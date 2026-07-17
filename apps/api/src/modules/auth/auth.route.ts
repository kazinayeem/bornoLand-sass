import { Router } from "express";
import {
  forgotPasswordController,
  googleCallbackController,
  googleStartController,
  loginController,
  logoutController,
  meController,
  refreshController,
  registerController,
  resetPasswordController,
  verifyEmailController,
} from "./auth.controller.js";

export const authRouter: Router = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/refresh", refreshController);
authRouter.post("/forgot-password", forgotPasswordController);
authRouter.post("/reset-password", resetPasswordController);
authRouter.get("/me", meController);
authRouter.post("/logout", logoutController);
authRouter.post("/verify-email", verifyEmailController);
authRouter.get("/google", googleStartController);
authRouter.get("/google/callback", googleCallbackController);
