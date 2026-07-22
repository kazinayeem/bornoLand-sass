import {
  getRootDomain,
  getBaseDomain,
} from "@/lib/urls";
import { resolveTenantFromHost as resolveTenantHost } from "@/lib/tenant-resolution";

export type TenantHostResolution = {
  hostname: string;
  subdomain: string | null;
  rootDomain: string | null;
  isLocalhost: boolean;
  isCustomDomain: boolean;
};

export function resolveTenantFromHost(host: string): TenantHostResolution {
  const resolved = resolveTenantHost(host);
  const rootDomain = getRootDomain().toLowerCase();
  const baseDomain = getBaseDomain();

  return {
    hostname: resolved.hostname,
    subdomain: resolved.storeSlug,
    rootDomain: resolved.isCustomDomain ? null : rootDomain || baseDomain,
    isLocalhost: baseDomain === "localhost" || resolved.hostname.endsWith(".localhost"),
    isCustomDomain: resolved.isCustomDomain,
  };
}

export function getCurrentStore(host: string) {
  return resolveTenantFromHost(host);
}
