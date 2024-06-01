import { Request, Response } from "express";
import request from "request";

import {
  createRoom,
  disableRoom,
  listRooms,
  sdkToken,
  roomToken,
  taskToken,
  TokenRole,
} from "../services/whiteboard";

const ACCESS_KEY = process.env.AGORA_WHITEBOARD_ACCESS_KEY!;
const SECRET_KEY = process.env.AGORA_WHITEBOARD_SECRET_KEY!;
const TOKEN_EXPIRATION_TIME = 1000 * 60 * 10;

const createRoomController = (req: Request, res: Response) => {
  const { sdkToken } = req.body;

  if (!sdkToken) throw new Error("Whiteboard SDK token is required");

  const callback = (error: unknown, response: request.Response) => {
    if (error) throw new Error("Could not create a whiteboard room");

    return res.json(response.body);
  };

  createRoom(sdkToken, callback);
};

const disableRoomController = (req: Request, res: Response) => {
  const { roomUuid, sdkToken } = req.body;

  if (!roomUuid || !sdkToken)
    throw new Error("Whiteboard room uuid and SDK token are required");

  const callback = (error: unknown, response: request.Response) => {
    if (error) {
      console.log(error);
      throw new Error("Could not disable a whiteboard room");
    }

    return res.json(response.body);
  };

  disableRoom(roomUuid, sdkToken, callback);
};

const listRoomsController = (req: Request, res: Response) => {
  const { sdkToken } = req.params;

  if (!sdkToken) throw new Error("Whiteboard SDK token is required");

  const callback = (error: unknown, response: request.Response) => {
    if (error) throw new Error("Could not get a list of whiteboard rooms");

    return res.json(response.body);
  };

  listRooms(sdkToken, callback);
};

const generateSDKTokenController = (_: Request, res: Response) =>
  res.json({
    token: sdkToken(ACCESS_KEY, SECRET_KEY, TOKEN_EXPIRATION_TIME, {
      role: TokenRole.Admin,
    }),
  });

const generateRoomTokenController = (req: Request, res: Response) => {
  const { roomUUID } = req.params;

  if (!roomUUID) throw new Error("Whiteboard room UUID is required");

  return res.json({
    token: roomToken(ACCESS_KEY, SECRET_KEY, TOKEN_EXPIRATION_TIME, {
      role: TokenRole.Writer,
      uuid: roomUUID,
    }),
  });
};

const generateTaskTokenController = (req: Request, res: Response) => {
  const { userUUID } = req.params;

  if (!userUUID) throw new Error("User UUID is required");

  return res.json({
    token: taskToken(ACCESS_KEY, SECRET_KEY, TOKEN_EXPIRATION_TIME, {
      role: TokenRole.Writer,
      uuid: userUUID,
    }),
  });
};

export {
  createRoomController,
  disableRoomController,
  listRoomsController,
  generateSDKTokenController,
  generateRoomTokenController,
  generateTaskTokenController,
};
