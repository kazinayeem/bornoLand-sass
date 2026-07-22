import type { NextFunction, Request, Response } from "express";
import { extractSubdomain, normalizeStoreSlug } from "../utils/subdomain.js";
import { classifyHost, resolveStoreKeyForRequest } from "../utils/host-resolution.js";
import { findStoreByHostKey } from "../../modules/stores/tenant-resolver.service.js";
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
 * Attach store slug candidate from:
 * 1. Explicit `x-store-slug` (short slug or full custom-domain hostname)
 * 2. Universal host classification of `x-forwarded-host` / Host
 */
export function subdomainDetector(request: SubdomainRequest, _response: Response, next: NextFunction) {
  const storeSlugHeader = request.headers["x-store-slug"];
  const rawHeader =
    typeof storeSlugHeader === "string"
      ? storeSlugHeader
      : Array.isArray(storeSlugHeader)
        ? storeSlugHeader[0]
        : null;
  if (rawHeader?.trim()) {
    const trimmed = rawHeader.trim().toLowerCase();
    // Full hostnames (custom domains) keep dots; short labels are validated
    request.subdomain = trimmed.includes(".") ? trimmed : normalizeStoreSlug(trimmed);
    if (request.subdomain) return next();
  }

  const forwardedHost = request.headers["x-forwarded-host"];
  const host =
    typeof forwardedHost === "string" && forwardedHost.length > 0
      ? forwardedHost
      : (request.headers["host"] ?? "");

  const { storeKey, source } = resolveStoreKeyForRequest(host);
  request.subdomain = storeKey;
  if (process.env.DEBUG_TENANT_ROUTING === "1") {
    const classification = classifyHost(host);
    console.log(
      `[subdomainDetector] host="${host}" kind=${classification.kind} source=${source} key=${storeKey}`,
    );
  }
  next();
}

/**
 * Look up Store by subdomain / slug / customDomains (DB is source of truth).
 * Must run AFTER `subdomainDetector`.
 */
export async function resolveStoreFromSubdomain(
  request: SubdomainRequest,
  _response: Response,
  next: NextFunction,
) {
  const key = request.subdomain;
  if (!key) return next();

  try {
    const storeDoc = await findStoreByHostKey(key);
    if (storeDoc) {
      const store = storeDoc as {
        _id: unknown;
        slug: string;
        name: string;
        subdomain?: string;
        tenantId?: unknown;
      };
      // Prefer canonical subdomain for downstream code that expects a short slug
      request.subdomain = (store.subdomain || store.slug || key).toString();
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
    } else {
      // Fallback: legacy subdomain-only lookup
      let store: any = await StoreModel.findOne({ subdomain: key, status: "active" }).lean();
      if (!store) {
        store = await StoreModel.findOne({ slug: key, status: "active" }).lean();
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
    }
  } catch {
    // Silently continue
  }

  next();
}
