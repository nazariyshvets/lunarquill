import { Request, Response } from "express";

import {
  getUserContacts,
  getUserChannels,
  getUserById,
  updateUserById,
} from "../services/user";

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

const getUserByIdController = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await getUserById(userId ?? "");

  return res.status(200).json(user);
};

const updateUserByIdController = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const updateData = req.body;

  if (!userId) throw new Error("User id is required");

  const updatedUser = await updateUserById(userId, updateData);

  return res.status(200).json(updatedUser);
};

export {
  getUserContactsController,
  getUserChannelsController,
  getUserByIdController,
  updateUserByIdController,
};
