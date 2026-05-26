"use client";

import { useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  setCurrentStore,
  clearCurrentStore,
  rehydrateCurrentStore,
} from "@/redux/slices/current-store-slice";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import type { Store } from "@/redux/api/store-api";

export function useCurrentStore() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const current = useSelector((s: RootState) => s.currentStore);
  const { data } = useGetMyStoresQuery();
  const stores = data?.data?.stores ?? [];

  const rehydrate = useCallback(() => {
    dispatch(rehydrateCurrentStore());
  }, [dispatch]);

  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

  // Auto-restore from URL query param ?storeId=
  useEffect(() => {
    const storeIdFromUrl = searchParams.get("storeId");
    if (storeIdFromUrl && stores.length > 0) {
      const store = stores.find((s) => s._id === storeIdFromUrl);
      if (store) {
        // Only update if different from current
        if (store._id !== current.storeId) {
          dispatch(
            setCurrentStore({
              storeId: store._id,
              storeName: store.name,
              storeSlug: store.slug,
            })
          );
        }
        return;
      }
    }
  }, [searchParams, stores, dispatch, current.storeId]);

  // Auto-restore from global state (from localStorage)/rehydrate
  useEffect(() => {
    if (
      !current.storeId &&
      stores.length > 0 &&
      current.initialized
    ) {
      const savedId = current.storeId;
      if (savedId) {
        const store = stores.find((s) => s._id === savedId);
        if (store) {
          dispatch(
            setCurrentStore({
              storeId: store._id,
              storeName: store.name,
              storeSlug: store.slug,
            })
          );
        }
      }
    }
  }, [stores, dispatch, current.storeId, current.initialized]);

  const selectStore = useCallback(
    (store: Store) => {
      dispatch(
        setCurrentStore({
          storeId: store._id,
          storeName: store.name,
          storeSlug: store.slug,
        })
      );
    },
    [dispatch]
  );

  const clearStore = useCallback(() => {
    dispatch(clearCurrentStore());
  }, [dispatch]);

  const currentStore = stores.find((s) => s._id === current.storeId) ?? null;
  const hasStore = !!currentStore;

  return {
    currentStore,
    currentStoreId: current.storeId,
    currentStoreName: current.storeName,
    stores,
    hasStore,
    selectStore,
    clearStore,
    rehydrate,
  };
}
