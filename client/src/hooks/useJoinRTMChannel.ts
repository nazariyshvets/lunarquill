import { useEffect, useRef, useState } from "react";

import { RtmChannel, RtmClient } from "agora-rtm-react";

import useAppSelector from "./useAppSelector";

const useJoinRTMChannel = (RTMClient: RtmClient, RTMChannel?: RtmChannel) => {
  const [isJoined, setIsJoined] = useState(false);
  const username = useAppSelector((state) => state.auth.username);
  const isRTMClientInitialized = useAppSelector(
    (state) => state.rtm.isRTMClientInitialized,
  );
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (!RTMChannel || !isRTMClientInitialized) {
      console.warn(
        "RTMChannel is absent or RTM Client is not initialized. Cannot join channel.",
      );
      return;
    }

    if (!isJoined && !isLoadingRef.current)
      (async () => {
        isLoadingRef.current = true;

        try {
          await RTMClient.addOrUpdateLocalUserAttributes({
            username: username ?? "unknown",
            isCameraMuted: "false",
            isMicrophoneMuted: "false",
          });
          await RTMChannel.join();
          setIsJoined(true);
        } catch (err) {
          console.log("RTM Channel joining failed:", err);
          setIsJoined(false);
        } finally {
          isLoadingRef.current = false;
        }
      })();

    return () => {
      if (isJoined) {
        RTMChannel.leave().catch((err) =>
          console.error("Failed to leave RTM channel:", err),
        );
      }
    };
  }, [RTMClient, RTMChannel, isJoined, isRTMClientInitialized, username]);

  return isJoined;
};

export default useJoinRTMChannel;
