import {
  extractSubdomainFromHost,
  getBaseDomain,
  getRootDomain,
  isRootHost,
} from "@/lib/urls";

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

export function resolveTenantFromHost(host: string): TenantHostResolution {
  const hostname = stripPort(host);
  const rootDomain = getRootDomain().toLowerCase();
  const baseDomain = getBaseDomain();
  const subdomain = extractSubdomainFromHost(host);

  if (subdomain) {
    const isLocalhost = baseDomain === "localhost" || hostname.endsWith(".localhost");
    return {
      hostname,
      subdomain,
      rootDomain: rootDomain || baseDomain,
      isLocalhost,
      isCustomDomain: false,
    };
  }

  if (isRootHost(host)) {
    return {
      hostname,
      subdomain: null,
      rootDomain: rootDomain || baseDomain,
      isLocalhost: baseDomain === "localhost",
      isCustomDomain: false,
    };
  }

  return {
    hostname,
    subdomain: hostname || null,
    rootDomain: null,
    isLocalhost: baseDomain === "localhost",
    isCustomDomain: true,
  };
}

export function getCurrentStore(host: string) {
  return resolveTenantFromHost(host);
}
