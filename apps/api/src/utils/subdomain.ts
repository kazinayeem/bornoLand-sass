import { serverConfig } from "../config/server.js";
import { getRootDomain, getDevRootDomains, isDevDomain } from "./domain.js";

export function getRootDomain(): string {
  return serverConfig.ROOT_DOMAIN;
}

export function isDevDomain(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  for (const dev of getDevRootDomains()) {
    if (lower === dev || lower.endsWith(`.${dev}`)) return true;
  }
  return false;
}

export function extractSubdomain(host: string): string | null {
  if (!host) return null;

  const hostname = host.split(":")[0].toLowerCase();

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") {
    return null;
  }

  for (const dev of getDevRootDomains()) {
    if (hostname.endsWith(`.${dev}`)) {
      const prefix = hostname.slice(0, -(dev.length + 1));
      if (prefix && !prefix.includes(".")) {
        return prefix;
      }
      return null;
    }
  }

  const rootDomain = getRootDomain();
  if (hostname.endsWith(`.${rootDomain}`)) {
    const prefix = hostname.slice(0, -(rootDomain.length + 1));
    if (prefix && !prefix.includes(".")) {
      return prefix;
    }
  }

  return null;
}

export function buildSubdomainUrl(slug: string, port = "3002"): string {
  const isDev = serverConfig.isDev;
  const rootDomain = getRootDomain();
  const protocol = isDev ? "http" : "https";
  const host = isDev ? `${slug}.localhost.com` : `${slug}.${rootDomain}`;
  const portPart = isDev && port ? `:${port}` : "";
  return `${protocol}://${host}${portPart}`;
}
