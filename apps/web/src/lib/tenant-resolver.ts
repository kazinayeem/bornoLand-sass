import { extractSubdomainFromHost, getBaseDomain, isRootHost } from "@/lib/urls";

export type TenantResolution = {
  tenantKey: string | null;
  source: "subdomain" | "custom-domain" | "session" | "none";
};

export function resolveTenant(hostname: string, sessionTenantId?: string): TenantResolution {
  if (sessionTenantId) {
    return {
      tenantKey: sessionTenantId,
      source: "session",
    };
  }

  if (isRootHost(hostname)) {
    return {
      tenantKey: null,
      source: "none",
    };
  }

  const tenantKey = extractSubdomainFromHost(hostname);
  if (tenantKey) {
    return {
      tenantKey,
      source: "subdomain",
    };
  }

  if (hostname === getBaseDomain()) {
    return {
      tenantKey: null,
      source: "none",
    };
  }

  return {
    tenantKey: hostname,
    source: "custom-domain",
  };
}
