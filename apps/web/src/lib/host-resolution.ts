/**
 * Universal host classifier — no product/deployment domains in source.
 *
 * All environment-specific bases come from env:
 *   ROOT_DOMAIN / NEXT_PUBLIC_ROOT_DOMAIN
 *   PLATFORM_BASES / NEXT_PUBLIC_PLATFORM_BASES  (comma-separated wildcard bases)
 *
 * Structural detection only (safe in any deployment):
 *   - loopback / bare IP
 *   - `{slug}.{A}.{B}.{C}.{D}.{rest}` IP-encoded wildcard DNS (covers nip/sslip/etc without naming them)
 *   - `{slug}.{A}-{B}-{C}-{D}.{rest}` dashed IP form
 *   - `*.localhost` (RFC local multi-label convention)
 */

export type HostKind =
  | "platform" // SaaS landing / app apex — no storefront tenant
  | "tenant-subdomain" // first label is a store subdomain candidate
  | "custom-domain"; // full hostname → DB customDomain lookup

export type HostClassification = {
  hostname: string;
  host: string;
  kind: HostKind;
  /** Subdomain slug or full hostname for custom-domain */
  storeKey: string | null;
  isLoopback: boolean;
  isIp: boolean;
};

const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_RE = /^\[?[0-9a-f:]+\]?$/i;
const LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** Infrastructure labels that are never store tenants under a platform base. */
const RESERVED_LABELS = new Set([
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
  "workshops",
  "workspace",
  "dashboard",
  "store",
  "site",
  "login",
  "register",
  "signup",
  "pricing",
  "features",
  "solutions",
  "contact",
  "about",
  "terms",
  "privacy",
  "faq",
]);

export function stripPort(host: string): string {
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

export function isIpHostname(hostname: string): boolean {
  const host = stripPort(hostname);
  if (!host) return false;
  if (IPV4_RE.test(host)) return isIpv4Octets(host.split("."));
  return IPV6_RE.test(host) && host.includes(":");
}

/** Loopback / local resolver names — infrastructure, not product domains. */
export function isLoopbackHostname(hostname: string): boolean {
  const host = stripPort(hostname);
  if (!host) return false;
  if (host === "localhost" || host === "0.0.0.0" || host === "::1") return true;
  if (host === "127.0.0.1") return true;
  if (IPV4_RE.test(host)) {
    const [a] = host.split(".").map(Number);
    return a === 127;
  }
  return false;
}

export function normalizeLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const label = value.trim().toLowerCase();
  if (!label || !LABEL_RE.test(label)) return null;
  if (RESERVED_LABELS.has(label)) return null;
  return label;
}

function firstLabel(prefix: string): string | null {
  if (!prefix) return null;
  return normalizeLabel(prefix.split(".")[0] ?? "");
}

export type HostResolutionConfig = {
  /** e.g. example.com or localhost:3000 — value comes from env only */
  rootDomain: string;
  rootHostname: string;
  /** Extra wildcard bases from PLATFORM_BASES env (never hardcoded) */
  platformBases: string[];
};

export function readHostResolutionConfig(): HostResolutionConfig {
  const rawRootDomain = (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ??
    process.env.ROOT_DOMAIN ??
    (process.env.NODE_ENV === "production" ? "bornosoft.site" : "localhost:3000")
  )
    .trim()
    .toLowerCase();

  // Strip leading protocol and trailing slashes if passed in env
  const rootDomain = rawRootDomain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const colon = rootDomain.lastIndexOf(":");
  const hasPort = colon > 0 && /^\d+$/.test(rootDomain.slice(colon + 1));
  const rootHostname = hasPort ? rootDomain.slice(0, colon) : rootDomain;

  const basesRaw =
    process.env.NEXT_PUBLIC_PLATFORM_BASES ??
    process.env.PLATFORM_BASES ??
    process.env.NEXT_PUBLIC_PLATFORM_HOSTS ??
    process.env.PLATFORM_HOSTS ??
    "";

  const platformBases = basesRaw
    .split(",")
    .map((part) => stripPort(part.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "")))
    .filter(Boolean);

  return { rootDomain, rootHostname, platformBases };
}

/**
 * Detect `{slug?}[.]A.B.C.D.{suffix}` or `{slug?}[.]A-B-C-D.{suffix}` without
 * naming any particular wildcard DNS provider.
 */
function parseIpEncodedHost(hostname: string): {
  storeKey: string | null;
  isApex: boolean;
} | null {
  const parts = hostname.split(".").filter(Boolean);
  if (parts.length < 5) {
    // dashed form needs at least slug + ip + tld → 3 labels, or ip + tld → 2
  }

  // Dashed IPv4 anywhere before the public suffix: ….{a-b-c-d}.{rest}
  for (let i = 0; i < parts.length; i++) {
    const dashed = parts[i]?.match(/^(\d{1,3})-(\d{1,3})-(\d{1,3})-(\d{1,3})$/);
    if (!dashed) continue;
    const ipParts = [dashed[1], dashed[2], dashed[3], dashed[4]].filter(Boolean) as string[];
    if (!isIpv4Octets(ipParts)) continue;
    const prefixParts = parts.slice(0, i);
    if (prefixParts.length === 0) return { storeKey: null, isApex: true };
    return { storeKey: firstLabel(prefixParts.join(".")), isApex: false };
  }

  // Dotted IPv4 as four consecutive labels
  for (let i = 0; i <= parts.length - 4; i++) {
    const ipParts = parts.slice(i, i + 4);
    if (!isIpv4Octets(ipParts)) continue;
    // Require at least one label after the IP (the wildcard DNS suffix)
    if (i + 4 >= parts.length) continue;
    const prefixParts = parts.slice(0, i);
    if (prefixParts.length === 0) return { storeKey: null, isApex: true };
    return { storeKey: firstLabel(prefixParts.join(".")), isApex: false };
  }

  return null;
}

