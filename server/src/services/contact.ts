import mongoose from "mongoose";

import User from "../models/User";
import Contact from "../models/Contact";

const getContactRelation = async (userId1: string, userId2: string) => {
  if (
    !mongoose.Types.ObjectId.isValid(userId1) ||
    !mongoose.Types.ObjectId.isValid(userId1)
  )
    throw new Error("Invalid user id(s)");

  const user1 = await User.findById(userId1);
  const user2 = await User.findById(userId2);

  if (!user1 || !user2) throw new Error("One or both users not found");

  const contact = await Contact.findOne({
    user1: { $in: [userId1, userId2] },
    user2: { $in: [userId1, userId2] },
  })
    .populate("user1", "-password")
    .populate("user2", "-password");

  if (!contact)
    throw new Error("No contact relationship found between the two users");

  return contact;
};

const getContactById = async (contactId: string) => {
  if (!mongoose.Types.ObjectId.isValid(contactId))
    throw new Error("Invalid contact id");

  const contact = await Contact.findById(contactId)
    .populate("user1", "-password")
    .populate("user2", "-password");

  if (!contact) throw new Error("Contact not found");

  const user1 = await User.findById(contact.user1);
  const user2 = await User.findById(contact.user2);

  if (!user1 || !user2) throw new Error("One or both users not found");

  return contact;
};

const removeContactRelation = async (user1Id: string, user2Id: string) => {
  if (
    !mongoose.Types.ObjectId.isValid(user1Id) ||
    !mongoose.Types.ObjectId.isValid(user2Id)
  )
    throw new Error("Invalid user ids");

  // Find and remove the contact document
  const contact = await Contact.findOneAndDelete({
    $or: [
      { user1: user1Id, user2: user2Id },
      { user1: user2Id, user2: user1Id },
    ],
  });

  if (!contact) throw new Error("Contact not found");

  return { message: "Contact removed successfully" };
};

export { getContactRelation, getContactById, removeContactRelation };
