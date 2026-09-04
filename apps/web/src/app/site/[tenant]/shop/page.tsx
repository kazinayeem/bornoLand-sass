"use client";

import { StorefrontProductGrid } from "@/components/storefront/storefront-product-grid";
import { StorefrontPage } from "@/components/storefront/storefront-ui";

export default function ShopPage() {
  return (
    <StorefrontPage parchment>
      <StorefrontProductGrid
        title="Shop"
        subtitle="Browse the full catalog"
        productCount={12}
        gridColumns="4"
        showFilters
        showSort
        showPagination
        allowRowsPerPage
        productSource="all"
      />
    </StorefrontPage>
  );
}
