/**
 * Route rendering policy for the App Router.
 *
 * SSR (force-dynamic) — authenticated dashboards; uses cookies()/session.
 * ISR (revalidate) — public storefront at /site/[tenant]/*.
 * Dynamic — subdomain product pages at /products/[slug] (headers()).
 */

export const SSR_ROUTE_SEGMENT = "force-dynamic" as const;

export const STOREFRONT_REVALIDATE_SECONDS = 60;
