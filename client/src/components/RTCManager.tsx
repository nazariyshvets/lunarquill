import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useRTCClient,
  useJoin,
  usePublish,
  useRemoteUsers,
  useClientEvent,
  UID,
} from "agora-rtc-react";
import { RtmChannel } from "agora-rtm-react";
import { useWindowWidth } from "@react-hook/window-size";
import { isEmpty } from "lodash";
import { useAlert } from "react-alert";

import Whiteboard from "./Whiteboard";
import Loading from "./Loading";
import VideoTracksContainer from "./VideoTracksContainer";
import VideoTrack from "./VideoTrack";
import LocalVideoTrack from "./LocalVideoTrack";
import RemoteUser from "./RemoteUser";
import ScreenCaster from "./ScreenCaster";
import FeaturedUser from "./FeaturedUser";
import RTCControlPanel from "./RTCControlPanel";
import Chat from "./Chat";
import useRTMClient from "../hooks/useRTMClient";
import useRemoteUsersTracksState from "../hooks/useRemoteUsersTracksState";
import useRemoteUsersAttributes from "../hooks/useUsersAttributes";
import useScreenCasterId from "../hooks/useScreenCasterId";
import useAuth from "../hooks/useAuth";
import useRTC from "../hooks/useRTC";
import useWhiteboardRoom from "../hooks/useWhiteboardRoom";
import useInitMediaDevices from "../hooks/useInitMediaDevices";
import RTCConfig from "../config/RTCConfig";
import { MOBILE_SCREEN_THRESHOLD } from "../constants/constants";
import PeerMessage from "../types/PeerMessage";
import type { PopulatedUserWithoutPassword, UserVolume } from "../types/User";
import { type ChatType, ChatTypeEnum } from "../types/ChatType";

interface RTCManagerProps {
  localUser: PopulatedUserWithoutPassword | undefined;
  channelId: string;
  RTMChannel: RtmChannel;
  chatType: ChatType;
  chatTargetId: string;
  whiteboardRoomId: string;
}

