import { Router } from "express";
import nocache from "../middleware/nocache";
import { generateRTMTokenController } from "../controllers/rtm";

const router = Router();

router.get("/:uid", nocache, generateRTMTokenController);

export default router;
