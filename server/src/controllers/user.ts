import { Request, Response } from "express";

import { getUserContacts, getUserChannels } from "../services/user";

const getProfileController = async (req: Request, res: Response) =>
  res.json({ user: req.user });

const getUserContactsController = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const contacts = await getUserContacts(userId ?? "");

  return res.status(200).json(contacts);
};

const getUserChannelsController = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const channels = await getUserChannels(userId ?? "");

  return res.status(200).json(channels);
};

export {
  getProfileController,
  getUserContactsController,
  getUserChannelsController,
};
