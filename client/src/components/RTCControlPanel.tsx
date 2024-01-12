import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-react";
import {
  BiCamera,
  BiCameraOff,
  BiMicrophone,
  BiMicrophoneOff,
  BiWindowOpen,
  BiWindowClose,
  BiPhoneOff,
} from "react-icons/bi";
import RTCControlButton from "./RTCControlButton";

interface RTCControlPanelProps {
  localCameraTrack: ICameraVideoTrack | null;
  localMicrophoneTrack: IMicrophoneAudioTrack | null;
  isLocalScreenShared: boolean;
  onToggleScreen: () => void;
}

const RTCControlPanel = ({
  localCameraTrack,
  localMicrophoneTrack,
  isLocalScreenShared,
  onToggleScreen,
}: RTCControlPanelProps) => {
  const [isCameraMuted, setIsCameraMuted] = useState(
    localCameraTrack?.muted || false,
  );
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(
    localMicrophoneTrack?.muted || false,
  );
  const navigate = useNavigate();

  const toggleCamera = async () => {
    try {
      await localCameraTrack?.setMuted(!isCameraMuted);
      setIsCameraMuted(!isCameraMuted);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleMicrophone = async () => {
    try {
      await localMicrophoneTrack?.setMuted(!isMicrophoneMuted);
      setIsMicrophoneMuted(!isMicrophoneMuted);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 self-center text-white">
      <RTCControlButton onClick={toggleCamera}>
        {isCameraMuted ? (
          <BiCameraOff className="h-full w-full" />
        ) : (
          <BiCamera className="h-full w-full text-primary" />
        )}
      </RTCControlButton>
      <RTCControlButton onClick={toggleMicrophone}>
        {isMicrophoneMuted ? (
          <BiMicrophoneOff className="h-full w-full" />
        ) : (
          <BiMicrophone className="h-full w-full text-primary" />
        )}
      </RTCControlButton>
      <RTCControlButton onClick={onToggleScreen}>
        {isLocalScreenShared ? (
          <BiWindowOpen className="h-full w-full text-primary" />
        ) : (
          <BiWindowClose className="h-full w-full" />
        )}
      </RTCControlButton>
      <RTCControlButton onClick={() => navigate("/profile")}>
        <BiPhoneOff className="h-full w-full text-red-500" />
      </RTCControlButton>
    </div>
  );
};

export default RTCControlPanel;
