import { Router } from "express";
import {
  forgotPasswordController,
  googleCallbackController,
  googleStartController,
  loginController,
  logoutController,
  meController,
  registerController,
  resetPasswordController
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/forgot-password", forgotPasswordController);
authRouter.post("/reset-password", resetPasswordController);
authRouter.get("/me", meController);
authRouter.post("/logout", logoutController);
authRouter.get("/google", googleStartController);
authRouter.get("/google/callback", googleCallbackController);