import { useEffect, useRef, useState } from "react";

import { RtmChannel, RtmClient } from "agora-rtm-react";
import { useAlert } from "react-alert";

import useAppSelector from "./useAppSelector";
import type { UserWithoutPassword } from "../types/User";

const useJoinRTMChannel = (
  RTMClient: RtmClient,
  RTMChannel: RtmChannel | undefined,
  localUser: UserWithoutPassword | undefined,
) => {
  const [hasJoined, setHasJoined] = useState(false);
  const isRTMClientInitialized = useAppSelector(
    (state) => state.rtm.isRTMClientInitialized,
  );
  const isLoadingRef = useRef(false);
  const alert = useAlert();

  useEffect(() => {
    if (
      !RTMChannel ||
      !localUser ||
      !isRTMClientInitialized ||
      hasJoined ||
      isLoadingRef.current
    ) {
      return;
    }

    (async () => {
      isLoadingRef.current = true;

      try {
        const avatarId = localUser.selectedAvatar;
        await RTMClient.addOrUpdateLocalUserAttributes({
          username: localUser.username ?? "unknown",
          isCameraMuted: "true",
          isMicrophoneMuted: "true",
          ...(avatarId ? { avatarId } : {}),
        });
        await RTMChannel.join();
        setHasJoined(true);
      } catch (err) {
        alert.error("Could not join RTM channel");
        console.error("RTM channel joining failed:", err);
        setHasJoined(false);
      } finally {
        isLoadingRef.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [RTMClient, RTMChannel, localUser, isRTMClientInitialized, hasJoined]);

  useEffect(
    () => () => {
      if (hasJoined) {
        RTMChannel?.leave().catch((err) =>
          console.error("Failed to leave RTM channel:", err),
        );
      }
    },
    [RTMChannel, hasJoined],
  );

  return hasJoined;
};

export default useJoinRTMChannel;
