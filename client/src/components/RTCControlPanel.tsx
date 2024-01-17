import { useNavigate } from "react-router-dom";
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
  isCameraMuted: boolean;
  isMicrophoneMuted: boolean;
  isLocalScreenShared: boolean;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  onToggleScreen: () => void;
}

const RTCControlPanel = ({
  isCameraMuted,
  isMicrophoneMuted,
  isLocalScreenShared,
  onToggleCamera,
  onToggleMicrophone,
  onToggleScreen,
}: RTCControlPanelProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center gap-4 self-center text-white">
      <RTCControlButton onClick={onToggleCamera}>
        {isCameraMuted ? (
          <BiCameraOff className="h-full w-full" />
        ) : (
          <BiCamera className="h-full w-full text-primary" />
        )}
      </RTCControlButton>
      <RTCControlButton onClick={onToggleMicrophone}>
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
