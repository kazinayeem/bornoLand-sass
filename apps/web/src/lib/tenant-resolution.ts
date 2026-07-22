/**
 * Storefront tenant helpers — thin adapters over universal host classification.
 * Prefer importing from `@/lib/host-resolution` for new code.
 */

import {
  classifyHost,
  getDefaultTenantSlug,
  isIpHostname,
  isLoopbackHostname,
  readHostResolutionConfig,
  resolveStoreKeyForRequest,
  stripPort,
  type HostClassification,
} from "@/lib/host-resolution";

export type TenantHostSource =
  | "subdomain"
  | "custom-domain"
  | "default-tenant"
  | "platform"
  | "session"
  | "none";

export type TenantHostResolution = {
  hostname: string;
  host: string;
  storeSlug: string | null;
  source: TenantHostSource;
  isPlatformHost: boolean;
  isCustomDomain: boolean;
};

export { getDefaultTenantSlug, isIpHostname, classifyHost, resolveStoreKeyForRequest };

export function isPlatformHost(host: string): boolean {
  const { kind } = classifyHost(host);
  return kind === "platform" || isLoopbackHostname(host) || isIpHostname(host);
}

export function isMarketingApexHost(host: string): boolean {
  const c = classifyHost(host);
  return c.kind === "platform" && !c.isLoopback && !c.isIp;
}

export function extractStoreSlugFromHost(host: string): string | null {
  const c = classifyHost(host);
  if (c.kind === "tenant-subdomain") return c.storeKey;
  return null;
}

export function resolveTenantFromHost(
  host: string,
  sessionTenantId?: string,
): TenantHostResolution {
  const normalizedHost = host.trim().toLowerCase();
  const hostname = stripPort(normalizedHost);

  if (sessionTenantId) {
    return {
      hostname,
      host: normalizedHost,
      storeSlug: null,
      source: "session",
      isPlatformHost: isPlatformHost(normalizedHost),
      isCustomDomain: false,
    };
  }

  const { storeKey, classification, source } = resolveStoreKeyForRequest(normalizedHost);

  return {
    hostname,
    host: normalizedHost,
    storeSlug: storeKey,
    source: source === "platform" && !storeKey ? "platform" : source,
    isPlatformHost: classification.kind === "platform" || source === "default-tenant",
    isCustomDomain: classification.kind === "custom-domain",
  };
}

export function getStorefrontForwardedHost(host?: string): string {
  const raw =
    host ??
    (typeof window !== "undefined" ? window.location.host : "");
  const resolution = resolveTenantFromHost(raw);

  if (resolution.source === "default-tenant" && resolution.storeSlug) {
    const { rootHostname } = readHostResolutionConfig();
    const apex =
      rootHostname && !isIpHostname(rootHostname) && rootHostname !== "localhost"
        ? rootHostname
        : "localhost";
    return `${resolution.storeSlug}.${apex}`;
  }

  return raw;
}

export function getStoreSlugHeader(host?: string): string | null {
  const raw =
    host ??
    (typeof window !== "undefined" ? window.location.host : "");
  return resolveTenantFromHost(raw).storeSlug;
}

export function getStorefrontTenantHeaders(host?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "x-forwarded-host": getStorefrontForwardedHost(host),
  };
  const slug = getStoreSlugHeader(host);
  if (slug) headers["x-store-slug"] = slug;
  return headers;
}

export type { HostClassification };
