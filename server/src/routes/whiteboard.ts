import { Router } from "express";

import {
  createRoomController,
  disableRoomController,
  listRoomsController,
  generateSDKTokenController,
  generateRoomTokenController,
  generateTaskTokenController,
} from "../controllers/whiteboard";

const router = Router();

router.post("/rooms", createRoomController);
router.patch("/rooms", disableRoomController);
router.get(`/rooms/:sdkToken`, listRoomsController);
router.get("/sdk-token", generateSDKTokenController);
router.get("/room-token/:roomUUID", generateRoomTokenController);
router.get("/task-token/:userUUID", generateTaskTokenController);

export default router;
