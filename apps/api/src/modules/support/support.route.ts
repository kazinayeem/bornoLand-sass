import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  listSupportTicketsController,
  createSupportTicketController,
  addTicketReplyController,
} from "./support.controller.js";

export const supportRouter: Router = Router({ mergeParams: true });

const storeId = (req: { params: { storeId?: string } }) => String(req.params.storeId);
const supportGuard = requireFeatureAccess("support", { getStoreId: storeId });

supportRouter.use(requireAuth);

supportRouter.get("/tickets", supportGuard, listSupportTicketsController);
supportRouter.post("/tickets", supportGuard, createSupportTicketController);
supportRouter.post("/tickets/:ticketId/reply", supportGuard, addTicketReplyController);
