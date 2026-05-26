import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getPagesController, getPageController, savePageController,
  getFaqsController, createFaqController, updateFaqController,
  deleteFaqController, reorderFaqsController,
} from "../controllers/cms.controller.js";

export const cmsRouter = Router();

cmsRouter.use(requireAuth);

cmsRouter.get("/:storeId/pages", getPagesController);
cmsRouter.get("/:storeId/pages/:slug", getPageController);
cmsRouter.put("/:storeId/pages/:slug", savePageController);

cmsRouter.get("/:storeId/faqs", getFaqsController);
cmsRouter.post("/:storeId/faqs/create", createFaqController);
cmsRouter.put("/:storeId/faqs/:faqId", updateFaqController);
cmsRouter.delete("/:storeId/faqs/:faqId", deleteFaqController);
cmsRouter.put("/:storeId/faqs/reorder", reorderFaqsController);
