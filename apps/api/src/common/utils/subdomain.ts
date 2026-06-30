/**
 * Subdomain utility functions for multi-tenant routing.
 *
 * Supports local development via:
 *   - *.localhost.com    (requires /etc/hosts entries)
 *   - *.lvh.me           (zero-config, resolves to 127.0.0.1)
 *   - *.localhost        (requires /etc/hosts entries)
 *
 * Production:
 *   - *.bornoland.com
 */

const DEV_ROOT_DOMAINS = new Set([
  "localhost.com",
  "lvh.me",
  "localhost",
  "127.0.0.1",
]);

export function getRootDomain(): string {
  return process.env.ROOT_DOMAIN ?? "bornoland.com";
}

/**
 * Returns whether a hostname is a known development root domain.
 */
export function isDevDomain(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  for (const dev of DEV_ROOT_DOMAINS) {
    if (lower === dev || lower.endsWith(`.${dev}`)) return true;
  }
  return false;
}

/**
 * Extracts the subdomain slug from a host header value.
 *
 * Examples:
 *   "test.localhost.com:3002"  → "test"
 *   "demo.lvh.me"              → "demo"
 *   "test.bornoland.com"       → "test"
 *   "localhost.com"            → null
 *   "app.localhost.com"        → "app"
 */
export function extractSubdomain(host: string): string | null {
  if (!host) return null;

  const hostname = host.split(":")[0].toLowerCase();

  // Special case: bare localhost / 127.0.0.1 — no subdomain
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") {
    return null;
  }

  // Try known dev domains first
  for (const dev of DEV_ROOT_DOMAINS) {
    if (hostname.endsWith(`.${dev}`)) {
      const prefix = hostname.slice(0, -(dev.length + 1));
      // Only return a non-empty prefix that doesn't contain dots
      if (prefix && !prefix.includes(".")) {
        return prefix;
      }
      return null;
    }
  }

  // Production: try ROOT_DOMAIN
  const rootDomain = getRootDomain();
  if (hostname.endsWith(`.${rootDomain}`)) {
    const prefix = hostname.slice(0, -(rootDomain.length + 1));
    if (prefix && !prefix.includes(".")) {
      return prefix;
    }
  }

  return null;
}

/**
 * Builds a full subdomain URL for a given slug.
 *
 * In development:  "http://{slug}.localhost.com:3002"
 * In production:   "https://{slug}.bornoland.com"
 */
export function buildSubdomainUrl(slug: string, port = "3002"): string {
  const isDev = process.env.NODE_ENV === "development";
  const rootDomain = getRootDomain();
  const protocol = isDev ? "http" : "https";
  const host = isDev ? `${slug}.localhost.com` : `${slug}.${rootDomain}`;
  const portPart = isDev && port ? `:${port}` : "";
  return `${protocol}://${host}${portPart}`;
}
