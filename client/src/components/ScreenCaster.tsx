import { useEffect, Dispatch, SetStateAction } from "react";
import {
  useRTCScreenShareClient,
  useJoin,
  useLocalScreenTrack,
  usePublish,
  useTrackEvent,
} from "agora-rtc-react";
import RTCConfig from "../config/RTCConfig";

interface ScreenCasterProps {
  setIsLocalScreenShared: Dispatch<SetStateAction<boolean>>;
}

const userId = Math.floor(Math.random() * 1000000000);

const ScreenCaster = ({ setIsLocalScreenShared }: ScreenCasterProps) => {
  const screenShareClient = useRTCScreenShareClient();
  const { screenTrack, error } = useLocalScreenTrack(true, {}, "disable");

  useJoin(
    {
      appid: RTCConfig.appId,
      channel: RTCConfig.channelName,
      token: RTCConfig.rtcToken,
      uid: userId,
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

  return <></>;
};

export default ScreenCaster;
