"use client";

import { CouponsTab } from "@/components/workspace/coupons-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { EcommerceModuleShell } from "@/components/ecommerce/module-shell";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";
import { Loader2 } from "lucide-react";

export default function StoreCouponsPage() {
  const { storeId, store, isLoading } = useStorePage();
  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId ?? "", { skip: !storeId });
  const feature = getFeatureByKey(accessData?.data?.features ?? [], "coupons");
  const billingHref = store ? `/store/${store.slug}/billing` : "#";

  if (isLoading || !storeId) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }

  return (
    <StorePageCard>
      <EcommerceModuleShell
        title="Coupons & Discounts"
        description="Percentage, fixed, free shipping, and buy X get Y coupons."
        feature={feature}
        billingHref={billingHref}
        currentPlan={accessData?.data?.currentPlan?.name}
      >
        <CouponsTab storeId={storeId} />
      </EcommerceModuleShell>
    </StorePageCard>
  );
}
