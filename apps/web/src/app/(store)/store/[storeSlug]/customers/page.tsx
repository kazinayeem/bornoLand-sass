"use client";

import { CustomersTab } from "@/components/workspace/customers-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

export default function StoreCustomersPage() {
  const { storeId, isLoading } = useStorePage();
  if (isLoading || !storeId) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }
  return <StorePageCard><CustomersTab storeId={storeId} /></StorePageCard>;
}
