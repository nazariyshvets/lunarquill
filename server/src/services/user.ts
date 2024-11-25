import mongoose from "mongoose";
import { ObjectId, type GridFSBucket } from "mongodb";

import capitalize from "../utils/capitalize";
import User, { IUser } from "../models/User";
import Channel from "../models/Channel";
import Membership from "../models/Membership";
import Contact from "../models/Contact";

const getUserContacts = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new Error("Invalid user id");

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const contacts = await Contact.find({
    $or: [{ user1: userId }, { user2: userId }],
  })
    .populate({
      path: "user1",
      select: "-password",
      populate: "selectedAvatar",
    })
    .populate({
      path: "user2",
      select: "-password",
      populate: "selectedAvatar",
    });

  return contacts.map((contact) =>
    contact.user1._id.toString() === userId ? contact.user2 : contact.user1,
  );
};

const getUserChannels = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new Error("Invalid user id");

  const memberships = await Membership.find({ user: userId });
  const channelIds = memberships.map((membership) => membership.channel);

  return Channel.find({ _id: { $in: channelIds } }).populate("selectedAvatar");
};

const getUserById = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new Error("Invalid user id");

  const user = await User.findById(userId)
    .select("-password")
    .populate("selectedAvatar");

  if (!user) throw new Error("User not found");

  return user;
};

const updateUserById = async (userId: string, updateData: Partial<IUser>) => {
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new Error("Invalid user id");

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true },
  ).select("-password");

  if (!updatedUser) throw new Error("User not found");

  return updatedUser;
};

const removeAvatars = async (
  imageBucket: GridFSBucket,
  removedAvatarIds: string[] | ObjectId[],
) => {
  await Promise.all(
    removedAvatarIds.map((avatarId) =>
      imageBucket.delete(
        typeof avatarId === "string" ? new ObjectId(avatarId) : avatarId,
      ),
    ),
  );
};

const updateAvatarsCollection = async (
  type: "user" | "channel",
  id: string,
  removedAvatarIds: string[],
  newAvatarObjectIds: ObjectId[],
  selectedAvatarId: string | undefined,
  frontendIdToObjectIdMap: Record<string, ObjectId>,
) => {
  const document = await (type === "user"
    ? User.findById(id)
    : Channel.findById(id));

  if (!document) {
    throw new Error(`${capitalize(type)} not found`);
  }

  document.avatars = [
    ...document.avatars.filter(
      (avatarId) => !removedAvatarIds.includes(avatarId.toString()),
    ),
    ...newAvatarObjectIds.map((id) => new mongoose.Types.ObjectId(id)),
  ];

  if (selectedAvatarId) {
    if (ObjectId.isValid(selectedAvatarId)) {
      document.selectedAvatar = new mongoose.Types.ObjectId(selectedAvatarId);
    } else {
      const selectedAvatarObjectId = frontendIdToObjectIdMap[selectedAvatarId];

      if (selectedAvatarObjectId) {
        document.selectedAvatar = new mongoose.Types.ObjectId(
          selectedAvatarObjectId,
        );
      } else {
        throw new Error(`Selected avatar not found: ${selectedAvatarId}`);
      }
    }
  } else {
    document.selectedAvatar = undefined;
  }

  await document.save();

  return document;
};

export {
  getUserContacts,
  getUserChannels,
  getUserById,
  updateUserById,
  removeAvatars,
  updateAvatarsCollection,
};
