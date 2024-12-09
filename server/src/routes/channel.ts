import { Router } from "express";

import {
  createChannelController,
  updateChannelController,
  searchChannelsController,
  joinChannelController,
  leaveChannelController,
  kickUserFromChannelController,
  getChannelByIdController,
  getChannelMembersController,
} from "../controllers/channel";
import { updateAvatarsCollectionController } from "../controllers/user";
import { uploadFiles } from "../middleware/uploadFile";

const router = Router();

router.post("/", createChannelController);
router.get("/search", searchChannelsController);
router.put("/join", joinChannelController);
router.post("/leave", leaveChannelController);
router.post("/kick-user", kickUserFromChannelController);
router.get("/:id", getChannelByIdController);
router.put("/:id", updateChannelController);
router.put("/:id/avatars-collection", uploadFiles, (req, res) =>
  updateAvatarsCollectionController(req, res, "channel"),
);
router.get("/:id/members", getChannelMembersController);

export default router;
