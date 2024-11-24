import { Link } from "react-router-dom";

import { skipToken } from "@reduxjs/toolkit/query";
import { debounce } from "lodash";
import { BiBell, BiCopy, BiExit, BiGroup, BiUserPlus } from "react-icons/bi";

import AvatarUploadModal from "../components/AvatarUploadModal";
import ActionButton from "../components/ProfilePageActionButton";
import Switch from "../components/Switch";
import Contact from "../components/Contact";
import { logout } from "../redux/authSlice";
import {
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
  useUpdateUserAvatarsCollectionMutation,
  useFetchUserContactsMutation,
} from "../services/mainService";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAppDispatch from "../hooks/useAppDispatch";
import useAvatarUpload from "../hooks/useAvatarUpload";
import useRTMClient from "../hooks/useRTMClient";
import useCopyToClipboard from "../hooks/useCopyToClipboard";
import useHandleError from "../hooks/useHandleError";
import PeerMessage from "../types/PeerMessage";

const ProfilePage = () => {
  const { userId, username } = useAuth();
  const { data: userDetails } = useGetUserByIdQuery(userId ?? skipToken);
  const [updateUser] = useUpdateUserByIdMutation();
  const [updateAvatarsCollection] = useUpdateUserAvatarsCollectionMutation();
  const [fetchUserContacts] = useFetchUserContactsMutation();
  const RTMClient = useRTMClient();
  const dispatch = useAppDispatch();
  const copyToClipboard = useCopyToClipboard();
  const handleError = useHandleError();
  const {
    modalState: editAvatarModalState,
    handleModalOpen: handleEditAvatarModalOpen,
    handleModalClose: handleEditAvatarModalClose,
    handleAvatarSelect,
    handleAvatarRemove,
    handleAvatarUpload,
    handleModalSaveBtnClick: handleEditAvatarModalSaveBtnClick,
  } = useAvatarUpload({
    selectedAvatarId: userDetails?.selectedAvatar?._id,
    avatarIds: userDetails?.avatars ?? [],
    updateAvatarsCollection,
  });

  useDocumentTitle("Profile");

  const handleCopyIdToClipboard = () => userId && copyToClipboard(userId, "id");

  const handleOnlineStatusChange = debounce(async (isOnline: boolean) => {
    if (!userId) return;

    try {
      const updatedUser = await updateUser({
        userId,
        updateData: { isOnline },
      }).unwrap();
      const contacts = await fetchUserContacts(userId).unwrap();
      const onlineStatus = updatedUser.isOnline
        ? PeerMessage.UserWentOnline
        : PeerMessage.UserWentOffline;

      contacts.forEach((contact) =>
        RTMClient.sendMessageToPeer(
          {
            text: onlineStatus,
          },
          contact._id,
        ),
      );
    } catch (error) {
      handleError(
        error,
        "Could not set online status. Please try again",
        "Error setting online status:",
      );
    }
  }, 200);

  const userName = username ?? "You";

  return (
    <div className="flex h-full w-full flex-col items-center gap-4">
      <div className="flex h-full w-full flex-col justify-center gap-8">
        <div className="flex flex-col gap-2">
          <div className="relative flex items-center justify-center">
            <Contact
              name={userName}
              isOnline={userDetails?.isOnline ?? false}
              avatarId={userDetails?.selectedAvatar?._id}
              size="xl"
              layout="vertical"
              withOverlay
              onEditAvatarBtnClick={handleEditAvatarModalOpen}
            />

            <div className="absolute right-0 flex flex-col items-end gap-8 p-2">
              <div
                className="flex cursor-pointer items-center gap-1 text-sm text-lightgrey hover:text-primary-light"
                onClick={handleCopyIdToClipboard}
              >
                <BiCopy />
                Copy id
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={userDetails?.isOnline ?? false}
                  onChange={handleOnlineStatusChange}
                />
                <span className="text-white">Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Link to="/add-contact">
            <ActionButton>
              <BiUserPlus />
              Add a contact
            </ActionButton>
          </Link>
          <Link to="/add-channel">
            <ActionButton>
              <BiGroup />
              Join/Create a channel
            </ActionButton>
          </Link>
          <Link to="/requests">
            <ActionButton>
              <BiBell />
              Inbox/Outbox requests
            </ActionButton>
          </Link>
        </div>
      </div>

      <ActionButton isDanger onClick={() => dispatch(logout())}>
        <BiExit />
        Log out
      </ActionButton>

      {editAvatarModalState.isOpen && (
        <AvatarUploadModal
          avatars={editAvatarModalState.avatars}
          selectedAvatarId={editAvatarModalState.selectedAvatarId}
          onAvatarSelect={handleAvatarSelect}
          onAvatarRemove={handleAvatarRemove}
          onAvatarUpload={handleAvatarUpload}
          onCancel={handleEditAvatarModalClose}
          onSave={() => handleEditAvatarModalSaveBtnClick(userId)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
