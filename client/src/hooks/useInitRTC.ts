import { useEffect, useState } from "react";

import { useAlert } from "react-alert";

import useAuth from "./useAuth";
import { useFetchRTCTokenMutation } from "../services/mainService";
import RTCConfig from "../config/RTCConfig";

const useInitRTC = (channelId: string) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [fetchRTCToken] = useFetchRTCTokenMutation();
  const { userId } = useAuth();
  const alert = useAlert();

  useEffect(() => {
    if (!channelId || !userId) return;

    (async () => {
      try {
        const [rtcToken, rtcTokenScreen] = await Promise.all([
          fetchRTCToken({ channelName: channelId, uid: userId }).unwrap(),
          fetchRTCToken({
            channelName: channelId,
            uid: RTCConfig.uidScreen,
          }).unwrap(),
        ]);

        RTCConfig.rtcToken = rtcToken;
        RTCConfig.rtcTokenScreen = rtcTokenScreen;
        setIsInitialized(true);
      } catch (err) {
        setIsInitialized(false);
        alert.error("Could not initialize RTC client");
        console.error("Error initializing RTC client:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, userId]);

  return isInitialized;
};

export default useInitRTC;
