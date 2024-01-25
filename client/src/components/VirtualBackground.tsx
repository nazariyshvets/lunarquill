import { useState, useRef, useEffect } from "react";
import AgoraRTC from "agora-rtc-react";
import VirtualBackgroundExtension, {
  IVirtualBackgroundProcessor,
} from "agora-extension-virtual-background";
import { useAlert } from "react-alert";
import useRTC from "../hooks/useRTC";

const VirtualBackground = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    localCameraTrack,
    virtualBgType,
    virtualBgBlurDegree,
    virtualBgColor,
    virtualBgImgSource,
    virtualBgVideoSource,
  } = useRTC();
  const extension = useRef(new VirtualBackgroundExtension());
  const processor = useRef<IVirtualBackgroundProcessor>();
  const alert = useAlert();

  useEffect(() => {
    const init = async () => {
      AgoraRTC.registerExtensions([extension.current]);

      checkCompatibility();

      if (localCameraTrack) {
        try {
          processor.current = extension.current.createProcessor();
          await processor.current.init();
          localCameraTrack
            .pipe(processor.current)
            .pipe(localCameraTrack.processorDestination);
          await processor.current.enable();
          setIsInitialized(true);
        } catch (err) {
          setIsInitialized(false);
          alert.error(`Error initializing virtual background: ${err}`);
          console.error(`Error initializing virtual background: ${err}`);
        }
      }
    };

    const checkCompatibility = () => {
      if (!extension.current.checkCompatibility()) {
        alert.error("Virtual background not supported on this platform");
        console.error("Virtual background not supported on this platform");
      }
    };

    init();

    return () => {
      const uninit = async () => {
        try {
          processor.current?.unpipe();
          localCameraTrack?.unpipe();
          await processor.current?.disable();
          setIsInitialized(false);
        } catch (err) {
          console.error("Error uninitializing virtual background:", err);
        }
      };
      uninit();
    };
  }, [localCameraTrack, alert]);

  useEffect(() => {
    if (isInitialized) {
      switch (virtualBgType) {
        case "blur":
          processor.current?.setOptions({
            type: "blur",
            blurDegree: virtualBgBlurDegree,
          });
          break;
        case "color":
          processor.current?.setOptions({
            type: "color",
            color: virtualBgColor,
          });
          break;
        case "img": {
          const img = new Image();

          if (virtualBgImgSource) {
            img.src = URL.createObjectURL(virtualBgImgSource);
            img.onload = () => {
              processor.current?.setOptions({ type: "img", source: img });
            };
          }
          break;
        }
        case "video": {
          const video = document.createElement("video");

          if (virtualBgVideoSource) {
            video.src = URL.createObjectURL(virtualBgVideoSource);
            video.setAttribute("loop", "");
            video.onloadeddata = () => {
              processor.current?.setOptions({ type: "video", source: video });
            };
          }
        }
      }
    }
  }, [
    isInitialized,
    virtualBgType,
    virtualBgBlurDegree,
    virtualBgColor,
    virtualBgImgSource,
    virtualBgVideoSource,
  ]);

  return <></>;
};

export default VirtualBackground;
