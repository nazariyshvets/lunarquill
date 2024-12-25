import { useEffect, useState } from "react";

import useAuth from "./useAuth";
import { useFetchRTCTokenMutation } from "../services/tokenApi";
import showToast from "../utils/showToast";
import RTCConfig from "../config/RTCConfig";

const useInitRTC = (channelId: string) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [fetchRTCToken] = useFetchRTCTokenMutation();
  const { userId } = useAuth();

  useEffect(() => {
    if (!channelId || !userId) {
      return;
    }

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
        showToast("error", "Could not initialize RTC client");
        console.error("Error initializing RTC client:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, userId]);

  return isInitialized;
};

export default useInitRTC;
