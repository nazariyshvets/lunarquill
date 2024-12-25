import React, { useState } from "react";

import Modal from "./Modal";
import { setPitchFactor } from "../redux/rtcSlice";
import useRTC from "../hooks/useRTC";
import useAppDispatch from "../hooks/useAppDispatch";
import Configurator from "../types/Configurator";

const PitchShiftConfigurator = ({ onClose }: Configurator) => {
  const { pitchFactor } = useRTC();
  const [factor, setFactor] = useState(pitchFactor);
  const dispatch = useAppDispatch();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setFactor(parseFloat(parseFloat(event.target.value).toFixed(2)));
  const handleSave = () => {
    dispatch(setPitchFactor(factor));
    onClose();
  };

  return (
    <Modal title="Pitch shift settings" onCancel={onClose} onSave={handleSave}>
      <div className="flex items-center justify-center gap-4">
        <input
          type="range"
          value={factor}
          min="0.25"
          max="2"
          step="0.05"
          className="w-1/2 accent-primary"
          onChange={handleInputChange}
        />
        <span className="w-10 text-white">{factor}</span>
      </div>
    </Modal>
  );
};

export default PitchShiftConfigurator;
