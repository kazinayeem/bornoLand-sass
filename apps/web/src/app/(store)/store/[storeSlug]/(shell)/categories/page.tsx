"use client";

import { CategoriesTab } from "@/components/workspace/categories-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";
import { TablePageSkeleton } from "@/components/loading/table-page-skeleton";

export default function StoreCategoriesPage() {
  const { storeId, store, isLoading } = useStorePage();
  const billingHref = store ? `/store/${store.slug}/billing` : "#";

  return (
    <div className="space-y-6">
      <StorePageHeader
        title="Categories & Collections"
        description="Organize catalog taxonomy with multi-level category trees, subcategories, and brands."
        breadcrumbs={[
          { label: "Dashboard", href: store ? `/store/${store.slug}/dashboard` : "#" },
          { label: "Catalog" },
          { label: "Categories" },
        ]}
      />
      <StorePageCard>
        {isLoading || !storeId ? (
          <TablePageSkeleton rows={5} cols={4} />
        ) : (
          <CategoriesTab storeId={storeId} billingHref={billingHref} />
        )}
      </StorePageCard>
    </div>
  );
}
