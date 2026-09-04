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

/**
 * Platform-only management routes that exist solely on the platform apex (e.g. bornosoft.site).
 * If accessed on a tenant subdomain (e.g. nayeem.bornosoft.site/dashboard), they redirect to the platform apex.
 */
export const PLATFORM_MANAGEMENT_ROUTES = new Set([
  "/dashboard",
  "/workshops",
  "/admin",
  "/store",
]);

export function isPlatformManagementRoute(pathname: string): boolean {
  if (!pathname) return false;
  const base = pathname.split("/")[1]?.toLowerCase() ?? "";
  return PLATFORM_MANAGEMENT_ROUTES.has(`/${base}`);
}

export const PLATFORM_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/unauthorized",
  "/logout",
  "/api",
  "/dashboard",
  "/workshops",
  "/store",
  "/admin",
  "/pricing",
  "/features",
  "/solutions",
  "/templates",
  "/contact",
  "/about",
  "/terms",
  "/privacy",
  "/faq",
]);

export function isPlatformRoute(pathname: string): boolean {
  if (!pathname || pathname === "/") return true;
  const base = pathname.split("/")[1]?.toLowerCase() ?? "";
  return PLATFORM_ROUTES.has(`/${base}`) || base.startsWith("_next") || base === "api" || base === "site";
}

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
  const fromHost = resolveTenantFromHost(raw).storeSlug;
  if (fromHost) return fromHost;

  if (typeof window !== "undefined") {
    const pathMatch = window.location.pathname.match(/^\/site\/([^/]+)/);
    if (pathMatch?.[1]) return pathMatch[1];
  }

  return null;
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
