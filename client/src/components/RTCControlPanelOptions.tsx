import { useState } from "react";
import { BiCog } from "react-icons/bi";
import Switch from "./Switch";
import RTCControlButton from "./RTCControlButton";
import VirtualBackgroundConfigurator from "./VirtualBackgroundConfigurator";
import useRTC from "../hooks/useRTC";
import useAppDispatch from "../hooks/useAppDispatch";
import { setIsVirtualBgEnabled } from "../redux/rtcSlice";

type ActiveConfigurator = "virtual-background";

interface OptionRowProps {
  title: string;
  isEnabled: boolean;
  onSwitchChange: () => void;
  onConfigure: () => void;
}

const RTCControlPanelOptions = () => {
  const [activeConfigurator, setActiveConfigurator] =
    useState<ActiveConfigurator | null>(null);
  const { isVirtualBgEnabled } = useRTC();
  const dispatch = useAppDispatch();

  const resetActiveConfigurator = () => {
    setActiveConfigurator(null);
  };

  return (
    <div className="absolute bottom-[calc(100%+1rem)] left-0 z-50 rounded bg-deep-black p-4 shadow-button">
      <OptionRow
        title="Virtual background"
        isEnabled={isVirtualBgEnabled}
        onSwitchChange={() =>
          dispatch(setIsVirtualBgEnabled(!isVirtualBgEnabled))
        }
        onConfigure={() => setActiveConfigurator("virtual-background")}
      />

      {activeConfigurator === "virtual-background" ? (
        <VirtualBackgroundConfigurator onClose={resetActiveConfigurator} />
      ) : (
        <></>
      )}
    </div>
  );
};

const OptionRow = ({
  title,
  isEnabled,
  onSwitchChange,
  onConfigure,
}: OptionRowProps) => {
  return (
    <div className="flex max-w-[256px] items-center justify-between gap-8 sm:max-w-[400px]">
      <p className="max-w-full truncate text-sm font-medium text-primary-light sm:text-lg">
        {title}
      </p>
      <div className="flex items-center gap-4">
        <Switch checked={isEnabled} onChange={onSwitchChange} />
        <RTCControlButton onClick={onConfigure}>
          <BiCog className="h-full w-full" />
        </RTCControlButton>
      </div>
    </div>
  );
};

export default RTCControlPanelOptions;
