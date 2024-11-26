import { useState, useRef } from "react";

import { Tooltip } from "react-tooltip";
import { BiCopy, BiEdit, BiLogOut, BiPhone, BiUserPlus } from "react-icons/bi";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAlert } from "react-alert";
import { skipToken } from "@reduxjs/toolkit/query";

import Loading from "../components/Loading";
import Contact from "../components/Contact";
import SimpleButton from "../components/SimpleButton";
import Chat from "../components/Chat";
import Input from "../components/Input";
import Modal from "../components/Modal";
import AvatarUploadModal from "../components/AvatarUploadModal";
import {
  useGetUserByIdQuery,
  useCreateRequestMutation,
  useDisableWhiteboardRoomMutation,
  useFetchWhiteboardSdkTokenMutation,
  useGetChannelByIdQuery,
  useLeaveChannelMutation,
  useUpdateChannelAvatarsCollectionMutation,
} from "../services/mainService";
import useAvatarUpload from "../hooks/useAvatarUpload";
import useAuth from "../hooks/useAuth";
import useHandleError from "../hooks/useHandleError";
import useChatConnection from "../hooks/useChatConnection";
import useCopyToClipboard from "../hooks/useCopyToClipboard";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useRTMClient from "../hooks/useRTMClient";
import useAppSelector from "../hooks/useAppSelector";
import { RequestTypeEnum } from "../types/Request";
import { ChatTypeEnum } from "../types/ChatType";
import PeerMessage from "../types/PeerMessage";

enum ModalAction {
  InviteUser = "inviteUser",
  LeaveChannel = "leaveChannel",
}

interface ModalState {
  isOpen: boolean;
  action?: ModalAction;
}

const ChannelChatPage = () => {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<{ contactId: string }>();
  const inviteFormRef = useRef<HTMLFormElement>(null);

  const { id } = useParams();
  const { userId } = useAuth();
  const { data: localUser } = useGetUserByIdQuery(userId ?? skipToken);
  const { data: channel } = useGetChannelByIdQuery(id ?? skipToken);

  const RTMClient = useRTMClient();
  const isChatInitialized = useAppSelector(
    (state) => state.chat.isChatInitialized,
  );
  const chatConnection = useChatConnection();
  const navigate = useNavigate();
  const alert = useAlert();
  const copyToClipboard = useCopyToClipboard();
  const handleError = useHandleError();

  const [createRequest] = useCreateRequestMutation();
  const [fetchWhiteboardSdkToken] = useFetchWhiteboardSdkTokenMutation();
  const [disableWhiteboardRoom] = useDisableWhiteboardRoomMutation();
  const [leaveChannel] = useLeaveChannelMutation();
  const [updateAvatarsCollection] = useUpdateChannelAvatarsCollectionMutation();

  const channelId = channel?._id;
  const channelName = channel?.name ?? "Unknown channel";
  const chatTargetId = channel?.chatTargetId ?? null;
  const selectedChannelAvatarId = channel?.selectedAvatar?._id;

  const {
    modalState: editAvatarModalState,
    handleModalOpen: handleEditAvatarModalOpen,
    handleModalClose: handleEditAvatarModalClose,
    handleAvatarSelect,
    handleAvatarRemove,
    handleAvatarUpload,
    handleModalSaveBtnClick: handleEditAvatarModalSaveBtnClick,
  } = useAvatarUpload({
    selectedAvatarId: selectedChannelAvatarId,
    avatarIds: channel?.avatars ?? [],
    updateAvatarsCollection,
  });

  useDocumentTitle(channelName);

  const handleCopyChannelIdBtnClick = () => {
    const errorMessage = "Could not copy the channel id. Please try again";

    if (channelId) {
      copyToClipboard(channelId, "channel id").catch(() =>
        alert.error(errorMessage),
      );
    } else {
      alert.error(errorMessage);
    }
  };

  const handleInviteFormSubmit: SubmitHandler<{
    contactId: string;
  }> = async ({ contactId }) => {
    if (!userId || !channelId || !chatTargetId) {
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
      handleError(
        err,
        "Could not send an invite request. Please try again",
        "Error sending an invite request:",
      );
    }
  };

  const handleChannelLeave = async () => {
    if (!userId || !channelId || !chatTargetId) {
      alert.error("Could not leave the channel. Please try again");
      return;
    }

    try {
      const chatInfo = await chatConnection.getGroupInfo({
        groupId: chatTargetId,
      });
      const prevChatOwner = chatInfo?.data?.[0]?.owner;
      const { isChannelRemoved, adminId } = await leaveChannel({
        userId,
        channelId,
      }).unwrap();

      if (isChannelRemoved) {
        const { token: whiteboardSdkToken } =
          await fetchWhiteboardSdkToken().unwrap();

        await Promise.all([
          disableWhiteboardRoom({
            roomUuid: channel.whiteboardRoomId,
            sdkToken: whiteboardSdkToken,
          }).unwrap(),
          chatConnection.destroyGroup({ groupId: chatTargetId }),
        ]);
      } else if (userId === prevChatOwner && adminId) {
        await chatConnection.changeGroupOwner({
          groupId: chatTargetId,
          newOwner: adminId,
        });
      }

      navigate("/profile");
      alert.success("You left the channel successfully");
    } catch (err) {
      handleError(
        err,
        "Could not leave the channel. Please try again",
        "Error leaving the channel:",
      );
    }
  };

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
    }
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
            name={channelName}
            isOnline={false}
            avatarId={selectedChannelAvatarId}
            size="sm"
          />

          <div className="flex items-center gap-4 text-xl">
            <SimpleButton
              data-tooltip-id="call"
              data-tooltip-content="Call"
              onClick={() => navigate(`/channels/${id}/call`)}
            >
              <BiPhone />
            </SimpleButton>
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
            {userId && channel?.admin && userId === channel.admin && (
              <SimpleButton
                data-tooltip-id="editAvatar"
                data-tooltip-content="Edit avatar"
                onClick={handleEditAvatarModalOpen}
              >
                <BiEdit />
              </SimpleButton>
            )}
            <SimpleButton
              isDanger
              data-tooltip-id="leaveChannel"
              data-tooltip-content="Leave the channel"
              onClick={handleLeaveChannelBtnClick}
            >
              <BiLogOut />
            </SimpleButton>
          </div>
        </div>

        <Chat
          key={chatTargetId}
          chatType={ChatTypeEnum.GroupChat}
          targetId={chatTargetId}
          localUser={localUser}
        />

        {modalState.isOpen && modalAction && (
          <Modal
            title={
              modalAction === ModalAction.InviteUser
                ? "Enter user's id"
                : "Are you sure you want to leave this channel"
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

        {editAvatarModalState.isOpen && (
          <AvatarUploadModal
            avatars={editAvatarModalState.avatars}
            selectedAvatarId={editAvatarModalState.selectedAvatarId}
            onAvatarSelect={handleAvatarSelect}
            onAvatarRemove={handleAvatarRemove}
            onAvatarUpload={handleAvatarUpload}
            onCancel={handleEditAvatarModalClose}
            onSave={() => handleEditAvatarModalSaveBtnClick(channelId)}
          />
        )}

        <Tooltip id="call" />
        <Tooltip id="copyChannelId" />
        <Tooltip id="inviteUser" />
        <Tooltip id="editAvatar" />
        <Tooltip id="leaveChannel" />
      </div>
    )
  );
};

export default ChannelChatPage;
