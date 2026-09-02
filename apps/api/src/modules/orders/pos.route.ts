import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  openPosShiftController,
  getCurrentPosShiftController,
  closePosShiftController,
  listPosShiftsController,
} from "./pos-shift.controller.js";

export const posRouter: Router = Router({ mergeParams: true });

const storeId = (req: { params: { storeId?: string } }) => String(req.params.storeId);
const posGuard = requireFeatureAccess("pos", { getStoreId: storeId });

posRouter.use(requireAuth);

posRouter.get("/shifts/current", posGuard, getCurrentPosShiftController);
posRouter.post("/shifts/open", posGuard, openPosShiftController);
posRouter.post("/shifts/:shiftId/close", posGuard, closePosShiftController);
posRouter.get("/shifts", posGuard, listPosShiftsController);
