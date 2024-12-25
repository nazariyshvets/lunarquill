import { Request, Response } from "express";

import {
  createChannel,
  updateChannel,
  searchChannels,
  joinChannel,
  leaveChannel,
  kickUserOutOfChannel,
  getChannelById,
  getChannelMembers,
} from "../services/channel";

const createChannelController = async (req: Request, res: Response) => {
  const {
    name,
    admin,
    participants,
    chatTargetId,
    whiteboardRoomId,
    isPrivate,
  } = req.body;

  if (!name || !admin || !chatTargetId || !whiteboardRoomId) {
    throw new Error(
      "Channel name, admin user, agora chat id and whiteboard room id are required",
    );
  }
  if (!participants || !Array.isArray(participants)) {
    throw new Error("Participants must be an array");
  }

  const channel = await createChannel(
    name,
    admin,
    participants,
    chatTargetId,
    whiteboardRoomId,
    isPrivate,
  );

  return res.status(201).json(channel);
};

const updateChannelController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id) {
    throw new Error("Channel id is required");
  }

  if (!updates || typeof updates !== "object") {
    throw new Error("Updates must be a valid object");
  }

  const validFields = [
    "name",
    "admin",
    "isPrivate",
    "chatTargetId",
    "whiteboardRoomId",
    "selectedAvatar",
    "avatars",
  ];

  const invalidFields = Object.keys(updates).filter(
    (field) => !validFields.includes(field),
  );

  if (invalidFields.length) {
    throw new Error(`Invalid field(s) in updates: ${invalidFields.join(", ")}`);
  }

  const updatedChannel = await updateChannel(id, updates);

  return res.status(200).json(updatedChannel);
};

const searchChannelsController = async (req: Request, res: Response) => {
  const { name } = req.query;

  if (!name) {
    throw new Error("Channel name query parameter is required");
  }

  const channels = await searchChannels(name as string);

  return res.status(200).json(channels);
};

const joinChannelController = async (req: Request, res: Response) => {
  const { userId, channelId } = req.body;

  if (!userId || !channelId) {
    throw new Error("User and channel ids are required");
  }

  const channel = await joinChannel(userId, channelId);

  return res.status(200).json(channel);
};

const leaveChannelController = async (req: Request, res: Response) => {
  const { userId, channelId } = req.body;

  if (!userId || !channelId) {
    throw new Error("User and channel ids are required");
  }

  const response = await leaveChannel(userId, channelId);

  return res.status(200).json(response);
};

const kickUserFromChannelController = async (req: Request, res: Response) => {
  const { adminId, targetUserId, channelId } = req.body;

  if (!adminId || !targetUserId || !channelId) {
    throw new Error("Admin, target user and channel ids are required");
  }

  const response = await kickUserOutOfChannel(adminId, targetUserId, channelId);

  return res.status(200).json(response);
};

const getChannelByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new Error("Channel id is required");
  }

  const channel = await getChannelById(id);

  return res.status(200).json(channel);
};

const getChannelMembersController = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new Error("Channel id is required");
  }

  const channelMembers = await getChannelMembers(id);

  return res.status(200).json(channelMembers);
};

export {
  createChannelController,
  updateChannelController,
  searchChannelsController,
  joinChannelController,
  leaveChannelController,
  kickUserFromChannelController,
  getChannelByIdController,
  getChannelMembersController,
};
