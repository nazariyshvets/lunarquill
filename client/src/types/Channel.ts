interface Channel {
  _id: string;
  name: string;
  admin: string;
  isPrivate: boolean;
  chatTargetId: string;
  whiteboardRoomId: string;
  createdAt: number;
  updatedAt: number;
}

export type { Channel };
