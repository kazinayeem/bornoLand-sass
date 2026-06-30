import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth.middleware.js";

export function requireRole(...roles: string[]) {
  return (request: AuthRequest, response: Response, next: NextFunction) => {
    if (!request.user) {
      return response.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!roles.includes(request.user.role)) {
      return response.status(403).json({ success: false, message: "Forbidden" });
    }

    return next();
  };
}