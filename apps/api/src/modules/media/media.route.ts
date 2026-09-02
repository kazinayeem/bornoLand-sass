import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireStorePermission } from "../../common/middleware/store-permission.middleware.js";
import {
  bulkDeleteMediaController,
  deleteMediaController,
  downloadMediaController,
  getMediaFileController,
  getMediaStatsController,
  getMediaUsageController,
  importMediaFromUrlController,
  listMediaController,
  mediaUploadMiddleware,
  renameMediaController,
  replaceMediaController,
  uploadMediaController,
} from "./media.controller.js";

export const mediaRouter: Router = Router({ mergeParams: true });

mediaRouter.use(requireAuth);

mediaRouter.get("/stats", getMediaStatsController);
mediaRouter.get("/", requireStorePermission("media:read"), listMediaController);
mediaRouter.get("/:id/usage", requireStorePermission("media:read"), getMediaUsageController);
mediaRouter.get("/:id/download", requireStorePermission("media:read"), downloadMediaController);
mediaRouter.get("/:id", requireStorePermission("media:read"), getMediaFileController);

mediaRouter.post(
  "/upload",
  requireStorePermission("media:create"),
  mediaUploadMiddleware,
  uploadMediaController
);
mediaRouter.post("/import-url", requireStorePermission("media:create"), importMediaFromUrlController);
mediaRouter.post("/:id/replace", requireStorePermission("media:update"), replaceMediaController);
mediaRouter.put("/:id", requireStorePermission("media:update"), renameMediaController);

mediaRouter.post("/bulk-delete", requireStorePermission("media:delete"), bulkDeleteMediaController);
mediaRouter.delete("/:id", requireStorePermission("media:delete"), deleteMediaController);
