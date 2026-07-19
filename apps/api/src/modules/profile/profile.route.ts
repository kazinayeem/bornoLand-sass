import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { avatarUpload, changePasswordController, getActivityController, getProfileController, getSessionsController, logoutAllSessionsController, logoutCurrentSessionController, removeAvatarController, updateProfileController, uploadAvatarController } from "./profile.controller.js";
import { sensitiveWriteRateLimit, writeRateLimit } from "../../common/middleware/rate-limit.middleware.js";

export const profileRouter: Router = Router();
profileRouter.use(requireAuth);
profileRouter.get("/", getProfileController);
profileRouter.patch("/", writeRateLimit, updateProfileController);
profileRouter.post("/avatar", writeRateLimit, avatarUpload, uploadAvatarController);
profileRouter.delete("/avatar", writeRateLimit, removeAvatarController);
profileRouter.post("/change-password", sensitiveWriteRateLimit, changePasswordController);
profileRouter.get("/sessions", getSessionsController);
profileRouter.delete("/sessions/current", sensitiveWriteRateLimit, logoutCurrentSessionController);
profileRouter.delete("/sessions", sensitiveWriteRateLimit, logoutAllSessionsController);
profileRouter.get("/activity", getActivityController);
