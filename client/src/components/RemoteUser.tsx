import {
  RemoteUser as AgoraRemoteUser,
  RemoteUserProps as AgoraRemoteUserProps,
} from "agora-rtc-react";
import { BiMicrophoneOff } from "react-icons/bi";

import MutedVideoPlaceholder from "./MutedVideoPlaceholder";
import type Size from "../types/Size";

interface RemoteUserProps extends AgoraRemoteUserProps {
  username?: string;
  avatarId?: string;
  avatarSize?: Size;
  isScreenCaster?: boolean;
}

const RemoteUser = ({
  username = "User",
  avatarId,
  avatarSize,
  isScreenCaster = false,
  playAudio,
  ...rest
}: RemoteUserProps) =>
  isScreenCaster ? (
    <AgoraRemoteUser {...rest} />
  ) : (
    <div className="relative h-full w-full">
      <AgoraRemoteUser
        playAudio={playAudio}
        cover={() => (
          <MutedVideoPlaceholder
            username={username}
            avatarId={avatarId}
            avatarSize={avatarSize}
          />
        )}
        {...rest}
      />
      {!playAudio && (
        <BiMicrophoneOff className="absolute bottom-0 right-0 z-10 h-7 w-7 rounded-full bg-charcoal bg-opacity-50 p-1 text-white sm:h-9 sm:w-9 sm:p-2" />
      )}
    </div>
  );

export default RemoteUser;
