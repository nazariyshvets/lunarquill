import { useState, useRef } from "react";

import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAlert } from "react-alert";
import { BiPhone, BiUserPlus, BiUserX, BiLogOut, BiCopy } from "react-icons/bi";
import { Tooltip } from "react-tooltip";

import Chat from "../components/Chat";
import Contact from "../components/Contact";
import SimpleButton from "../components/SimpleButton";
import Loading from "../components/Loading";
import Modal from "./Modal";
import Input from "./Input";
import useAppSelector from "../hooks/useAppSelector";
import useRTMClient from "../hooks/useRTMClient";
import useAuth from "../hooks/useAuth";
import useCopyToClipboard from "../hooks/useCopyToClipboard";
import useChatConnection from "../hooks/useChatConnection";
import {
  useCreateRequestMutation,
  useLeaveChannelMutation,
  useDisableWhiteboardRoomMutation,
  useFetchContactRelationMutation,
  useRemoveContactMutation,
  useFetchWhiteboardSdkTokenMutation,
} from "../services/mainService";
import getErrorMessage from "../utils/getErrorMessage";
import { ChatTypeEnum } from "../types/ChatType";
import { RequestTypeEnum } from "../types/Request";
import PeerMessage from "../types/PeerMessage";

interface ChatLayoutProps {
  contactName: string;
  isContactOnline: boolean;
  contactAvatarId?: string;
  chatType: ChatTypeEnum;
  chatTargetId: string | null;
  channelId?: string;
  onCallBtnClick: () => void;
}

enum ModalAction {
  InviteUser = "inviteUser",
  LeaveChannel = "leaveChannel",
  RemoveContact = "removeContact",
}

interface ModalState {
  isOpen: boolean;
  action?: ModalAction;
}

