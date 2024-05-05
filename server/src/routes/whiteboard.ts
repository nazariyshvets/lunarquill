import { Router } from "express";

import {
  createRoomController,
  generateSDKTokenController,
  generateRoomTokenController,
  generateTaskTokenController,
} from "../controllers/whiteboard";

const router = Router();

router.post("/room", createRoomController);
router.get("/sdk-token", generateSDKTokenController);
router.get("/room-token/:roomUUID", generateRoomTokenController);
router.get("/task-token/:userUUID", generateTaskTokenController);

export default router;
