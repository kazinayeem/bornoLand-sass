import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  bulkDeleteMediaController,
  deleteMediaController,
  downloadMediaController,
  getMediaFileController,
  getMediaStatsController,
  getMediaUsageController,
  listMediaController,
  mediaUploadMiddleware,
  renameMediaController,
  replaceMediaController,
  uploadMediaController,
} from "./media.controller.js";

export const mediaRouter: Router = Router({ mergeParams: true });

mediaRouter.use(requireAuth);

const storeId = (req: { params: { storeId?: string } }) => String(req.params.storeId);

mediaRouter.get("/stats", requireFeatureAccess("media", { getStoreId: storeId }), getMediaStatsController);
mediaRouter.post(
  "/upload",
  requireFeatureAccess("media", { getStoreId: storeId }),
  mediaUploadMiddleware,
  uploadMediaController
);
mediaRouter.post("/bulk-delete", requireFeatureAccess("media", { getStoreId: storeId }), bulkDeleteMediaController);
mediaRouter.get("/", requireFeatureAccess("media", { getStoreId: storeId }), listMediaController);
mediaRouter.get("/:id/usage", requireFeatureAccess("media", { getStoreId: storeId }), getMediaUsageController);
mediaRouter.get("/:id/download", requireFeatureAccess("media", { getStoreId: storeId }), downloadMediaController);
mediaRouter.post("/:id/replace", requireFeatureAccess("media", { getStoreId: storeId }), replaceMediaController);
mediaRouter.get("/:id", requireFeatureAccess("media", { getStoreId: storeId }), getMediaFileController);
mediaRouter.put("/:id", requireFeatureAccess("media", { getStoreId: storeId }), renameMediaController);
mediaRouter.delete("/:id", requireFeatureAccess("media", { getStoreId: storeId }), deleteMediaController);
