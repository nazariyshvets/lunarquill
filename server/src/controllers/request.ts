import { Request, Response } from "express";

import {
  createRequest,
  declineRequest,
  acceptRequest,
} from "../services/request";

const createRequestController = async (req: Request, res: Response) => {
  const { from, to, type, channel } = req.body;

  if (!from || !type) throw new Error("Missing required fields");

  const request = await createRequest(from, to ?? null, type, channel);

  return res.status(201).json(request);
};

const declineRequestController = async (req: Request, res: Response) => {
  const { requestId, uid } = req.body;

  if (!requestId || !uid) throw new Error("Fields are required");

  const response = await declineRequest(requestId, uid);

  return res.json(response);
};

const acceptRequestController = async (req: Request, res: Response) => {
  const { requestId, uid, whiteboardRoomId } = req.body;

  if (!requestId || !uid) throw new Error("Fields are required");

  const response = await acceptRequest(requestId, uid, whiteboardRoomId);

  return res.json(response);
};

export {
  createRequestController,
  declineRequestController,
  acceptRequestController,
};
