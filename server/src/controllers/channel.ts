import { Request, Response } from "express";

import {
  createChannel,
  searchChannels,
  joinChannel,
} from "../services/channel";

const createChannelController = async (req: Request, res: Response) => {
  const { name, admin, participants, isPrivate } = req.body;

  if (!name) throw new Error("Channel name is required");
  if (!admin) throw new Error("Admin user is required");
  if (!participants || !Array.isArray(participants))
    throw new Error("Participants must be an array");

  const channel = await createChannel(name, admin, participants, isPrivate);

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

export {
  createChannelController,
  searchChannelsController,
  joinChannelController,
};
