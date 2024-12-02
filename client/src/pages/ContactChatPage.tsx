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
import { useGetUserByIdQuery } from "../services/userApi";
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
import useRTMClient from "../hooks/useRTMClient";
import useIsUserOnline from "../hooks/useIsUserOnline";
import { setCallModalState, setCallTimeout } from "../redux/rtmSlice";
import { CALL_TIMEOUT_MS } from "../constants/constants";
import PeerMessage from "../types/PeerMessage";
import CallDirection from "../types/CallDirection";
import { ChatTypeEnum } from "../types/ChatType";

const ContactChatPage = () => {
  const [isRemoveContactModalOpen, setIsRemoveContactModalOpen] =
    useState(false);

  const { id: contactId } = useParams();
  const { userId } = useAuth();
  const { data: localUser } = useGetUserByIdQuery(userId ?? skipToken);
  const { data: contactRelation, isLoading: isContactRelationLoading } =
    useGetContactRelationQuery(
      userId && contactId
        ? {
            userId1: userId,
            userId2: contactId,
          }
        : skipToken,
    );

  const RTMClient = useRTMClient();
  const isChatInitialized = useAppSelector(
    (state) => state.chat.isChatInitialized,
  );
  const chatConnection = useChatConnection();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const alert = useAlert();
  const handleError = useHandleError();
  const isUserOnline = useIsUserOnline();

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
        await RTMClient.sendMessageToPeer(
          { text: PeerMessage.Call },
          contact._id,
        );
        dispatch(
          setCallModalState({
            callDirection: CallDirection.Outgoing,
            contact,
          }),
        );
        dispatch(
          setCallTimeout(
            window.setTimeout(() => {
              RTMClient.sendMessageToPeer(
                { text: PeerMessage.CallTimedOut },
                contact._id,
              );
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
          chatType: ChatTypeEnum.SingleChat,
          deleteRoam: true,
        }),
      ]);
      await RTMClient.sendMessageToPeer(
        { text: PeerMessage.ContactRemoved },
        contactId,
      );
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
            avatarId={contact?.selectedAvatar?._id}
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
          chatType={ChatTypeEnum.SingleChat}
          targetId={contactId}
          localUser={localUser}
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
