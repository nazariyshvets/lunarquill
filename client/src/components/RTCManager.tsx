import { useState, useEffect } from "react";

import {
  useRTCClient,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
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
import useAppDispatch from "../hooks/useAppDispatch";
import useScreenCasterId from "../hooks/useScreenCasterId";
import useAuth from "../hooks/useAuth";
import useRTC from "../hooks/useRTC";
import useWhiteboardRoom from "../hooks/useWhiteboardRoom";
import {
  setLocalCameraTrack,
  setLocalMicrophoneTrack,
} from "../redux/rtcSlice";
import RTCConfig from "../config/RTCConfig";
import { MOBILE_SCREEN_THRESHOLD } from "../constants/constants";
import type UserVolume from "../types/UserVolume";
import { type ChatType, ChatTypeEnum } from "../types/ChatType";

interface RTCManagerProps {
  channelId: string;
  RTMChannel: RtmChannel;
  chatType: ChatType;
  chatTargetId: string;
  whiteboardRoomId: string;
}

// RTCManager component responsible for handling RTC-related logic and rendering UI
const RTCManager = ({
  channelId,
  RTMChannel,
  chatType,
  chatTargetId,
  whiteboardRoomId,
}: RTCManagerProps) => {
  const RTCClient = useRTCClient();
  const RTMClient = useRTMClient();
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
  const { isLoading: isLoadingMic, localMicrophoneTrack } =
    useLocalMicrophoneTrack();
  const [isCameraMuted, setIsCameraMuted] = useState(
    localCameraTrack?.muted || false,
  );
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(
    localMicrophoneTrack?.muted || false,
  );
  const [isLocalScreenShared, setIsLocalScreenShared] = useState(false);
  const remoteUsers = useRemoteUsers();
  const remoteUsersTracksState = useRemoteUsersTracksState(
    RTMClient,
    RTMChannel,
  );
  const remoteUsersAttrs = useRemoteUsersAttributes(RTMClient, RTMChannel);
  const [activeUsers, setActiveUsers] = useState<UserVolume[]>([]);
  const { isChatDisplayed, isWhiteboardDisplayed } = useRTC();
  const whiteboardRoomCredentials = useWhiteboardRoom(whiteboardRoomId);
  const screenCasterId = useScreenCasterId(RTMClient, RTMChannel, channelId);
  const { userId: localUserId } = useAuth();
  const windowWidth = useWindowWidth();
  const alert = useAlert();
  const dispatch = useAppDispatch();

  // Join channel
  useJoin(
    {
      appid: RTCConfig.appId,
      channel: channelId,
      token: RTCConfig.rtcToken,
      uid: localUserId,
    },
    true,
    RTCClient,
  );

  // Publish local tracks
  usePublish(
    [localMicrophoneTrack, localCameraTrack],
    !!localCameraTrack && !!localMicrophoneTrack,
    RTCClient,
  );

  // Check for active users
  useClientEvent(RTCClient, "volume-indicator", (volumes) => {
    const newActiveUsers = volumes.filter((volume) => volume.level > 10);

    if (JSON.stringify(activeUsers) !== JSON.stringify(newActiveUsers)) {
      setActiveUsers(newActiveUsers);
    }
  });

  // Set local tracks to the redux store
  useEffect(() => {
    localCameraTrack && dispatch(setLocalCameraTrack(localCameraTrack));
  }, [dispatch, localCameraTrack]);

  useEffect(() => {
    localMicrophoneTrack &&
      dispatch(setLocalMicrophoneTrack(localMicrophoneTrack));
  }, [dispatch, localMicrophoneTrack]);

  const toggleCamera = async () => {
    try {
      await localCameraTrack?.setMuted(!isCameraMuted);
      await RTMClient.addOrUpdateLocalUserAttributes({
        isCameraMuted: isCameraMuted ? "false" : "true",
      });
      setIsCameraMuted(!isCameraMuted);
    } catch (err) {
      console.log(err);
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
      console.log(err);
    }
  };

  const toggleScreen = () =>
    isLocalScreenShared ? handleScreenShareEnd() : handleScreenShareStart();

  const handleScreenShareStart = () => {
    if (screenCasterId) {
      alert.info("Someone's screen is already shared");
    } else {
      setIsLocalScreenShared(true);
    }
  };

  const handleScreenShareEnd = () => setIsLocalScreenShared(false);

  const isUserActive = (uid: UID) =>
    !!activeUsers.find((user) => user.uid === uid);

  const isUserRemote = (uid: UID) => !!getRemoteUser(uid);

  const getRemoteUser = (uid: UID) =>
    remoteUsers.find((user) => user.uid === uid);

  const getMostActiveUserId = () =>
    isEmpty(activeUsers)
      ? null
      : activeUsers.reduce((res, user) => (user.level > res.level ? user : res))
          .uid;

  const renderMobileView = () => (
    <div className="h-full w-full overflow-auto">
      <div
        className={`h-full flex-col gap-4 ${
          isChatDisplayed || isWhiteboardDisplayed ? "hidden" : "flex"
        }`}
      >
        <VideoTracksContainer>
          {(screenCasterId || localUserId !== mostActiveUserId) && (
            <VideoTrack isActive={isUserActive(localUserId ?? "")}>
              <LocalVideoTrack track={localCameraTrack} play={!isCameraMuted} />
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
                  user={user}
                  playVideo={!remoteUsersTracksState[user.uid]?.camera?.muted}
                  playAudio={
                    !remoteUsersTracksState[user.uid]?.microphone?.muted
                  }
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
              user={getRemoteUser(mostActiveUserId)}
              playVideo={
                !remoteUsersTracksState[mostActiveUserId]?.camera?.muted
              }
              playAudio={
                !remoteUsersTracksState[mostActiveUserId]?.microphone?.muted
              }
            />
          ) : mostActiveUserId && !isUserRemote(mostActiveUserId) ? (
            <LocalVideoTrack track={localCameraTrack} play={!isCameraMuted} />
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
        <Chat chatType={chatType} targetId={chatTargetId} />
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
            isActive={isUserActive(localUserId ?? "")}
          >
            <LocalVideoTrack track={localCameraTrack} play={!isCameraMuted} />
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
                  user={user}
                  playVideo={!remoteUsersTracksState[user.uid]?.camera?.muted}
                  playAudio={
                    !remoteUsersTracksState[user.uid]?.microphone?.muted
                  }
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
        <Chat chatType={chatType} targetId={chatTargetId} />
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
        RTMChannel={RTMChannel}
        channelId={channelId}
        setIsLocalScreenShared={setIsLocalScreenShared}
      />
    );

  // Check if devices are still loading
  if (
    isLoadingCam ||
    isLoadingMic ||
    !localCameraTrack ||
    !localMicrophoneTrack
  ) {
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
        backRoute={`/${
          chatType === ChatTypeEnum.SingleChat
            ? `contacts/${chatTargetId}`
            : `channels/${channelId}`
        }/chat`}
        onToggleCamera={toggleCamera}
        onToggleMicrophone={toggleMicrophone}
        onToggleScreen={toggleScreen}
      />
    </div>
  );
};

export default RTCManager;
