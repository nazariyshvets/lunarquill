import * as mongoose from "mongoose";

import Request from "../models/Request";
import User from "../models/User";
import Channel from "../models/Channel";
import Membership from "../models/Membership";
import Contact from "../models/Contact";
import { RequestType } from "../types/RequestType";

const createRequest = async (
  from: string,
  to: string | null,
  type: string,
  channelId?: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(from))
    throw new Error("Invalid user ID for 'from'");

  // Check if the 'from' user exists
  const fromUser = await User.findById(from);
  if (!fromUser) throw new Error("User 'from' not found");

  // Validate the request type
  if (!Object.values(RequestType).includes(type as RequestType))
    throw new Error("Invalid request type");

  if (type === RequestType.Join) return handleJoinRequest(from, channelId);
  else if (type === RequestType.Invite)
    return handleInviteRequest(from, to, channelId);
  else if (type === RequestType.Contact) return handleContactRequest(from, to);
  else throw new Error("Invalid request type");
};

const handleJoinRequest = async (from: string, channelId?: string) => {
  if (!channelId) throw new Error("Channel id is required for join requests");

  if (!mongoose.Types.ObjectId.isValid(channelId))
    throw new Error("Invalid channel id");

  const channel = await Channel.findById(channelId);
  if (!channel) throw new Error("Channel not found");

  // Check if a join request already exists
  const existingRequest = await Request.findOne({
    type: RequestType.Join,
    from,
    channel: channel._id,
  });

  if (existingRequest)
    throw new Error("A request to join this channel already exists");

  // Check if user is already a member of the channel
  const membership = await Membership.findOne({
    user: from,
    channel: channel._id,
  });

  if (membership) throw new Error("User is already a member of this channel");

  if (!channel.isPrivate) {
    // Channel is public, auto-join the user
    const newMembership = new Membership({
      user: from,
      channel: channel._id,
    });

    await newMembership.save();

    return {
      message: "User has been automatically added to the public channel",
    };
  } else {
    const toUser = await User.findById(channel.admin);

    if (!toUser)
      throw new Error("Admin user not found for the specified channel");

    // Create the request
    const request = new Request({
      from,
      to: toUser._id,
      type: RequestType.Join,
      channel: channel._id,
    });

    await request.save();

    // Populate the necessary fields
    await request.populate("from", "-password");
    await request.populate("to", "-password");
    await request.populate("channel");

    return request;
  }
};

const handleInviteRequest = async (
  from: string,
  to: string | null,
  channelId?: string,
) => {
  if (!channelId) throw new Error("Channel id is required for invite requests");
  if (!to) throw new Error("Recipient is required");

  if (!mongoose.Types.ObjectId.isValid(to))
    throw new Error("Invalid recipient id");

  const toUser = await User.findById(to);
  if (!toUser) throw new Error("Recipient not found");

  const channel = await Channel.findById(channelId);
  if (!channel) throw new Error("Channel not found");

  // Check if an invitation request already exists
  const existingRequest = await Request.findOne({
    from,
    to: toUser._id,
    type: RequestType.Invite,
    channel: channel._id,
  });

  if (existingRequest) throw new Error("Invite request already exists");

  // Check if the user is already a member of the channel
  const membership = await Membership.findOne({
    user: toUser._id,
    channel: channel._id,
  });

  if (membership) throw new Error("User is already a member of this channel");

  // Create the request
  const request = new Request({
    from,
    to: toUser._id,
    type: RequestType.Invite,
    channel: channel._id,
  });

  await request.save();

  // Populate the necessary fields
  await request.populate("from", "-password");
  await request.populate("to", "-password");
  await request.populate("channel");

  return request;
};

const handleContactRequest = async (from: string, to: string | null) => {
  if (!to) throw new Error("Recipient is required");

  if (from === to) throw new Error("Cannot send a request to yourself");

  if (!mongoose.Types.ObjectId.isValid(to))
    throw new Error("Invalid recipient id");

  const toUser = await User.findById(to);
  if (!toUser) throw new Error("Recipient not found");

  // Check if a request between the users already exists
  const existingRequest = await Request.findOne({
    type: RequestType.Contact,
    $or: [
      { from, to: toUser._id },
      { from: toUser._id, to: from },
    ],
  });

  if (existingRequest)
    throw new Error("A request between these users already exists");

  // Check if the contact already exists
  const existingContact = await Contact.findOne({
    $or: [
      { user1: from, user2: toUser._id },
      { user1: toUser._id, user2: from },
    ],
  });

  if (existingContact) throw new Error("Contact already exists");

  // Create the request
  const request = new Request({
    from,
    to: toUser._id,
    type: RequestType.Contact,
  });

  await request.save();

  // Populate the necessary fields
  await request.populate("from", "-password");
  await request.populate("to", "-password");

  return request;
};

const declineRequest = async (requestId: string, userId: string) => {
  const request = await Request.findById(requestId);

  if (!request) throw new Error("Request not found");
  if (request.from.toString() !== userId && request.to.toString() !== userId)
    throw new Error("Unauthorized to decline this request");

  await request.deleteOne();

  return { success: true };
};

const acceptRequest = async (
  requestId: string,
  userId: string,
  whiteboardRoomId?: string,
) => {
  const request = await Request.findById(requestId);

  if (!request) throw new Error("Request not found");
  if (request.from.toString() !== userId && request.to.toString() !== userId)
    throw new Error("Unauthorized to accept this request");

  if (request.type === RequestType.Contact && !whiteboardRoomId)
    throw new Error("Whiteboard id is required for creating a contact");

  // Start a session for atomic updates
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    switch (request.type) {
      case RequestType.Contact:
        const [user1, user2] =
          request.from < request.to
            ? [request.from, request.to]
            : [request.to, request.from];
        await Contact.findOneAndUpdate(
          { user1, user2, whiteboardRoomId },
          {},
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        break;
      case RequestType.Invite:
        await Membership.findOneAndUpdate(
          { user: request.to, channel: request.channel },
          {},
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        break;
      case RequestType.Join:
        await Membership.findOneAndUpdate(
          { user: request.from, channel: request.channel },
          {},
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        break;
    }

    // Remove the request from the database
    await request.deleteOne();

    // Commit the transaction
    await session.commitTransaction();
    await session.endSession();

    return request;
  } catch (err) {
    // Rollback the transaction in case of error
    await session.abortTransaction();
    await session.endSession();
    throw new Error("Could not accept the request. Please try again.");
  }
};

export { createRequest, declineRequest, acceptRequest };
