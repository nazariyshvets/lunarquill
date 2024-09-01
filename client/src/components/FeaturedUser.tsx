import { useState, useRef, useEffect, PropsWithChildren } from "react";

import { BiFullscreen, BiExitFullscreen } from "react-icons/bi";

import RTCControlButton from "./RTCControlButton";

const FeaturedUser = ({
  children,
}: PropsWithChildren<Record<never, never>>) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fullScreenElementRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = async () => {
    try {
      if (isFullScreen) {
        await document.exitFullscreen();
        setIsFullScreen(false);
      } else {
        await fullScreenElementRef.current?.requestFullscreen();
        setIsFullScreen(true);
      }
    } catch (err) {
      setIsFullScreen(false);
      console.error("Error toggling full screen:", err);
    }
  };

  // Exit full screen mode when a user clicks the "Esc" button
  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) setIsFullScreen(false);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  return (
    <div
      ref={fullScreenElementRef}
      className={`relative h-full w-full overflow-hidden bg-deep-black ${
        !isFullScreen ? "rounded-lg" : ""
      }`}
    >
      {children}

      <RTCControlButton
        className="absolute bottom-2 right-2 z-10"
        onClick={toggleFullScreen}
      >
        {isFullScreen ? (
          <BiExitFullscreen className="h-full w-full text-primary" />
        ) : (
          <BiFullscreen className="h-full w-full text-white" />
        )}
      </RTCControlButton>
    </div>
  );
};

export default FeaturedUser;
