import { useCallback } from "react";

import useAppDispatch from "../hooks/useAppDispatch";
import { userApi } from "./userApi";
import { channelApi } from "./channelApi";
import { QUERY_TAG_TYPES } from "../constants/constants";
import { AvatarsUpdateRequestPayload } from "../types/Avatar";

export const prepareAvatarsCollectionMutationPayload = (
  updateData: AvatarsUpdateRequestPayload,
) => {
  const formData = new FormData();

  updateData.removedAvatarIds.forEach((id) => {
    formData.append("removedAvatarIds[]", id);
  });
  updateData.newAvatars.forEach((avatar) => {
    formData.append("files", avatar.src);
    formData.append("newAvatarIds[]", avatar.id);
  });

  if (updateData.selectedAvatarId) {
    formData.append("selectedAvatarId", updateData.selectedAvatarId);
  }

  return formData;
};

export const useInvalidateTags = () => {
  const dispatch = useAppDispatch();

  return useCallback(
    (tags: { type: QUERY_TAG_TYPES; id?: string }[]) => {
      tags.forEach((tag) => {
        if (tag.type.startsWith("User")) {
          dispatch(userApi.util?.invalidateTags([tag]));
        } else if (tag.type.startsWith("Channel")) {
          dispatch(channelApi.util?.invalidateTags([tag]));
        }
      });
    },
    [dispatch],
  );
};
