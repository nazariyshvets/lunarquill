import { Schema, model, Document, Types } from "mongoose";

import User, { IUserWithoutPassword } from "./User";

interface IContact extends Document {
  user1: Types.ObjectId;
  user2: Types.ObjectId;
  whiteboardRoomId: string;
}

interface IPopulatedContact extends Omit<IContact, "user1" | "user2"> {
  user1: IUserWithoutPassword;
  user2: IUserWithoutPassword;
}

const ContactSchema = new Schema<IContact>(
  {
    user1: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: User,
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

const Contact = model<IContact>("Contact", ContactSchema);

export default Contact;
export type { IContact, IPopulatedContact };
