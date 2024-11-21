import { Router } from "express";

import {
  getUserContactsController,
  getUserChannelsController,
  getUserByIdController,
  updateUserByIdController,
  updateUserAvatarsCollectionController,
} from "../controllers/user";
import { uploadFiles } from "../middleware/uploadFile";

const router = Router();

router.get("/:userId/contacts", getUserContactsController);
router.get("/:userId/channels", getUserChannelsController);
router.get("/:userId", getUserByIdController);
router.put("/:userId", updateUserByIdController);
router.put(
  "/:userId/avatars-collection",
  uploadFiles,
  updateUserAvatarsCollectionController,
);

export default router;
