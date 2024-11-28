export interface Avatar {
  id: string;
  name: string;
  dataUrl: string;
  // only new avatars have this property
  src?: File;
}

export interface AvatarsUpdateRequestPayload {
  removedAvatarIds: string[];
  newAvatars: {
    id: string;
    src: File;
  }[];
  selectedAvatarId?: string;
}

export interface AvatarsUpdateResponsePayload {
  message: string;
  avatars: string[];
  selectedAvatar?: string;
  frontendIdToObjectIdMap: Record<string, string>;
}
