import { Router } from "express";
import type { Response } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { requireRole } from "../../common/middleware/role.middleware.js";
import {
  getUnreadNotificationCount,
  listUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./billing-notification.service.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";

export const billingNotificationRouter: Router = Router();

billingNotificationRouter.use(requireAuth);

billingNotificationRouter.get("/", async (request: AuthRequest, response: Response) => {
  const result = await listUserNotifications(request.user!.userId);
  return sendSuccess(response, result.data);
});

billingNotificationRouter.get("/unread-count", async (request: AuthRequest, response: Response) => {
  const result = await getUnreadNotificationCount(request.user!.userId);
  return sendSuccess(response, result.data);
});

billingNotificationRouter.put("/read-all", async (request: AuthRequest, response: Response) => {
  await markAllNotificationsRead(request.user!.userId);
  return sendSuccess(response, undefined, "All notifications marked as read");
});

billingNotificationRouter.put("/:id/read", async (request: AuthRequest, response: Response) => {
  const result = await markNotificationRead(request.params.id as string, request.user!.userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});
