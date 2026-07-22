/**
 * Single source of truth for storefront tenant / store resolution from a Host header.
 *
 * Priority:
 * 1. Explicit subdomain of ROOT_DOMAIN / *.localhost  → that store slug
 * 2. Platform host (localhost, loopback, bare IP, PLATFORM_HOSTS, ROOT_DOMAIN)
 *    → NEXT_PUBLIC_DEFAULT_TENANT when set, otherwise no storefront tenant
 * 3. Anything else → custom domain (hostname is the lookup key)
 */

export type TenantHostSource =
  | "subdomain"
  | "custom-domain"
  | "default-tenant"
  | "platform"
  | "session"
  | "none";

export type TenantHostResolution = {
  /** Hostname without port */
  hostname: string;
  /** Original host (may include port) */
  host: string;
  /** Store/tenant slug to use for /site/[slug] and API store context, if any */
  storeSlug: string | null;
  source: TenantHostSource;
  /** True when this host is the SaaS platform apex (not a tenant custom domain) */
  isPlatformHost: boolean;
  isCustomDomain: boolean;
};

const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_RE = /^\[?[0-9a-f:]+\]?$/i;

function stripPort(host: string): string {
  const trimmed = host.trim().toLowerCase();
  if (!trimmed) return "";
  if (trimmed.startsWith("[")) {
    const end = trimmed.indexOf("]");
    if (end > 0) return trimmed.slice(1, end);
  }
  const colon = trimmed.lastIndexOf(":");
  if (colon > 0 && /^\d+$/.test(trimmed.slice(colon + 1))) {
    return trimmed.slice(0, colon);
  }
  return trimmed;
}

function readRootConfig() {
  const rootDomain = (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ??
    process.env.ROOT_DOMAIN ??
    ""
  )
    .trim()
    .toLowerCase();
  const colon = rootDomain.lastIndexOf(":");
  const hasPort = colon > 0 && /^\d+$/.test(rootDomain.slice(colon + 1));
  const rootHostname = hasPort ? rootDomain.slice(0, colon) : rootDomain;
  return { rootDomain, rootHostname };
}

/** Configurable default storefront slug — never hardcode a store name. */
export function getDefaultTenantSlug(): string | null {
  const value = (process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? process.env.DEFAULT_TENANT ?? "")
    .trim()
    .toLowerCase();
  if (!value) return null;
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(value)) return null;
  return value;
}

/** Extra platform apex hosts (comma-separated), e.g. EC2 public IP or elastic hostname. */
export function getConfiguredPlatformHosts(): string[] {
  const raw =
    process.env.NEXT_PUBLIC_PLATFORM_HOSTS ??
    process.env.PLATFORM_HOSTS ??
    "";
  return raw
    .split(",")
    .map((part) => stripPort(part))
    .filter(Boolean);
}

export function isIpHostname(hostname: string): boolean {
  const host = stripPort(hostname);
  if (!host) return false;
  if (IPV4_RE.test(host)) {
    return host.split(".").every((octet) => {
      const n = Number(octet);
      return Number.isInteger(n) && n >= 0 && n <= 255;
    });
  }
  return IPV6_RE.test(host) && host.includes(":");
}

/**
 * Platform apex hosts must never be treated as tenant custom domains.
 * Includes loopback, bare IPs, configured PLATFORM_HOSTS, and ROOT_DOMAIN.
 */
export function isPlatformHost(host: string): boolean {
  const hostname = stripPort(host);
  if (!hostname) return false;

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1"
  ) {
    return true;
  }

  if (isIpHostname(hostname)) return true;

  const configured = getConfiguredPlatformHosts();
  if (configured.includes(hostname)) return true;

  const { rootDomain, rootHostname } = readRootConfig();
  const lowerHost = host.trim().toLowerCase();
  if (rootDomain && (lowerHost === rootDomain || hostname === rootHostname)) {
    return true;
  }

  return false;
}

/** Extract store slug from a subdomain host (store.root or store.localhost). */
export function extractStoreSlugFromHost(host: string): string | null {
  const lowerHost = host.trim().toLowerCase();
  if (!lowerHost) return null;

  const { rootDomain, rootHostname } = readRootConfig();
  const hostname = stripPort(lowerHost);

  if (rootDomain && (lowerHost === rootDomain || hostname === rootHostname)) {
    return null;
  }

  if (rootDomain && lowerHost.endsWith(`.${rootDomain}`)) {
    const prefix = lowerHost.slice(0, -(rootDomain.length + 1));
    if (prefix && !prefix.includes(".")) return prefix;
    return null;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || isIpHostname(hostname)) {
    return null;
  }

  if (hostname.endsWith(".localhost")) {
    const prefix = hostname.slice(0, -".localhost".length);
    if (prefix && !prefix.includes(".")) return prefix;
  }

  if (rootHostname && hostname.endsWith(`.${rootHostname}`)) {
    const prefix = hostname.slice(0, -(rootHostname.length + 1));
    if (prefix && !prefix.includes(".")) return prefix;
  }

  return null;
}

/**
 * Resolve which storefront (if any) a Host header maps to.
 */
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

  const subdomainSlug = extractStoreSlugFromHost(normalizedHost);
  if (subdomainSlug) {
    return {
      hostname,
      host: normalizedHost,
      storeSlug: subdomainSlug,
      source: "subdomain",
      isPlatformHost: false,
      isCustomDomain: false,
    };
  }

  if (isPlatformHost(normalizedHost)) {
    const defaultSlug = getDefaultTenantSlug();
    return {
      hostname,
      host: normalizedHost,
      storeSlug: defaultSlug,
      source: defaultSlug ? "default-tenant" : "platform",
      isPlatformHost: true,
      isCustomDomain: false,
    };
  }

  // Custom domain → hostname is the store lookup key
  return {
    hostname,
    host: normalizedHost,
    storeSlug: hostname || null,
    source: hostname ? "custom-domain" : "none",
    isPlatformHost: false,
    isCustomDomain: Boolean(hostname),
  };
}

/**
 * Host value to send as `x-forwarded-host` so the API can resolve the store.
 * On platform hosts with a default tenant, synthesize `{slug}.{rootHostname}`.
 */
export function getStorefrontForwardedHost(host?: string): string {
  const raw =
    host ??
    (typeof window !== "undefined" ? window.location.host : "");
  const resolution = resolveTenantFromHost(raw);

  if (
    resolution.source === "default-tenant" &&
    resolution.storeSlug
  ) {
    const { rootHostname } = readRootConfig();
    const apex = rootHostname && !isIpHostname(rootHostname) ? rootHostname : "localhost";
    return `${resolution.storeSlug}.${apex}`;
  }

  return raw;
}

/** Optional explicit store slug header for path-based /site/[tenant] browsing. */
export function getStoreSlugHeader(host?: string): string | null {
  const raw =
    host ??
    (typeof window !== "undefined" ? window.location.host : "");
  return resolveTenantFromHost(raw).storeSlug;
}

/**
 * Headers every storefront API client should attach.
 */
export function getStorefrontTenantHeaders(host?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "x-forwarded-host": getStorefrontForwardedHost(host),
  };
  const slug = getStoreSlugHeader(host);
  if (slug) headers["x-store-slug"] = slug;
  return headers;
}
