"use client";

import { Suspense } from "react";
import { StorefrontProductGrid } from "@/components/storefront/storefront-product-grid";
import { StorefrontPage } from "@/components/storefront/storefront-ui";

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <StorefrontPage parchment>
        <StorefrontProductGrid
          title="Search"
          subtitle="Find products across the store"
          productCount={12}
          gridColumns="4"
          showSort
          showPagination
          allowRowsPerPage
        />
      </StorefrontPage>
    </Suspense>
  );
}
