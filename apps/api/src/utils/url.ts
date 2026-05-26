import { serverConfig } from "../config/server.js";

function joinUrl(base: string, path = ""): string {
  if (!path) return base.replace(/\/$/, "");
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function getRootDomain(): string {
  return serverConfig.ROOT_DOMAIN;
}

export function getProtocol(): string {
  return serverConfig.PROTOCOL;
}

export function getAppUrl(path = ""): string {
  return joinUrl(serverConfig.APP_URL, path);
}

export function getApiUrl(path = ""): string {
  return joinUrl(serverConfig.API_URL, path);
}

export function getAssetUrl(path = ""): string {
  return joinUrl(serverConfig.APP_URL, path);
}

export function getStoreUrl(slug: string): string {
  const protocol = getProtocol();
  const host = `${slug}.${getRootDomain()}`;
  const portPart = serverConfig.isDev ? `:${serverConfig.PORT}` : "";
  return `${protocol}://${host}${portPart}`;
}
