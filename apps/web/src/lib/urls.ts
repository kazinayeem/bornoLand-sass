/**
 * Centralized URL configuration — single source of truth for all app URLs.
 * Driven by NEXT_PUBLIC_APP_ENV, NEXT_PUBLIC_ROOT_DOMAIN, NEXT_PUBLIC_PROTOCOL.
 */

import {
  extractStoreSlugFromHost,
  isPlatformHost,
} from "@/lib/tenant-resolution";

export type AppUrlConfig = {
  appEnv: string;
  protocol: string;
  /** Full root domain, e.g. `localhost:3000` or `bornosoft.site` */
  rootDomain: string;
  /** Hostname without port, e.g. `localhost` or `bornosoft.site` */
  rootHostname: string;
  /** Port suffix when present, e.g. `:3000` */
  rootPortSuffix: string;
};

function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function parseRootDomain(rootDomain: string): Pick<AppUrlConfig, "rootHostname" | "rootPortSuffix"> {
  const trimmed = rootDomain.trim().toLowerCase();
  const colonIndex = trimmed.lastIndexOf(":");
  const hasPort = colonIndex > 0 && /^\d+$/.test(trimmed.slice(colonIndex + 1));
  if (hasPort) {
    return {
      rootHostname: trimmed.slice(0, colonIndex),
      rootPortSuffix: trimmed.slice(colonIndex),
    };
  }
  return { rootHostname: trimmed, rootPortSuffix: "" };
}

export function readAppUrlConfig(): AppUrlConfig {
  const rootDomain = (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ??
    process.env.ROOT_DOMAIN ??
    ""
  ).trim().toLowerCase();

  const protocol = stripTrailingSlash(
    process.env.NEXT_PUBLIC_PROTOCOL ??
      (process.env.NODE_ENV === "production" ? "https" : "http"),
  );

  const { rootHostname, rootPortSuffix } = parseRootDomain(rootDomain);

  return {
    appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? "development",
    protocol,
    rootDomain,
    rootHostname,
    rootPortSuffix,
  };
}

export function getAppEnv(): string {
  return readAppUrlConfig().appEnv;
}

export function getProtocol(): string {
  return readAppUrlConfig().protocol;
}

export function getRootDomain(): string {
  return readAppUrlConfig().rootDomain;
}

export function getBaseDomain(): string {
  return readAppUrlConfig().rootHostname;
}

export function getAppOrigin(): string {
  const fromAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromAppUrl) return stripTrailingSlash(fromAppUrl);

  const { protocol, rootDomain } = readAppUrlConfig();
  if (!rootDomain) return "";
  return `${protocol}://${rootDomain}`;
}

/** Canonical origin for metadataBase and Open Graph URLs. */
export function getMetadataBaseUrl(): string {
  return getAppOrigin() || "http://localhost:3000";
}

export function joinUrl(origin: string, path = "/"): string {
  const base = stripTrailingSlash(origin);
  if (!path || path === "/") return base || "/";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getStoreHost(storeSlug: string): string {
  const slug = storeSlug.trim().toLowerCase();
  const { rootDomain } = readAppUrlConfig();
  if (!slug || !rootDomain) return rootDomain;
  return `${slug}.${rootDomain}`;
}

export function getStoreDisplayDomain(storeSlug: string): string {
  return getStoreHost(storeSlug);
}

export function getStoreUrl(storeSlug: string, path = "/"): string {
  const { protocol } = readAppUrlConfig();
  const host = getStoreHost(storeSlug);
  if (!host) return joinUrl(getAppOrigin(), path);
  return joinUrl(`${protocol}://${host}`, path);
}

export function getAdminUrl(path = "/admin"): string {
  return joinUrl(getAppOrigin(), path);
}

export function getWorkspaceUrl(path = "/dashboard"): string {
  return joinUrl(getAppOrigin(), path);
}

export function getApiUrl(): string {
  const url =
    (typeof window === "undefined"
      ? process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL
      : process.env.NEXT_PUBLIC_API_URL) ?? "";
  return stripTrailingSlash(url);
}

export function getTenantCanonicalUrl(tenantSlug: string, path = "/"): string {
  return getStoreUrl(tenantSlug, path);
}

/** Extract store/tenant slug from a Host header value (subdomain only). */
export function extractSubdomainFromHost(host: string): string | null {
  return extractStoreSlugFromHost(host);
}

/**
 * Platform apex hosts (landing / dashboard), never a custom-domain tenant.
 * Includes loopback, bare IPs, PLATFORM_HOSTS, and ROOT_DOMAIN.
 */
export function isRootHost(host: string): boolean {
  return isPlatformHost(host);
}

export function resolveStoreSlug(
  storeOrSlug: string | { subdomain?: string | null; slug?: string | null },
): string {
  if (typeof storeOrSlug === "string") return storeOrSlug;
  return storeOrSlug.subdomain || storeOrSlug.slug || "";
}

export function getStoreUrlFromRecord(
  store: { subdomain?: string | null; slug?: string | null },
  path = "/",
): string {
  return getStoreUrl(resolveStoreSlug(store), path);
}
