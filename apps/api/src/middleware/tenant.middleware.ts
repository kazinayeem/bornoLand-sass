import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth.middleware.js";

export function requireTenantScope(request: AuthRequest, response: Response, next: NextFunction) {
  const tenantId = request.params.tenantId || request.user?.tenantId;

  if (!tenantId) {
    return response.status(400).json({ message: "Tenant context required" });
  }

  request.params.tenantId = tenantId;
  return next();
}