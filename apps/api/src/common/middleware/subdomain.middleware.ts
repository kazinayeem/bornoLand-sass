import type { NextFunction, Request, Response } from "express";
import { extractSubdomain, normalizeStoreSlug } from "../utils/subdomain.js";
import { StoreModel } from "../../models/store.model.js";
import { TenantModel } from "../../models/tenant.model.js";

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
 * Middleware that extracts the store slug from:
 * 1. `x-store-slug` (explicit, preferred for platform IP / path-based storefronts)
 * 2. `x-forwarded-host` / Host subdomain parsing
 *
 * Attaches the result to `req.subdomain`.
 */
export function subdomainDetector(request: SubdomainRequest, _response: Response, next: NextFunction) {
  const storeSlugHeader = request.headers["x-store-slug"];
  const fromHeader = normalizeStoreSlug(
    typeof storeSlugHeader === "string" ? storeSlugHeader : Array.isArray(storeSlugHeader) ? storeSlugHeader[0] : null,
  );
  if (fromHeader) {
    request.subdomain = fromHeader;
    return next();
  }

  const forwardedHost = request.headers["x-forwarded-host"];
  const host =
    typeof forwardedHost === "string" && forwardedHost.length > 0
      ? forwardedHost
      : (request.headers["host"] ?? "");
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
    let store: any = await StoreModel.findOne({ subdomain: slug, status: "active" }).lean();
    if (!store) {
      store = await StoreModel.findOne({ slug, status: "active" }).lean();
    }
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
