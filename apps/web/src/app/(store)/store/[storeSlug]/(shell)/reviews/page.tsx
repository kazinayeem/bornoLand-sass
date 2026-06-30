"use client";

import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { EcommerceModuleShell } from "@/components/ecommerce/module-shell";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";
import { Loader2 } from "lucide-react";

export default function StoreReviewsPage() {
  const { storeId, store, isLoading } = useStorePage();
  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId ?? "", { skip: !storeId });
  const feature = getFeatureByKey(accessData?.data?.features ?? [], "reviews");
  const billingHref = store ? `/store/${store.slug}/billing` : "#";

  if (isLoading || !storeId) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  return (
    <StorePageCard>
      <EcommerceModuleShell
        title="Product Reviews"
        description="Moderate customer reviews and ratings."
        feature={feature}
        billingHref={billingHref}
        currentPlan={accessData?.data?.currentPlan?.name}
        comingSoon={feature?.comingSoon}
      >
        <p className="text-sm text-zinc-500">Review moderation UI connects to `/stores/:id/reviews` API.</p>
      </EcommerceModuleShell>
    </StorePageCard>
  );
}
