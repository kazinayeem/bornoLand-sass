"use client";

import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { EcommerceModuleShell } from "@/components/ecommerce/module-shell";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";
import { Loader2 } from "lucide-react";

export default function StoreMarketingPage() {
  const { storeId, store, isLoading } = useStorePage();
  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId ?? "", { skip: !storeId });
  const feature = getFeatureByKey(accessData?.data?.features ?? [], "marketing");
  const billingHref = store ? `/store/${store.slug}/billing` : "#";

  if (isLoading || !storeId) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }

  return (
    <StorePageCard>
      <EcommerceModuleShell
        title="Marketing"
        description="Discount campaigns, flash sales, banners, and announcements."
        feature={feature}
        billingHref={billingHref}
        currentPlan={accessData?.data?.currentPlan?.name}
        comingSoon={feature?.comingSoon ?? true}
      >
        {null}
      </EcommerceModuleShell>
    </StorePageCard>
  );
}
