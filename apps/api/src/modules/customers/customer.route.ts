import { Router } from "express";
import { subdomainDetector, resolveStoreFromSubdomain } from "../../common/middleware/subdomain.middleware.js";
import {
  registerController,
  loginController,
  meController,
  forgotPasswordController,
  updateProfileController,
  changePasswordController,
  uploadAvatarController,
  removeAvatarController,
  logoutAllDevicesController,
  listSessionsController,
  listNotificationsController,
  getUnreadNotificationCountController,
  markNotificationReadController,
  markAllNotificationsReadController,
  deleteNotificationController,
} from "./customer.controller.js";
import { customerAddressRouter } from "./customer-address.route.js";

export const customerRouter: Router = Router();

customerRouter.use(subdomainDetector);
customerRouter.use(resolveStoreFromSubdomain);

customerRouter.post("/register", registerController);
customerRouter.post("/login", loginController);
customerRouter.post("/forgot-password", forgotPasswordController);
customerRouter.get("/me", meController);
customerRouter.use("/addresses", customerAddressRouter);
customerRouter.patch("/me", updateProfileController);
customerRouter.post("/me/change-password", changePasswordController);
customerRouter.post("/me/avatar", uploadAvatarController);
customerRouter.delete("/me/avatar", removeAvatarController);
customerRouter.get("/sessions", listSessionsController);
customerRouter.delete("/sessions/logout-all", logoutAllDevicesController);
customerRouter.get("/notifications", listNotificationsController);
customerRouter.get("/notifications/unread-count", getUnreadNotificationCountController);
customerRouter.put("/notifications/:id/read", markNotificationReadController);
customerRouter.put("/notifications/read-all", markAllNotificationsReadController);
customerRouter.delete("/notifications/:id", deleteNotificationController);
