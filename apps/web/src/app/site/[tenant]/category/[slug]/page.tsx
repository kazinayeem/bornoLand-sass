"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useTenant } from "@/providers/tenant-provider";
import { StorefrontProductGrid } from "@/components/storefront/storefront-product-grid";
import { StorefrontPage } from "@/components/storefront/storefront-ui";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { categories } = useTenant();
  const category = useMemo(() => categories.find((item) => item.slug === slug), [categories, slug]);

  return (
    <StorefrontPage>
      <StorefrontProductGrid
        title={category?.name ?? "Category"}
        subtitle={category?.description ?? "Browse products from this category"}
        productCount={12}
        gridColumns="4"
        showSort
        showPagination
        allowRowsPerPage
      />
    </StorefrontPage>
  );
}
