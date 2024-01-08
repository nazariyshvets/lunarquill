// Import necessary components and hooks from Agora SDK and React
import {
  LocalVideoTrack,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
} from "agora-rtc-react";

import React, { useState, createContext, PropsWithChildren, ButtonHTMLAttributes } from "react";
import { useNavigate } from "react-router-dom";
import {
  BiCamera,
  BiCameraOff,
  BiMicrophone,
  BiMicrophoneOff,
  BiPhoneOff,
} from "react-icons/bi";
import { RTCConfigType } from "../config/RTCConfig";

// Define the shape of the RTC context
interface RTCContextType {
  children: React.ReactNode;
  localCameraTrack: ICameraVideoTrack | null;
  localMicrophoneTrack: IMicrophoneAudioTrack | null;
}

interface RTCManagerProps {
  config: RTCConfigType;
}

// Create the RTC context
export const RTCContext = createContext<RTCContextType | null>(null);

// RTCProvider component to provide the RTC context to its children
export const RTCProvider = ({
  children,
  localCameraTrack,
  localMicrophoneTrack,
}: RTCContextType) => (
  <RTCContext.Provider
    value={{ localCameraTrack, localMicrophoneTrack, children }}
  >
    {children}
  </RTCContext.Provider>
);

// RTCManager component responsible for handling RTC-related logic and rendering UI
export const RTCManager = ({ config }: RTCManagerProps) => {
  // Retrieve local camera and microphone tracks and remote users
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
  const { isLoading: isLoadingMic, localMicrophoneTrack } =
    useLocalMicrophoneTrack();
  const remoteUsers = useRemoteUsers();
  // Local tracks state
  const [isCameraMuted, setIsCameraMuted] = useState(
    localCameraTrack?.muted || false,
  );
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(
    localMicrophoneTrack?.muted || false,
  );
  const navigate = useNavigate();

  // Publish local tracks
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Join the RTC channel with the specified configuration
  useJoin({
    appid: config.appId,
    channel: config.channelName,
    token: config.rtcToken,
    uid: config.uid,
  });

  const toggleCamera = () => {
    const isLocalCameraTrackMuted = localCameraTrack?.muted;
    localCameraTrack?.setMuted(!isLocalCameraTrackMuted);
    setIsCameraMuted(!isLocalCameraTrackMuted);
  };

  const toggleMicrophone = () => {
    const isLocalMicrophoneMuted = localMicrophoneTrack?.muted;
    localMicrophoneTrack?.setMuted(!isLocalMicrophoneMuted);
    setIsMicrophoneMuted(!isLocalMicrophoneMuted);
  };

  // Check if devices are still loading
  const deviceLoading = isLoadingMic || isLoadingCam;
  if (deviceLoading) {
    return (
      <div className="flex h-screen min-h-screen items-center justify-center bg-deep-black text-white">
        Loading devices...
      </div>
    );
  }

  // Render the RTCProvider and associated UI components
  return (
    <RTCProvider
      localCameraTrack={localCameraTrack}
      localMicrophoneTrack={localMicrophoneTrack}
    >
      <div className="flex h-screen min-h-screen flex-col gap-4 overflow-auto bg-deep-black p-4">
        <div
          className={`flex flex-shrink-0 gap-2 overflow-auto bg-black scrollbar-hide sm:grid sm:h-full sm:flex-shrink sm:grid-cols-auto-fit sm:p-4`}
        >
          <VideoTrack>
            <LocalVideoTrack track={localCameraTrack} play={true} />
          </VideoTrack>

          {remoteUsers.map((remoteUser) => (
            <VideoTrack key={remoteUser.uid}>
              <RemoteUser user={remoteUser} playVideo={true} playAudio={true} />
            </VideoTrack>
          ))}
        </div>

        {/* Active user or shared screen will be displayed here */}
        <div className="h-full w-full rounded-lg bg-white sm:hidden"></div>

        <div className="flex items-center justify-center gap-4 self-center text-white">
          <ControlButton onClick={toggleCamera}>
            {isCameraMuted ? (
              <BiCameraOff className="h-full w-full" />
            ) : (
              <BiCamera className="h-full w-full" />
            )}
          </ControlButton>
          <ControlButton onClick={toggleMicrophone}>
            {isMicrophoneMuted ? (
              <BiMicrophoneOff className="h-full w-full" />
            ) : (
              <BiMicrophone className="h-full w-full" />
            )}
          </ControlButton>
          <ControlButton onClick={() => navigate("/profile")}>
            <BiPhoneOff className="h-full w-full text-red-500" />
          </ControlButton>
        </div>
      </div>
    </RTCProvider>
  );
};

const VideoTrack = ({ children }: PropsWithChildren<Record<never, never>>) => {
  return (
    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-deep-black sm:h-auto sm:min-h-[200px] sm:w-auto">
      {children}
    </div>
  );
};

const ControlButton = ({
  children,
  onClick,
  ...rest
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => {
  return (
    <button
      className="h-12 w-12 rounded-full p-3 transition-shadow hover:shadow-button sm:h-14 sm:w-14"
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

// Export the RTCManager component as the default export
export default RTCManager;
