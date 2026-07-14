import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { attachStoreIdFromPage } from "../../common/middleware/page-store.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  getPagesController, getPageController, savePageController,
  createPageController, deletePageController, clearPageController,
  updatePageController, duplicatePageController, renamePageController,
  archivePageController, restorePageController, resetPageController,
  getOrCreateHomePageController, publishPageController
} from "./builder.controller.js";

export const builderRouter: Router = Router();

builderRouter.use(requireAuth);

builderRouter.get("/:storeId/pages", getPagesController);
builderRouter.get("/:storeId/home", getOrCreateHomePageController);
builderRouter.get("/page/:pageId", getPageController);
builderRouter.put("/page/:pageId/save", attachStoreIdFromPage, savePageController);
builderRouter.post("/:storeId/pages/create", requireFeatureAccess("page_builder", { checkLimit: true }), createPageController);
builderRouter.put("/page/:pageId", updatePageController);
builderRouter.post("/page/:pageId/duplicate", duplicatePageController);
builderRouter.patch("/page/:pageId/rename", renamePageController);
builderRouter.post("/page/:pageId/archive", archivePageController);
builderRouter.post("/page/:pageId/restore", restorePageController);
builderRouter.post("/page/:pageId/reset", resetPageController);
builderRouter.delete("/page/:pageId", deletePageController);
builderRouter.post("/page/:pageId/clear", clearPageController);
builderRouter.post(
  "/page/:pageId/publish",
  attachStoreIdFromPage,
  requireFeatureAccess("page_builder"),
  publishPageController,
);
