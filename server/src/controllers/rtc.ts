import { Request, Response } from "express";

import { generateRTCToken } from "../services/rtc";

const generateRTCTokenController = (req: Request, res: Response) => {
  const { channel, role, tokentype, uid } = req.params;
  const { expiry } = req.query;

  if (!channel || channel === "") {
    throw new Error("Channel is required");
  } else if (!role) {
    throw new Error("Role is required");
  } else if (!tokentype) {
    throw new Error("Token type is required");
  } else if (!uid || uid === "") {
    throw new Error("User id is required");
  }

  const generateRTCTokenService = generateRTCToken(
    channel,
    role,
    tokentype,
    uid,
    expiry?.toString(),
  );

  return res.json(generateRTCTokenService);
};

export { generateRTCTokenController };
