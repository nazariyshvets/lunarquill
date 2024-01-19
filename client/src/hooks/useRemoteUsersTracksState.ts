import { useState, useEffect } from "react";
import { useRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-react";
import useUsersAttributes from "./useUsersAttributes";
import RTMConfig from "../config/RTMConfig";
import type RTCMediaType from "../types/RTCMediaType";

interface RemoteUsersTracksState {
  [uid: string]: {
    camera?: {
      muted: boolean;
    };
    microphone?: {
      muted: boolean;
    };
  };
}

const useRemoteUsersTracksState = () => {
  const [remoteUsersTracksState, setRemoteUsersTracksState] =
    useState<RemoteUsersTracksState>({});
  const RTCClient = useRTCClient();
  const usersAttributes = useUsersAttributes();

  const updateUserTrackState = (
    user: IAgoraRTCRemoteUser,
    trackType: "camera" | "microphone",
    muted: boolean,
  ) => {
    setRemoteUsersTracksState((prev) => ({
      ...prev,
      [user.uid.toString()]: {
        ...prev[user.uid.toString()],
        [trackType]: {
          muted,
        },
      },
    }));
  };

  useEffect(() => {
    const handleUserPublished = (
      user: IAgoraRTCRemoteUser,
      mediaType: RTCMediaType,
    ) => {
      if (mediaType === "video") {
        updateUserTrackState(user, "camera", false);
      } else if (mediaType === "audio") {
        updateUserTrackState(user, "microphone", false);
      }
    };

    const handleUserUnpublished = (
      user: IAgoraRTCRemoteUser,
      mediaType: RTCMediaType,
    ) => {
      if (mediaType === "video") {
        updateUserTrackState(user, "camera", true);
      } else if (mediaType === "audio") {
        updateUserTrackState(user, "microphone", true);
      }
    };

    RTCClient.on("user-published", handleUserPublished);
    RTCClient.on("user-unpublished", handleUserUnpublished);

    return () => {
      RTCClient.off("user-published", handleUserPublished);
      RTCClient.off("user-unpublished", handleUserUnpublished);
    };
  }, [RTCClient]);

  useEffect(() => {
    // remove local user
    delete usersAttributes[RTMConfig.uid];
    const tracksState = Object.entries(usersAttributes).reduce(
      (acc, [uid, attributes]) => {
        acc[uid] = {
          camera: { muted: attributes?.isCameraMuted || false },
          microphone: { muted: attributes?.isMicrophoneMuted || false },
        };
        return acc;
      },
      {} as RemoteUsersTracksState,
    );

    setRemoteUsersTracksState(tracksState);
  }, [usersAttributes]);

  return remoteUsersTracksState;
};

export default useRemoteUsersTracksState;
