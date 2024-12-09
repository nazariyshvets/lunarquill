import { useGetUserByIdQuery } from "../services/userApi";
import { useRTCClient, useRTCScreenSharingClient } from "./useRTCClient";
import useRTMClient from "./useRTMClient";
import useRTMChannel from "./useRTMChannel";
import useInitRTC from "./useInitRTC";
import useJoinRTMChannel from "./useJoinRTMChannel";
import useAppSelector from "./useAppSelector";
import useRTC from "./useRTC";
import useRTCTokenWillExpire from "./useRTCTokenWillExpire";
import useAudioVolumeIndicator from "./useAudioVolumeIndicator";
import RTCConfig from "../config/RTCConfig";

const useInitCall = (localUserId: string, channelId: string) => {
  const RTCClient = useRTCClient();
  const RTCScreenSharingClient = useRTCScreenSharingClient();
  const RTMClient = useRTMClient();
  const RTMChannel = useRTMChannel(RTMClient, channelId);
  const isRTCInitialized = useInitRTC(channelId);
  const isRTMClientInitialized = useAppSelector(
    (state) => state.rtm.isRTMClientInitialized,
  );
  const { data: localUser } = useGetUserByIdQuery(localUserId);
  const hasJoinedRTMChannel = useJoinRTMChannel(
    RTMClient,
    RTMChannel,
    localUser,
  );
  const isChatInitialized = useAppSelector(
    (state) => state.chat.isChatInitialized,
  );
  const { isVirtualBgEnabled, isNoiseSuppressionEnabled } = useRTC();

  useRTCTokenWillExpire(RTCClient, channelId, localUserId);
  useRTCTokenWillExpire(RTCScreenSharingClient, channelId, RTCConfig.uidScreen);
  useAudioVolumeIndicator(RTCClient);

  return {
    localUser,
    RTCClient,
    RTCScreenSharingClient,
    RTMChannel,
    isRTCInitialized,
    isRTMClientInitialized,
    hasJoinedRTMChannel,
    isChatInitialized,
    isVirtualBgEnabled,
    isNoiseSuppressionEnabled,
  };
};

export default useInitCall;
