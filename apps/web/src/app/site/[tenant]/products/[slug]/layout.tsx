import type { Metadata } from "next";
import { generateTenantMetadata } from "@/lib/server/page-metadata";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { TenantPageLayout } from "@/lib/server/tenant-page-metadata";

type ProductLayoutProps = {
  params: Promise<{ tenant: string; slug: string }>;
};

export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
  const { tenant, slug } = await params;
  const data = await fetchTenantSite(tenant);
  const products = (data?.products ?? []) as Array<{ slug?: string; name?: string; description?: string }>;
  const product = products.find((item) => item.slug === slug);
  const pageTitle = product?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return generateTenantMetadata({
    tenant,
    pageTitle,
    canonicalPath: `/site/${tenant}/products/${slug}`,
    description: product?.description,
  });
}

export default TenantPageLayout;
