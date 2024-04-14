import { Router } from "express";

import nocache from "../middleware/nocache";
import { generateChatTokenController } from "../controllers/chat";

const router = Router();

router.get("/:uid/:expire", nocache, generateChatTokenController);

export default router;
