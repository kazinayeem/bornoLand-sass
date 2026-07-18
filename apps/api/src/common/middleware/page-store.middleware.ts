import type { NextFunction, Response } from "express";
import { connectDatabase } from "../../common/database/connection.js";
import type { AuthRequest } from "./auth.middleware.js";
import { StorePageModel } from "../../modules/pages/store-page.model.js";
import { resolveStoreIdFromRequest } from "../../modules/features/feature-access.service.js";

type RequestWithResolvedStore = AuthRequest & { resolvedStoreId?: string };

export async function attachStoreIdFromPage(
  request: RequestWithResolvedStore,
  response: Response,
  next: NextFunction,
) {
  if (resolveStoreIdFromRequest(request)) {
    return next();
  }

  const pageId = request.params.pageId;
  if (!pageId) {
    return response.status(400).json({ success: false, message: "Page ID required" });
  }

  await connectDatabase();
  const page = (await StorePageModel.findById(pageId).select("storeId").lean()) as { storeId?: unknown } | null;
  if (!page?.storeId) {
    return response.status(404).json({ success: false, message: "Page not found" });
  }

  request.resolvedStoreId = String(page.storeId);
  return next();
}
