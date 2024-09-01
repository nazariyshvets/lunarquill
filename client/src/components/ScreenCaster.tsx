import { useEffect, useCallback } from "react";

import {
  useRTCScreenShareClient,
  useJoin,
  useLocalScreenTrack,
  usePublish,
  useTrackEvent,
} from "agora-rtc-react";
import { RtmClient } from "agora-rtm-react";

import RTCConfig from "../config/RTCConfig";

interface ScreenCasterProps {
  RTMClient: RtmClient;
  channelId: string;
  onScreenShareEnd: () => void;
}

const ScreenCaster = ({
  RTMClient,
  channelId,
  onScreenShareEnd,
}: ScreenCasterProps) => {
  const screenShareClient = useRTCScreenShareClient();
  const { screenTrack, error } = useLocalScreenTrack(
    true,
    {},
    "disable",
    screenShareClient || undefined,
  );

  useJoin(
    {
      appid: RTCConfig.appId,
      channel: channelId,
      token: RTCConfig.rtcTokenScreen,
      uid: RTCConfig.uidScreen,
    },
    true,
    screenShareClient,
  );

  usePublish([screenTrack], !!screenTrack, screenShareClient || undefined);

  useTrackEvent(screenTrack, "track-ended", onScreenShareEnd);

  const deleteChannelAttr = useCallback(() => {
    RTMClient.deleteChannelAttributesByKeys(channelId, ["screenCasterId"], {
      enableNotificationToChannelMembers: true,
    }).catch((err) => console.error("Error deleting channel attributes:", err));
  }, [RTMClient, channelId]);

  useEffect(() => {
    if (error) {
      console.error("Error in ScreenCaster:", error);
      onScreenShareEnd();
    }
  }, [error, onScreenShareEnd]);

  useEffect(() => {
    RTMClient.addOrUpdateChannelAttributes(
      channelId,
      {
        screenCasterId: RTCConfig.uidScreen.toString(),
      },
      { enableNotificationToChannelMembers: true },
    ).catch((err) => console.error("Error adding channel attributes:", err));

    return () => {
      deleteChannelAttr();
    };
  }, [RTMClient, channelId, deleteChannelAttr]);

  useEffect(() => {
    window.addEventListener("beforeunload", deleteChannelAttr);

    return () => {
      window.removeEventListener("beforeunload", deleteChannelAttr);
    };
  }, [deleteChannelAttr]);

  return null;
};

export default ScreenCaster;
