import { useState } from "react";

import { Tooltip } from "react-tooltip";
import {
  BiCopy,
  BiEdit,
  BiLogOut,
  BiPhone,
  BiUserPlus,
  BiGroup,
  BiPencil,
  BiShield,
  BiImage,
} from "react-icons/bi";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";

import InviteUserModal from "../components/channelChatPage/InviteUserModal";
import ViewMembersModal from "../components/channelChatPage/ViewMembersModal";
import LeaveChannelModal from "../components/channelChatPage/LeaveChannelModal";
import EditChannelNameModal from "../components/channelChatPage/EditChannelNameModal";
import EditChannelPrivacyModal from "../components/channelChatPage/EditChannelPrivacyModal";
import Dropdown from "../components/Dropdown";
import Loading from "../components/Loading";
import Contact from "../components/Contact";
import SimpleButton from "../components/SimpleButton";
import Chat from "../components/Chat";
import AvatarUploadModal from "../components/AvatarUploadModal";
import { useGetUserContactsQuery } from "../services/userApi";
import {
  useGetChannelByIdQuery,
  useUpdateChannelAvatarsCollectionMutation,
  useGetChannelMembersQuery,
} from "../services/channelApi";
import useAvatarUpload from "../hooks/useAvatarUpload";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAppSelector from "../hooks/useAppSelector";
import copyToClipboard from "../utils/copyToClipboard";
import showToast from "../utils/showToast";
import { ChatType } from "../types/ChatType";
import Placement from "../types/Placement";
import PeerMessage from "../types/PeerMessage";

enum ModalAction {
  InviteUser = "inviteUser",
  ViewMembers = "viewMembers",
  LeaveChannel = "leaveChannel",
  EditChannelName = "editChannelName",
  EditChannelPrivacy = "editChannelPrivacy",
}

interface ModalState {
  isOpen: boolean;
  action?: ModalAction;
}

