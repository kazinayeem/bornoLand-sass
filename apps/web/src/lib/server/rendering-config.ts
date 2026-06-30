/**
 * Route rendering policy for the App Router.
 *
 * SSR — authenticated dashboards; uses cookies()/session.
 *   Set `export const dynamic = "force-dynamic"` on the layout (must be a string literal).
 *
 * ISR — public storefront at /site/[tenant]/* (`revalidate = 60`).
 *
 * Dynamic — subdomain product pages at /products/[slug] (headers()).
 */

export const STOREFRONT_REVALIDATE_SECONDS = 60;
