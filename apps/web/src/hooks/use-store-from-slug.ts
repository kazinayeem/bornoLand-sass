"use client";

import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCurrentStore } from "@/redux/slices/current-store-slice";

export function useStoreFromSlug() {
  const params = useParams();
  const storeSlug = params.storeSlug as string;
  const dispatch = useDispatch();

  const query = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = query.data?.data?.store;

  useEffect(() => {
    if (store) {
      dispatch(
        setCurrentStore({
          storeId: store._id,
          storeName: store.name,
          storeSlug: store.slug,
        })
      );
    }
  }, [store, dispatch]);

  return {
    storeSlug,
    store,
    storeId: store?._id,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
