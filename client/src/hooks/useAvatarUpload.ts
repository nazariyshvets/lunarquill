import { useState } from "react";

import { nanoid } from "@reduxjs/toolkit";

import { useDownloadFilesMutation } from "../services/fileApi";
import useHandleError from "./useHandleError";
import extractFilesFromBlob from "../utils/extractFilesFromBlob";
import getFileDataUrls from "../utils/getFileDataUrls";
import getBlobFromFile from "../utils/getBlobFromFile";
import {
  Avatar,
  AvatarsUpdateRequestPayload,
  AvatarsUpdateResponsePayload,
} from "../types/Avatar";

interface UseAvatarUploadProps {
  avatarIds: string[];
  selectedAvatarId: string | undefined;
}

interface ModalState {
  isOpen: boolean;
  avatars: Avatar[];
  selectedAvatarId?: string;
  removedAvatarIds: string[];
}

const initialModalState: ModalState = {
  isOpen: false,
  avatars: [],
  removedAvatarIds: [],
};

const useAvatarUpload = ({
  selectedAvatarId,
  avatarIds,
}: UseAvatarUploadProps) => {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [modalState, setModalState] = useState(initialModalState);

  const handleError = useHandleError();
  const [downloadFiles] = useDownloadFilesMutation();

  const handleModalOpen = async () => {
    if (avatars.length) {
      setModalState({
        isOpen: true,
        avatars: [...avatars],
        selectedAvatarId,
        removedAvatarIds: [],
      });
    } else {
      try {
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
        setModalState({
          isOpen: true,
          avatars: [...newAvatars],
          selectedAvatarId,
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

  const handleModalClose = () => setModalState(initialModalState);

  const handleAvatarSelect = (avatarId: string) =>
    setModalState((prevState) => ({
      ...prevState,
      selectedAvatarId: avatarId,
    }));

  const handleAvatarRemove = (avatarToRemove: Avatar) =>
    setModalState((prevState) => ({
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
    const avatarId = nanoid();

    setModalState((prevState) => ({
      ...prevState,
      avatars: [
        {
          id: avatarId,
          name: src?.name || `avatar__${avatarId}`,
          dataUrl,
          src,
        },
        ...prevState.avatars,
      ],
    }));
  };

  const handleModalSaveBtnClick = async <T>(
    args: T,
    updateAvatarsCollection: (
      args: T & { updateData: AvatarsUpdateRequestPayload },
    ) => {
      unwrap(): Promise<AvatarsUpdateResponsePayload>;
    },
  ) => {
    try {
      const requestPayload = {
        ...args,
        updateData: {
          removedAvatarIds: modalState.removedAvatarIds,
          newAvatars: modalState.avatars
            .filter((avatar) => avatar.src)
            .map((avatar) => ({ id: avatar.id, src: avatar.src as File })),
          selectedAvatarId: modalState.selectedAvatarId,
        },
      };
      const { frontendIdToObjectIdMap } =
        await updateAvatarsCollection(requestPayload).unwrap();

      setAvatars(
        modalState.avatars.map((avatar) =>
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
      handleModalClose();
    }
  };

  return {
    modalState,
    handleModalOpen,
    handleModalClose,
    handleAvatarSelect,
    handleAvatarRemove,
    handleAvatarUpload,
    handleModalSaveBtnClick,
  };
};

export default useAvatarUpload;
