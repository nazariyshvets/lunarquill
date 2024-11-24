import { Router } from "express";

import {
  getUserContactsController,
  getUserChannelsController,
  getUserByIdController,
  updateUserByIdController,
  updateAvatarsCollectionController,
} from "../controllers/user";
import { uploadFiles } from "../middleware/uploadFile";

const router = Router();

router.get("/:userId/contacts", getUserContactsController);
router.get("/:userId/channels", getUserChannelsController);
router.get("/:userId", getUserByIdController);
router.put("/:userId", updateUserByIdController);
router.put("/:id/avatars-collection", uploadFiles, (req, res) =>
  updateAvatarsCollectionController(req, res, "user"),
);

export default router;
