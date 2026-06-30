import { extractSubdomainFromHost, getBaseDomain, isRootHost } from "@/lib/urls";

export type TenantResolution = {
  tenantId: string | null;
  tenantSlug: string | null;
  source: "subdomain" | "custom-domain" | "session" | "none";
};

export function resolveTenantFromHost(hostname: string, sessionTenantId?: string): TenantResolution {
  if (sessionTenantId) {
    return { tenantId: sessionTenantId, tenantSlug: null, source: "session" };
  }

  const host = hostname.includes(":") ? hostname : hostname;
  if (isRootHost(host)) {
    return { tenantId: null, tenantSlug: null, source: "none" };
  }

  const tenantSlug = extractSubdomainFromHost(host);
  if (tenantSlug) {
    return { tenantId: null, tenantSlug, source: "subdomain" };
  }

  const baseDomain = getBaseDomain();
  if (hostname === baseDomain) {
    return { tenantId: null, tenantSlug: null, source: "none" };
  }

  return { tenantId: null, tenantSlug: hostname, source: "custom-domain" };
}
