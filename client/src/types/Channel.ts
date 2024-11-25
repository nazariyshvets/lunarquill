import type { File as CustomFile } from "./File";

interface Channel {
  _id: string;
  name: string;
  admin: string;
  isPrivate: boolean;
  chatTargetId: string;
  whiteboardRoomId: string;
  selectedAvatar?: string;
  avatars?: string[];
  createdAt: number;
  updatedAt: number;
}

interface PopulatedChannel extends Omit<Channel, "selectedAvatar"> {
  selectedAvatar: CustomFile;
}

export type { Channel, PopulatedChannel };
