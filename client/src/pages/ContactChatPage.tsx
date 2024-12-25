import { useState } from "react";

import { Tooltip } from "react-tooltip";
import { BiPhone, BiUserX } from "react-icons/bi";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAlert } from "react-alert";
import { skipToken } from "@reduxjs/toolkit/query";

import Loading from "../components/Loading";
import Contact from "../components/Contact";
import SimpleButton from "../components/SimpleButton";
import Chat from "../components/Chat";
import Modal from "../components/Modal";
import {
  useGetContactRelationQuery,
  useRemoveContactMutation,
} from "../services/contactApi";
import { useDisableWhiteboardRoomMutation } from "../services/whiteboardApi";
import { useFetchWhiteboardSdkTokenMutation } from "../services/tokenApi";
import useAuth from "../hooks/useAuth";
import useAppDispatch from "../hooks/useAppDispatch";
import useChatConnection from "../hooks/useChatConnection";
import useHandleError from "../hooks/useHandleError";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAppSelector from "../hooks/useAppSelector";
import useIsUserOnline from "../hooks/useIsUserOnline";
import useSendMessageToPeer from "../hooks/useSendMessageToPeer";
import { setCallModalState, setCallTimeout } from "../redux/rtmSlice";
import { CALL_TIMEOUT_MS } from "../constants/constants";
import PeerMessage from "../types/PeerMessage";
import CallDirection from "../types/CallDirection";
import { ChatType } from "../types/ChatType";

const ContactChatPage = () => {
  const [isRemoveContactModalOpen, setIsRemoveContactModalOpen] =
    useState(false);

  const { id: contactId } = useParams();
  const { userId } = useAuth();
  const { data: contactRelation, isLoading: isContactRelationLoading } =
    useGetContactRelationQuery(
      userId && contactId
        ? {
            userId1: userId,
            userId2: contactId,
          }
        : skipToken,
    );

  const isChatInitialized = useAppSelector(
    (state) => state.chat.isChatInitialized,
  );
  const chatConnection = useChatConnection();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const alert = useAlert();
  const handleError = useHandleError();
  const isUserOnline = useIsUserOnline();
  const sendMessageToPeer = useSendMessageToPeer();

  const [removeContact] = useRemoveContactMutation();
  const [fetchWhiteboardSdkToken] = useFetchWhiteboardSdkTokenMutation();
  const [disableWhiteboardRoom] = useDisableWhiteboardRoomMutation();

  const contact = contactRelation
    ? contactRelation.user1._id === contactId
      ? contactRelation.user1
      : contactRelation.user2
    : undefined;
  const contactName = contact?.username ?? "Unknown";
  const isContactOnline = isUserOnline(contact?._id);

  useDocumentTitle(contactName);

  if (isContactRelationLoading || !isChatInitialized) return <Loading />;
  if (!contactRelation) return <Navigate to="/profile" replace={true} />;

  const handleCallBtnClick = async () => {
    if (!contact) {
      return;
    }

    if (isContactOnline) {
      try {
        await sendMessageToPeer(contact._id, PeerMessage.Call);
        dispatch(
          setCallModalState({
            callDirection: CallDirection.Outgoing,
            contact,
          }),
        );
        dispatch(
          setCallTimeout(
            window.setTimeout(() => {
              sendMessageToPeer(contact._id, PeerMessage.CallTimedOut);
              dispatch(setCallModalState(null));
              dispatch(setCallTimeout(null));
              alert.info("The recipient did not respond");
            }, CALL_TIMEOUT_MS),
          ),
        );
      } catch (err) {
        alert.error(`Could not call ${contactName}. Please try again`);
        console.error(`Error calling ${contactName}:`, err);
      }
    } else {
      alert.info(`${contactName} is offline. The call cannot be sent`);
    }
  };

  const handleContactRemove = async () => {
    if (!userId || !contactId) {
      alert.error("Could not remove the contact. Please try again");
      return;
    }

    try {
      const { token: whiteboardSdkToken } =
        await fetchWhiteboardSdkToken().unwrap();

      await Promise.all([
        disableWhiteboardRoom({
          roomUuid: contactRelation.whiteboardRoomId,
          sdkToken: whiteboardSdkToken,
        }).unwrap(),
        removeContact({
          user1Id: userId,
          user2Id: contactId,
        }).unwrap(),
        chatConnection.deleteConversation({
          channel: contactId,
          chatType: ChatType.SingleChat,
          deleteRoam: true,
        }),
      ]);
      await sendMessageToPeer(contactId, PeerMessage.ContactRemoved);
      navigate("/profile");
      alert.success("The contact was deleted successfully");
    } catch (err) {
      handleError(
        err,
        "Could not delete the contact. Please try again",
        "Error deleting the contact:",
      );
    }
  };

  const handleRemoveContactModalOpen = () => setIsRemoveContactModalOpen(true);

  const handleRemoveContactModalClose = () =>
    setIsRemoveContactModalOpen(false);

  return (
    contactId && (
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between border-b border-white p-2">
          <Contact
            name={contactName}
            isOnline={isContactOnline}
            avatarId={contact?.selectedAvatar}
            size="sm"
          />

          <div className="flex items-center gap-4 text-xl">
            <SimpleButton
              data-tooltip-id="call"
              data-tooltip-content="Call"
              onClick={handleCallBtnClick}
            >
              <BiPhone />
            </SimpleButton>
            <SimpleButton
              isDanger
              data-tooltip-id="removeContact"
              data-tooltip-content="Remove the contact"
              onClick={handleRemoveContactModalOpen}
            >
              <BiUserX />
            </SimpleButton>
          </div>
        </div>

        <Chat
          key={contactId}
          chatType={ChatType.SingleChat}
          targetId={contactId}
          members={[contactRelation.user1, contactRelation.user2]}
        />

        {isRemoveContactModalOpen && (
          <Modal
            title="Are you sure you want to delete this contact"
            onCancel={handleRemoveContactModalClose}
            onSave={handleContactRemove}
          />
        )}

        <Tooltip id="call" />
        <Tooltip id="removeContact" />
      </div>
    )
  );
};

export default ContactChatPage;