const ChannelChatPage = () => {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);

  const { id } = useParams();
  const { userId } = useAuth();
  const { data: channel, isError: isFetchingChannelError } =
    useGetChannelByIdQuery(id ?? skipToken);
  const { data: channelMembers = [] } = useGetChannelMembersQuery(
    id ?? skipToken,
  );
  const { data: contacts = [] } = useGetUserContactsQuery(userId ?? skipToken);

  const isChatInitialized = useAppSelector(
    (state) => state.chat.isChatInitialized,
  );
  const navigate = useNavigate();
  const [updateAvatarsCollection] = useUpdateChannelAvatarsCollectionMutation();

  const channelId = channel?._id;
  const channelName = channel?.name ?? "Unknown channel";
  const chatTargetId = channel?.chatTargetId ?? null;
  const selectedChannelAvatarId = channel?.selectedAvatar;
  const modalAction = modalState.action;

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
  });

  useDocumentTitle(channelName);

  if (!isChatInitialized) {
    return <Loading />;
  }
  if (isFetchingChannelError) {
    return <Navigate to="/profile" replace />;
  }

  const handleCallBtnClick = () => navigate(`/channels/${id}/call`);

  const toggleSettingsDropdown = () =>
    setIsSettingsDropdownOpen((prevState) => !prevState);

  const handleCopyChannelIdBtnClick = () => {
    const errorMessage = "Could not copy the channel id. Please try again";

    if (channelId) {
      copyToClipboard(channelId, "channel id").catch(() =>
        showToast("error", errorMessage),
      );
    } else {
      showToast("error", errorMessage);
    }
  };

  const handleChannelAvatarsUpdate = async () => {
    if (!!userId && !!channelId) {
      await handleEditAvatarModalSaveBtnClick(
        { userId, channelId },
        updateAvatarsCollection,
        channelMembers.filter((member) => member._id !== userId),
        `${PeerMessage.ChannelUpdated}__${channelId}`,
      );
    }
  };

  const handleModalClose = () => setModalState({ isOpen: false });

  const handleInviteUserBtnClick = () =>
    setModalState({
      isOpen: true,
      action: ModalAction.InviteUser,
    });

  const handleViewMembersBtnClick = () =>
    setModalState({
      isOpen: true,
      action: ModalAction.ViewMembers,
    });

  const handleLeaveChannelBtnClick = () =>
    setModalState({
      isOpen: true,
      action: ModalAction.LeaveChannel,
    });

  const handleEditChannelBtnClick = (modalAction: ModalAction) => {
    if (channel) {
      setIsSettingsDropdownOpen(false);
      setModalState({
        isOpen: true,
        action: modalAction,
      });
    } else {
      showToast("error", "No channel information. Please try again");
      console.error("No channel information");
    }
  };

  const handleEditChannelNameBtnClick = () =>
    handleEditChannelBtnClick(ModalAction.EditChannelName);

  const handleEditChannelPrivacyBtnClick = () =>
    handleEditChannelBtnClick(ModalAction.EditChannelPrivacy);

  const handleEditChannelAvatarBtnClick = async () => {
    setIsSettingsDropdownOpen(false);
    await handleEditAvatarModalOpen();
  };

  const settingsOptions = [
    {
      attribute: "name",
      Icon: BiPencil,
      onClick: handleEditChannelNameBtnClick,
    },
    {
      attribute: "privacy",
      Icon: BiShield,
      onClick: handleEditChannelPrivacyBtnClick,
    },

    {
      attribute: "avatar",
      Icon: BiImage,
      onClick: handleEditChannelAvatarBtnClick,
    },
  ];

  return (
    chatTargetId && (
      <div className="flex h-full w-full flex-col">
        <div className="flex flex-col justify-between gap-4 border-b border-white py-2 sm:flex-row sm:items-center sm:px-2">
          <Contact
            name={channelName}
            isOnline={false}
            avatarId={selectedChannelAvatarId}
            size="sm"
          />

          <div className="flex items-center gap-3 text-lg sm:gap-4 sm:text-xl">
            <SimpleButton
              data-tooltip-id="call"
              data-tooltip-content="Call"
              onClick={handleCallBtnClick}
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
            <SimpleButton
              data-tooltip-id="viewMembers"
              data-tooltip-content="View members list"
              onClick={handleViewMembersBtnClick}
            >
              <BiGroup />
            </SimpleButton>
            {userId && channel?.admin && userId === channel.admin && (
              <Dropdown
                isOpen={isSettingsDropdownOpen}
                placement={Placement.BOTTOM_RIGHT}
                content={
                  <div className="flex flex-col gap-2 text-lg">
                    {settingsOptions.map((item) => (
                      <SimpleButton
                        key={item.attribute}
                        className="flex items-center gap-2"
                        onClick={item.onClick}
                      >
                        <item.Icon className="flex-shrink-0" />
                        <span className="text-sm">
                          Edit channel {item.attribute}
                        </span>
                      </SimpleButton>
                    ))}
                  </div>
                }
              >
                <SimpleButton
                  data-tooltip-id="editChannel"
                  data-tooltip-content="Edit channel"
                  onClick={toggleSettingsDropdown}
                >
                  <BiEdit />
                </SimpleButton>
              </Dropdown>
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
          chatType={ChatType.GroupChat}
          targetId={chatTargetId}
          members={channelMembers}
        />

        {modalState.isOpen &&
          modalAction &&
          (modalAction === ModalAction.InviteUser ? (
            <InviteUserModal
              localUserId={userId}
              channel={channel}
              onClose={handleModalClose}
            />
          ) : modalAction === ModalAction.ViewMembers ? (
            <ViewMembersModal
              localUserId={userId}
              contacts={contacts}
              channel={channel}
              channelMembers={channelMembers}
              onClose={handleModalClose}
            />
          ) : modalAction === ModalAction.LeaveChannel ? (
            <LeaveChannelModal
              localUserId={userId}
              channel={channel}
              channelMembers={channelMembers}
              onClose={handleModalClose}
            />
          ) : modalAction === ModalAction.EditChannelName ? (
            <EditChannelNameModal
              localUserId={userId}
              channelId={channelId}
              channelName={channelName}
              channelMembers={channelMembers}
              onClose={handleModalClose}
            />
          ) : (
            <EditChannelPrivacyModal
              localUserId={userId}
              channel={channel}
              channelMembers={channelMembers}
              onClose={handleModalClose}
            />
          ))}

        {editAvatarModalState.isOpen && (
          <AvatarUploadModal
            avatars={editAvatarModalState.avatars}
            selectedAvatarId={editAvatarModalState.selectedAvatarId}
            onAvatarSelect={handleAvatarSelect}
            onAvatarRemove={handleAvatarRemove}
            onAvatarUpload={handleAvatarUpload}
            onCancel={handleEditAvatarModalClose}
            onSave={handleChannelAvatarsUpdate}
          />
        )}

        <Tooltip id="call" />
        <Tooltip id="copyChannelId" />
        <Tooltip id="inviteUser" />
        <Tooltip id="viewMembers" />
        <Tooltip id="editChannel" />
        <Tooltip id="leaveChannel" />
      </div>
    )
  );
};

export default ChannelChatPage;
