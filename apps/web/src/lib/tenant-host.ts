import { config } from "@/lib/config";

export type TenantHostResolution = {
  hostname: string;
  subdomain: string | null;
  rootDomain: string | null;
  isLocalhost: boolean;
  isCustomDomain: boolean;
};

function stripPort(host: string): string {
  return host.split(":")[0]?.toLowerCase() ?? "";
}

function isLocalhostHost(hostname: string): boolean {
  return hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".localhost.com") || hostname === "127.0.0.1";
}

export function resolveTenantFromHost(host: string): TenantHostResolution {
  const hostname = stripPort(host);
  const rootDomain = config.rootDomain.toLowerCase();

  const localhostMatch = hostname.match(/^(?<subdomain>[a-z0-9-]+)\.(localhost(?:\.com)?|127\.0\.0\.1)$/i);
  if (localhostMatch?.groups?.subdomain) {
    return {
      hostname,
      subdomain: localhostMatch.groups.subdomain.toLowerCase(),
      rootDomain: localhostMatch[2].toLowerCase(),
      isLocalhost: true,
      isCustomDomain: false,
    };
  }

  if (hostname === rootDomain) {
    return { hostname, subdomain: null, rootDomain, isLocalhost: false, isCustomDomain: false };
  }

  if (hostname.endsWith(`.${rootDomain}`)) {
    const prefix = hostname.slice(0, -(rootDomain.length + 1));
    if (prefix && !prefix.includes(".")) {
      return { hostname, subdomain: prefix, rootDomain, isLocalhost: false, isCustomDomain: false };
    }
  }

  return {
    hostname,
    subdomain: hostname || null,
    rootDomain: null,
    isLocalhost: isLocalhostHost(hostname),
    isCustomDomain: true,
  };
}

export function getCurrentStore(host: string) {
  return resolveTenantFromHost(host);
}
