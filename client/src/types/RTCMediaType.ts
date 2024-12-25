type RTCMediaType = "audio" | "video" | "datachannel";

interface UsersAttributes {
  [uid: string]: {
    username?: string;
    avatarId?: string;
    isCameraMuted?: boolean;
    isMicrophoneMuted?: boolean;
  };
}

export type { RTCMediaType, UsersAttributes };
