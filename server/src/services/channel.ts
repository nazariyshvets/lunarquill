import * as mongoose from "mongoose";

import User from "../models/User";
import Channel from "../models/Channel";
import Membership from "../models/Membership";

const createChannel = async (
  name: string,
  admin: string,
  participants: string[],
  chatTargetId: string,
  whiteboardRoomId: string,
  isPrivate = false,
) => {
  if (!mongoose.Types.ObjectId.isValid(admin))
    throw new Error("Invalid admin id");

  // Validate participants
  const validParticipants = await User.find({
    _id: { $in: participants },
  });

  if (validParticipants.length !== participants.length)
    throw new Error("Some participants are invalid");

  // Create the channel
  const channel = new Channel({
    name,
    admin,
    chatTargetId,
    whiteboardRoomId,
    isPrivate,
  });
  await channel.save();

  // Create membership documents for each participant
  const memberships = participants.map((participant) => ({
    user: participant,
    channel: channel._id,
  }));

  await Membership.insertMany(memberships);

  return channel;
};

const searchChannels = async (query: string) => {
  // Check if the query is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(query))
    return Channel.find({ _id: query, isPrivate: false });

  // If not a valid ObjectId, search by name using regex
  const regex = new RegExp(query, "i"); // Case-insensitive regex for partial match

  return Channel.find({ name: { $regex: regex }, isPrivate: false });
};

const joinChannel = async (userId: string, channelId: string) => {
  // Validate user ID
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(channelId)
  )
    throw new Error("Invalid user or channel id");

  const user = await User.findById(userId);
  if (!user) throw new Error("Invalid user id");

  const channel = await Channel.findById(channelId);
  if (!channel) throw new Error("Channel not found");

  // Check if the membership already exists
  const existingMembership = await Membership.findOne({
    user: userId,
    channel: channelId,
  });

  if (existingMembership)
    throw new Error("User is already a member of this channel");

  // Create a new membership document
  const membership = new Membership({
    user: userId,
    channel: channelId,
  });

  await membership.save();

  return membership;
};

const leaveChannel = async (userId: string, channelId: string) => {
  // Validate user ID and channel ID
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(channelId)
  )
    throw new Error("Invalid user or channel id");

  const user = await User.findById(userId);
  if (!user) throw new Error("Invalid user id");

  const channel = await Channel.findById(channelId);
  if (!channel) throw new Error("Channel not found");

  // Find the membership document
  const membership = await Membership.findOne({
    user: userId,
    channel: channelId,
  });

  if (!membership) throw new Error("Membership not found");

  // Remove the membership document
  await Membership.deleteOne({ _id: membership._id });

  return { message: "User has left the channel" };
};

const getChannelById = async (channelId: string) => {
  if (!mongoose.Types.ObjectId.isValid(channelId))
    throw new Error("Invalid channel id");

  const channel = await Channel.findById(channelId);

  if (!channel) throw new Error("Channel not found");

  return channel;
};

export {
  createChannel,
  searchChannels,
  joinChannel,
  leaveChannel,
  getChannelById,
};
