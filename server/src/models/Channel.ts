import { Schema, model, Document, Types } from "mongoose";

import User from "./User";
import File from "./File";

interface IChannel extends Document {
  name: string;
  admin: Types.ObjectId;
  isPrivate: boolean;
  chatTargetId: string;
  whiteboardRoomId: string;
  selectedAvatar?: Types.ObjectId;
  avatars: Types.ObjectId[];
}

const ChannelSchema = new Schema<IChannel>(
  {
    name: {
      type: String,
      required: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    chatTargetId: {
      type: String,
      required: true,
    },
    whiteboardRoomId: {
      type: String,
      required: true,
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

const Channel = model<IChannel>("Channel", ChannelSchema);

export default Channel;
export type { IChannel };
