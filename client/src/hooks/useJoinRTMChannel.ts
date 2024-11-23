import { useEffect, useRef, useState } from "react";

import { RtmChannel, RtmClient } from "agora-rtm-react";
import { useAlert } from "react-alert";

import useAppSelector from "./useAppSelector";

const useJoinRTMChannel = (
  RTMClient: RtmClient,
  RTMChannel?: RtmChannel,
  avatarId?: string,
) => {
  const [isJoined, setIsJoined] = useState(false);
  const username = useAppSelector((state) => state.auth.username);
  const isRTMClientInitialized = useAppSelector(
    (state) => state.rtm.isRTMClientInitialized,
  );
  const isLoadingRef = useRef(false);
  const alert = useAlert();

  useEffect(() => {
    if (
      !RTMChannel ||
      !isRTMClientInitialized ||
      isJoined ||
      isLoadingRef.current
    ) {
      return;
    }

    (async () => {
      isLoadingRef.current = true;

      try {
        await RTMClient.addOrUpdateLocalUserAttributes({
          username: username ?? "unknown",
          isCameraMuted: "true",
          isMicrophoneMuted: "true",
          ...(avatarId ? { avatarId } : {}),
        });
        await RTMChannel.join();
        setIsJoined(true);
      } catch (err) {
        alert.error("Could not join RTM channel");
        console.error("RTM channel joining failed:", err);
        setIsJoined(false);
      } finally {
        isLoadingRef.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    RTMClient,
    RTMChannel,
    isRTMClientInitialized,
    username,
    avatarId,
    isJoined,
  ]);

  useEffect(
    () => () => {
      if (isJoined) {
        RTMChannel?.leave().catch((err) =>
          console.error("Failed to leave RTM channel:", err),
        );
      }
    },
    [RTMChannel, isJoined],
  );

  return isJoined;
};

export default useJoinRTMChannel;
