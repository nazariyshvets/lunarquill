import { Request, Response } from "express";

import { generateChatToken } from "../services/chat";

const generateChatTokenController = (req: Request, res: Response) => {
  const { uid, expire } = req.params;

  if (!uid || uid === "") {
    throw new Error("User id is required");
  } else if (!expire) {
    throw new Error("Expire time is required");
  }

  const token = generateChatToken(uid, Number(expire));

  return res.json(token);
};

export { generateChatTokenController };
