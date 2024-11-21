import { Navigate, useLocation, useParams } from "react-router-dom";
import { AgoraRTCProvider, AgoraRTCScreenShareProvider } from "agora-rtc-react";
import { skipToken } from "@reduxjs/toolkit/query";

import Loading from "../components/Loading";
import RTCManager from "../components/RTCManager";
import VirtualBackground from "../components/VirtualBackground";
import NoiseSuppression from "../components/NoiseSuppression";
import { useRTCClient, useRTCScreenSharingClient } from "../hooks/useRTCClient";
import useRTC from "../hooks/useRTC";
import useRTMClient from "../hooks/useRTMClient";
import useRTMChannel from "../hooks/useRTMChannel";
import useRTCTokenWillExpire from "../hooks/useRTCTokenWillExpire";
import useAudioVolumeIndicator from "../hooks/useAudioVolumeIndicator";
import useInitRTC from "../hooks/useInitRTC";
import useJoinRTMChannel from "../hooks/useJoinRTMChannel";
import useAuth from "../hooks/useAuth";
import useAppSelector from "../hooks/useAppSelector";
import {
  useGetUserByIdQuery,
  useGetChannelByIdQuery,
  useGetContactByIdQuery,
} from "../services/mainService";
import RTCConfig from "../config/RTCConfig";
import { type ChatType, ChatTypeEnum } from "../types/ChatType";

interface ChannelPageComponentProps {
  channelId: string;
  chatType: ChatType;
}

const ChannelPage = () => {
  const location = useLocation();
  const { id: channelId } = useParams();
  const chatType = location.pathname.includes("/contacts/")
    ? ChatTypeEnum.SingleChat
    : location.pathname.includes("/channels/")
      ? ChatTypeEnum.GroupChat
      : null;

  return channelId && chatType ? (
    <ChannelPageComponent chatType={chatType} channelId={channelId} />
  ) : (
    <Navigate to="/profile" replace />
  );
};

const ChannelPageComponent = ({
  chatType,
  channelId,
}: ChannelPageComponentProps) => {
  const RTCClient = useRTCClient();
  const RTCScreenSharingClient = useRTCScreenSharingClient();
  const RTMClient = useRTMClient();
  const RTMChannel = useRTMChannel(RTMClient, channelId);
  const isRTCInitialized = useInitRTC(channelId);
  const isRTMClientInitialized = useAppSelector(
    (state) => state.rtm.isRTMClientInitialized,
  );
  const { userId } = useAuth();
  const { data: localUser } = useGetUserByIdQuery(userId ?? skipToken);
  const isRTMChannelJoined = useJoinRTMChannel(
    RTMClient,
    RTMChannel,
    localUser?.selectedAvatar?._id,
  );
  const isChatInitialized = useAppSelector(
    (state) => state.chat.isChatInitialized,
  );
  const { isVirtualBgEnabled, isNoiseSuppressionEnabled } = useRTC();
  const { data: contact, isFetching: isContactFetching } =
    useGetContactByIdQuery(
      chatType === ChatTypeEnum.SingleChat ? channelId : skipToken,
    );
  const { data: channel, isFetching: isChannelFetching } =
    useGetChannelByIdQuery(
      chatType === ChatTypeEnum.GroupChat ? channelId : skipToken,
    );

  useRTCTokenWillExpire(RTCClient, channelId, userId ?? "");
  useRTCTokenWillExpire(RTCScreenSharingClient, channelId, RTCConfig.uidScreen);
  useAudioVolumeIndicator(RTCClient);

  return !isRTCInitialized ||
    !isRTMClientInitialized ||
    !isRTMChannelJoined ||
    !isChatInitialized ||
    !RTMChannel ||
    isContactFetching ||
    isChannelFetching ? (
    <Loading />
  ) : (
    <AgoraRTCProvider client={RTCClient}>
      <AgoraRTCScreenShareProvider client={RTCScreenSharingClient}>
        <RTCManager
          localUser={localUser}
          RTMChannel={RTMChannel}
          channelId={channelId}
          chatType={chatType}
          chatTargetId={
            chatType === ChatTypeEnum.SingleChat
              ? contact?.user1._id === userId
                ? contact?.user2._id
                : contact?.user2._id === userId
                  ? contact?.user1._id
                  : ""
              : channel?.chatTargetId ?? ""
          }
          whiteboardRoomId={
            (chatType === ChatTypeEnum.SingleChat
              ? contact?.whiteboardRoomId
              : channel?.whiteboardRoomId) ?? ""
          }
        />
        {isVirtualBgEnabled && <VirtualBackground />}
        {isNoiseSuppressionEnabled && <NoiseSuppression />}
      </AgoraRTCScreenShareProvider>
    </AgoraRTCProvider>
  );
};

export default ChannelPage;
