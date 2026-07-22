import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import type { SubdomainRequest } from "../../common/middleware/subdomain.middleware.js";
import { sendFailure } from "../../common/utils/api-response.js";
import { CustomerModel } from "../../models/customer.model.js";

function getCustomerJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

export function requireCustomerAuth(request: SubdomainRequest, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return sendFailure(response, "Not authenticated", 401);

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], getCustomerJwtSecret()) as { customerId?: string; tokenVersion?: number };
    if (!decoded.customerId) return sendFailure(response, "Not authenticated", 401);

    return CustomerModel.findById(decoded.customerId)
      .select({ tokenVersion: 1 })
      .lean()
      .then((customer: any) => {
        if (!customer) return sendFailure(response, "Not authenticated", 401);
        // Backwards compat: if tokenVersion wasn't included, allow it.
        if (typeof decoded.tokenVersion === "number" && (customer.tokenVersion as number | undefined) !== decoded.tokenVersion) {
          return sendFailure(response, "Session expired. Please sign in again.", 401);
        }
        (request as SubdomainRequest & { customerId?: string }).customerId = decoded.customerId;
        return next();
      })
      .catch(() => sendFailure(response, "Invalid or expired token", 401));
  } catch {
    return sendFailure(response, "Invalid or expired token", 401);
  }
}
