import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  getPagesController, getPageController, savePageController,
  getFaqsController, createFaqController, updateFaqController,
  deleteFaqController, reorderFaqsController,
} from "./cms.controller.js";

export const cmsRouter: Router = Router();

cmsRouter.use(requireAuth);

cmsRouter.get("/:storeId/pages", getPagesController);
cmsRouter.get("/:storeId/pages/:slug", getPageController);
cmsRouter.put("/:storeId/pages/:slug", requireFeatureAccess("cms"), savePageController);

cmsRouter.get("/:storeId/faqs", getFaqsController);
cmsRouter.post("/:storeId/faqs/create", requireFeatureAccess("cms"), createFaqController);
cmsRouter.put("/:storeId/faqs/:faqId", updateFaqController);
cmsRouter.delete("/:storeId/faqs/:faqId", deleteFaqController);
cmsRouter.put("/:storeId/faqs/reorder", reorderFaqsController);
