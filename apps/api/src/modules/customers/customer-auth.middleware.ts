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

/** Normalize missing tokenVersion on legacy customer documents to 0. */
export function resolveCustomerTokenVersion(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function requireCustomerAuth(request: SubdomainRequest, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return sendFailure(response, "Not authenticated", 401);

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], getCustomerJwtSecret()) as {
      customerId?: string;
      tokenVersion?: number;
    };
    if (!decoded.customerId) return sendFailure(response, "Not authenticated", 401);

    return CustomerModel.findById(decoded.customerId)
      .select({ tokenVersion: 1 })
      .lean()
      .then((customer: any) => {
        if (!customer) return sendFailure(response, "Not authenticated", 401);


        // Legacy docs may omit tokenVersion; treat missing as 0 to match token issuance.
        const storedVersion = resolveCustomerTokenVersion(customer.tokenVersion);
        const tokenVersion = resolveCustomerTokenVersion(decoded.tokenVersion);
        if (tokenVersion !== storedVersion) {
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
