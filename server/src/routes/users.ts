import express from "express";
import {
  registerUserController,
  loginUserController,
  resetPasswordRequestController,
  resetPasswordController,
} from "../controllers/auth";

const router = express.Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.post("/request-password-reset", resetPasswordRequestController);
router.post("/password-reset", resetPasswordController);

export default router;
