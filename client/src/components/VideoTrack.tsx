import { PropsWithChildren } from "react";

interface VideoTrackProps {
  size?: "auto" | "fixed";
  isActive?: boolean;
}

const VideoTrack = ({
  size = "auto",
  isActive = false,
  children,
}: PropsWithChildren<VideoTrackProps>) => {
  return (
    <div
      className={`m-1 h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg ${
        size === "auto"
          ? "sm:h-auto sm:min-h-[200px] sm:w-auto"
          : "sm:h-30 sm:w-30"
      } ${
        isActive ? "outline outline-2 outline-offset-2 outline-primary" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default VideoTrack;
