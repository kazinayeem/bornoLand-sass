import { serverConfig } from "../config/server.js";
import { getRootDomain } from "./domain.js";

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

  const rootDomain = getRootDomain();
  if (hostname.endsWith(`.${rootDomain}`)) {
    const prefix = hostname.slice(0, -(rootDomain.length + 1));
    if (prefix && !prefix.includes(".")) {
      return prefix;
    }
  }

  return null;
}

export function buildSubdomainUrl(slug: string, port?: string): string {
  const rootDomain = getRootDomain();
  const protocol = serverConfig.PROTOCOL;
  const host = `${slug}.${rootDomain}`;
  const portPart = serverConfig.isDev && port ? `:${port}` : serverConfig.isDev ? `:${serverConfig.PORT}` : "";
  return `${protocol}://${host}${portPart}`;
}