function matchesBase(hostname: string, base: string): "apex" | "subdomain" | null {
  if (!base) return null;
  if (hostname === base) return "apex";
  if (hostname.endsWith(`.${base}`)) return "subdomain";
  return null;
}

/**
 * Classify an incoming Host header into platform / tenant-subdomain / custom-domain.
 * Does not touch the database — callers resolve storeKey against MongoDB.
 */
export function classifyHost(
  host: string,
  config: HostResolutionConfig = readHostResolutionConfig(),
): HostClassification {
  const normalizedHost = host.trim().toLowerCase();
  const hostname = stripPort(normalizedHost);

  const base: HostClassification = {
    hostname,
    host: normalizedHost,
    kind: "platform",
    storeKey: null,
    isLoopback: isLoopbackHostname(hostname),
    isIp: isIpHostname(hostname),
  };

  if (!hostname) return base;

  if (base.isLoopback || base.isIp) {
    return { ...base, kind: "platform", storeKey: null };
  }

  const { rootDomain, rootHostname, platformBases } = config;
  const apexHostname = rootHostname.startsWith("www.")
    ? rootHostname.slice(4)
    : rootHostname;

  // Configured marketing / app apex (including www)
  if (apexHostname) {
    if (hostname === apexHostname || hostname === `www.${apexHostname}`) {
      return { ...base, kind: "platform", storeKey: null };
    }
    if (rootDomain && (normalizedHost === rootDomain || hostname === rootDomain)) {
      return { ...base, kind: "platform", storeKey: null };
    }
  }

  // Subdomain of configured ROOT_DOMAIN
  if (apexHostname && hostname.endsWith(`.${apexHostname}`)) {
    const prefix = hostname.slice(0, -(apexHostname.length + 1));
    const label = firstLabel(prefix);
    if (!label) return { ...base, kind: "platform", storeKey: null };
    return { ...base, kind: "tenant-subdomain", storeKey: label };
  }

  if (rootDomain && normalizedHost.endsWith(`.${rootDomain}`)) {
    const prefix = normalizedHost.slice(0, -(rootDomain.length + 1));
    const label = firstLabel(prefix);
    if (!label) return { ...base, kind: "platform", storeKey: null };
    return { ...base, kind: "tenant-subdomain", storeKey: label };
  }

  // Extra bases from PLATFORM_BASES env (IPs, elastic hostnames, temporary wildcards)
  for (const platformBase of platformBases) {
    const match = matchesBase(hostname, platformBase);
    if (match === "apex") return { ...base, kind: "platform", storeKey: null };
    if (match === "subdomain") {
      const prefix = hostname.slice(0, -(platformBase.length + 1));
      const label = firstLabel(prefix);
      if (!label) return { ...base, kind: "platform", storeKey: null };
      return { ...base, kind: "tenant-subdomain", storeKey: label };
    }
  }

  // Structural IP-encoded wildcard DNS (provider-agnostic)
  const ipEncoded = parseIpEncodedHost(hostname);
  if (ipEncoded) {
    if (ipEncoded.isApex || !ipEncoded.storeKey) {
      return { ...base, kind: "platform", storeKey: null };
    }
    return { ...base, kind: "tenant-subdomain", storeKey: ipEncoded.storeKey };
  }

  // Local multi-tenant convention: store.localhost
  if (hostname.endsWith(".localhost")) {
    const prefix = hostname.slice(0, -".localhost".length);
    const label = firstLabel(prefix);
    if (!label) return { ...base, kind: "platform", storeKey: null };
    return { ...base, kind: "tenant-subdomain", storeKey: label };
  }

  // Anything else is a customer custom domain → DB is source of truth
  return { ...base, kind: "custom-domain", storeKey: hostname };
}

export function getDefaultTenantSlug(): string | null {
  const value = (process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? process.env.DEFAULT_TENANT ?? "")
    .trim()
    .toLowerCase();
  return normalizeLabel(value);
}

/**
 * Resolve what storefront key (if any) middleware should rewrite to.
 * Platform marketing apex (ROOT / www.ROOT) → null (landing).
 * Optional DEFAULT_TENANT only on provisional platform hosts (loopback, IP, IP-encoded apex).
 */
export function resolveStoreKeyForRequest(host: string): {
  storeKey: string | null;
  classification: HostClassification;
  source: "subdomain" | "custom-domain" | "default-tenant" | "platform";
} {
  const config = readHostResolutionConfig();
  const classification = classifyHost(host, config);
  const { kind, storeKey, isLoopback, isIp, hostname } = classification;

  if (kind === "tenant-subdomain" && storeKey) {
    return { storeKey, classification, source: "subdomain" };
  }

  if (kind === "custom-domain" && storeKey) {
    return { storeKey, classification, source: "custom-domain" };
  }

  // Marketing apex must never be forced onto a default storefront
  const { rootHostname } = config;
  const apexHostname = rootHostname.startsWith("www.")
    ? rootHostname.slice(4)
    : rootHostname;
  const isMarketingApex =
    Boolean(apexHostname) &&
    (hostname === apexHostname || hostname === `www.${apexHostname}`);

  if (!isMarketingApex) {
    const fallback = getDefaultTenantSlug();
    // Provisional hosts: loopback, bare IP, or any other non-marketing platform apex
    // (includes IP-encoded wildcard DNS apexes without naming providers)
    if (fallback && (isLoopback || isIp || kind === "platform")) {
      return {
        storeKey: fallback,
        classification,
        source: "default-tenant",
      };
    }
  }

  return { storeKey: null, classification, source: "platform" };
}
