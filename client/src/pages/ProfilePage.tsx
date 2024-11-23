import { useState } from "react";
import { Link } from "react-router-dom";

import { nanoid } from "@reduxjs/toolkit";
import { skipToken } from "@reduxjs/toolkit/query";
import { debounce } from "lodash";
import { BiBell, BiCopy, BiExit, BiGroup, BiUserPlus } from "react-icons/bi";

import Modal from "../components/Modal";
import FileUploader from "../components/FileUploader";
import ActionButton from "../components/ProfilePageActionButton";
import Switch from "../components/Switch";
import Contact from "../components/Contact";
import NoDataBox from "../components/NoDataBox";
import SelectableItem from "../components/SelectableItem";
import { logout } from "../redux/authSlice";
import {
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
  useFetchUserContactsMutation,
  useDownloadFilesMutation,
  useUpdateUserAvatarsCollectionMutation,
} from "../services/mainService";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAppDispatch from "../hooks/useAppDispatch";
import useRTMClient from "../hooks/useRTMClient";
import useCopyToClipboard from "../hooks/useCopyToClipboard";
import useHandleError from "../hooks/useHandleError";
import extractFilesFromBlob from "../utils/extractFilesFromBlob";
import getFileDataUrls from "../utils/getFileDataUrls";
import getBlobFromFile from "../utils/getBlobFromFile";
import { IMAGES_IN_STORAGE_LIMIT } from "../constants/constants";
import PeerMessage from "../types/PeerMessage";

interface Avatar {
  id: string;
  name: string;
  dataUrl: string;
  // only new avatars have this property
  src?: File;
}

interface EditAvatarModalState {
  isOpen: boolean;
  avatars: Avatar[];
  selectedAvatarId?: string;
  removedAvatarIds: string[];
}

const initialEditAvatarModalState: EditAvatarModalState = {
  isOpen: false,
  avatars: [],
  removedAvatarIds: [],
};

