import { useEffect, useRef, useState } from "react";

import AgoraRTC from "agora-rtc-react";
import {
  AIDenoiserExtension,
  AIDenoiserProcessorMode,
  AIDenoiserProcessorLevel,
  IAIDenoiserProcessor,
} from "agora-extension-ai-denoiser";

import useRTC from "../hooks/useRTC";
import showToast from "../utils/showToast";

const NoiseSuppression = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { localMicrophoneTrack, noiseSuppressionMode, noiseSuppressionLevel } =
    useRTC();
  const extension = useRef(
    new AIDenoiserExtension({
      assetsPath: import.meta.env.VITE_AI_DENOISER_ASSETS_PATH,
    }),
  );
  const processor = useRef<IAIDenoiserProcessor>();

  useEffect(() => {
    (async () => {
      if (!extension.current.checkCompatibility()) {
        showToast(
          "error",
          "Noise suppression is not supported on this platform",
        );
        console.error("Noise suppression is not supported on this platform");
        return;
      }

      AgoraRTC.registerExtensions([extension.current]);

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
          showToast("error", `Error applying noise reduction: ${err}`);
          console.error("Error applying noise reduction:", err);
        }
      }
    })();

    return () => {
      (async () => {
        try {
          processor.current?.unpipe();
          await processor.current?.disable();
          localMicrophoneTrack?.pipe(localMicrophoneTrack.processorDestination);
        } catch (err) {
          console.error("Error uninitializing noise suppression:", err);
        }
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMicrophoneTrack]);

  useEffect(() => {
    (async () => {
      if (!isInitialized || !processor.current) return;

      try {
        await processor.current.setMode(
          AIDenoiserProcessorMode[noiseSuppressionMode],
        );
      } catch (err) {
        showToast(
          "error",
          "Could not set noise suppression mode. Please try again",
        );
        console.error("Error setting noise suppression mode:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, noiseSuppressionMode]);

  useEffect(() => {
    (async () => {
      if (!isInitialized || !processor.current) return;

      try {
        await processor.current.setLevel(
          AIDenoiserProcessorLevel[noiseSuppressionLevel],
        );
      } catch (err) {
        showToast(
          "error",
          "Could not set noise suppression level. Please try again",
        );
        console.error("Error setting noise suppression level:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, noiseSuppressionLevel]);

  return <></>;
};

export default NoiseSuppression;
