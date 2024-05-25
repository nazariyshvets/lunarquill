import { Schema, model, Document, Types } from "mongoose";

interface IContact extends Document {
  user1: Types.ObjectId;
  user2: Types.ObjectId;
}

const ContactSchema = new Schema<IContact>(
  {
    user1: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Contact = model<IContact>("Contact", ContactSchema);

export default Contact;
export { IContact };
