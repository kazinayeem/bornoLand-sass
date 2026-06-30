import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  createCampaignController,
  deleteCampaignController,
  listCampaignsController,
  updateCampaignController,
} from "./campaign.controller.js";

export const marketingRouter: Router = Router({ mergeParams: true });

marketingRouter.use(requireAuth);
marketingRouter.use(requireFeatureAccess("marketing", { getStoreId: (req) => String(req.params.storeId) }));
marketingRouter.get("/campaigns", listCampaignsController);
marketingRouter.post("/campaigns", createCampaignController);
marketingRouter.put("/campaigns/:id", updateCampaignController);
marketingRouter.delete("/campaigns/:id", deleteCampaignController);
