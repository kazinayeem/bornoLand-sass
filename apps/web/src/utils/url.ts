import { config } from "@/lib/config";

function joinUrl(base: string, path = ""): string {
  if (!path) return base.replace(/\/$/, "");
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function getRootDomain(): string {
  return config.rootDomain;
}

export function getProtocol(): string {
  return config.protocol;
}

export function getApiUrl(path = ""): string {
  return joinUrl(config.apiUrl, path);
}

export function getAssetUrl(path = ""): string {
  return joinUrl(config.assetUrl, path);
}

export function getAppUrl(path = ""): string {
  return joinUrl(config.appUrl, path);
}

export function getSocketUrl(path = ""): string {
  return joinUrl(config.socketUrl, path);
}

export function getStoreUrl(subdomain?: string | null): string {
  if (!subdomain) return config.appUrl;
  const protocol = getProtocol();
  const rootDomain = getRootDomain();
  const host = `${subdomain}.${rootDomain}`;
  const portPart = config.isDev ? `:${config.appPort}` : "";
  return `${protocol}://${host}${portPart}`;
}

export function getStoreDisplayDomain(subdomain?: string | null, slug?: string | null): string {
  const key = subdomain || slug || "store";
  return `${key}.${getRootDomain()}`;
}
