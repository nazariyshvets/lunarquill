import {
  LocalVideoTrack as AgoraLocalVideoTrack,
  LocalVideoTrackProps as AgoraLocalVideoTrackProps,
} from "agora-rtc-react";

import MutedVideoPlaceholder from "./MutedVideoPlaceholder";
import type Size from "../types/Size";

interface LocalVideoTrackProps extends AgoraLocalVideoTrackProps {
  avatarId?: string;
  avatarSize?: Size;
}

const LocalVideoTrack = ({
  avatarId,
  avatarSize,
  play,
  ...rest
}: LocalVideoTrackProps) =>
  play ? (
    <AgoraLocalVideoTrack play {...rest} />
  ) : (
    <MutedVideoPlaceholder
      username="You"
      avatarId={avatarId}
      avatarSize={avatarSize}
    />
  );

export default LocalVideoTrack;
