import type { Metadata } from "next";
import { generateTenantMetadata, buildCategoryJsonLd } from "@/lib/server/page-metadata";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { getTenantCanonicalUrl } from "@/lib/urls";
import { CategoryPageClient } from "@/components/storefront/category-page-client";

export const revalidate = 60;
export const dynamicParams = true;

type CategoryProps = {
  params: Promise<{ tenant: string; slug: string[] }>;
};

export async function generateMetadata({ params }: CategoryProps): Promise<Metadata> {
  const { tenant, slug: slugs } = await params;
  const data = await fetchTenantSite(tenant);
  const categories = (data?.categories ?? []) as Array<{ slug?: string; name?: string; description?: string }>;
  const currentSlug = slugs[slugs.length - 1];
  const category = categories.find((item) => item.slug === currentSlug);
  const pageTitle = category?.name ?? currentSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return generateTenantMetadata({
    tenant,
    pageTitle,
    description: category?.description,
    canonicalPath: `/category/${slugs.join("/")}`,
  });
}

export default async function CategoryPage({ params }: CategoryProps) {
  const { tenant, slug: slugs } = await params;
  const data = await fetchTenantSite(tenant);
  const categories = (data?.categories ?? []) as Array<{ _id?: string; slug?: string; name?: string; description?: string; parentId?: string }>;
  const currentSlug = slugs[slugs.length - 1];
  const category = categories.find((item) => item.slug === currentSlug);

  const canonicalUrl = getTenantCanonicalUrl(tenant, `/category/${slugs.join("/")}`);
  const breadcrumbs = [
    { name: "Home", url: getTenantCanonicalUrl(tenant, "/") },
    { name: "Categories", url: getTenantCanonicalUrl(tenant, "/categories") },
    ...slugs.map((s, idx) => {
      const match = categories.find((c) => c.slug === s);
      return {
        name: match?.name || s.replace(/-/g, " "),
        url: getTenantCanonicalUrl(tenant, `/category/${slugs.slice(0, idx + 1).join("/")}`),
      };
    }),
  ];

  const jsonLd = buildCategoryJsonLd({
    category: {
      name: category?.name || currentSlug,
      description: category?.description,
      slug: currentSlug,
    },
    canonicalUrl,
    breadcrumbs,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryPageClient slugs={slugs} />
    </>
  );
}
