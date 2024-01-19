import {
  LocalVideoTrack as AgoraLocalVideoTrack,
  LocalVideoTrackProps as AgoraLocalVideoTrackProps,
} from "agora-rtc-react";
import MutedVideoPlaceholder from "./MutedVideoPlaceholder";

const LocalVideoTrack = ({ muted, ...rest }: AgoraLocalVideoTrackProps) => {
  return muted ? (
    <MutedVideoPlaceholder text="You" />
  ) : (
    <AgoraLocalVideoTrack muted={muted} {...rest} />
  );
};

export default LocalVideoTrack;
