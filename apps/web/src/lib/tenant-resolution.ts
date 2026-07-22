/**
 * Single source of truth for storefront tenant / store resolution from a Host header.
 *
 * Priority:
 * 1. Subdomain of ROOT_DOMAIN / *.localhost / *.nip.io / *.sslip.io → first label as store slug
 * 2. Platform host (localhost, loopback, bare IP, IP.*.nip.io/sslip.io apex, PLATFORM_HOSTS, ROOT_DOMAIN)
 *    → NEXT_PUBLIC_DEFAULT_TENANT when set, otherwise no storefront tenant
 * 3. Anything else → custom domain (hostname is the lookup key)
 *
 * Examples:
 *   nayeem.13.201.93.77.nip.io  → storeSlug = "nayeem"
 *   demo.13.201.93.77.sslip.io   → storeSlug = "demo"
 *   store1.bornoland.com         → storeSlug = "store1" (when ROOT_DOMAIN=bornoland.com)
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

function normalizeStoreSlug(value: string | null | undefined): string | null {
  if (!value) return null;
  const slug = value.trim().toLowerCase();
  if (!slug || !STORE_SLUG_RE.test(slug)) return null;
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
 * Parse nip.io / sslip.io hosts.
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

  // Dashed IPv4 form used by sslip.io: [slug.]a-b-c-d
  const dashed = base.match(/^(?:(.+)\.)?(\d{1,3}-\d{1,3}-\d{1,3}-\d{1,3})$/);
  if (dashed) {
    const ipParts = (dashed[2] ?? "").split("-");
    if (!isIpv4Octets(ipParts)) return null;
    const prefix = dashed[1] ?? "";
    if (!prefix) return { storeSlug: null, isApex: true };
    return { storeSlug: firstLabel(prefix), isApex: false };
  }

  // Dotted IPv4 form: [slug.]a.b.c.d
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
 * Platform apex hosts must never be treated as tenant custom domains.
 * Includes loopback, bare IPs, IP.*.nip.io / *.sslip.io apex, PLATFORM_HOSTS, and ROOT_DOMAIN.
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

  const wildcard = parseDevWildcardDns(hostname);
  if (wildcard?.isApex) return true;

  const configured = getConfiguredPlatformHosts();
  if (configured.includes(hostname)) return true;

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
 */
export function extractStoreSlugFromHost(host: string): string | null {
  const lowerHost = host.trim().toLowerCase();
  if (!lowerHost) return null;

  const { rootDomain, rootHostname } = readRootConfig();
  const hostname = stripPort(lowerHost);

  // Bare platform apex — no tenant in the hostname
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    isIpHostname(hostname)
  ) {
    return null;
  }

  // *.nip.io / *.sslip.io (including multi-label IP bases)
  const wildcard = parseDevWildcardDns(hostname);
  if (wildcard) {
    return wildcard.isApex ? null : wildcard.storeSlug;
  }

  // Exact ROOT_DOMAIN apex
  if (rootDomain && (lowerHost === rootDomain || hostname === rootHostname)) {
    return null;
  }

  // {slug}.….{ROOT_DOMAIN}  → first label only
  if (rootDomain && lowerHost.endsWith(`.${rootDomain}`)) {
    const prefix = lowerHost.slice(0, -(rootDomain.length + 1));
    return firstLabel(prefix);
  }

  // {slug}.localhost
  if (hostname.endsWith(".localhost")) {
    const prefix = hostname.slice(0, -".localhost".length);
    return firstLabel(prefix);
  }

  // {slug}.….{rootHostname} when ROOT_DOMAIN includes a port (e.g. localhost:3000)
  if (rootHostname && hostname !== rootHostname && hostname.endsWith(`.${rootHostname}`)) {
    const prefix = hostname.slice(0, -(rootHostname.length + 1));
    return firstLabel(prefix);
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
