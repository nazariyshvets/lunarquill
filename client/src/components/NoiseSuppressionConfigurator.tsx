import { useState } from "react";
import Modal from "./Modal";
import Select, { SelectOption } from "./Select";
import {
  setNoiseSuppressionMode,
  setNoiseSuppressionLevel,
} from "../redux/rtcSlice";
import useRTC from "../hooks/useRTC";
import useAppDispatch from "../hooks/useAppDispatch";
import type NoiseSuppressionMode from "../types/NoiseSuppressionMode";
import type NoiseSuppressionLevel from "../types/NoiseSuppressionLevel";
import type Configurator from "../types/Configurator";

const modeOptions: SelectOption[] = [
  { value: "STATIONARY_NS", label: "Stationary noise reduction" },
  { value: "NSNG", label: "Normal noise reduction" },
];

const modeOptionsMap = modeOptions.reduce(
  (res, option) => ({ ...res, [option.value]: option }),
  {} as Record<NoiseSuppressionMode, SelectOption>,
);

const levelOptions: SelectOption[] = [
  { value: "AGGRESSIVE", label: "Aggressive" },
  { value: "SOFT", label: "Soft" },
];

const levelOptionsMap = levelOptions.reduce(
  (res, option) => ({ ...res, [option.value]: option }),
  {} as Record<NoiseSuppressionLevel, SelectOption>,
);

const NoiseSuppressionConfigurator = ({ onClose }: Configurator) => {
  const { noiseSuppressionMode, noiseSuppressionLevel } = useRTC();
  const [mode, setMode] = useState(noiseSuppressionMode);
  const [level, setLevel] = useState(noiseSuppressionLevel);
  const dispatch = useAppDispatch();

  const handleSave = () => {
    dispatch(setNoiseSuppressionMode(mode));
    dispatch(setNoiseSuppressionLevel(level));
    onClose();
  };

  return (
    <Modal
      title="Noise suppression settings"
      onCancel={onClose}
      onSave={handleSave}
    >
      <div className="flex min-h-[250px] flex-col items-center gap-2">
        <Select
          value={modeOptionsMap[mode]}
          options={modeOptions}
          className="w-full"
          onChange={(newValue) =>
            setMode((newValue as SelectOption).value as NoiseSuppressionMode)
          }
        />
        <Select
          value={levelOptionsMap[level]}
          options={levelOptions}
          className="w-full"
          onChange={(newValue) =>
            setLevel((newValue as SelectOption).value as NoiseSuppressionLevel)
          }
        />
      </div>
    </Modal>
  );
};

export default NoiseSuppressionConfigurator;
