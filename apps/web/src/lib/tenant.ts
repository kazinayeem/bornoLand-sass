import {
  getDefaultTenantSlug,
  resolveTenantFromHost as resolveTenantHost,
  type TenantHostSource,
} from "@/lib/tenant-resolution";

export type TenantResolution = {
  tenantId: string | null;
  tenantSlug: string | null;
  source: TenantHostSource;
};

export function resolveTenantFromHost(hostname: string, sessionTenantId?: string): TenantResolution {
  const resolved = resolveTenantHost(hostname, sessionTenantId);
  return {
    tenantId: sessionTenantId ?? null,
    tenantSlug: resolved.storeSlug,
    source: resolved.source,
  };
}

export { getDefaultTenantSlug };
