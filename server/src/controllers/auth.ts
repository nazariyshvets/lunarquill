import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  loginUserWithGoogle,
  requestPasswordReset,
  resetPassword,
} from "../services/auth";

const registerUserController = async (req: Request, res: Response) => {
  const registerUserService = await registerUser(
    req.body.username,
    req.body.email,
    req.body.password,
    req.body.password2
  );
  return res.json(registerUserService);
};

const loginUserController = async (req: Request, res: Response) => {
  const loginUserService = await loginUser(req.body.email, req.body.password);
  return res.json(loginUserService);
};

const loginUserWithGoogleController = async (req: Request, res: Response) => {
  const loginUserWithGoogleService = await loginUserWithGoogle(req.body.code);
  return res.json(loginUserWithGoogleService);
};

const resetPasswordRequestController = async (req: Request, res: Response) => {
  const requestPasswordResetService = await requestPasswordReset(
    req.body.email
  );
  return res.json(requestPasswordResetService);
};

const resetPasswordController = async (req: Request, res: Response) => {
  const resetPasswordService = await resetPassword(
    req.body.userId,
    req.body.token,
    req.body.password,
    req.body.password2
  );
  return res.json(resetPasswordService);
};

export {
  registerUserController,
  loginUserController,
  loginUserWithGoogleController,
  resetPasswordRequestController,
  resetPasswordController,
};
