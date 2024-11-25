import { Router } from "express";

import {
  createChannelController,
  searchChannelsController,
  joinChannelController,
  leaveChannelController,
  getChannelByIdController,
} from "../controllers/channel";
import { updateAvatarsCollectionController } from "../controllers/user";
import { uploadFiles } from "../middleware/uploadFile";

const router = Router();

router.post("/", createChannelController);
router.get("/search", searchChannelsController);
router.put("/join", joinChannelController);
router.post("/leave", leaveChannelController);
router.get("/:id", getChannelByIdController);
router.put("/:id/avatars-collection", uploadFiles, (req, res) =>
  updateAvatarsCollectionController(req, res, "channel"),
);

export default router;
