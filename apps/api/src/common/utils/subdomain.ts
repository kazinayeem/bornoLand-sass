/**
 * Subdomain utility functions for multi-tenant routing.
 * Driven by ROOT_DOMAIN environment variable (e.g. `localhost:3000` or `bornosoft.site`).
 */

function parseRootDomain(rootDomain: string) {
  const trimmed = rootDomain.trim().toLowerCase();
  const colonIndex = trimmed.lastIndexOf(":");
  const hasPort = colonIndex > 0 && /^\d+$/.test(trimmed.slice(colonIndex + 1));
  if (hasPort) {
    return {
      rootDomain: trimmed,
      rootHostname: trimmed.slice(0, colonIndex),
    };
  }
  return { rootDomain: trimmed, rootHostname: trimmed };
}

const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;

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

function isIpHostname(hostname: string): boolean {
  if (!hostname) return false;
  if (IPV4_RE.test(hostname)) {
    return hostname.split(".").every((octet) => {
      const n = Number(octet);
      return Number.isInteger(n) && n >= 0 && n <= 255;
    });
  }
  return hostname.includes(":") && /^[0-9a-f:]+$/i.test(hostname);
}

function getConfiguredPlatformHosts(): string[] {
  const raw = process.env.PLATFORM_HOSTS ?? process.env.NEXT_PUBLIC_PLATFORM_HOSTS ?? "";
  return raw
    .split(",")
    .map((part) => stripPort(part))
    .filter(Boolean);
}

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

function firstLabel(prefix: string): string | null {
  if (!prefix) return null;
  return normalizeStoreSlug(prefix.split(".")[0] ?? "");
}

/** Parse nip.io / sslip.io — apex has no tenant; otherwise first label is the slug. */
function parseDevWildcardDns(hostname: string): { storeSlug: string | null; isApex: boolean } | null {
  let base: string | null = null;
  if (hostname.endsWith(".nip.io")) base = hostname.slice(0, -".nip.io".length);
  else if (hostname.endsWith(".sslip.io")) base = hostname.slice(0, -".sslip.io".length);
  else return null;
  if (!base) return { storeSlug: null, isApex: true };

  const dashed = base.match(/^(?:(.+)\.)?(\d{1,3}-\d{1,3}-\d{1,3}-\d{1,3})$/);
  if (dashed) {
    if (!isIpv4Octets((dashed[2] ?? "").split("-"))) return null;
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

function isPlatformHost(host: string): boolean {
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

  const rootDomain = getRootDomain();
  const { rootHostname } = parseRootDomain(rootDomain);
  const lowerHost = host.trim().toLowerCase();
  if (rootDomain && (lowerHost === rootDomain || hostname === rootHostname)) {
    return true;
  }
  // www.{ROOT} is marketing apex, not a tenant
  if (rootHostname && hostname === `www.${rootHostname}`) {
    return true;
  }
  return false;
}

export function getRootDomain(): string {
  return process.env.ROOT_DOMAIN ?? process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";
}

export function normalizeStoreSlug(value: string | undefined | null): string | null {
  if (!value || typeof value !== "string") return null;
  const slug = value.trim().toLowerCase();
  if (!slug) return null;
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)) return null;
  if (RESERVED_SUBDOMAINS.has(slug)) return null;
  return slug;
}
export function extractSubdomain(host: string): string | null {
  if (!host) return null;

  const lowerHost = host.trim().toLowerCase();
  const hostname = stripPort(lowerHost);

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    isIpHostname(hostname)
  ) {
    return null;
  }

  const wildcard = parseDevWildcardDns(hostname);
  if (wildcard) return wildcard.isApex ? null : wildcard.storeSlug;

  if (isPlatformHost(lowerHost)) return null;

  const rootDomain = getRootDomain();
  const { rootHostname } = parseRootDomain(rootDomain);

  if (rootDomain && (lowerHost === rootDomain || hostname === rootHostname)) {
    return null;
  }

  if (rootDomain && lowerHost.endsWith(`.${rootDomain}`)) {
    return firstLabel(lowerHost.slice(0, -(rootDomain.length + 1)));
  }

  if (hostname.endsWith(".localhost")) {
    return firstLabel(hostname.slice(0, -".localhost".length));
  }

  if (rootHostname && hostname !== rootHostname && hostname.endsWith(`.${rootHostname}`)) {
    return firstLabel(hostname.slice(0, -(rootHostname.length + 1)));
  }

  return null;
}

export function buildSubdomainUrl(slug: string): string {
  const rootDomain = getRootDomain();
  const protocol = process.env.NEXT_PUBLIC_PROTOCOL ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  if (!rootDomain) return "";
  return `${protocol}://${slug}.${rootDomain}`;
}
