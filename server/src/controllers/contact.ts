import { Request, Response } from "express";

import {
  getContactRelation,
  getContactById,
  removeContactRelation,
} from "../services/contact";

const getContactRelationController = async (req: Request, res: Response) => {
  const { userId1, userId2 } = req.params;

  if (!userId1 || !userId2) {
    throw new Error("User ids are required");
  }

  const contact = await getContactRelation(userId1, userId2);

  return res.status(200).json(contact);
};

const getContactByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new Error("Contact id is required");
  }

  const contact = await getContactById(id);

  return res.status(200).json(contact);
};

const removeContactRelationController = async (req: Request, res: Response) => {
  const { user1Id, user2Id } = req.body;

  if (!user1Id || !user2Id) {
    throw new Error("User ids are required");
  }

  const response = await removeContactRelation(user1Id, user2Id);

  return res.status(200).json(response);
};

export {
  getContactRelationController,
  getContactByIdController,
  removeContactRelationController,
};
