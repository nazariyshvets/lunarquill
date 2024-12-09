import { ObjectId } from "mongodb";
import * as mongoose from "mongoose";

import { removeAvatars } from "./user";
import { getGridFSBucket } from "../db";
import User from "../models/User";
import Channel, { IChannel } from "../models/Channel";
import Membership from "../models/Membership";

const createChannel = async (
  name: string,
  admin: string,
  participants: string[],
  chatTargetId: string,
  whiteboardRoomId: string,
  isPrivate = false,
) => {
  if (!mongoose.Types.ObjectId.isValid(admin)) {
    throw new Error("Invalid admin id");
  }

  // Validate participants
  const validParticipants = await User.find({
    _id: { $in: participants },
  });

  if (validParticipants.length !== participants.length) {
    throw new Error("Some participants are invalid");
  }

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

const updateChannel = async (channelId: string, updates: Partial<IChannel>) => {
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new Error("Invalid channel id");
  }

  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new Error("Channel not found");
  }

  // Validate specific fields
  if (updates.admin && !mongoose.Types.ObjectId.isValid(updates.admin)) {
    throw new Error("Invalid admin id");
  }

  if (
    updates.selectedAvatar &&
    !mongoose.Types.ObjectId.isValid(updates.selectedAvatar)
  ) {
    throw new Error("Invalid avatar id");
  }
  if (
    updates.selectedAvatar &&
    !channel.avatars.includes(
      new mongoose.Types.ObjectId(updates.selectedAvatar),
    )
  ) {
    throw new Error("Selected avatar is not part of the channel's avatars");
  }

  // Iterate through the update fields and apply changes
  Object.entries(updates).forEach(([key, value]) => {
    if (key in channel && value !== undefined) {
      // @ts-ignore: Allow dynamic assignment of keys
      channel[key] = value;
    }
  });

  await channel.save();

  return channel;
};

const searchChannels = async (query: string) => {
  if (mongoose.Types.ObjectId.isValid(query)) {
    return Channel.find({ _id: query, isPrivate: false });
  }

  const regex = new RegExp(query, "i");

  return Channel.find({ name: { $regex: regex }, isPrivate: false });
};

const joinChannel = async (userId: string, channelId: string) => {
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(channelId)
  ) {
    throw new Error("Invalid user or channel id");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Invalid user id");
  }

  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new Error("Channel not found");
  }

  const existingMembership = await Membership.findOne({
    user: userId,
    channel: channelId,
  });

  if (existingMembership) {
    throw new Error("User is already a member of this channel");
  }

  const membership = new Membership({
    user: userId,
    channel: channelId,
  });

  await membership.save();

  return membership;
};

const validateMembership = async (userId: string, channelId: string) => {
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(channelId)
  ) {
    throw new Error("Invalid user or channel id");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Invalid user id");
  }

  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new Error("Channel not found");
  }

  const membership = await Membership.findOne({
    user: userId,
    channel: channelId,
  });

  if (!membership) {
    throw new Error("Membership not found");
  }

  return { user, channel, membership };
};

const leaveChannel = async (userId: string, channelId: string) => {
  const { membership, channel } = await validateMembership(userId, channelId);

  await Membership.deleteOne({ _id: membership._id });

  const channelMemberships = await Membership.find({ channel: channelId });
  const shouldRemoveChannel = channelMemberships.length === 0;

  if (shouldRemoveChannel) {
    const imageBucket = await getGridFSBucket("images");

    await removeAvatars(
      imageBucket,
      channel.avatars.map((id) => new ObjectId(id)),
    );
    await Channel.deleteOne({ _id: channel._id });
  } else if (userId === channel.admin.toString() && channelMemberships[0]) {
    channel.admin = channelMemberships[0].user;
    await channel.save();
  }

  return {
    isChannelRemoved: shouldRemoveChannel,
    adminId: shouldRemoveChannel ? undefined : channel.admin,
  };
};

const kickUserOutOfChannel = async (
  adminId: string,
  targetUserId: string,
  channelId: string,
) => {
  const { membership, channel } = await validateMembership(
    targetUserId,
    channelId,
  );

  if (adminId !== channel.admin.toString()) {
    throw new Error("Only the admin can kick a user from the channel");
  }

  await Membership.deleteOne({ _id: membership._id });

  return {
    message: `User ${targetUserId} is eligible for removal from channel ${channelId}`,
  };
};

const getChannelById = async (channelId: string) => {
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new Error("Invalid channel id");
  }

  const channel = await Channel.findById(channelId);

  if (!channel) {
    throw new Error("Channel not found");
  }

  return channel;
};

const getChannelMembers = async (channelId: string) => {
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new Error("Invalid channel id");
  }

  const channelMemberships = await Membership.find({
    channel: channelId,
  }).populate({
    path: "user",
    select: "-password",
  });

  return channelMemberships.map((membership) => membership.user);
};

export {
  createChannel,
  updateChannel,
  searchChannels,
  joinChannel,
  leaveChannel,
  kickUserOutOfChannel,
  getChannelById,
  getChannelMembers,
};
