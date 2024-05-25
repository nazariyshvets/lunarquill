import { Router } from "express";

import {
  createRequestController,
  getUserRequestsController,
  declineRequestController,
  acceptRequestController,
} from "../controllers/request";

const router = Router();

router.post("/", createRequestController);
router.get("/user-requests/:uid", getUserRequestsController);
router.post("/decline", declineRequestController);
router.post("/accept", acceptRequestController);

export default router;
