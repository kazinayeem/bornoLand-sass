/**
 * Rendering strategy reference for BornoLand (Next.js 15 App Router).
 *
 * PUBLIC STOREFRONT  → ISR (revalidate: 60) + on-demand tag invalidation
 * STORE DASHBOARD    → SSR (force-dynamic on shell layout)
 * SUPER ADMIN        → SSR (force-dynamic)
 * BUILDER / CMS / MEDIA → CSR (client components, dynamic import where heavy)
 * AUTH FLOWS         → SSR layout gates; post-login uses router.push + refresh
 *
 * Do not convert authenticated dashboards to ISR — they require fresh data.
 * Do not convert public marketing/storefront pages to force-dynamic — use ISR.
 */

export const RENDERING = {
  /** Public tenant pages: home, CMS, categories, product detail */
  STOREFRONT_ISR_SECONDS: 60,
  /** Store shell context (branding, theme, plan) — fetch cache across navigations */
  STORE_CONTEXT_SECONDS: 300,
  /** SEO metadata helpers */
  METADATA_SECONDS: 120,
} as const;

/** ISR — public storefront routes */
export const STOREFRONT_ISR = { revalidate: RENDERING.STOREFRONT_ISR_SECONDS } as const;

/** SSR — authenticated surfaces always fetch fresh data */
export const DASHBOARD_SSR = { dynamic: "force-dynamic" as const };

/** CSR — interactive editors; route shell stays server-rendered */
export const EDITOR_CSR = { dynamic: "force-dynamic" as const };

/**
 * Multi-tenant on-demand ISR: no tenants pre-built at compile time.
 * First request generates the page; publish triggers tag revalidation.
 */
export const TENANT_ON_DEMAND_ISR = {
  dynamicParams: true as const,
};
