import { useEffect, useRef, useState } from "react";

import useAuth from "./useAuth";
import useAuthRequestConfig from "./useAuthRequestConfig";
import fetchRTCToken from "../utils/fetchRTCToken";
import RTCConfig from "../config/RTCConfig";

const useInitRTC = (channelId: string) => {
  // Whether RTC is initialized
  const [isInitialized, setIsInitialized] = useState(false);
  // Whether the process of initialization is happening
  const isLoadingRef = useRef(false);
  const { userId } = useAuth();
  const requestConfig = useAuthRequestConfig();

  useEffect(() => {
    if (!RTCConfig.serverUrl || !channelId || !userId) {
      console.warn(
        "Please make sure you specified the RTC token server URL and channel name in the configuration file",
      );
      return;
    }

    if (!isInitialized && !isLoadingRef.current)
      (async () => {
        isLoadingRef.current = true;

        try {
          const [rtcToken, rtcTokenScreen] = await Promise.all([
            fetchRTCToken(channelId, userId, requestConfig),
            fetchRTCToken(channelId, RTCConfig.uidScreen, requestConfig),
          ]);

          RTCConfig.rtcToken = rtcToken;
          RTCConfig.rtcTokenScreen = rtcTokenScreen;
          setIsInitialized(true);
        } catch (err) {
          setIsInitialized(false);
          console.log(err);
        } finally {
          isLoadingRef.current = false;
        }
      })();
  }, [channelId, isInitialized, requestConfig, userId]);

  return isInitialized;
};

export default useInitRTC;
