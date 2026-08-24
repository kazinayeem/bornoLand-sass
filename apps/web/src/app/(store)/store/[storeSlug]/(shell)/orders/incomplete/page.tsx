"use client";

import { IncompleteOrdersTab } from "@/components/orders/incomplete-orders-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";
import { FeatureLocked } from "@/components/features/feature-gate";
import { Loader2 } from "lucide-react";

export default function StoreIncompleteOrdersPage() {
  const { storeId, store, isLoading } = useStorePage();
  const { data: accessData, isLoading: isAccessLoading } = useGetStoreFeatureAccessQuery(storeId ?? "", {
    skip: !storeId,
  });

  if (isLoading || isAccessLoading || !storeId || !store) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  const feature = getFeatureByKey(accessData?.data?.features ?? [], "incomplete_orders");
  const billingHref = `/store/${store.slug}/billing`;
  const isLocked = Boolean(feature?.locked);

  return (
    <div className="space-y-6">
      <StorePageHeader
        title="Incomplete Orders"
        description="Track and recover abandoned checkout sessions when customers enter their details but do not complete order placement."
        breadcrumbs={[
          { label: "Dashboard", href: `/store/${store.slug}/dashboard` },
          { label: "Sales" },
          { label: "Incomplete Orders" },
        ]}
      />
      <StorePageCard>
        {isLocked && feature ? (
          <FeatureLocked
            feature={feature}
            billingHref={billingHref}
            currentPlan={accessData?.data?.currentPlan?.name}
          />
        ) : (
          <IncompleteOrdersTab storeId={storeId} storeSlug={store.slug} />
        )}
      </StorePageCard>
    </div>
  );
}
