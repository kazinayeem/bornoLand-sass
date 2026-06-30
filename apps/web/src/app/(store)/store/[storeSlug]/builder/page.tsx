"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

export default function StoreBuilderPage() {
  const router = useRouter();
  const { storeId, isLoading } = useStorePage();

  useEffect(() => {
    if (storeId) {
      router.replace(`/dashboard/builder/${storeId}`);
    }
  }, [storeId, router]);

  return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
    </div>
  );
}
