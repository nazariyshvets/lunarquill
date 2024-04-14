import { useEffect, useRef, useState } from "react";

import AgoraRTC from "agora-rtc-react";
import {
  AIDenoiserExtension,
  AIDenoiserProcessorMode,
  AIDenoiserProcessorLevel,
  IAIDenoiserProcessor,
} from "agora-extension-ai-denoiser";
import { useAlert } from "react-alert";

import useRTC from "../hooks/useRTC";

const NoiseSuppression = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { localMicrophoneTrack, noiseSuppressionMode, noiseSuppressionLevel } =
    useRTC();
  const extension = useRef(
    new AIDenoiserExtension({
      assetsPath: "../../node_modules/agora-extension-ai-denoiser/external",
    }),
  );
  const processor = useRef<IAIDenoiserProcessor>();
  const alert = useAlert();

  useEffect(() => {
    const init = async () => {
      AgoraRTC.registerExtensions([extension.current]);

      checkCompatibility();

      if (localMicrophoneTrack) {
        try {
          processor.current = extension.current.createProcessor();
          localMicrophoneTrack
            .pipe(processor.current)
            .pipe(localMicrophoneTrack.processorDestination);
          await processor.current.enable();
          setIsInitialized(true);
        } catch (err) {
          setIsInitialized(false);
          alert.error(`Error applying noise reduction: ${err}`);
          console.error("Error applying noise reduction:", err);
        }
      }
    };

    const checkCompatibility = () => {
      if (!extension.current.checkCompatibility()) {
        alert.error("Noise suppression is not supported on this platform");
        console.error("Noise suppression is not supported on this platform");
      }
    };

    init();

    return () => {
      const uninit = async () => {
        try {
          processor.current?.unpipe();
          localMicrophoneTrack?.unpipe();
          await processor.current?.disable();
        } catch (err) {
          console.error("Error uninitializing noise suppression:", err);
        }
      };
      uninit();
    };
  }, [localMicrophoneTrack, alert]);

  useEffect(() => {
    if (isInitialized && processor.current) {
      processor.current.setMode(AIDenoiserProcessorMode[noiseSuppressionMode]);
    }
  }, [isInitialized, noiseSuppressionMode]);

  useEffect(() => {
    if (isInitialized && processor.current) {
      processor.current.setLevel(
        AIDenoiserProcessorLevel[noiseSuppressionLevel],
      );
    }
  }, [isInitialized, noiseSuppressionLevel]);

  return <></>;
};

export default NoiseSuppression;
