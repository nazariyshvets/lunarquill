import { PropsWithChildren } from "react";

interface VideoTracksContainerProps {
  isScreenShared?: boolean;
}

const VideoTracksContainer = ({
  isScreenShared = false,
  children,
}: PropsWithChildren<VideoTracksContainerProps>) => {
  return (
    <div
      className={`flex flex-shrink-0 gap-2 overflow-auto scrollbar-hide ${
        !isScreenShared
          ? "sm:grid sm:h-full sm:flex-shrink sm:grid-cols-auto-fit"
          : ""
      }`}
    >
      {children}
    </div>
  );
};

export default VideoTracksContainer;
