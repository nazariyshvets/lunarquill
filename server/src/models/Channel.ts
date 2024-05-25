import { Schema, model, Document, Types } from "mongoose";

interface IChannel extends Document {
  name: string;
  admin: Types.ObjectId;
  isPrivate: boolean;
}

const ChannelSchema = new Schema<IChannel>(
  {
    name: {
      type: String,
      required: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Channel = model<IChannel>("Channel", ChannelSchema);

export default Channel;
export type { IChannel };
