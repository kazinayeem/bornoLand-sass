"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useGetStoreContextBySlugQuery } from "@/redux/api/store-api";
import type { Store, StoreContextData } from "@/redux/api/store-api";
import { setCurrentStore } from "@/redux/slices/current-store-slice";
import { setStorePermissions } from "@/redux/slices/auth-slice";

export type StoreSubscription = {
  billingStatus?: Store["billingStatus"];
  subscriptionStatus?: Store["subscriptionStatus"];
  renewalDate?: Store["renewalDate"];
  trialEndsAt?: Store["trialEndsAt"];
};

export type StoreContextValue = {
  storeSlug: string;
  store: Store | null;
  storeId: string | null;
  workspaceId: string | null;
  plan: string | null;
  subscription: StoreSubscription | null;
  permissions: string[];
  isOwner: boolean;
  role: string;
  features: Record<string, unknown> | null;
  storageStats: StoreContextData["storageStats"] | null;
  isLoading: boolean;
  isError: boolean;
  isReady: boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children, initialStore }: { children: ReactNode; initialStore?: Store | null }) {
  const params = useParams();
  const storeSlug = typeof params.storeSlug === "string" ? params.storeSlug : "";
  const dispatch = useDispatch();

  const query = useGetStoreContextBySlugQuery(storeSlug, {
    skip: !storeSlug || storeSlug === "",
    refetchOnMountOrArgChange: false,
  });

  const contextData = query.data?.data;
  const store = contextData?.store ?? initialStore ?? null;

  useEffect(() => {
    if (store) {
      dispatch(
        setCurrentStore({
          storeId: store._id,
          storeName: store.name,
          storeSlug: store.slug,
          userId: store.userId,
        }),
      );
      try {
        localStorage.setItem("bornoland_last_store_slug", store.slug);
      } catch {
        // Ignore local storage errors
      }
    }
    if (contextData?.permissions) {
      dispatch(
        setStorePermissions({
          permissions: contextData.permissions,
          isOwner: contextData.isOwner,
          role: contextData.role,
        }),
      );
    }
  }, [store, contextData, dispatch]);

  const value = useMemo<StoreContextValue>(
    () => ({
      storeSlug,
      store,
      storeId: store?._id ?? null,
      workspaceId: store?.tenantId ?? null,
      plan: store?.plan ?? null,
      subscription: store
        ? {
            billingStatus: store.billingStatus,
            subscriptionStatus: store.subscriptionStatus,
            renewalDate: store.renewalDate,
            trialEndsAt: store.trialEndsAt,
          }
        : null,
      permissions: contextData?.permissions ?? [],
      isOwner: contextData?.isOwner ?? false,
      role: contextData?.role ?? "viewer",
      features: (contextData?.features as Record<string, unknown> | null) ?? null,
      storageStats: contextData?.storageStats ?? null,
      isLoading: !store && !initialStore && !query.isError && (query.isLoading || query.isFetching),
      isError: query.isError,
      isReady: !!store && !!store._id,
    }),
    [store, storeSlug, initialStore, contextData, query.isLoading, query.isFetching, query.isError],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStoreContext(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStoreContext must be used within StoreProvider");
  }
  return context;
}

export function useRequiredStore() {
  const context = useStoreContext();
  if (!context.isReady || !context.store || !context.storeId) {
    throw new Error("Store context is not ready");
  }
  return {
    ...context,
    store: context.store,
    storeId: context.storeId,
  };
}
