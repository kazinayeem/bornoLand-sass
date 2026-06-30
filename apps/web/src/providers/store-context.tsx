"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import type { Store } from "@/redux/api/store-api";
import { setCurrentStore } from "@/redux/slices/current-store-slice";

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
  isLoading: boolean;
  isError: boolean;
  isReady: boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const storeSlug = typeof params.storeSlug === "string" ? params.storeSlug : "";
  const dispatch = useDispatch();
  const query = useGetStoreBySlugQuery(storeSlug, {
    skip: !storeSlug,
    refetchOnMountOrArgChange: 300,
  });
  const store = query.data?.data?.store ?? null;

  useEffect(() => {
    if (store) {
      dispatch(
        setCurrentStore({
          storeId: store._id,
          storeName: store.name,
          storeSlug: store.slug,
        }),
      );
    }
  }, [store, dispatch]);

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
      isLoading: query.isLoading || (!!storeSlug && !store && !query.isError),
      isError: query.isError,
      isReady: !!store && !!store._id,
    }),
    [store, storeSlug, query.isLoading, query.isError],
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
