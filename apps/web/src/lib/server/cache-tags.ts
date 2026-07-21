export const CACHE_REVALIDATE = {
  storefront: 60,
  storeContext: 300,
  metadata: 120,
  product: 60,
  cms: 60,
} as const;

export const cacheTags = {
  tenant: (slug: string) => `tenant-${slug}`,
  store: (storeId: string) => `store-${storeId}`,
  storeMetadata: (slug: string) => `store-meta-${slug}`,
  storeBySlug: (slug: string) => `store-by-slug-${slug}`,
  cmsPage: (storeId: string, pageSlug: string) => `cms-${storeId}-${pageSlug}`,
  cmsStore: (storeId: string) => `cms-store-${storeId}`,
  storeContact: (storeId: string) => `store-contact-${storeId}`,
  product: (slug: string) => `product-${slug}`,
  category: (slug: string) => `category-${slug}`,
  tenantTheme: (slug: string) => `tenant-theme-${slug}`,
};
