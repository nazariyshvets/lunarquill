import { useState } from "react";

import Modal from "./Modal";
import Select, { SelectOption } from "./Select";
import {
  setNoiseSuppressionMode,
  setNoiseSuppressionLevel,
} from "../redux/rtcSlice";
import useRTC from "../hooks/useRTC";
import useAppDispatch from "../hooks/useAppDispatch";
import type {
  NoiseSuppressionMode,
  NoiseSuppressionLevel,
} from "../types/NoiseSuppression";
import type Configurator from "../types/Configurator";

const modeOptions: SelectOption[] = [
  { value: "STATIONARY_NS", label: "Stationary noise reduction" },
  { value: "NSNG", label: "Normal noise reduction" },
];

const modeOptionsMap = modeOptions.reduce<
  Partial<Record<NoiseSuppressionMode, SelectOption>>
>((res, option) => ({ ...res, [option.value]: option }), {});

const levelOptions: SelectOption[] = [
  { value: "AGGRESSIVE", label: "Aggressive" },
  { value: "SOFT", label: "Soft" },
];

const levelOptionsMap = levelOptions.reduce<
  Partial<Record<NoiseSuppressionLevel, SelectOption>>
>((res, option) => ({ ...res, [option.value]: option }), {});

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
          isSearchable={false}
          className="w-full"
          onChange={(newValue) =>
            setMode((newValue as SelectOption).value as NoiseSuppressionMode)
          }
        />
        <Select
          value={levelOptionsMap[level]}
          options={levelOptions}
          isSearchable={false}
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
