import type { NextFunction, Request, Response } from "express";
import { extractSubdomain } from "../utils/subdomain.js";
import { StoreModel } from "../models/store.model.js";
import { TenantModel } from "../models/tenant.model.js";

/**
 * Augments Express Request with tenant/subdomain context.
 */
export type SubdomainRequest = Request & {
  subdomain?: string | null;
  tenant?: {
    _id: unknown;
    slug: string;
    name: string;
  } | null;
  store?: {
    _id: unknown;
    slug: string;
    name: string;
  } | null;
};

/**
 * Middleware that extracts the subdomain from the Host header
 * and attaches it to `req.subdomain`.
 *
 * Use this for routes that need to know which tenant/store
 * is being accessed via subdomain.
 */
export function subdomainDetector(request: SubdomainRequest, _response: Response, next: NextFunction) {
  const forwardedHost = request.headers["x-forwarded-host"];
  const host = typeof forwardedHost === "string" && forwardedHost.length > 0 ? forwardedHost : (request.headers["host"] ?? "");
  request.subdomain = extractSubdomain(host);
  next();
}

/**
 * Middleware that looks up the Store by subdomain and attaches
 * the store + its parent tenant to the request.
 *
 * Must be placed AFTER `subdomainDetector`.
 */
export async function resolveStoreFromSubdomain(request: SubdomainRequest, response: Response, next: NextFunction) {
  const slug = request.subdomain;
  if (!slug) return next();

  try {
    const store: any = await StoreModel.findOne({ subdomain: slug, status: "active" }).lean();
    if (store) {
      request.store = {
        _id: store._id,
        slug: store.slug,
        name: store.name,
      };
      const tenant: any = await TenantModel.findById(store.tenantId).lean();
      if (tenant) {
        request.tenant = {
          _id: tenant._id,
          slug: tenant.slug,
          name: tenant.name,
        };
      }
    }
  } catch {
    // Silently continue
  }

  next();
}
