import { notFound } from "next/navigation";

/**
 * Product pages are served through the tenant layout via middleware rewrite:
 * `{subdomain}.host/products/[slug]` → `/site/[tenant]/products/[slug]`.
 */
export default function LegacyProductRoute() {
  notFound();
}
