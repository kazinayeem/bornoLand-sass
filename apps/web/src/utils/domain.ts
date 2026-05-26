import { config } from "@/lib/config";

export function getRootDomain(): string {
  return config.rootDomain;
}

export function getProtocol(): string {
  return config.protocol;
}

export function getAppPort(): string {
  return config.appPort;
}

export function getApiPort(): string {
  return config.apiPort;
}

export function isDev(): boolean {
  return config.isDev;
}

export function getStoreUrl(subdomain?: string | null): string {
  if (!subdomain) return config.appUrl;
  const protocol = getProtocol();
  const rootDomain = getRootDomain();
  if (isDev()) {
    return `${protocol}://${subdomain}.localhost:${getAppPort()}`;
  }
  return `${protocol}://${subdomain}.${rootDomain}`;
}

export function getApiUrl(): string {
  return config.apiUrl;
}

export function getAssetUrl(): string {
  return config.assetUrl;
}

export function getAppUrl(): string {
  return config.appUrl;
}

export function getSocketUrl(): string {
  return config.socketUrl;
}

export function getStoreDisplayDomain(subdomain?: string | null, slug?: string | null): string {
  const key = subdomain || slug || "store";
  const rootDomain = getRootDomain();
  if (isDev()) {
    return `${key}.localhost:${getAppPort()}`;
  }
  return `${key}.${rootDomain}`;
}
