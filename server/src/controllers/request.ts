import { Request, Response } from "express";

import {
  createRequest,
  getUserRequests,
  declineRequest,
  acceptRequest,
} from "../services/request";

const createRequestController = async (req: Request, res: Response) => {
  const { from, to, type, channel } = req.body;

  if (!from || !type) throw new Error("Missing required fields");

  const request = await createRequest(from, to ?? null, type, channel);

  return res.status(201).json(request);
};

const getUserRequestsController = async (req: Request, res: Response) => {
  const { uid } = req.params;

  if (!uid) throw new Error("User id is required");

  const requests = await getUserRequests(uid);

  return res.json(requests);
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
  getUserRequestsController,
  declineRequestController,
  acceptRequestController,
};
