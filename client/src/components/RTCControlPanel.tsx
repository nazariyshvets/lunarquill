import { useState } from "react";

import {
  BiDotsHorizontalRounded,
  BiCamera,
  BiCameraOff,
  BiMicrophone,
  BiMicrophoneOff,
  BiWindowOpen,
  BiWindowClose,
  BiPhoneOff,
} from "react-icons/bi";

import RTCControlPanelOptions from "./RTCControlPanelOptions";
import RTCControlButton from "./RTCControlButton";

interface RTCControlPanelProps {
  isCameraMuted: boolean;
  isMicrophoneMuted: boolean;
  isLocalScreenShared: boolean;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  onToggleScreen: () => void;
  onChannelLeave: () => void;
}

const RTCControlPanel = ({
  isCameraMuted,
  isMicrophoneMuted,
  isLocalScreenShared,
  onToggleCamera,
  onToggleMicrophone,
  onToggleScreen,
  onChannelLeave,
}: RTCControlPanelProps) => {
  const [areOptionsDisplayed, setAreOptionsDisplayed] = useState(false);

  const toggleOptions = () => setAreOptionsDisplayed((prevState) => !prevState);

  return (
    <div className="relative flex w-full items-center justify-center gap-4 text-white">
      {areOptionsDisplayed && <RTCControlPanelOptions />}

      <RTCControlButton
        onClick={toggleOptions}
        className="sm:absolute sm:left-0"
      >
        {areOptionsDisplayed ? (
          <BiDotsHorizontalRounded className="h-full w-full text-primary" />
        ) : (
          <BiDotsHorizontalRounded className="h-full w-full" />
        )}
      </RTCControlButton>
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
      <RTCControlButton onClick={onChannelLeave}>
        <BiPhoneOff className="h-full w-full text-red-500" />
      </RTCControlButton>
    </div>
  );
};

export default RTCControlPanel;
