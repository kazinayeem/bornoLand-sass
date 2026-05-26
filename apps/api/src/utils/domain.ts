import { serverConfig } from "../config/server.js";

const DEV_ROOT_DOMAINS = new Set([
  "localhost.com",
  "lvh.me",
  "localhost",
  "127.0.0.1",
]);

export function getRootDomain(): string {
  return serverConfig.ROOT_DOMAIN;
}

export function getProtocol(): string {
  return serverConfig.protocol;
}

export function isDevDomain(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  for (const dev of DEV_ROOT_DOMAINS) {
    if (lower === dev || lower.endsWith(`.${dev}`)) return true;
  }
  return false;
}

export function getStoreUrl(slug: string): string {
  const isDev = serverConfig.isDev;
  const rootDomain = getRootDomain();
  const protocol = getProtocol();
  const host = isDev ? `${slug}.localhost.com` : `${slug}.${rootDomain}`;
  const portPart = isDev ? `:${serverConfig.PORT}` : "";
  return `${protocol}://${host}${portPart}`;
}

export function getFrontendUrl(): string {
  return serverConfig.FRONTEND_URL;
}

export function getApiUrl(): string {
  return serverConfig.API_URL;
}

export function getDevRootDomains(): Set<string> {
  return DEV_ROOT_DOMAINS;
}
