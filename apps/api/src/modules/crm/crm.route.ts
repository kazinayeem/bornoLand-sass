import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  listDealsController,
  createDealController,
  updateDealStageController,
} from "./crm.controller.js";

export const crmRouter: Router = Router({ mergeParams: true });

const storeId = (req: { params: { storeId?: string } }) => String(req.params.storeId);
const crmGuard = requireFeatureAccess("crm", { getStoreId: storeId });

crmRouter.use(requireAuth);

crmRouter.get("/deals", crmGuard, listDealsController);
crmRouter.post("/deals", crmGuard, createDealController);
crmRouter.put("/deals/:dealId/stage", crmGuard, updateDealStageController);
