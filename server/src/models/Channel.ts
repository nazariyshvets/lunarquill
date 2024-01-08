import { Schema, model } from "mongoose";

const ChannelSchema = new Schema({});
const Channel = model("Channel", ChannelSchema);

export default Channel;