// RTCManager component responsible for handling RTC-related logic and rendering UI
const RTCManager = ({
  localUser,
  channelId,
  RTMChannel,
  chatType,
  chatTargetId,
  whiteboardRoomId,
}: RTCManagerProps) => {
  const RTCClient = useRTCClient();
  const RTMClient = useRTMClient();
  const {
    localMicrophoneTrack,
    localCameraTrack,
    isChatDisplayed,
    isWhiteboardDisplayed,
  } = useRTC();
  const [isCameraMuted, setIsCameraMuted] = useState(
    localCameraTrack?.muted ?? true,
  );
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(
    localMicrophoneTrack?.muted ?? true,
  );
  const [isLocalScreenShared, setIsLocalScreenShared] = useState(false);
  const remoteUsers = useRemoteUsers();
  const remoteUsersTracksState = useRemoteUsersTracksState(
    RTMClient,
    RTMChannel,
  );
  const remoteUsersAttrs = useRemoteUsersAttributes(RTMClient, RTMChannel);
  const [activeUsers, setActiveUsers] = useState<UserVolume[]>([]);
  const whiteboardRoomCredentials = useWhiteboardRoom(whiteboardRoomId);
  const screenCasterId = useScreenCasterId(RTMClient, RTMChannel, channelId);
  const { userId: localUserId } = useAuth();
  const windowWidth = useWindowWidth();
  const alert = useAlert();
  const navigate = useNavigate();

  const { isConnected: isConnectedToRTCChannel } = useJoin(
    {
      appid: RTCConfig.appId,
      channel: channelId,
      token: RTCConfig.rtcToken,
      uid: localUserId,
    },
    true,
    RTCClient,
  );

  useInitMediaDevices(isConnectedToRTCChannel);

  usePublish(
    [localMicrophoneTrack],
    !!localMicrophoneTrack && !isMicrophoneMuted,
    RTCClient,
  );
  usePublish(
    [localCameraTrack],
    !!localCameraTrack && !isCameraMuted,
    RTCClient,
  );

  useClientEvent(RTCClient, "volume-indicator", (volumes) => {
    const newActiveUsers = volumes.filter((volume) => volume.level > 10);

    if (JSON.stringify(activeUsers) !== JSON.stringify(newActiveUsers)) {
      setActiveUsers(newActiveUsers);
    }
  });

  const toggleCamera = async () => {
    try {
      await localCameraTrack?.setMuted(!isCameraMuted);
      await RTMClient.addOrUpdateLocalUserAttributes({
        isCameraMuted: isCameraMuted ? "false" : "true",
      });
      setIsCameraMuted(!isCameraMuted);
    } catch (err) {
      alert.error("Could not turn camera on/off. Please try again");
      console.error("Error toggling camera:", err);
    }
  };

  const toggleMicrophone = async () => {
    try {
      await localMicrophoneTrack?.setMuted(!isMicrophoneMuted);
      await RTMClient.addOrUpdateLocalUserAttributes({
        isMicrophoneMuted: isMicrophoneMuted ? "false" : "true",
      });
      setIsMicrophoneMuted(!isMicrophoneMuted);
    } catch (err) {
      alert.error("Could not turn microphone on/off. Please try again");
      console.error("Error toggling microphone:", err);
    }
  };

  const toggleScreen = () =>
    isLocalScreenShared ? handleScreenShareEnd() : handleScreenShareStart();

  const leaveChannel = () => {
    if (chatType === ChatTypeEnum.SingleChat) {
      RTMClient.sendMessageToPeer(
        {
          text: PeerMessage.CallEnded,
        },
        chatTargetId,
      );
    }

    navigate(
      `/${
        chatType === ChatTypeEnum.SingleChat
          ? `contacts/${chatTargetId}`
          : `channels/${channelId}`
      }/chat`,
    );
  };

  const handleScreenShareStart = () => {
    if (screenCasterId) {
      alert.info("Someone's screen is already shared");
    } else {
      setIsLocalScreenShared(true);
    }
  };

  const handleScreenShareEnd = () => setIsLocalScreenShared(false);

  const isUserActive = (uid: UID) =>
    activeUsers.some((user) => user.uid === uid);

  const isUserRemote = (uid: UID) => !!getRemoteUser(uid);

  const getRemoteUser = (uid: UID) =>
    remoteUsers.find((user) => user.uid === uid);

  const getMostActiveUserId = () =>
    isEmpty(activeUsers)
      ? null
      : activeUsers.reduce((res, user) => (user.level > res.level ? user : res))
          .uid;

  const isMediaEnabled = (userId: UID, media: "camera" | "microphone") =>
    !(remoteUsersTracksState[userId]?.[media]?.muted ?? true);

  const renderMobileView = () => (
    <div className="h-full w-full overflow-auto">
      <div
        className={`h-full flex-col gap-4 ${
          isChatDisplayed || isWhiteboardDisplayed ? "hidden" : "flex"
        }`}
      >
        <VideoTracksContainer>
          {(screenCasterId || localUserId !== mostActiveUserId) && (
            <VideoTrack isActive={!!localUserId && isUserActive(localUserId)}>
              <LocalVideoTrack
                avatarId={localUser?.selectedAvatar?._id}
                avatarSize="lg"
                track={localCameraTrack}
                play={!isCameraMuted}
              />
            </VideoTrack>
          )}

          {remoteUsers
            .filter((user) =>
              screenCasterId
                ? user.uid !== screenCasterId
                : user.uid !== mostActiveUserId,
            )
            .map((user) => (
              <VideoTrack key={user.uid} isActive={isUserActive(user.uid)}>
                <RemoteUser
                  username={remoteUsersAttrs[user.uid]?.username}
                  avatarId={remoteUsersAttrs[user.uid]?.avatarId}
                  avatarSize="lg"
                  user={user}
                  playVideo={isMediaEnabled(user.uid, "camera")}
                  playAudio={isMediaEnabled(user.uid, "microphone")}
                />
              </VideoTrack>
            ))}
        </VideoTracksContainer>

        <FeaturedUser>
          {screenCasterId ? (
            <RemoteUser
              user={getRemoteUser(screenCasterId)}
              isScreenCaster
              playVideo
            />
          ) : mostActiveUserId && isUserRemote(mostActiveUserId) ? (
            <RemoteUser
              username={remoteUsersAttrs[mostActiveUserId]?.username}
              avatarId={remoteUsersAttrs[mostActiveUserId]?.avatarId}
              avatarSize="xl"
              user={getRemoteUser(mostActiveUserId)}
              playVideo={isMediaEnabled(mostActiveUserId, "camera")}
              playAudio={isMediaEnabled(mostActiveUserId, "microphone")}
            />
          ) : mostActiveUserId && !isUserRemote(mostActiveUserId) ? (
            <LocalVideoTrack
              avatarId={localUser?.selectedAvatar?._id}
              avatarSize="xl"
              track={localCameraTrack}
              play={!isCameraMuted}
            />
          ) : (
            <></>
          )}
        </FeaturedUser>
      </div>

      <div
        className={`h-full ${
          isChatDisplayed && !isWhiteboardDisplayed ? "" : "hidden"
        }`}
      >
        <Chat
          chatType={chatType}
          targetId={chatTargetId}
          localUser={localUser}
        />
      </div>

      {whiteboardRoomCredentials && (
        <div
          className={`h-full w-full ${isWhiteboardDisplayed ? "" : "hidden"}`}
        >
          <Whiteboard roomCredentials={whiteboardRoomCredentials} />
        </div>
      )}
    </div>
  );

  const renderLaptopView = () => (
    <div className="flex h-full w-full gap-4 overflow-auto">
      <div
        className={`h-full w-full flex-col gap-4 ${
          isWhiteboardDisplayed ? "hidden" : "flex"
        }`}
      >
        <VideoTracksContainer isScreenShared={!!screenCasterId}>
          <VideoTrack
            size={screenCasterId ? "fixed" : "auto"}
            isActive={!!localUserId && isUserActive(localUserId)}
          >
            <LocalVideoTrack
              avatarId={localUser?.selectedAvatar?._id}
              avatarSize={screenCasterId ? "lg" : "xl"}
              track={localCameraTrack}
              play={!isCameraMuted}
            />
          </VideoTrack>

          {remoteUsers
            .filter((user) => user.uid !== screenCasterId)
            .map((user) => (
              <VideoTrack
                key={user.uid}
                size={screenCasterId ? "fixed" : "auto"}
                isActive={isUserActive(user.uid)}
              >
                <RemoteUser
                  username={remoteUsersAttrs[user.uid]?.username}
                  avatarId={remoteUsersAttrs[user.uid]?.avatarId}
                  avatarSize={screenCasterId ? "lg" : "xl"}
                  user={user}
                  playVideo={isMediaEnabled(user.uid, "camera")}
                  playAudio={isMediaEnabled(user.uid, "microphone")}
                />
              </VideoTrack>
            ))}
        </VideoTracksContainer>

        {screenCasterId && (
          <FeaturedUser>
            <RemoteUser
              user={getRemoteUser(screenCasterId)}
              isScreenCaster
              playVideo
            />
          </FeaturedUser>
        )}
      </div>

      <div
        className={`h-full flex-shrink-0 ${
          isChatDisplayed && !isWhiteboardDisplayed
            ? "sm:w-[280px] xl:w-[420px]"
            : "hidden"
        }`}
      >
        <Chat
          chatType={chatType}
          targetId={chatTargetId}
          localUser={localUser}
        />
      </div>

      {whiteboardRoomCredentials && (
        <div
          className={`h-full w-full ${isWhiteboardDisplayed ? "" : "hidden"}`}
        >
          <Whiteboard roomCredentials={whiteboardRoomCredentials} />
        </div>
      )}
    </div>
  );

  const renderScreenCaster = () =>
    isLocalScreenShared && (
      <ScreenCaster
        RTMClient={RTMClient}
        channelId={channelId}
        onScreenShareEnd={handleScreenShareEnd}
      />
    );

  // Check if devices are still loading
  if (!localCameraTrack || !localMicrophoneTrack) {
    return <Loading />;
  }

  const isMobile = windowWidth < MOBILE_SCREEN_THRESHOLD;
  const mostActiveUserId = getMostActiveUserId();

  return (
    <div className="flex h-screen min-h-screen flex-col gap-4 overflow-auto bg-deep-black p-4">
      {isMobile ? renderMobileView() : renderLaptopView()}
      {renderScreenCaster()}

      <RTCControlPanel
        isCameraMuted={isCameraMuted}
        isMicrophoneMuted={isMicrophoneMuted}
        isLocalScreenShared={isLocalScreenShared}
        onToggleCamera={toggleCamera}
        onToggleMicrophone={toggleMicrophone}
        onToggleScreen={toggleScreen}
        onChannelLeave={leaveChannel}
      />
    </div>
  );
};

export default RTCManager;
