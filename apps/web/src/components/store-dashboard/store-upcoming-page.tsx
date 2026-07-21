"use client";

import { Loader2 } from "lucide-react";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { EcommerceModuleShell } from "@/components/ecommerce/module-shell";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";

type StoreUpcomingPageProps = {
  title: string;
  description: string;
  featureKey?: string;
};

export function StoreUpcomingPage({ title, description, featureKey }: StoreUpcomingPageProps) {
  const { storeId, store, isLoading } = useStorePage();
  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId ?? "", { skip: !storeId });
  const feature = featureKey ? getFeatureByKey(accessData?.data?.features ?? [], featureKey) : undefined;
  const billingHref = store ? `/store/${store.slug}/billing` : "#";

  if (isLoading || !storeId) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  return (
    <StorePageCard>
      <EcommerceModuleShell
        title={title}
        description={description}
        feature={feature}
        billingHref={billingHref}
        currentPlan={accessData?.data?.currentPlan?.name}
        comingSoon
      >
        {null}
      </EcommerceModuleShell>
    </StorePageCard>
  );
}
