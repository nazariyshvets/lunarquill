import { useEffect, Dispatch, SetStateAction } from "react";
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
  const { screenTrack, error } = useLocalScreenTrack(true, {}, "disable");
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

  useEffect(() => {
    if (error) {
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
    ).catch((err) => console.log(err));

    return () => {
      RTMClient.deleteChannelAttributesByKeys(
        RTMChannel.channelId,
        ["screenCasterId"],
        { enableNotificationToChannelMembers: true },
      ).catch((err) => console.log(err));
    };
  }, [RTMClient, RTMChannel.channelId]);

  return <></>;
};

export default ScreenCaster;