const ProfilePage = () => {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [editAvatarModalState, setEditAvatarModalState] = useState(
    initialEditAvatarModalState,
  );
  const { userId, username } = useAuth();
  const { data: userDetails } = useGetUserByIdQuery(userId ?? skipToken);
  const [updateUser] = useUpdateUserByIdMutation();
  const [fetchUserContacts] = useFetchUserContactsMutation();
  const [downloadFiles] = useDownloadFilesMutation();
  const [updateUserAvatarsCollection] =
    useUpdateUserAvatarsCollectionMutation();
  const RTMClient = useRTMClient();
  const dispatch = useAppDispatch();
  const copyToClipboard = useCopyToClipboard();
  const handleError = useHandleError();

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

  const handleEditAvatarModalOpen = async () => {
    if (avatars.length) {
      setEditAvatarModalState({
        isOpen: true,
        avatars: [...avatars],
        selectedAvatarId: userDetails?.selectedAvatar?._id,
        removedAvatarIds: [],
      });
    } else {
      try {
        const avatarIds = userDetails?.avatars ?? [];
        let newAvatars: Avatar[] = [];

        if (avatarIds.length) {
          const avatarsArchive = await downloadFiles(avatarIds).unwrap();
          const extractedAvatars = await extractFilesFromBlob(avatarsArchive);
          const dataUrls = await getFileDataUrls(
            extractedAvatars.map((avatar) => avatar.data),
          );

          newAvatars = extractedAvatars.map((avatar, index) => ({
            id: avatar.name.slice(0, avatar.name.indexOf("_")),
            name: avatar.name.slice(avatar.name.indexOf("_") + 1),
            dataUrl: dataUrls[index],
          }));
        }

        setAvatars([...newAvatars]);
        setEditAvatarModalState({
          isOpen: true,
          avatars: [...newAvatars],
          selectedAvatarId: userDetails?.selectedAvatar?._id,
          removedAvatarIds: [],
        });
      } catch (error) {
        handleError(
          error,
          "Could not set avatars collection. Please reopen the modal window",
          "Error setting avatars:",
        );
      }
    }
  };

  const handleEditAvatarModalClose = () =>
    setEditAvatarModalState(initialEditAvatarModalState);

  const handleAvatarSelect = (avatarId: string) =>
    setEditAvatarModalState((prevState) => ({
      ...prevState,
      selectedAvatarId: avatarId,
    }));

  const handleAvatarRemove = (avatarToRemove: Avatar) =>
    setEditAvatarModalState((prevState) => ({
      ...prevState,
      avatars: prevState.avatars.filter(
        (avatar) => avatar.id !== avatarToRemove.id,
      ),
      selectedAvatarId:
        prevState.selectedAvatarId === avatarToRemove.id
          ? undefined
          : prevState.selectedAvatarId,
      removedAvatarIds: avatarToRemove.src
        ? prevState.removedAvatarIds
        : [...prevState.removedAvatarIds, avatarToRemove.id],
    }));

  const handleAvatarUpload = async (sources: File[]) => {
    const src = sources?.[0];
    const blob = getBlobFromFile(src);
    const [dataUrl] = await getFileDataUrls([blob]);

    setEditAvatarModalState((prevState) => ({
      ...prevState,
      avatars: [
        {
          id: nanoid(),
          name: src?.name ?? "avatar",
          dataUrl,
          src,
        },
        ...prevState.avatars,
      ],
    }));
  };

  const handleEditAvatarModalSaveBtnClick = async () => {
    if (!userId) return;

    try {
      const { frontendIdToObjectIdMap } = await updateUserAvatarsCollection({
        userId,
        updateData: {
          removedAvatarIds: editAvatarModalState.removedAvatarIds,
          newAvatars: editAvatarModalState.avatars
            .filter((avatar) => avatar.src)
            .map((avatar) => ({ id: avatar.id, src: avatar.src as File })),
          selectedAvatarId: editAvatarModalState.selectedAvatarId,
        },
      }).unwrap();

      setAvatars(
        editAvatarModalState.avatars.map((avatar) =>
          avatar.src
            ? {
                ...avatar,
                id: frontendIdToObjectIdMap[avatar.id],
                src: undefined,
              }
            : avatar,
        ),
      );
    } catch (error) {
      handleError(
        error,
        "Could not update avatars collection. Please try again",
        "Error updating avatars collection:",
      );
    } finally {
      handleEditAvatarModalClose();
    }
  };

  const userName = username ?? "You";
  const selectableAvatars = editAvatarModalState.avatars.map((avatar) => (
    <SelectableItem
      key={avatar.id}
      isSelected={avatar.id === editAvatarModalState.selectedAvatarId}
      onSelect={() => handleAvatarSelect(avatar.id)}
      onRemove={() => handleAvatarRemove(avatar)}
    >
      <img
        src={avatar.dataUrl}
        alt={avatar.name}
        className="h-full w-full rounded object-cover"
      />
    </SelectableItem>
  ));

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
        <Modal
          title="Edit profile image"
          onCancel={handleEditAvatarModalClose}
          onSave={handleEditAvatarModalSaveBtnClick}
        >
          <div className="flex w-full flex-col gap-1 pb-7">
            {Boolean(selectableAvatars.length) && (
              <>
                <div className="flex gap-2 overflow-auto p-1">
                  {selectableAvatars}
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-px w-full bg-white" />
                  <span className="text-white">or</span>
                  <span className="h-px w-full bg-white" />
                </div>
              </>
            )}

            {editAvatarModalState.avatars.length < IMAGES_IN_STORAGE_LIMIT ? (
              <FileUploader
                type="image"
                multiple={false}
                onDropAccepted={handleAvatarUpload}
              />
            ) : (
              <NoDataBox
                text={`You can have up to ${IMAGES_IN_STORAGE_LIMIT} avatars`}
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProfilePage;
