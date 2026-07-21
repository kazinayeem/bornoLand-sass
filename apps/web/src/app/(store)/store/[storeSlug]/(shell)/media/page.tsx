"use client";

import { MediaLibrary } from "@/components/media/media-library";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { EcommerceModuleShell } from "@/components/ecommerce/module-shell";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";
import { Loader2 } from "lucide-react";

export default function StoreMediaPage() {
  const { storeId, store, isLoading } = useStorePage();
  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId ?? "", { skip: !storeId });
  const feature = getFeatureByKey(accessData?.data?.features ?? [], "media");
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
        title="Media Library"
        description="Upload, organize, and manage images and files for your store."
        feature={feature}
        billingHref={billingHref}
        currentPlan={accessData?.data?.currentPlan?.name}
      >
        <MediaLibrary storeId={storeId} store={store} billingHref={billingHref} />
      </EcommerceModuleShell>
    </StorePageCard>
  );
}
