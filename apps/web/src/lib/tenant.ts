import { config } from "@/lib/config";

export type TenantResolution = {
  tenantId: string | null;
  tenantSlug: string | null;
  source: "subdomain" | "custom-domain" | "session" | "none";
};

export function resolveTenantFromHost(hostname: string, sessionTenantId?: string): TenantResolution {
  const rootDomain = config.rootDomain;

  if (sessionTenantId) {
    return { tenantId: sessionTenantId, tenantSlug: null, source: "session" };
  }

  if (hostname === rootDomain) {
    return { tenantId: null, tenantSlug: null, source: "none" };
  }

  if (hostname.endsWith(`.${rootDomain}`)) {
    const tenantSlug = hostname.replace(`.${rootDomain}`, "").split(".")[0] ?? null;
    return { tenantId: null, tenantSlug, source: "subdomain" };
  }

  return { tenantId: null, tenantSlug: hostname, source: "custom-domain" };
}
