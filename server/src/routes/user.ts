import { Router } from "express";

import {
  getProfileController,
  getUserContactsController,
  getUserChannelsController,
} from "../controllers/user";

const router = Router();

router.get("/profile", getProfileController);
router.get("/:userId/contacts", getUserContactsController);
router.get("/:userId/channels", getUserChannelsController);

export default router;
