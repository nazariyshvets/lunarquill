import { Router } from "express";

import auth from "./auth";
import rtc from "./rtc";
import rtm from "./rtm";
import chat from "./chat";
import whiteboard from "./whiteboard";
import authenticateJWT from "../middleware/authenticateJWT";

const router = Router();

router.use("/auth", auth);
router.use("/rtc", authenticateJWT, rtc);
router.use("/rtm", authenticateJWT, rtm);
router.use("/chat", authenticateJWT, chat);
router.use("/whiteboard", authenticateJWT, whiteboard);

router.get("/profile", authenticateJWT, (req, res) =>
  res.json({ user: req.user }),
);

export default router;
