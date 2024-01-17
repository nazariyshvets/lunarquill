import {
  LocalVideoTrack as AgoraLocalVideoTrack,
  ILocalVideoTrack,
} from "agora-rtc-react";
import MutedVideoPlaceholder from "./MutedVideoPlaceholder";

interface LocalVideoTrackProps {
  track: ILocalVideoTrack | null;
  isMuted: boolean;
  play?: boolean;
}

const LocalVideoTrack = ({
  track,
  isMuted,
  play = false,
}: LocalVideoTrackProps) => {
  return isMuted ? (
    <MutedVideoPlaceholder text="You" />
  ) : (
    <AgoraLocalVideoTrack track={track} play={play} />
  );
};

export default LocalVideoTrack;
