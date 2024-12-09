interface ChannelDto {
  name: string;
  admin: string;
  isPrivate: boolean;
  chatTargetId: string;
  whiteboardRoomId: string;
  selectedAvatar?: string;
  avatars?: string[];
}

interface Channel extends ChannelDto {
  _id: string;
  createdAt: number;
  updatedAt: number;
}

export type { ChannelDto, Channel };
