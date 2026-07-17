import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  createCollectionController,
  deleteCollectionController,
  listCollectionsController,
  updateCollectionController,
} from "./collection.controller.js";

export const collectionRouter: Router = Router({ mergeParams: true });

collectionRouter.use(requireAuth);
collectionRouter.get("/", listCollectionsController);
collectionRouter.post("/", requireFeatureAccess("collections", { checkLimit: true }), createCollectionController);
collectionRouter.put("/:id", requireFeatureAccess("collections"), updateCollectionController);
collectionRouter.delete("/:id", requireFeatureAccess("collections"), deleteCollectionController);
