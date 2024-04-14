import { useEffect, useCallback, Dispatch, SetStateAction } from "react";

import {
  useRTCScreenShareClient,
  useJoin,
  useLocalScreenTrack,
  usePublish,
  useTrackEvent,
} from "agora-rtc-react";

import useRTMClient from "../hooks/useRTMClient";
import useRTMChannel from "../hooks/useRTMChannel";
import RTCConfig from "../config/RTCConfig";

interface ScreenCasterProps {
  setIsLocalScreenShared: Dispatch<SetStateAction<boolean>>;
}

const ScreenCaster = ({ setIsLocalScreenShared }: ScreenCasterProps) => {
  const screenShareClient = useRTCScreenShareClient();
  const { screenTrack, error } = useLocalScreenTrack(
    true,
    {},
    "disable",
    screenShareClient || undefined,
  );
  const RTMClient = useRTMClient();
  const RTMChannel = useRTMChannel(RTMClient);

  useJoin(
    {
      appid: RTCConfig.appId,
      channel: RTCConfig.channelName,
      token: RTCConfig.rtcTokenScreen,
      uid: RTCConfig.uidScreen,
    },
    true,
    screenShareClient,
  );

  usePublish([screenTrack], !!screenTrack, screenShareClient || undefined);

  useTrackEvent(screenTrack, "track-ended", () => {
    setIsLocalScreenShared(false);
  });

  const deleteChannelAttr = useCallback(() => {
    RTMClient.deleteChannelAttributesByKeys(
      RTMChannel.channelId,
      ["screenCasterId"],
      { enableNotificationToChannelMembers: true },
    ).catch((err) => console.log("Error deleting channel attributes:", err));
  }, [RTMClient, RTMChannel.channelId]);

  useEffect(() => {
    if (error) {
      console.log("Error in ScreenCaster:", error);
      setIsLocalScreenShared(false);
    }
  }, [error, setIsLocalScreenShared]);

  useEffect(() => {
    RTMClient.addOrUpdateChannelAttributes(
      RTMChannel.channelId,
      {
        screenCasterId: RTCConfig.uidScreen.toString(),
      },
      { enableNotificationToChannelMembers: true },
    ).catch((err) => console.log("Error adding channel attributes:", err));

    return () => {
      deleteChannelAttr();
    };
  }, [RTMClient, RTMChannel.channelId, deleteChannelAttr]);

  useEffect(() => {
    window.addEventListener("beforeunload", deleteChannelAttr);

    return () => {
      window.removeEventListener("beforeunload", deleteChannelAttr);
    };
  }, [deleteChannelAttr]);

  return <></>;
};

export default ScreenCaster;
