import { Schema, model, Document, Types } from "mongoose";

import File from "./File";

interface IUserWithoutPassword extends Document {
  username: string;
  email: string;
  active: boolean;
  isOnline: boolean;
  selectedAvatar?: Types.ObjectId;
  avatars: Types.ObjectId[];
}

interface IUser extends IUserWithoutPassword {
  password: string;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    active: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    selectedAvatar: {
      type: Schema.Types.ObjectId,
      ref: File,
    },
    avatars: [
      {
        type: Schema.Types.ObjectId,
        ref: File,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const User = model<IUser>("User", UserSchema);

export default User;
export type { IUser, IUserWithoutPassword };
