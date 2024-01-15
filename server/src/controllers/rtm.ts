import { Request, Response } from "express";
import { generateRTMToken } from "../services/rtm";

const generateRTMTokenController = (req: Request, res: Response) => {
  const { uid } = req.params;
  const { expiry } = req.query;

  if (!uid || uid === "") {
    throw new Error("User id is required");
  }

  const generateRTMTokenService = generateRTMToken(uid, expiry?.toString());

  return res.json(generateRTMTokenService);
};

export { generateRTMTokenController };
