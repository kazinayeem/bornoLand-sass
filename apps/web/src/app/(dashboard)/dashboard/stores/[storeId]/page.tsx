"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetStoreQuery } from "@/redux/api/store-api";
import { Loader2 } from "lucide-react";

export default function LegacyStoreWorkspaceRedirect() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const { data, isLoading } = useGetStoreQuery(storeId);

  useEffect(() => {
    const slug = data?.data?.store?.slug;
    if (slug) {
      router.replace(`/store/${slug}`);
    }
  }, [data, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  return null;
}
