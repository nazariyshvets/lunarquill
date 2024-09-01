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
    (async () => {
      if (!extension.current.checkCompatibility()) {
        alert.error("Noise suppression is not supported on this platform");
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
          alert.error(`Error applying noise reduction: ${err}`);
          console.error("Error applying noise reduction:", err);
        }
      }
    })();

    return () => {
      (async () => {
        try {
          processor.current?.unpipe();
          localMicrophoneTrack?.unpipe();
          await processor.current?.disable();
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
        alert.error("Could not set noise suppression mode. Please try again");
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
        alert.error("Could not set noise suppression level. Please try again");
        console.error("Error setting noise suppression level:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, noiseSuppressionLevel]);

  return <></>;
};

export default NoiseSuppression;
