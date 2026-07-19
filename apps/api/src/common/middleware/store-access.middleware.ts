import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth.middleware.js";
import { connectDatabase } from "../database/connection.js";
import { StoreModel } from "../../models/store.model.js";

export async function requireStoreAccess(request: AuthRequest, response: Response, next: NextFunction) {
  const userId = request.user?.userId;
  if (!userId) {
    return response.status(401).json({ success: false, message: "Unauthorized" });
  }

  const storeId = request.params.storeId || request.body?.storeId || request.query.storeId;
  if (!storeId) {
    return response.status(400).json({ success: false, message: "Store ID required" });
  }

  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).select("_id").lean();

  if (!store) {
    return response.status(403).json({ success: false, message: "You do not have access to this store" });
  }

  next();
}

export function requireStoreAccessForParam(paramName = "storeId") {
  return async (request: AuthRequest, response: Response, next: NextFunction) => {
    const userId = request.user?.userId;
    if (!userId) {
      return response.status(401).json({ success: false, message: "Unauthorized" });
    }

    const storeId = request.params[paramName] as string | undefined;
    if (!storeId) {
      return response.status(400).json({ success: false, message: `${paramName} is required` });
    }

    await connectDatabase();
    const store = await StoreModel.findOne({ _id: storeId, userId }).select("_id").lean();

    if (!store) {
      return response.status(403).json({ success: false, message: "You do not have access to this store" });
    }

    next();
  };
}
