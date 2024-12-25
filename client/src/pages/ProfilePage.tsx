import { Link } from "react-router-dom";

import { skipToken } from "@reduxjs/toolkit/query";
import { BiBell, BiCopy, BiExit, BiGroup, BiUserPlus } from "react-icons/bi";

import AvatarUploadModal from "../components/AvatarUploadModal";
import ActionButton from "../components/ProfilePageActionButton";
import Contact from "../components/Contact";
import { logout } from "../redux/authSlice";
import {
  useGetUserByIdQuery,
  useUpdateUserAvatarsCollectionMutation,
} from "../services/userApi";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAppDispatch from "../hooks/useAppDispatch";
import useAvatarUpload from "../hooks/useAvatarUpload";
import copyToClipboard from "../utils/copyToClipboard";

const ProfilePage = () => {
  const { userId, username } = useAuth();
  const { data: userDetails } = useGetUserByIdQuery(userId ?? skipToken);
  const [updateAvatarsCollection] = useUpdateUserAvatarsCollectionMutation();
  const dispatch = useAppDispatch();
  const {
    modalState: editAvatarModalState,
    handleModalOpen: handleEditAvatarModalOpen,
    handleModalClose: handleEditAvatarModalClose,
    handleAvatarSelect,
    handleAvatarRemove,
    handleAvatarUpload,
    handleModalSaveBtnClick: handleEditAvatarModalSaveBtnClick,
  } = useAvatarUpload({
    selectedAvatarId: userDetails?.selectedAvatar,
    avatarIds: userDetails?.avatars ?? [],
  });

  useDocumentTitle("Profile");

  const handleCopyIdToClipboard = () => userId && copyToClipboard(userId, "id");

  const handleAvatarsUpdate = () =>
    !!userId &&
    handleEditAvatarModalSaveBtnClick(
      { userId },
      updateAvatarsCollection,
      [],
      "",
    );

  const userName = username ?? "You";

  return (
    <div className="flex h-full w-full flex-col items-center gap-4">
      <div className="flex h-full w-full flex-col justify-center gap-8">
        <div className="flex flex-col gap-2">
          <div className="relative flex items-center justify-center">
            <Contact
              name={userName}
              isOnline
              avatarId={userDetails?.selectedAvatar}
              size="xl"
              layout="vertical"
              withOverlay
              onEditAvatarBtnClick={handleEditAvatarModalOpen}
            />

            <div
              className="absolute right-0 flex cursor-pointer items-center gap-1 text-sm text-lightgrey hover:text-primary-light"
              onClick={handleCopyIdToClipboard}
            >
              <BiCopy />
              Copy id
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
          onSave={handleAvatarsUpdate}
        />
      )}
    </div>
  );
};

export default ProfilePage;
