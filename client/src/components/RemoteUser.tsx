import {
  RemoteUser as AgoraRemoteUser,
  IAgoraRTCRemoteUser,
} from "agora-rtc-react";
import MutedVideoPlaceholder from "./MutedVideoPlaceholder";

interface RemoteUserProps {
  user?: IAgoraRTCRemoteUser;
  isCameraMuted?: boolean;
  playVideo?: boolean;
  playAudio?: boolean;
}

const RemoteUser = ({
  user,
  isCameraMuted = false,
  playVideo = false,
  playAudio = false,
}: RemoteUserProps) => {
  return isCameraMuted ? (
    <MutedVideoPlaceholder text="Remote User" />
  ) : (
    <AgoraRemoteUser user={user} playVideo={playVideo} playAudio={playAudio} />
  );
};

export default RemoteUser;
