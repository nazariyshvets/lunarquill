import { Router } from "express";

import {
  createChannelController,
  searchChannelsController,
  joinChannelController,
  leaveChannelController,
  getChannelByIdController,
} from "../controllers/channel";

const router = Router();

router.post("/", createChannelController);
router.get("/search", searchChannelsController);
router.put("/join", joinChannelController);
router.post("/leave", leaveChannelController);
router.get("/:id", getChannelByIdController);

export default router;
