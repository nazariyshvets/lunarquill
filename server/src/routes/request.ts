import { Router } from "express";

import {
  createRequestController,
  declineRequestController,
  acceptRequestController,
} from "../controllers/request";

const router = Router();

router.post("/", createRequestController);
router.post("/decline", declineRequestController);
router.post("/accept", acceptRequestController);

export default router;
