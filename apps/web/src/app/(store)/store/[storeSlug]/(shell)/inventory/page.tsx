"use client";

import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";
import { useStoreContext } from "@/providers/store-context";
import { EcommerceModuleShell } from "@/components/ecommerce/module-shell";
import { InventoryHub } from "@/components/workspace/inventory/inventory-hub";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";
import { TablePageSkeleton } from "@/components/loading/table-page-skeleton";

export default function StoreInventoryPage() {
  const { storeId, store, isLoading } = useStorePage();
  const storeContext = useStoreContext();
  const contextFeatures = (storeContext.features as { features?: any[]; currentPlan?: { name?: string } } | null)?.features;

  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId ?? "", {
    skip: !storeId || Boolean(contextFeatures && contextFeatures.length > 0),
  });

  const features = contextFeatures ?? accessData?.data?.features ?? [];
  const feature = getFeatureByKey(features, "inventory");
  const billingHref = store ? `/store/${store.slug}/billing` : "#";
  const currentPlan = (storeContext.features as any)?.currentPlan?.name ?? accessData?.data?.currentPlan?.name;

  return (
    <div className="space-y-6">
      <StorePageHeader
        title="Inventory & Stock Control"
        description="Multi-warehouse stock allocation, supplier purchase orders, FIFO batches, and automated reorder triggers."
        breadcrumbs={[
          { label: "Dashboard", href: store ? `/store/${store.slug}/dashboard` : "#" },
          { label: "Inventory" },
          { label: "Stock Control" },
        ]}
      />
      <StorePageCard>
        {isLoading || !storeId ? (
          <TablePageSkeleton rows={6} cols={5} />
        ) : (
          <EcommerceModuleShell
            title="Inventory Hub"
            description="Enterprise stock control — features unlocked according to your subscription tier."
            feature={feature}
            billingHref={billingHref}
            currentPlan={currentPlan}
          >
            <InventoryHub storeId={storeId} features={features} />
          </EcommerceModuleShell>
        )}
      </StorePageCard>
    </div>
  );
}
