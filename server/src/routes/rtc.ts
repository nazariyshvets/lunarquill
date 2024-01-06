import express from "express";
import nocache from "../middleware/nocache";
import { generateRTCTokenController } from "../controllers/rtc";

const router = express.Router();

router.get(
  "/:channel/:role/:tokentype/:uid",
  nocache,
  generateRTCTokenController
);

export default router;
