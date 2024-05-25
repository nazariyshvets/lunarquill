import * as mongoose from "mongoose";

import User from "../models/User";
import Channel from "../models/Channel";
import Membership from "../models/Membership";
import Contact from "../models/Contact";

const getUserContacts = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new Error("Invalid user ID");

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const contacts = await Contact.find({
    $or: [{ user1: userId }, { user2: userId }],
  })
    .populate("user1", "-password")
    .populate("user2", "-password");

  return contacts.map((contact) =>
    contact.user1._id.toString() === userId ? contact.user2 : contact.user1,
  );
};

const getUserChannels = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new Error("Invalid user ID");

  // Find all memberships for the user
  const memberships = await Membership.find({ user: userId });

  // Extract the channel IDs from the memberships
  const channelIds = memberships.map((membership) => membership.channel);

  // Find all channels the user is a member of
  return Channel.find({ _id: { $in: channelIds } });
};

export { getUserContacts, getUserChannels };
