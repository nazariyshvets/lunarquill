import { Schema, model, Document, Types } from "mongoose";

import User from "./User";
import Channel from "./Channel";

interface IMembership extends Document {
  user: Types.ObjectId;
  channel: Types.ObjectId;
}

const MembershipSchema = new Schema<IMembership>(
  {
    user: { type: Schema.Types.ObjectId, ref: User, required: true },
    channel: { type: Schema.Types.ObjectId, ref: Channel, required: true },
  },
  {
    timestamps: true,
  },
);

const Membership = model<IMembership>("Membership", MembershipSchema);

export default Membership;
export { IMembership };
