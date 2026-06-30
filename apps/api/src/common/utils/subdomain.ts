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

export function getRootDomain(): string {
  return process.env.ROOT_DOMAIN ?? process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";
}

export function extractSubdomain(host: string): string | null {
  if (!host) return null;

  const lowerHost = host.trim().toLowerCase();
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

  const hostname = lowerHost.split(":")[0] ?? lowerHost;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") {
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
