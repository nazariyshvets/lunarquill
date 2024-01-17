import { useState, useEffect } from "react";
import { useRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-react";
import type RTCMediaType from "../types/RTCMediaType";

const useRemoteUsersCameraState = () => {
  // Mapping between remote user id and camera state (on/off)
  const [areRemoteUsersCameraMuted, setAreRemoteUsersCameraMuted] = useState<{
    [key: string]: boolean;
  }>({});
  const RTCClient = useRTCClient();

  useEffect(() => {
    const handleUserPublished = (
      user: IAgoraRTCRemoteUser,
      mediaType: RTCMediaType,
    ) => {
      if (mediaType === "video") {
        setAreRemoteUsersCameraMuted((prevAreRemoteUsersCameraMuted) => ({
          ...prevAreRemoteUsersCameraMuted,
          [user.uid]: false,
        }));
      }
    };

    const handleUserUnpublished = (
      user: IAgoraRTCRemoteUser,
      mediaType: RTCMediaType,
    ) => {
      if (mediaType === "video") {
        setAreRemoteUsersCameraMuted((prevAreRemoteUsersCameraMuted) => ({
          ...prevAreRemoteUsersCameraMuted,
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

  return areRemoteUsersCameraMuted;
};

export default useRemoteUsersCameraState;
