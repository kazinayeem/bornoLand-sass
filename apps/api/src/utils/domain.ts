import { serverConfig } from "../config/server.js";

export function getRootDomain(): string {
  return serverConfig.ROOT_DOMAIN;
}

export function getProtocol(): string {
  return serverConfig.PROTOCOL;
}

export function getStoreUrl(slug: string): string {
  const rootDomain = getRootDomain();
  const protocol = getProtocol();
  const host = `${slug}.${rootDomain}`;
  const portPart = serverConfig.isDev ? `:${serverConfig.PORT}` : "";
  return `${protocol}://${host}${portPart}`;
}

export function getFrontendUrl(): string {
  return serverConfig.FRONTEND_URL;
}

export function getApiUrl(): string {
  return serverConfig.API_URL;
}

export function getAssetUrl(path = ""): string {
  return `${serverConfig.APP_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`.replace(/\/$/, "");
}
