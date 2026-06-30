"use client";

import { Loader2 } from "lucide-react";
import { AuditCenterPanel } from "@/components/audit/audit-center-panel";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { useGetStoreAuditLogsQuery } from "@/redux/api/audit-api";

export default function StoreActivityPage() {
  const { storeId, isLoading } = useStorePage();

  if (isLoading || !storeId) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <StorePageCard>
      <AuditCenterPanel
        scope="store"
        storeId={storeId}
        title="Activity"
        description="Immutable audit timeline for this store."
        useQuery={(filters) => useGetStoreAuditLogsQuery({ storeId, ...filters })}
      />
    </StorePageCard>
  );
}
