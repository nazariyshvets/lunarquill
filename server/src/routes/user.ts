import { Router } from "express";

import {
  getUserContactsController,
  getUserChannelsController,
  getUserByIdController,
  updateUserByIdController,
} from "../controllers/user";

const router = Router();

router.get("/:userId/contacts", getUserContactsController);
router.get("/:userId/channels", getUserChannelsController);
router.get("/:userId", getUserByIdController);
router.put("/:userId", updateUserByIdController);

export default router;
