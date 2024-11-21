import { Schema, model, Document, Types } from "mongoose";

import User, { IUser } from "./User";
import Channel, { IChannel } from "./Channel";
import { RequestType, RequestTypeEnum } from "../types/RequestType";

interface IRequest extends Document {
  from: Types.ObjectId;
  to: Types.ObjectId;
  type: RequestType;
  channel?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IPopulatedRequest extends Omit<IRequest, "from" | "to" | "channel"> {
  from: IUser;
  to: IUser;
  channel?: IChannel;
}

const requestSchema = new Schema<IRequest>({
  from: { type: Schema.Types.ObjectId, ref: User, required: true },
  to: { type: Schema.Types.ObjectId, ref: User, required: true },
  type: {
    type: String,
    enum: RequestTypeEnum,
    required: true,
  },
  channel: { type: Schema.Types.ObjectId, ref: Channel },
});

// Pre-save hook to handle the conditional requirement for `channel`
requestSchema.pre<IRequest>("save", function (next) {
  if (
    (this.type === RequestTypeEnum.Invite ||
      this.type === RequestTypeEnum.Join) &&
    !this.channel
  )
    next(new Error("Channel is required for invite or join requests."));
  else next();
});

const Request = model<IRequest>("Request", requestSchema);

export default Request;
export type { IRequest, IPopulatedRequest };
