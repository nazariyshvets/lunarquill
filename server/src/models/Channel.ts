import { Schema, model, Document, Types } from "mongoose";

import User from "./User";

interface IChannel extends Document {
  name: string;
  admin: Types.ObjectId;
  isPrivate: boolean;
  chatTargetId: string;
  whiteboardRoomId: string;
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
  },
  {
    timestamps: true,
  },
);

const Channel = model<IChannel>("Channel", ChannelSchema);

export default Channel;
export type { IChannel };