const ChatLayout = ({
  contactName,
  isContactOnline,
  contactAvatarId,
  chatType,
  chatTargetId,
  channelId,
  onCallBtnClick,
}: ChatLayoutProps) => {
  const { userId } = useAuth();

  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<{ contactId: string }>();
  const inviteFormRef = useRef<HTMLFormElement>(null);
  const isChatInitialized = useAppSelector(
    (state) => state.chat.isChatInitialized,
  );
  const RTMClient = useRTMClient();
  const chatConnection = useChatConnection();
  const [disableWhiteboardRoom] = useDisableWhiteboardRoomMutation();
  const [fetchContactRelation] = useFetchContactRelationMutation();
  const [createRequest] = useCreateRequestMutation();
  const [leaveChannel] = useLeaveChannelMutation();
  const [removeContact] = useRemoveContactMutation();
  const [fetchWhiteboardSdkToken] = useFetchWhiteboardSdkTokenMutation();
  const copyToClipboard = useCopyToClipboard();
  const alert = useAlert();
  const navigate = useNavigate();

  const handleModalClose = () => setModalState({ isOpen: false });

  const handleModalSave = async (action: ModalAction) => {
    switch (action) {
      case ModalAction.InviteUser:
        inviteFormRef.current?.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true }),
        );
        break;
      case ModalAction.LeaveChannel:
        await handleChannelLeave();
        break;
      case ModalAction.RemoveContact:
        await handleContactRemove();
    }
  };

  const handleChannelLeave = async () => {
    if (!userId || !chatTargetId || !channelId) {
      alert.error("Could not leave the channel. Please try again");
      return;
    }

    try {
      await Promise.all([
        chatConnection.leaveGroup({ groupId: chatTargetId }),
        leaveChannel({ userId, channelId }),
      ]);
      navigate("/profile");
      alert.success("You left the channel successfully");
    } catch (err) {
      alert.error(
        getErrorMessage({
          error: err,
          defaultErrorMessage: "Could not leave the channel. Please try again",
        }),
      );
      console.error("Could not leave the channel:", err);
    }
  };

  const handleContactRemove = async () => {
    if (!userId || !chatTargetId) {
      alert.error("Could not remove the contact. Please try again");
      return;
    }

    try {
      const contactRelation = await fetchContactRelation({
        userId1: userId,
        userId2: chatTargetId,
      }).unwrap();
      const { token: whiteboardSdkToken } =
        await fetchWhiteboardSdkToken().unwrap();

      await Promise.all([
        disableWhiteboardRoom({
          roomUuid: contactRelation.whiteboardRoomId,
          sdkToken: whiteboardSdkToken,
        }).unwrap(),
        removeContact({
          user1Id: userId,
          user2Id: chatTargetId,
        }).unwrap(),
        chatConnection.deleteConversation({
          channel: chatTargetId,
          chatType: ChatTypeEnum.SingleChat,
          deleteRoam: true,
        }),
      ]);
      await RTMClient.sendMessageToPeer(
        { text: PeerMessage.ContactRemoved },
        chatTargetId,
      );
      navigate("/profile");
      alert.success("The contact was deleted successfully");
    } catch (err) {
      alert.error(
        getErrorMessage({
          error: err,
          defaultErrorMessage: "Could not delete the contact. Please try again",
        }),
      );
      console.error("Could not delete the contact:", err);
    }
  };

  const handleInviteFormSubmit: SubmitHandler<{ contactId: string }> = async ({
    contactId,
  }) => {
    if (!userId || !chatTargetId || !channelId) {
      alert.error("Could not send an invite request. Please try again");
      return;
    }

    try {
      await Promise.all([
        createRequest({
          from: userId,
          to: contactId,
          type: RequestTypeEnum.Invite,
          channel: channelId,
        }).unwrap(),
        chatConnection.inviteUsersToGroup({
          groupId: chatTargetId,
          users: [contactId],
        }),
      ]);
      await RTMClient.sendMessageToPeer(
        { text: PeerMessage.RequestCreated },
        contactId,
      );
      alert.success("Request created successfully!");
      handleModalClose();
    } catch (err) {
      alert.error(
        getErrorMessage({
          error: err,
          defaultErrorMessage:
            "Could not send an invite request. Please try again",
        }),
      );
      console.error("Could not send an invite request:", err);
    }
  };

  const handleRemoveContactBtnClick = () =>
    setModalState({
      isOpen: true,
      action: ModalAction.RemoveContact,
    });

  const handleCopyChannelIdBtnClick = () => {
    const errorMessage = "Could not copy the channel id. Please try again";

    if (channelId)
      copyToClipboard(channelId, "channel id").catch(() =>
        alert.error(errorMessage),
      );
    else alert.error(errorMessage);
  };

  const handleInviteUserBtnClick = () =>
    setModalState({
      isOpen: true,
      action: ModalAction.InviteUser,
    });

  const handleLeaveChannelBtnClick = () =>
    setModalState({
      isOpen: true,
      action: ModalAction.LeaveChannel,
    });

  if (!isChatInitialized) return <Loading />;

  const modalAction = modalState.action;

  return (
    chatTargetId && (
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between border-b border-white p-2">
          <Contact
            name={contactName}
            isOnline={isContactOnline}
            avatarId={contactAvatarId}
            size="sm"
          />

          <div className="flex items-center gap-4 text-xl">
            <SimpleButton
              data-tooltip-id="call"
              data-tooltip-content="Call"
              onClick={onCallBtnClick}
            >
              <BiPhone />
            </SimpleButton>

            {chatType === ChatTypeEnum.SingleChat ? (
              <SimpleButton
                isDanger
                data-tooltip-id="removeContact"
                data-tooltip-content="Remove the contact"
                onClick={handleRemoveContactBtnClick}
              >
                <BiUserX />
              </SimpleButton>
            ) : (
              <>
                <SimpleButton
                  data-tooltip-id="copyChannelId"
                  data-tooltip-content="Copy the channel id"
                  onClick={handleCopyChannelIdBtnClick}
                >
                  <BiCopy />
                </SimpleButton>
                <SimpleButton
                  data-tooltip-id="inviteUser"
                  data-tooltip-content="Invite a user"
                  onClick={handleInviteUserBtnClick}
                >
                  <BiUserPlus />
                </SimpleButton>
                <SimpleButton
                  isDanger
                  data-tooltip-id="leaveChannel"
                  data-tooltip-content="Leave the channel"
                  onClick={handleLeaveChannelBtnClick}
                >
                  <BiLogOut />
                </SimpleButton>
              </>
            )}
          </div>
        </div>

        <Chat chatType={chatType} targetId={chatTargetId} />

        {modalState.isOpen && modalAction && (
          <Modal
            title={
              modalAction === ModalAction.InviteUser
                ? "Enter user's id"
                : modalAction === ModalAction.LeaveChannel
                  ? "Are you sure you want to leave this channel"
                  : "Are you sure you want to delete this contact"
            }
            onCancel={handleModalClose}
            onSave={() => handleModalSave(modalAction)}
          >
            {modalAction === ModalAction.InviteUser && (
              <form
                ref={inviteFormRef}
                method="POST"
                autoComplete="off"
                onSubmit={handleSubmit(handleInviteFormSubmit)}
              >
                <Input
                  name="contactId"
                  register={register}
                  errors={errors["contactId"]}
                  required
                />
              </form>
            )}
          </Modal>
        )}

        <Tooltip id="call" />
        <Tooltip id="removeContact" />
        <Tooltip id="copyChannelId" />
        <Tooltip id="inviteUser" />
        <Tooltip id="leaveChannel" />
      </div>
    )
  );
};

export default ChatLayout;
