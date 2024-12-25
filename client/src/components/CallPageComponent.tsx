import { AgoraRTCProvider, AgoraRTCScreenShareProvider } from "agora-rtc-react";

import Loading from "../components/Loading";
import RTCManager from "../components/RTCManager";
import VirtualBackground from "../components/VirtualBackground";
import NoiseSuppression from "../components/NoiseSuppression";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useInitCall from "../hooks/useInitCall";
import { ChatType } from "../types/ChatType";
import type { UserWithoutPassword } from "../types/User";

interface CallPageComponentProps<T> {
  localUserId: string;
  channelId: string;
  pageTitle: string;
  data: T | undefined;
  chatType: ChatType;
  getChatTargetId: (data: T) => string;
  getChatMembers: (data: T) => UserWithoutPassword[];
  getWhiteboardRoomId: (data: T) => string;
}

const CallPageComponent = <T,>({
  localUserId,
  channelId,
  pageTitle,
  data,
  chatType,
  getChatTargetId,
  getChatMembers,
  getWhiteboardRoomId,
}: CallPageComponentProps<T>) => {
  const {
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
  } = useInitCall(localUserId, channelId);

  useDocumentTitle(pageTitle);

  return !isRTCInitialized ||
    !isRTMClientInitialized ||
    !hasJoinedRTMChannel ||
    !isChatInitialized ||
    !RTMChannel ||
    !data ? (
    <Loading />
  ) : (
    <AgoraRTCProvider client={RTCClient}>
      <AgoraRTCScreenShareProvider client={RTCScreenSharingClient}>
        <RTCManager
          localUser={localUser}
          RTMChannel={RTMChannel}
          channelId={channelId}
          chatType={chatType}
          chatTargetId={getChatTargetId(data)}
          chatMembers={getChatMembers(data)}
          whiteboardRoomId={getWhiteboardRoomId(data)}
        />
        {isVirtualBgEnabled && <VirtualBackground />}
        {isNoiseSuppressionEnabled && <NoiseSuppression />}
      </AgoraRTCScreenShareProvider>
    </AgoraRTCProvider>
  );
};

export default CallPageComponent;
