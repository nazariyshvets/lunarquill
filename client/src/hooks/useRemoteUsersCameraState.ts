import { useState, useEffect } from "react";
import { useRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-react";
import useUsersAttributes from "./useUsersAttributes";
import RTMConfig from "../config/RTMConfig";
import type RTCMediaType from "../types/RTCMediaType";

const useRemoteUsersCameraState = () => {
  const [areRemoteUsersCameraMuted, setAreRemoteUsersCameraMuted] = useState<{
    [uid: string]: boolean;
  }>({});
  const RTCClient = useRTCClient();
  const usersAttributes = useUsersAttributes();

  useEffect(() => {
    const handleUserPublished = (
      user: IAgoraRTCRemoteUser,
      mediaType: RTCMediaType,
    ) => {
      if (mediaType === "video") {
        setAreRemoteUsersCameraMuted((prev) => ({
          ...prev,
          [user.uid.toString()]: false,
        }));
      }
    };

    const handleUserUnpublished = (
      user: IAgoraRTCRemoteUser,
      mediaType: RTCMediaType,
    ) => {
      if (mediaType === "video") {
        setAreRemoteUsersCameraMuted((prev) => ({
          ...prev,
          [user.uid]: true,
        }));
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
    const camerasState = Object.entries(usersAttributes).reduce(
      (acc, [uid, attributes]) => {
        acc[uid] = attributes?.isCameraMuted || false;
        return acc;
      },
      {} as { [uid: string]: boolean },
    );

    setAreRemoteUsersCameraMuted(camerasState);
  }, [usersAttributes]);

  return areRemoteUsersCameraMuted;
};

export default useRemoteUsersCameraState;
