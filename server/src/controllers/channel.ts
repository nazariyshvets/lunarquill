import { Request, Response } from "express";

import {
  createChannel,
  searchChannels,
  joinChannel,
  leaveChannel,
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

  if (!name || !admin || !chatTargetId || !whiteboardRoomId)
    throw new Error(
      "Channel name, admin user, agora chat id and whiteboard room id are required",
    );
  if (!participants || !Array.isArray(participants))
    throw new Error("Participants must be an array");

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

const searchChannelsController = async (req: Request, res: Response) => {
  const { name } = req.query;

  if (!name) throw new Error("Channel name query parameter is required");

  const channels = await searchChannels(name as string);

  return res.status(200).json(channels);
};

const joinChannelController = async (req: Request, res: Response) => {
  const { userId, channelId } = req.body;

  if (!userId || !channelId)
    throw new Error("User and Channel ids are required");

  const channel = await joinChannel(userId, channelId);

  return res.status(200).json(channel);
};

const leaveChannelController = async (req: Request, res: Response) => {
  const { userId, channelId } = req.body;

  if (!userId || !channelId)
    throw new Error("User and Channel ids are required");

  const response = await leaveChannel(userId, channelId);

  return res.status(200).json(response);
};

const getChannelByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) throw new Error("Channel id is required");

  const channel = await getChannelById(id);

  return res.status(200).json(channel);
};

const getChannelMembersController = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) throw new Error("Channel id is required");

  const channelMembers = await getChannelMembers(id);

  return res.status(200).json(channelMembers);
};

export {
  createChannelController,
  searchChannelsController,
  joinChannelController,
  leaveChannelController,
  getChannelByIdController,
  getChannelMembersController,
};
