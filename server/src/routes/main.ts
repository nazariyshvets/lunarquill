import { Router } from "express";

import auth from "./auth";
import rtc from "./rtc";
import rtm from "./rtm";
import chat from "./chat";
import whiteboard from "./whiteboard";
import request from "./request";
import channel from "./channel";
import user from "./user";
import contact from "./contact";
import authenticateJWT from "../middleware/authenticateJWT";

const router = Router();

router.use("/auth", auth);
router.use("/rtc", authenticateJWT, rtc);
router.use("/rtm", authenticateJWT, rtm);
router.use("/chat", authenticateJWT, chat);
router.use("/whiteboard", authenticateJWT, whiteboard);
router.use("/requests", authenticateJWT, request);
router.use("/channels", authenticateJWT, channel);
router.use("/users", authenticateJWT, user);
router.use("/contacts", authenticateJWT, contact);

export default router;
