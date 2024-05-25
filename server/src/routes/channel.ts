import { Router } from "express";

import {
  createChannelController,
  searchChannelsController,
  joinChannelController,
} from "../controllers/channel";

const router = Router();

router.post("/", createChannelController);
router.get("/search", searchChannelsController);
router.put("/join", joinChannelController);

export default router;
