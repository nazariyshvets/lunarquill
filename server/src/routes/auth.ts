import express from "express";
import {
  registerUserController,
  loginUserController,
  loginUserWithGoogleController,
  resetPasswordRequestController,
  resetPasswordController,
} from "../controllers/auth";

const router = express.Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.post("/login-with-google", loginUserWithGoogleController);
router.post("/request-password-reset", resetPasswordRequestController);
router.post("/password-reset", resetPasswordController);

export default router;
