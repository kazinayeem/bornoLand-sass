import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getPagesController, getPageController, savePageController,
  createPageController, deletePageController, publishPageController
} from "../controllers/builder.controller.js";

export const builderRouter = Router();

builderRouter.use(requireAuth);

builderRouter.get("/:storeId/pages", getPagesController);
builderRouter.get("/page/:pageId", getPageController);
builderRouter.put("/page/:pageId/save", savePageController);
builderRouter.post("/:storeId/pages/create", createPageController);
builderRouter.delete("/page/:pageId", deletePageController);
builderRouter.post("/page/:pageId/publish", publishPageController);
