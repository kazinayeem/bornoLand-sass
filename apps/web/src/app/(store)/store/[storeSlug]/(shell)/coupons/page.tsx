"use client";

import { CouponsTab } from "@/components/workspace/coupons-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { useStoreContext } from "@/providers/store-context";
import { EcommerceModuleShell } from "@/components/ecommerce/module-shell";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";
import { TablePageSkeleton } from "@/components/loading/table-page-skeleton";

export default function StoreCouponsPage() {
  const { storeId, store, isLoading } = useStorePage();
  const storeContext = useStoreContext();
  const contextFeatures = (storeContext.features as { features?: any[]; currentPlan?: { name?: string } } | null)?.features;

  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId ?? "", {
    skip: !storeId || Boolean(contextFeatures && contextFeatures.length > 0),
  });

  const features = contextFeatures ?? accessData?.data?.features ?? [];
  const feature = getFeatureByKey(features, "coupons");
  const billingHref = store ? `/store/${store.slug}/billing` : "#";
  const currentPlan = (storeContext.features as any)?.currentPlan?.name ?? accessData?.data?.currentPlan?.name;

  return (
    <StorePageCard>
      {isLoading || !storeId ? (
        <TablePageSkeleton rows={5} cols={5} />
      ) : (
        <EcommerceModuleShell
          title="Coupons & Discounts"
          description="Percentage, fixed, free shipping, and buy X get Y coupons."
          feature={feature}
          billingHref={billingHref}
          currentPlan={currentPlan}
        >
          <CouponsTab storeId={storeId} />
        </EcommerceModuleShell>
      )}
    </StorePageCard>
  );
}
