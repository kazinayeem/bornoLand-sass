import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  getPagesController, getPageController, savePageController,
  createPageController, deletePageController, publishPageController
} from "./builder.controller.js";

export const builderRouter: Router = Router();

builderRouter.use(requireAuth);

builderRouter.get("/:storeId/pages", getPagesController);
builderRouter.get("/page/:pageId", getPageController);
builderRouter.put("/page/:pageId/save", savePageController);
builderRouter.post("/:storeId/pages/create", requireFeatureAccess("page_builder", { checkLimit: true }), createPageController);
builderRouter.delete("/page/:pageId", deletePageController);
builderRouter.post("/page/:pageId/publish", requireFeatureAccess("page_builder"), publishPageController);
