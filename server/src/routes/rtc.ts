import { Router } from "express";
import nocache from "../middleware/nocache";
import { generateRTCTokenController } from "../controllers/rtc";

const router = Router();

router.get(
  "/:channel/:role/:tokentype/:uid",
  nocache,
  generateRTCTokenController
);

export default router;
