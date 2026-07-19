import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { avatarUpload, changePasswordController, getActivityController, getProfileController, getSessionsController, logoutAllSessionsController, logoutCurrentSessionController, removeAvatarController, updateProfileController, uploadAvatarController } from "./profile.controller.js";

export const profileRouter: Router = Router();
profileRouter.use(requireAuth);
profileRouter.get("/", getProfileController);
profileRouter.patch("/", updateProfileController);
profileRouter.post("/avatar", avatarUpload, uploadAvatarController);
profileRouter.delete("/avatar", removeAvatarController);
profileRouter.post("/change-password", changePasswordController);
profileRouter.get("/sessions", getSessionsController);
profileRouter.delete("/sessions/current", logoutCurrentSessionController);
profileRouter.delete("/sessions", logoutAllSessionsController);
profileRouter.get("/activity", getActivityController);
