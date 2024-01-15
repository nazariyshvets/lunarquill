import { useState, useEffect } from "react";
import {
  LocalVideoTrack,
  RemoteUser,
  useRTCClient,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  useJoin,
  usePublish,
  useRemoteUsers,
  useClientEvent,
  UID,
} from "agora-rtc-react";
import { useWindowWidth } from "@react-hook/window-size";
import { isEmpty } from "lodash";
import { useAlert } from "react-alert";
import Loading from "./Loading";
import VideoTracksContainer from "./VideoTracksContainer";
import VideoTrack from "./VideoTrack";
import ScreenCaster from "./ScreenCaster";
import FeaturedUser from "./FeaturedUser";
import RTCControlPanel from "./RTCControlPanel";
import useAppDispatch from "../hooks/useAppDispatch";
import useScreenCasterId from "../hooks/useScreenCasterId";
import { setLocalTracks } from "../redux/rtcSlice";
import RTCConfig from "../config/RTCConfig";
import { MOBILE_SCREEN_THRESHOLD } from "../constants/constants";
import type UserVolume from "../types/UserVolume";

const localUserId = RTCConfig.uid;

// RTCManager component responsible for handling RTC-related logic and rendering UI
const RTCManager = () => {
  const RTCClient = useRTCClient();
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
  const { isLoading: isLoadingMic, localMicrophoneTrack } =
    useLocalMicrophoneTrack();
  const remoteUsers = useRemoteUsers();
  const [activeUsers, setActiveUsers] = useState<UserVolume[]>([]);
  const [isLocalScreenShared, setIsLocalScreenShared] = useState(false);
  const screenCasterId = useScreenCasterId();
  const windowWidth = useWindowWidth();
  const alert = useAlert();
  const dispatch = useAppDispatch();

  // Join channel
  useJoin(
    {
      appid: RTCConfig.appId,
      channel: RTCConfig.channelName,
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
    setActiveUsers(volumes.filter((volume) => volume.level > 10));
  });

  // Set local tracks to the redux store
  useEffect(() => {
    dispatch(setLocalTracks({ localCameraTrack, localMicrophoneTrack }));
  }, [dispatch, localCameraTrack, localMicrophoneTrack]);

  const toggleScreen = () => {
    if (isLocalScreenShared) {
      handleScreenShareEnd();
    } else {
      handleScreenShareStart();
    }
  };

  const handleScreenShareStart = () => {
    if (screenCasterId) {
      alert.info("Someone's screen is already shared");
    } else {
      setIsLocalScreenShared(true);
    }
  };

  const handleScreenShareEnd = () => {
    setIsLocalScreenShared(false);
  };

  const isUserActive = (uid: UID) => {
    return !!activeUsers.find((user) => user.uid === uid);
  };

  const isUserRemote = (uid: UID) => {
    return !!getRemoteUser(uid);
  };

  const getRemoteUser = (uid: UID) => {
    return remoteUsers.find((user) => user.uid === uid);
  };

  const getMostActiveUserId = () => {
    return isEmpty(activeUsers)
      ? null
      : activeUsers.reduce((res, user) => (user.level > res.level ? user : res))
          .uid;
  };

  // Check if devices are still loading
  const deviceLoading = isLoadingMic || isLoadingCam;
  if (deviceLoading) {
    return <Loading />;
  }

  const isMobile = windowWidth < MOBILE_SCREEN_THRESHOLD;
  const mostActiveUserId = getMostActiveUserId();

  return (
    <div className="flex h-screen min-h-screen flex-col gap-4 overflow-auto bg-deep-black p-4">
      {isMobile ? (
        <>
          <VideoTracksContainer>
            {(screenCasterId || localUserId !== mostActiveUserId) && (
              <VideoTrack isActive={isUserActive(localUserId)}>
                <LocalVideoTrack track={localCameraTrack} play />
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
                  <RemoteUser user={user} playVideo playAudio />
                </VideoTrack>
              ))}
          </VideoTracksContainer>

          <FeaturedUser>
            {screenCasterId ? (
              <RemoteUser
                user={getRemoteUser(screenCasterId)}
                playVideo
                playAudio
              />
            ) : mostActiveUserId && isUserRemote(mostActiveUserId) ? (
              <RemoteUser
                user={getRemoteUser(mostActiveUserId)}
                playVideo
                playAudio
              />
            ) : mostActiveUserId && !isUserRemote(mostActiveUserId) ? (
              <LocalVideoTrack track={localCameraTrack} play />
            ) : (
              <></>
            )}
          </FeaturedUser>
        </>
      ) : (
        <>
          <VideoTracksContainer isScreenShared={!!screenCasterId}>
            <VideoTrack
              size={screenCasterId ? "fixed" : "auto"}
              isActive={isUserActive(localUserId)}
            >
              <LocalVideoTrack track={localCameraTrack} play />
            </VideoTrack>

            {remoteUsers
              .filter((user) => user.uid !== screenCasterId)
              .map((user) => (
                <VideoTrack
                  key={user.uid}
                  size={screenCasterId ? "fixed" : "auto"}
                  isActive={isUserActive(user.uid)}
                >
                  <RemoteUser user={user} playVideo playAudio />
                </VideoTrack>
              ))}
          </VideoTracksContainer>

          {screenCasterId && (
            <FeaturedUser>
              <RemoteUser
                user={getRemoteUser(screenCasterId)}
                playVideo
                playAudio
              />
            </FeaturedUser>
          )}
        </>
      )}

      {isLocalScreenShared && (
        <ScreenCaster setIsLocalScreenShared={setIsLocalScreenShared} />
      )}

      <RTCControlPanel
        localCameraTrack={localCameraTrack}
        localMicrophoneTrack={localMicrophoneTrack}
        isLocalScreenShared={isLocalScreenShared}
        onToggleScreen={toggleScreen}
      />
    </div>
  );
};

export default RTCManager;
