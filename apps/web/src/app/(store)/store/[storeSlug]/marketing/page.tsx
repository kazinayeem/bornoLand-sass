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
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  return (
    <StorePageCard>
      <EcommerceModuleShell
        title="Marketing"
        description="Discount campaigns, flash sales, banners, and announcements."
        feature={feature}
        billingHref={billingHref}
        currentPlan={accessData?.data?.currentPlan?.name}
      >
        <p className="text-sm text-zinc-500">Campaign manager uses `/stores/:id/marketing/campaigns`.</p>
        <p className="mt-2 text-sm text-zinc-400">Email campaigns, abandoned cart, and affiliate — Coming Soon badges in sidebar.</p>
      </EcommerceModuleShell>
    </StorePageCard>
  );
}
