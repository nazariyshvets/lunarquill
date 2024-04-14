import {
  LocalVideoTrack as AgoraLocalVideoTrack,
  LocalVideoTrackProps as AgoraLocalVideoTrackProps,
} from "agora-rtc-react";

import MutedVideoPlaceholder from "./MutedVideoPlaceholder";

const LocalVideoTrack = ({ play, ...rest }: AgoraLocalVideoTrackProps) =>
  play ? (
    <AgoraLocalVideoTrack play {...rest} />
  ) : (
    <MutedVideoPlaceholder text="You" />
  );

export default LocalVideoTrack;
