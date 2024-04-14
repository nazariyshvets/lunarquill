import { Router } from "express";

import {
  registerUserController,
  verifyAccountController,
  loginUserController,
  loginUserWithGoogleController,
  resetPasswordRequestController,
  resetPasswordController,
} from "../controllers/auth";

const router = Router();

router.post("/register", registerUserController);
router.post("/account-verification", verifyAccountController);
router.post("/login", loginUserController);
router.post("/login-with-google", loginUserWithGoogleController);
router.post("/request-password-reset", resetPasswordRequestController);
router.post("/password-reset", resetPasswordController);

export default router;
