export {
  getAppEnv,
  getProtocol,
  getRootDomain,
  getBaseDomain,
  getAppOrigin,
  getStoreHost,
  getStoreDisplayDomain,
  getStoreUrl,
  getStoreUrlFromRecord,
  getAdminUrl,
  getWorkspaceUrl,
  getApiUrl,
  getTenantCanonicalUrl,
  extractSubdomainFromHost,
  isRootHost,
  resolveStoreSlug,
  joinUrl,
  readAppUrlConfig,
} from "@/lib/urls";

export {
  getDefaultTenantSlug,
  getStorefrontTenantHeaders,
  isMarketingApexHost,
  isPlatformHost,
  resolveTenantFromHost,
} from "@/lib/tenant-resolution";
