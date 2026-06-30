import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import {
  createCollectionController,
  deleteCollectionController,
  listCollectionsController,
  updateCollectionController,
} from "./collection.controller.js";

export const collectionRouter: Router = Router({ mergeParams: true });

collectionRouter.use(requireAuth);
collectionRouter.get("/", listCollectionsController);
collectionRouter.post("/", createCollectionController);
collectionRouter.put("/:id", updateCollectionController);
collectionRouter.delete("/:id", deleteCollectionController);
