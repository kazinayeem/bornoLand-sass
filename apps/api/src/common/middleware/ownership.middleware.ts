import type { Response, NextFunction } from "express";
import type { SubdomainRequest } from "./subdomain.middleware.js";

export function requireStoreOwnership(modelName: string, paramName: string = "id") {
  return async (request: SubdomainRequest, response: Response, next: NextFunction) => {
    const storeId = request.store?._id?.toString();
    const resourceId = request.params[paramName];
    if (!storeId || !resourceId) {
      return response.status(400).json({ success: false, message: "Store and resource ID required" });
    }

    try {
      const { default: mongoose } = await import("mongoose");
      const model = mongoose.models[modelName];
      if (!model) {
        return response.status(500).json({ success: false, message: "Model not found" });
      }

      const doc = await model.findById(resourceId).lean();
      if (!doc) {
        return response.status(404).json({ success: false, message: "Resource not found" });
      }

      const docStoreId = (doc as any).storeId?.toString();
      if (!docStoreId || docStoreId !== storeId) {
        return response.status(403).json({ success: false, message: "Access denied" });
      }

      (request as any).resource = doc;
      next();
    } catch (error) {
      next(error);
    }
  };
}
