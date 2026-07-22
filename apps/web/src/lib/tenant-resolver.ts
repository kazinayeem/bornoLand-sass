import {
  resolveTenantFromHost,
  type TenantHostSource,
} from "@/lib/tenant-resolution";

export type TenantResolution = {
  tenantKey: string | null;
  source: TenantHostSource;
};

export function resolveTenant(hostname: string, sessionTenantId?: string): TenantResolution {
  const resolved = resolveTenantFromHost(hostname, sessionTenantId);
  return {
    tenantKey: sessionTenantId ?? resolved.storeSlug,
    source: resolved.source,
  };
}
