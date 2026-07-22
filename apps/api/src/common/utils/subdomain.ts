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
  if (getConfiguredPlatformHosts().includes(hostname)) return true;

  const rootDomain = getRootDomain();
  const { rootHostname } = parseRootDomain(rootDomain);
  const lowerHost = host.trim().toLowerCase();
  if (rootDomain && (lowerHost === rootDomain || hostname === rootHostname)) {
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
  return slug;
}

export function extractSubdomain(host: string): string | null {
  if (!host) return null;

  const lowerHost = host.trim().toLowerCase();
  if (isPlatformHost(lowerHost)) return null;

  const rootDomain = getRootDomain();
  const { rootHostname } = parseRootDomain(rootDomain);

  if (rootDomain && (lowerHost === rootDomain || lowerHost.split(":")[0] === rootHostname)) {
    return null;
  }

  if (rootDomain && lowerHost.endsWith(`.${rootDomain}`)) {
    const prefix = lowerHost.slice(0, -(rootDomain.length + 1));
    if (prefix && !prefix.includes(".")) return prefix;
    return null;
  }

  const hostname = stripPort(lowerHost);
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

export function buildSubdomainUrl(slug: string): string {
  const rootDomain = getRootDomain();
  const protocol = process.env.NEXT_PUBLIC_PROTOCOL ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  if (!rootDomain) return "";
  return `${protocol}://${slug}.${rootDomain}`;
}
