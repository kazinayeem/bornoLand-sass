import type { Metadata } from "next";
import { generateTenantMetadata } from "@/lib/server/page-metadata";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { StorefrontProductGrid } from "@/components/storefront/storefront-product-grid";
import { StorefrontPage } from "@/components/storefront/storefront-ui";
import { Tag } from "lucide-react";

export const revalidate = 60;
export const dynamicParams = true;

type BrandProps = {
  params: Promise<{ tenant: string; slug: string }>;
};

export async function generateMetadata({ params }: BrandProps): Promise<Metadata> {
  const { tenant, slug } = await params;
  const brandName = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return generateTenantMetadata({
    tenant,
    pageTitle: `${brandName} Products`,
    description: `Shop authentic ${brandName} products from our store.`,
    canonicalPath: `/brand/${slug}`,
  });
}

export default async function BrandPage({ params }: BrandProps) {
  const { tenant, slug } = await params;
  const brandName = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <StorefrontPage>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* Brand Banner */}
        <div className="rounded-3xl bg-zinc-900 px-8 py-10 text-white shadow-md mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md mb-3">
            <Tag className="h-3.5 w-3.5" />
            <span>Brand Showcase</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {brandName}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-300 max-w-xl">
            Explore authentic products manufactured and curated by {brandName}.
          </p>
        </div>

        {/* Products */}
        <StorefrontProductGrid
          title={`${brandName} Collection`}
          subtitle={`Showing all available products from ${brandName}`}
          productCount={12}
          gridColumns="4"
          tabletColumns="2"
          mobileColumns="2"
          showSort
          showPagination
          allowRowsPerPage
        />
      </div>
    </StorefrontPage>
  );
}
