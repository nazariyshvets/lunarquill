import { useState, useEffect } from "react";

import { useRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-react";
import { RtmClient, RtmChannel } from "agora-rtm-react";

import useUsersAttributes from "./useUsersAttributes";
import useAuth from "./useAuth";
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

const useRemoteUsersTracksState = (
  RTMClient: RtmClient,
  RTMChannel: RtmChannel,
) => {
  const [remoteUsersTracksState, setRemoteUsersTracksState] =
    useState<RemoteUsersTracksState>({});
  const RTCClient = useRTCClient();
  const usersAttributes = useUsersAttributes(RTMClient, RTMChannel);
  const { userId } = useAuth();

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
    if (userId) delete usersAttributes[userId];

    const tracksState = Object.entries(usersAttributes).reduce(
      (acc, [uid, attributes]) => {
        acc[uid] = {
          camera: { muted: attributes?.isCameraMuted ?? true },
          microphone: { muted: attributes?.isMicrophoneMuted ?? true },
        };

        return acc;
      },
      {} as RemoteUsersTracksState,
    );

    setRemoteUsersTracksState(tracksState);
  }, [userId, usersAttributes]);

  return remoteUsersTracksState;
};

export default useRemoteUsersTracksState;
