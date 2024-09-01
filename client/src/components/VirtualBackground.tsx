import React, { useState, useRef, useEffect, useCallback } from "react";

import AgoraRTC from "agora-rtc-react";
import VirtualBackgroundExtension, {
  IVirtualBackgroundProcessor,
} from "agora-extension-virtual-background";
import { useAlert } from "react-alert";
import { useIndexedDB } from "react-indexed-db-hook";

import useRTC from "../hooks/useRTC";
import type { VirtualBgMediaSource } from "../types/VirtualBg";

const VirtualBackground = (): React.ReactNode => {
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    localCameraTrack,
    virtualBgType,
    virtualBgBlurDegree,
    virtualBgColor,
    virtualBgImgId,
    virtualBgVideoId,
  } = useRTC();
  const extension = useRef(new VirtualBackgroundExtension());
  const processor = useRef<IVirtualBackgroundProcessor>();
  const alert = useAlert();
  const { getByID: getImgById } = useIndexedDB("virtualBgImages");
  const { getByID: getVideoById } = useIndexedDB("virtualBgVideos");
  const imgSrcUrlsRef = useRef<Record<string, string>>({});
  const videoSrcUrlsRef = useRef<Record<string, string>>({});

  const handleImageVirtualBg = useCallback(
    async (imgId: string) => {
      try {
        if (!imgSrcUrlsRef.current[imgId]) {
          const file: VirtualBgMediaSource = await getImgById(imgId);

          imgSrcUrlsRef.current[imgId] = URL.createObjectURL(file.source);
        }

        const imgSrcUrl = imgSrcUrlsRef.current[imgId];

        if (imgSrcUrl) {
          const img = new Image();

          img.src = imgSrcUrl;
          img.onload = () => {
            processor.current?.setOptions({ type: "img", source: img });
          };
        } else {
          console.error(`URL for imgId ${imgId} is undefined`);
        }
      } catch (err) {
        alert.error(`Error retrieving an image by id: ${err}`);
        console.error("Error retrieving an image by id:", err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getImgById],
  );

  const handleVideoVirtualBg = useCallback(
    async (videoId: string) => {
      try {
        if (!videoSrcUrlsRef.current[videoId]) {
          const file: VirtualBgMediaSource = await getVideoById(videoId);

          videoSrcUrlsRef.current[videoId] = URL.createObjectURL(file.source);
        }

        const videoSrcUrl = videoSrcUrlsRef.current[videoId];

        if (videoSrcUrl) {
          const video = document.createElement("video");

          video.src = videoSrcUrl;
          video.setAttribute("loop", "");
          video.onloadeddata = () => {
            processor.current?.setOptions({ type: "video", source: video });
          };
        } else {
          console.error(`URL for videoId ${videoId} is undefined`);
        }
      } catch (err) {
        alert.error(`Error retrieving a video by id: ${err}`);
        console.error("Error retrieving a video by id:", err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getVideoById],
  );

  useEffect(() => {
    (async () => {
      if (!extension.current.checkCompatibility()) {
        alert.error("Virtual background not supported on this platform");
        console.error("Virtual background not supported on this platform");
        return;
      }

      AgoraRTC.registerExtensions([extension.current]);

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
    })();

    return () => {
      (async () => {
        try {
          processor.current?.unpipe();
          localCameraTrack?.unpipe();
          await processor.current?.disable();
          setIsInitialized(false);
        } catch (err) {
          console.error("Error uninitializing virtual background:", err);
        }
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localCameraTrack]);

  useEffect(() => {
    if (!isInitialized) return;

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
      case "img":
        virtualBgImgId && handleImageVirtualBg(virtualBgImgId);
        break;
      case "video":
        virtualBgVideoId && handleVideoVirtualBg(virtualBgVideoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isInitialized,
    virtualBgType,
    virtualBgBlurDegree,
    virtualBgColor,
    virtualBgImgId,
    virtualBgVideoId,
    handleImageVirtualBg,
    handleVideoVirtualBg,
  ]);

  useEffect(() => {
    const imgSrcUrls = imgSrcUrlsRef.current;
    const videoSrcUrls = videoSrcUrlsRef.current;

    // Clean up previously created urls
    return () => {
      Object.values({ ...imgSrcUrls, ...videoSrcUrls }).forEach(
        URL.revokeObjectURL,
      );
    };
  }, []);

  return null;
};

export default VirtualBackground;
