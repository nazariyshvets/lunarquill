import { useState, useEffect } from "react";

import { useRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-react";
import { RtmClient, RtmChannel } from "agora-rtm-react";

import { type RTCMediaType, UsersAttributes } from "../types/RTCMediaType";

const fetchUsersAttributes = async (
  RTMClient: RtmClient,
  RTMChannel: RtmChannel,
) => {
  try {
    const members = await RTMChannel.getMembers();
    const attributes = await Promise.all(
      members.map(async (uid) => {
        const { isCameraMuted, isMicrophoneMuted, ...rest } =
          await RTMClient.getUserAttributes(uid);

        return [
          uid,
          {
            isCameraMuted: isCameraMuted === "true",
            isMicrophoneMuted: isMicrophoneMuted === "true",
            ...rest,
          },
        ];
      }),
    );

    return Object.fromEntries(attributes);
  } catch (err) {
    console.error("Error fetching users attributes:", err);
    return {};
  }
};

const useUsersAttributes = (RTMClient: RtmClient, RTMChannel: RtmChannel) => {
  const [usersAttributes, setUsersAttributes] = useState<UsersAttributes>({});
  const RTCClient = useRTCClient();

  const updateUserTrackState = (
    user: IAgoraRTCRemoteUser,
    key: "isCameraMuted" | "isMicrophoneMuted",
    isMuted: boolean,
  ) => {
    setUsersAttributes((prevState) => ({
      ...prevState,
      [user.uid.toString()]: {
        ...prevState[user.uid.toString()],
        [key]: isMuted,
      },
    }));
  };

  useEffect(() => {
    const handleUserPublished = (
      user: IAgoraRTCRemoteUser,
      mediaType: RTCMediaType,
    ) => {
      if (mediaType === "video") {
        updateUserTrackState(user, "isCameraMuted", false);
      } else if (mediaType === "audio") {
        updateUserTrackState(user, "isMicrophoneMuted", false);
      }
    };

    const handleUserUnpublished = (
      user: IAgoraRTCRemoteUser,
      mediaType: RTCMediaType,
    ) => {
      if (mediaType === "video") {
        updateUserTrackState(user, "isCameraMuted", true);
      } else if (mediaType === "audio") {
        updateUserTrackState(user, "isMicrophoneMuted", true);
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
    const handleMemberCountUpdated = async () => {
      const attributes = await fetchUsersAttributes(RTMClient, RTMChannel);

      setUsersAttributes(attributes);
    };

    RTMChannel.on("MemberCountUpdated", handleMemberCountUpdated);

    return () => {
      RTMChannel.off("MemberCountUpdated", handleMemberCountUpdated);
    };
  }, [RTMClient, RTMChannel]);

  return usersAttributes;
};

export default useUsersAttributes;
