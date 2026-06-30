"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentStore } from "@/features/session/hooks";

type RequireStoreProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export function RequireStore({ children, redirectTo = "/dashboard/stores" }: RequireStoreProps) {
  const router = useRouter();
  const currentStore = useCurrentStore();

  useEffect(() => {
    if (!currentStore.storeId) {
      router.replace(redirectTo);
    }
  }, [currentStore.storeId, redirectTo, router]);

  if (!currentStore.storeId) return null;
  return <>{children}</>;
}
