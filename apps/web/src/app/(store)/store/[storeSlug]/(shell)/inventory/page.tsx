"use client";

import { InventoryTab } from "@/components/workspace/inventory-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { EcommerceModuleShell } from "@/components/ecommerce/module-shell";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";
import { Loader2 } from "lucide-react";

export default function StoreInventoryPage() {
  const { storeId, store, isLoading } = useStorePage();
  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId ?? "", { skip: !storeId });
  const feature = getFeatureByKey(accessData?.data?.features ?? [], "inventory");
  const billingHref = store ? `/store/${store.slug}/billing` : "#";

  if (isLoading || !storeId) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }

  return (
    <StorePageCard>
      <EcommerceModuleShell
        title="Inventory"
        description="Track stock levels, low-stock alerts, and out-of-stock SKUs."
        feature={feature}
        billingHref={billingHref}
        currentPlan={accessData?.data?.currentPlan?.name}
      >
        <InventoryTab storeId={storeId} />
      </EcommerceModuleShell>
    </StorePageCard>
  );
}
