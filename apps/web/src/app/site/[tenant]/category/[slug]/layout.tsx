import type { Metadata } from "next";
import { generateTenantMetadata } from "@/lib/server/page-metadata";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { TenantPageLayout } from "@/lib/server/tenant-page-metadata";

export const revalidate = 60;

type CategoryLayoutProps = {
  params: Promise<{ tenant: string; slug: string }>;
};

export async function generateMetadata({ params }: CategoryLayoutProps): Promise<Metadata> {
  const { tenant, slug } = await params;
  const data = await fetchTenantSite(tenant);
  const categories = (data?.categories ?? []) as Array<{ slug?: string; name?: string }>;
  const category = categories.find((item) => item.slug === slug);
  const pageTitle = category?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return generateTenantMetadata({
    tenant,
    pageTitle,
    canonicalPath: `/site/${tenant}/category/${slug}`,
  });
}

export default TenantPageLayout;
