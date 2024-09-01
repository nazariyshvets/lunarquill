import { UID } from "agora-rtc-react";
import { JwtPayload } from "jwt-decode";

interface UserWithoutPassword {
  _id: string;
  username: string;
  email: string;
  active: boolean;
  isOnline: boolean;
  createdAt: number;
  updatedAt: number;
}

interface User extends UserWithoutPassword {
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
  user1: UserWithoutPassword;
  user2: UserWithoutPassword;
  whiteboardRoomId: string;
}

export type {
  User,
  UserWithoutPassword,
  UserVolume,
  DecodedUserToken,
  PopulatedContact,
};
