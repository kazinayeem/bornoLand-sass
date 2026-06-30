/** Storage limits per plan slug (MB). 0 + unlimited flag = unlimited where noted. */
export const DEFAULT_STORAGE_BY_PLAN_SLUG: Record<
  string,
  { storageLimitMB: number; maxFileSizeMB: number; unlimited?: boolean }
> = {
  free: { storageLimitMB: 500, maxFileSizeMB: 10 },
  starter: { storageLimitMB: 5 * 1024, maxFileSizeMB: 25 },
  business: { storageLimitMB: 20 * 1024, maxFileSizeMB: 50 },
  enterprise: { storageLimitMB: 100 * 1024, maxFileSizeMB: 100, unlimited: false },
};
