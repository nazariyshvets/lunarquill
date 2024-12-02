import { UID } from "agora-rtc-react";
import { JwtPayload } from "jwt-decode";

import type { File as CustomFile } from "./File";

interface UserWithoutPassword {
  _id: string;
  username: string;
  email: string;
  active: boolean;
  selectedAvatar?: string;
  avatars?: string[];
  createdAt: number;
  updatedAt: number;
}

interface PopulatedUserWithoutPassword
  extends Omit<UserWithoutPassword, "selectedAvatar"> {
  selectedAvatar: CustomFile;
}

interface User extends PopulatedUserWithoutPassword {
  password: string;
}

interface UserVolume {
  uid: UID;
  level: number;
}

interface DecodedUserToken extends JwtPayload {
  id: string;
  email: string;
  username?: string;
}

interface PopulatedContact {
  _id: string;
  user1: PopulatedUserWithoutPassword;
  user2: PopulatedUserWithoutPassword;
  whiteboardRoomId: string;
}

export type {
  User,
  UserWithoutPassword,
  PopulatedUserWithoutPassword,
  UserVolume,
  DecodedUserToken,
  PopulatedContact,
};
