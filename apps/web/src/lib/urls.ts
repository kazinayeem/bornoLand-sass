/**
 * Centralized URL configuration — single source of truth for all app URLs.
 * Driven by NEXT_PUBLIC_APP_ENV, NEXT_PUBLIC_ROOT_DOMAIN, NEXT_PUBLIC_PROTOCOL.
 */

import {
  classifyHost,
  isLoopbackHostname,
  isIpHostname,
} from "@/lib/host-resolution";

/** Extract store/tenant slug from a Host header value (subdomain only). */
export function extractSubdomainFromHost(host: string): string | null {
  const c = classifyHost(host);
  return c.kind === "tenant-subdomain" ? c.storeKey : null;
}

/**
 * Platform apex hosts (landing / dashboard), never a custom-domain tenant.
 */
export function isRootHost(host: string): boolean {
  const c = classifyHost(host);
  return c.kind === "platform" || isLoopbackHostname(host) || isIpHostname(host);
}
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
  const rawRootDomain = (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ??
    process.env.ROOT_DOMAIN ??
    (process.env.NODE_ENV === "production" ? "bornosoft.site" : "localhost:3000")
  ).trim().toLowerCase();
  const rootDomain = rawRootDomain.replace(/^https?:\/\//, "").replace(/\/+$/, "");

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
  const domain = rootDomain || "localhost:3000";
  return `${protocol}://${domain}`;
}

/** Canonical origin for metadataBase and Open Graph URLs. */
export function getMetadataBaseUrl(): string {
  return getAppOrigin();
}

export function joinUrl(origin: string, path = "/"): string {
  const base = stripTrailingSlash(origin);
  if (!path || path === "/") return base || "/";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getStoreHost(storeSlug: string): string {
  const slug = storeSlug.trim().toLowerCase();
  const { rootDomain, rootHostname, rootPortSuffix } = readAppUrlConfig();
  const baseDomain = rootDomain || "localhost:3000";
  if (!slug) return baseDomain;

  // In browser, if on nip.io or sslip.io, preserve that domain
  if (typeof window !== "undefined") {
    const currentHost = window.location.host.toLowerCase();
    const nipMatch = currentHost.match(/^(?:[a-z0-9-]+\.)?((?:\d{1,3}\.){3}\d{1,3}\.(?:nip|sslip)\.io(?::\d+)?)$/);
    if (nipMatch) {
      return `${slug}.${nipMatch[1]}`;
    }
  }

  // If rootHostname is an IP address (e.g. 3.111.51.117), a raw subdomain like
  // nayeem.3.111.51.117 is an invalid hostname in WHATWG URL spec (causes new URL() to throw TypeError).
  // Automatically use nip.io for IP-based subdomains.
  if (isIpHostname(rootHostname)) {
    return `${slug}.${rootHostname}.nip.io${rootPortSuffix}`;
  }

  return `${slug}.${baseDomain}`;
}

export function getStoreDisplayDomain(storeSlug: string): string {
  return getStoreHost(storeSlug);
}

export function getStoreUrl(storeSlug: string, path = "/"): string {
  const { protocol } = readAppUrlConfig();
  const host = getStoreHost(storeSlug);
  return joinUrl(`${protocol}://${host}`, path);
}

export function getAdminUrl(path = "/admin"): string {
  return joinUrl(getAppOrigin(), path);
}

export function getWorkspaceUrl(path = "/dashboard"): string {
  return joinUrl(getAppOrigin(), path);
}

export function getApiUrl(): string {
  if (typeof window === "undefined") {
    const raw = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "").trim();
    if (raw && (raw.startsWith("http://") || raw.startsWith("https://"))) {
      return stripTrailingSlash(raw);
    }
    const port = process.env.NEXT_PUBLIC_API_PORT || process.env.API_PORT || "4000";
    return `http://localhost:${port}`;
  }
  const url = process.env.NEXT_PUBLIC_API_URL ?? "/api";
  return stripTrailingSlash(url);
}

export function getTenantCanonicalUrl(tenantSlug: string, path = "/"): string {
  return getStoreUrl(tenantSlug, path);
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
