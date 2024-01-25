import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useAlert } from "react-alert";
import { BiCog } from "react-icons/bi";
import Switch from "./Switch";
import Modal from "./Modal";
import RTCControlButton from "./RTCControlButton";
import Select, { SelectOption } from "./Select";
import FileUploader from "./FileUploader";
import useRTC from "../hooks/useRTC";
import useAppDispatch from "../hooks/useAppDispatch";
import {
  setIsVirtualBgEnabled,
  setVirtualBgType,
  setVirtualBgBlurDegree,
  setVirtualBgColor,
  setVirtualBgImgSource,
  setVirtualBgVideoSource,
} from "../redux/rtcSlice";
import type VirtualBgType from "../types/VirtualBgType";
import type VirtualBgBlurDegree from "../types/VirtualBgBlurDegree";

type ActiveConfigurator = "virtual-background";

interface OptionRowProps {
  title: string;
  isEnabled: boolean;
  onSwitchChange: () => void;
  onConfigure: () => void;
}

interface VirtualBackgroundConfiguratorProps {
  onClose: () => void;
}

const virtualBgTypeOptions = [
  { value: "blur", label: "Blur" },
  { value: "color", label: "Color" },
  { value: "img", label: "Image" },
  { value: "video", label: "Video" },
];

const virtualBgBlurDegreeOptions = [
  { value: "1", label: "Low" },
  { value: "2", label: "Medium" },
  { value: "3", label: "High" },
];

const RTCControlPanelOptions = () => {
  const [activeConfigurator, setActiveConfigurator] =
    useState<ActiveConfigurator | null>(null);
  const { isVirtualBgEnabled } = useRTC();
  const dispatch = useAppDispatch();

  const resetActiveConfigurator = () => {
    setActiveConfigurator(null);
  };

  return (
    <div className="absolute bottom-[calc(100%+1rem)] left-0 rounded bg-deep-black p-4 shadow-button">
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

const VirtualBackgroundConfigurator = ({
  onClose,
}: VirtualBackgroundConfiguratorProps) => {
  const {
    virtualBgType,
    virtualBgBlurDegree,
    virtualBgColor,
    virtualBgImgSource,
    virtualBgVideoSource,
  } = useRTC();
  const [type, setType] = useState(virtualBgType);
  const [blurDegree, setBlurDegree] = useState(virtualBgBlurDegree);
  const [color, setColor] = useState(virtualBgColor);
  const [imgSource, setImgSource] = useState(virtualBgImgSource);
  const [videoSource, setVideoSource] = useState(virtualBgVideoSource);
  const dispatch = useAppDispatch();
  const alert = useAlert();

  const getInputs = () => {
    switch (type) {
      case "blur":
        return (
          <Select
            value={virtualBgBlurDegreeOptions.find(
              ({ value }) => value === blurDegree.toString(),
            )}
            options={virtualBgBlurDegreeOptions}
            className="w-full"
            onChange={(newValue) =>
              setBlurDegree(
                Number((newValue as SelectOption).value) as VirtualBgBlurDegree,
              )
            }
          />
        );
      case "color":
        return <HexColorPicker color={color} onChange={setColor} />;
      case "img":
        return (
          <FileUploader
            type="image"
            multiple={false}
            onDropAccepted={handleImgUpload}
            onDropRejected={resetImgSource}
            onFileDialogCancel={resetImgSource}
          />
        );
      case "video":
        return (
          <FileUploader
            type="video"
            multiple={false}
            onDropAccepted={handleVideoUpload}
            onDropRejected={resetVideoSource}
            onFileDialogCancel={resetVideoSource}
          />
        );
      default:
        return <></>;
    }
  };

  const handleImgUpload = (files: File[]) => {
    files?.[0] && setImgSource(files[0]);
  };

  const handleVideoUpload = (files: File[]) => {
    files?.[0] && setVideoSource(files[0]);
  };

  const resetImgSource = () => {
    setImgSource(null);
  };

  const resetVideoSource = () => {
    setVideoSource(null);
  };

  const handleSave = () => {
    switch (type) {
      case "blur":
        dispatch(setVirtualBgType("blur"));
        dispatch(setVirtualBgBlurDegree(blurDegree));
        break;
      case "color":
        dispatch(setVirtualBgType("color"));
        dispatch(setVirtualBgColor(color));
        break;
      case "img":
        if (imgSource) {
          dispatch(setVirtualBgType("img"));
          dispatch(setVirtualBgImgSource(imgSource));
          break;
        } else {
          alert.info("Please select an image");
          return;
        }
      case "video":
        if (videoSource) {
          dispatch(setVirtualBgType("video"));
          dispatch(setVirtualBgVideoSource(videoSource));
        } else {
          alert.info("Please select a video");
          return;
        }
    }
    onClose();
  };

  return (
    <Modal
      title="Virtual background settings"
      onCancel={onClose}
      onSave={handleSave}
    >
      <div className="flex min-h-[250px] flex-col items-center gap-2">
        <Select
          value={virtualBgTypeOptions.find(({ value }) => value === type)}
          options={virtualBgTypeOptions}
          className="z-50 w-full"
          onChange={(newValue) =>
            setType((newValue as SelectOption).value as VirtualBgType)
          }
        />

        {getInputs()}
      </div>
    </Modal>
  );
};

export default RTCControlPanelOptions;
