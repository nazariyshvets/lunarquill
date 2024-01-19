import {
  RemoteUser as AgoraRemoteUser,
  RemoteUserProps as AgoraRemoteUserProps,
} from "agora-rtc-react";
import MutedVideoPlaceholder from "./MutedVideoPlaceholder";

interface RemoteUserProps extends AgoraRemoteUserProps {
  username?: string;
}

const RemoteUser = ({ username = "User", ...rest }: RemoteUserProps) => {
  return (
    <AgoraRemoteUser
      cover={() => <MutedVideoPlaceholder text={username} />}
      {...rest}
    />
  );
};

export default RemoteUser;
