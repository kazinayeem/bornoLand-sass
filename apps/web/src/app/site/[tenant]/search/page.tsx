import { Suspense } from "react";
import type { Metadata } from "next";
import { StorefrontProductGrid } from "@/components/storefront/storefront-product-grid";
import { StorefrontPage } from "@/components/storefront/storefront-ui";
import { generateTenantMetadata } from "@/lib/server/page-metadata";
import { ProductGridSkeleton } from "@/components/loading/storefront-skeletons";

type SearchProps = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ q?: string; search?: string; category?: string; sort?: string; page?: string }>;
};

export async function generateMetadata({ params, searchParams }: SearchProps): Promise<Metadata> {
  const { tenant } = await params;
  const { q, search } = await searchParams;
  const query = q || search || "";
  const pageTitle = query ? `Search: "${query}"` : "Search Products";

  return generateTenantMetadata({
    tenant,
    pageTitle,
    description: query ? `Search results for "${query}"` : "Search our product catalog",
    canonicalPath: query ? `/search?q=${encodeURIComponent(query)}` : "/search",
  });
}

export default async function SearchPage({ searchParams }: SearchProps) {
  const { q, search } = await searchParams;
  const query = q || search || "";

  return (
    <StorefrontPage parchment>
      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <StorefrontProductGrid
          title={query ? `Results for "${query}"` : "Search Catalog"}
          subtitle={query ? "Browse all matching items below" : "Enter a search term or filter by category"}
          productCount={12}
          gridColumns="4"
          tabletColumns="2"
          mobileColumns="2"
          showSort
          showFilters
          showPagination
          allowRowsPerPage
        />
      </Suspense>
    </StorefrontPage>
  );
}
