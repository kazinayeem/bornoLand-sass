import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  createReviewController,
  deleteReviewController,
  listReviewsController,
  updateReviewStatusController,
} from "./review.controller.js";

export const reviewRouter: Router = Router({ mergeParams: true });

reviewRouter.use(requireAuth);
reviewRouter.get("/", requireFeatureAccess("reviews", { getStoreId: (req) => String(req.params.storeId) }), listReviewsController);
reviewRouter.post("/", requireFeatureAccess("reviews", { getStoreId: (req) => String(req.params.storeId) }), createReviewController);
reviewRouter.put("/:id/status", requireFeatureAccess("reviews", { getStoreId: (req) => String(req.params.storeId) }), updateReviewStatusController);
reviewRouter.delete("/:id", requireFeatureAccess("reviews", { getStoreId: (req) => String(req.params.storeId) }), deleteReviewController);
