/**
 * Single source of truth for storefront tenant / store resolution from a Host header.
 *
 * Priority:
 * 1. Subdomain of ROOT_DOMAIN / *.localhost / *.nip.io / *.sslip.io → first label as store slug
 *    (reserved labels like "www" are never tenants)
 * 2. Marketing apex (ROOT_DOMAIN, www.ROOT_DOMAIN, APP_URL host) → SaaS landing (no storefront)
 * 3. Dev platform (localhost, bare IP, nip/sslip apex, PLATFORM_HOSTS)
 *    → NEXT_PUBLIC_DEFAULT_TENANT when set, otherwise landing
 * 4. Anything else → custom domain (hostname is the lookup key)
 *
 * Examples:
 *   bornosoft.site                 → platform (landing)
 *   www.bornosoft.site             → platform (landing)
 *   nayeem.bornosoft.site          → storeSlug = "nayeem"
 *   nayeem.13.201.93.77.nip.io     → storeSlug = "nayeem"
 *   shop.localhost                 → storeSlug = "shop"
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
const STORE_SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** Labels that must never be treated as store tenants under ROOT_DOMAIN. */
const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "admin",
  "app",
  "cdn",
  "static",
  "assets",
  "mail",
  "ftp",
  "m",
  "mobile",
  "status",
  "docs",
]);

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

function hostnameFromUrl(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return stripPort(new URL(withProtocol).host);
  } catch {
    return stripPort(value);
  }
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

/**
 * Hostnames that serve the SaaS marketing/app apex (landing, /login, /dashboard).
 * Derived from ROOT_DOMAIN plus APP_URL / WEB_URL so a mis-synced ROOT_DOMAIN
 * still treats the public site host as platform (not a custom-domain tenant).
 */
function getMarketingApexHostnames(): string[] {
  const hosts = new Set<string>();
  const { rootHostname } = readRootConfig();
  if (rootHostname && !isIpHostname(rootHostname)) {
    hosts.add(rootHostname);
    hosts.add(`www.${rootHostname}`);
  }

  for (const envKey of [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_URL,
    process.env.WEB_URL,
    process.env.NEXT_PUBLIC_WEB_URL,
  ]) {
    const host = hostnameFromUrl(envKey);
    if (!host || isIpHostname(host)) continue;
    hosts.add(host);
    if (!host.startsWith("www.")) hosts.add(`www.${host}`);
    if (host.startsWith("www.")) hosts.add(host.slice(4));
  }

  return [...hosts];
}

function normalizeStoreSlug(value: string | null | undefined): string | null {
  if (!value) return null;
  const slug = value.trim().toLowerCase();
  if (!slug || !STORE_SLUG_RE.test(slug)) return null;
  if (RESERVED_SUBDOMAINS.has(slug)) return null;
  return slug;
}

/** First DNS label only — never return multi-label prefixes as the tenant slug. */
function firstLabel(prefix: string): string | null {
  if (!prefix) return null;
  const label = prefix.split(".")[0] ?? "";
  return normalizeStoreSlug(label);
}

function isIpv4Octets(parts: string[]): boolean {
  return (
    parts.length === 4 &&
    parts.every((octet) => {
      if (!/^\d{1,3}$/.test(octet)) return false;
      const n = Number(octet);
      return Number.isInteger(n) && n >= 0 && n <= 255;
    })
  );
}

/**
 * Parse nip.io / sslip.io hosts (EC2 / no-DNS testing).
 * Apex (platform):  13.201.93.77.nip.io  |  13-201-93-77.sslip.io
 * Tenant:           nayeem.13.201.93.77.nip.io  |  demo.13-201-93-77.sslip.io
 */
function parseDevWildcardDns(hostname: string): {
  storeSlug: string | null;
  isApex: boolean;
} | null {
  let base: string | null = null;
  if (hostname.endsWith(".nip.io")) {
    base = hostname.slice(0, -".nip.io".length);
  } else if (hostname.endsWith(".sslip.io")) {
    base = hostname.slice(0, -".sslip.io".length);
  }
  if (base === null) return null;
  if (!base) return { storeSlug: null, isApex: true };

  const dashed = base.match(/^(?:(.+)\.)?(\d{1,3}-\d{1,3}-\d{1,3}-\d{1,3})$/);
  if (dashed) {
    const ipParts = (dashed[2] ?? "").split("-");
    if (!isIpv4Octets(ipParts)) return null;
    const prefix = dashed[1] ?? "";
    if (!prefix) return { storeSlug: null, isApex: true };
    return { storeSlug: firstLabel(prefix), isApex: false };
  }

  const parts = base.split(".").filter(Boolean);
  if (parts.length < 4) return null;

  const ipParts = parts.slice(-4);
  if (!isIpv4Octets(ipParts)) return null;

  const prefixParts = parts.slice(0, -4);
  if (prefixParts.length === 0) return { storeSlug: null, isApex: true };
  return { storeSlug: firstLabel(prefixParts.join(".")), isApex: false };
}

