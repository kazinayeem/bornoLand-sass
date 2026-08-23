"use client";

import { useMemo } from "react";
import { useTenant } from "@/providers/tenant-provider";
import { useGetCategoriesQuery, type Category } from "@/redux/api/category-api";

/** Normalize Mongo ObjectId from API/SSR payloads into a string storeId. */
export function normalizeStoreId(id: unknown): string {
  if (id == null || id === "") return "";
  if (typeof id === "string") return id;
  if (typeof id === "object") {
    const record = id as Record<string, unknown>;
    if (typeof record.$oid === "string") return record.$oid;
    if (typeof record.toString === "function") {
      const asString = record.toString();
      if (/^[a-f0-9]{24}$/i.test(asString)) return asString;
    }
  }
  const coerced = String(id);
  return coerced === "[object Object]" ? "" : coerced;
}

function filterActiveCategories<T extends { active?: boolean }>(list: T[]): T[] {
  return list.filter((c) => c.active !== false);
}

/**
 * Single category source for storefront + builder.
 *
 * Priority:
 * 1. RTK GET /categories/:storeId when it returns rows (builder / authenticated).
 * 2. Tenant SSR categories from public tenant resolution (published storefront).
 *
 * Both are real MongoDB data for the current store — never demo/template arrays.
 */
export function useStoreCategories(storeIdOverride?: string) {
  const { store, categories: tenantCategories } = useTenant();
  const storeId = normalizeStoreId(
    storeIdOverride ?? store?._id ?? (store as { id?: string } | undefined)?.id,
  );

  const { data, isLoading, isFetching, isError } = useGetCategoriesQuery(storeId, {
    skip: !storeId,
  });

  const categories = useMemo(() => {
    const fromApi = filterActiveCategories(data?.data?.categories ?? []);
    if (fromApi.length > 0) return fromApi as Category[];

    return filterActiveCategories(tenantCategories ?? []) as Category[];
  }, [data, tenantCategories]);

  return {
    storeId,
    categories,
    isLoading: (isLoading || isFetching) && categories.length === 0,
    isError: isError && categories.length === 0,
  };
}

export type { Category };
