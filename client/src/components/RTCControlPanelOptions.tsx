import { useState } from "react";

import { BiCog } from "react-icons/bi";

import Switch from "./Switch";
import RTCControlButton from "./RTCControlButton";
import VirtualBackgroundConfigurator from "./VirtualBackgroundConfigurator";
import NoiseSuppressionConfigurator from "./NoiseSuppressionConfigurator";
import PitchShiftConfigurator from "./PitchShiftConfigurator";
import useRTC from "../hooks/useRTC";
import useAppDispatch from "../hooks/useAppDispatch";
import {
  setIsVirtualBgEnabled,
  setIsNoiseSuppressionEnabled,
  setIsPitchShiftEnabled,
  setIsChatDisplayed,
  setIsWhiteboardDisplayed,
} from "../redux/rtcSlice";

enum ActiveConfigurator {
  VirtualBackground = "virtualBackground",
  NoiseSuppression = "noiseSuppression",
  PitchShift = "pitchShift",
}

interface OptionRowProps {
  title: string;
  isEnabled: boolean;
  onSwitchChange: () => void;
  onConfigure?: () => void;
}

const RTCControlPanelOptions = () => {
  const [activeConfigurator, setActiveConfigurator] =
    useState<ActiveConfigurator | null>(null);
  const {
    isVirtualBgEnabled,
    isNoiseSuppressionEnabled,
    isPitchShiftEnabled,
    isChatDisplayed,
    isWhiteboardDisplayed,
  } = useRTC();
  const dispatch = useAppDispatch();

  const resetActiveConfigurator = () => setActiveConfigurator(null);

  const optionConfigs = [
    {
      title: "Virtual background",
      isEnabled: isVirtualBgEnabled ?? false,
      onSwitchChange: () =>
        dispatch(setIsVirtualBgEnabled(!isVirtualBgEnabled)),
      onConfigure: () =>
        setActiveConfigurator(ActiveConfigurator.VirtualBackground),
    },
    {
      title: "Noise suppression",
      isEnabled: isNoiseSuppressionEnabled ?? false,
      onSwitchChange: () =>
        dispatch(setIsNoiseSuppressionEnabled(!isNoiseSuppressionEnabled)),
      onConfigure: () =>
        setActiveConfigurator(ActiveConfigurator.NoiseSuppression),
    },
    {
      title: "Pitch shift",
      isEnabled: isPitchShiftEnabled ?? false,
      onSwitchChange: () =>
        dispatch(setIsPitchShiftEnabled(!isPitchShiftEnabled)),
      onConfigure: () => setActiveConfigurator(ActiveConfigurator.PitchShift),
    },
    {
      title: "Chat",
      isEnabled: isChatDisplayed ?? false,
      onSwitchChange: () => dispatch(setIsChatDisplayed(!isChatDisplayed)),
    },
    {
      title: "Whiteboard",
      isEnabled: isWhiteboardDisplayed ?? false,
      onSwitchChange: () =>
        dispatch(setIsWhiteboardDisplayed(!isWhiteboardDisplayed)),
    },
  ];

  return (
    <>
      {optionConfigs.map((config, i) => (
        <OptionRow key={i} {...config} />
      ))}

      {activeConfigurator === ActiveConfigurator.VirtualBackground ? (
        <VirtualBackgroundConfigurator onClose={resetActiveConfigurator} />
      ) : activeConfigurator === ActiveConfigurator.NoiseSuppression ? (
        <NoiseSuppressionConfigurator onClose={resetActiveConfigurator} />
      ) : activeConfigurator === ActiveConfigurator.PitchShift ? (
        <PitchShiftConfigurator onClose={resetActiveConfigurator} />
      ) : (
        <></>
      )}
    </>
  );
};

const OptionRow = ({
  title,
  isEnabled,
  onSwitchChange,
  onConfigure,
}: OptionRowProps) => (
  <div className="flex h-10 max-w-full items-center justify-between gap-4 sm:h-14">
    <p className="max-w-full truncate text-sm font-medium text-primary-light sm:text-lg">
      {title}
    </p>
    <div className="flex items-center gap-4">
      {onConfigure && (
        <RTCControlButton onClick={onConfigure}>
          <BiCog className="h-full w-full" />
        </RTCControlButton>
      )}

      <Switch checked={isEnabled} onChange={onSwitchChange} />
    </div>
  </div>
);

export default RTCControlPanelOptions;
