/**
 * Subdomain helpers — thin wrappers around universal host classification.
 * Product/deployment domains live in env (ROOT_DOMAIN, PLATFORM_BASES), never here.
 */

import {
  classifyHost,
  normalizeLabel,
  resolveStoreKeyForRequest,
  stripPort,
} from "./host-resolution.js";

export function getRootDomain(): string {
  return process.env.ROOT_DOMAIN ?? process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";
}

export function normalizeStoreSlug(value: string | undefined | null): string | null {
  return normalizeLabel(value);
}

/** Extract store slug candidate from Host / x-forwarded-host (no DB). */
export function extractSubdomain(host: string): string | null {
  if (!host) return null;
  const { storeKey, source } = resolveStoreKeyForRequest(host);
  if (source === "subdomain" || source === "default-tenant") return storeKey;
  // Custom domains are full hostnames — middleware may set x-store-slug after DB resolve
  if (source === "custom-domain") return storeKey;
  return null;
}

export function buildSubdomainUrl(slug: string): string {
  const rootDomain = getRootDomain();
  const protocol =
    process.env.NEXT_PUBLIC_PROTOCOL ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  if (!rootDomain) return "";
  return `${protocol}://${slug}.${rootDomain}`;
}

export { classifyHost, resolveStoreKeyForRequest, stripPort };