/** Configurable default storefront slug — never hardcode a store name. */
export function getDefaultTenantSlug(): string | null {
  const value = (process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? process.env.DEFAULT_TENANT ?? "")
    .trim()
    .toLowerCase();
  return normalizeStoreSlug(value);
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
 * Marketing / SaaS apex — must show the landing page, never rewrite to /site/{slug}.
 * Includes bornosoft.site, www.bornosoft.site, and hosts from APP_URL / WEB_URL.
 */
export function isMarketingApexHost(host: string): boolean {
  const hostname = stripPort(host);
  if (!hostname) return false;
  return getMarketingApexHostnames().includes(hostname);
}

/**
 * Dev / provisional platform hosts (no real marketing domain in play).
 * DEFAULT_TENANT may apply here; it must NOT apply on marketing apex.
 */
export function isDevPlatformHost(host: string): boolean {
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

  const wildcard = parseDevWildcardDns(hostname);
  if (wildcard?.isApex) return true;

  if (getConfiguredPlatformHosts().includes(hostname)) return true;

  // ROOT_DOMAIN like localhost:3000 — apex is a local platform host
  const { rootHostname } = readRootConfig();
  if (rootHostname === "localhost" || rootHostname === "127.0.0.1") {
    if (hostname === rootHostname) return true;
  }

  return false;
}

/**
 * Platform apex hosts must never be treated as tenant custom domains.
 */
export function isPlatformHost(host: string): boolean {
  if (isMarketingApexHost(host)) return true;
  if (isDevPlatformHost(host)) return true;

  const hostname = stripPort(host);
  const { rootDomain, rootHostname } = readRootConfig();
  const lowerHost = host.trim().toLowerCase();
  if (rootDomain && (lowerHost === rootDomain || hostname === rootHostname)) {
    return true;
  }

  return false;
}

/**
 * Extract store slug from a subdomain host.
 * Always returns only the first DNS label (never multi-label prefixes).
 * Reserved labels (www, api, …) return null so callers treat the host as platform.
 */
export function extractStoreSlugFromHost(host: string): string | null {
  const lowerHost = host.trim().toLowerCase();
  if (!lowerHost) return null;

  const { rootDomain, rootHostname } = readRootConfig();
  const hostname = stripPort(lowerHost);

  // Bare platform / marketing apex — no tenant in the hostname
  if (isMarketingApexHost(hostname) || isDevPlatformHost(hostname)) {
    return null;
  }

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    isIpHostname(hostname)
  ) {
    return null;
  }

  // *.nip.io / *.sslip.io
  const wildcard = parseDevWildcardDns(hostname);
  if (wildcard) {
    return wildcard.isApex ? null : wildcard.storeSlug;
  }

  // Exact ROOT_DOMAIN apex
  if (rootDomain && (lowerHost === rootDomain || hostname === rootHostname)) {
    return null;
  }

  // {slug}.….{ROOT_DOMAIN}  → first label only (www → null via reserved list)
  if (rootDomain && lowerHost.endsWith(`.${rootDomain}`)) {
    const prefix = lowerHost.slice(0, -(rootDomain.length + 1));
    return firstLabel(prefix);
  }

  // {slug}.localhost
  if (hostname.endsWith(".localhost")) {
    const prefix = hostname.slice(0, -".localhost".length);
    return firstLabel(prefix);
  }

  // {slug}.….{rootHostname} when ROOT_DOMAIN includes a port
  if (rootHostname && hostname !== rootHostname && hostname.endsWith(`.${rootHostname}`)) {
    const prefix = hostname.slice(0, -(rootHostname.length + 1));
    return firstLabel(prefix);
  }

  // Fallback: derive from APP_URL / WEB_URL apex when ROOT_DOMAIN was not baked
  // into the client bundle (common after switching from nip.io → real domain).
  for (const apex of getMarketingApexHostnames()) {
    if (!apex || apex.startsWith("www.") || apex === "localhost") continue;
    if (hostname === apex || hostname === `www.${apex}`) continue;
    if (hostname.endsWith(`.${apex}`)) {
      return firstLabel(hostname.slice(0, -(apex.length + 1)));
    }
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

  // Marketing apex (bornosoft.site / www) → always landing, never DEFAULT_TENANT rewrite
  if (isMarketingApexHost(normalizedHost)) {
    return {
      hostname,
      host: normalizedHost,
      storeSlug: null,
      source: "platform",
      isPlatformHost: true,
      isCustomDomain: false,
    };
  }

  // Dev platform (IP / localhost / nip apex) → optional DEFAULT_TENANT
  if (isDevPlatformHost(normalizedHost) || isPlatformHost(normalizedHost)) {
    const defaultSlug = getDefaultTenantSlug();
    // Only apply default tenant on true dev/provisional hosts, not marketing apex
    const useDefault = Boolean(defaultSlug) && isDevPlatformHost(normalizedHost);
    return {
      hostname,
      host: normalizedHost,
      storeSlug: useDefault ? defaultSlug : null,
      source: useDefault ? "default-tenant" : "platform",
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

  if (resolution.source === "default-tenant" && resolution.storeSlug) {
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
