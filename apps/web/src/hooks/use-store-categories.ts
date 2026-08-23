"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useTenant } from "@/providers/tenant-provider";
import {
  useGetCategoriesQuery,
  useGetPublicCategoriesQuery,
  type Category,
} from "@/redux/api/category-api";
import { useIsBuilder } from "@/lib/device-context";

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

function normalizeCategoryRow(cat: Category): Category {
  return {
    ...cat,
    _id: normalizeStoreId(cat._id) || String(cat._id ?? ""),
    storeId: normalizeStoreId(cat.storeId) || String(cat.storeId ?? ""),
    parentId:
      cat.parentId == null || cat.parentId === ""
        ? null
        : normalizeStoreId(cat.parentId) || String(cat.parentId),
  };
}

function scopeToStore(categories: Category[], storeId: string): Category[] {
  if (!storeId) return categories;
  return categories.filter((c) => normalizeStoreId(c.storeId) === storeId);
}

function resolveStoreSlug(
  store: { subdomain?: string; slug?: string } | undefined,
  tenantFromPath?: string,
): string {
  const fromPath = tenantFromPath?.trim();
  if (fromPath) return fromPath;
  return (store?.slug || store?.subdomain || "").trim();
}

const PUBLIC_CATEGORY_QUERY = { page: 1, limit: 100, status: "active" as const };

/**
 * Single category source for storefront header, mega-menu, and category sections.
 *
 * Builder: authenticated GET /categories/:storeId
 * Published: GET /public/categories?storeId=… (same getCategories() service on the API)
 */
export function useStoreCategories(storeIdOverride?: string) {
  const isBuilder = useIsBuilder();
  const params = useParams();
  const tenantFromPath = typeof params?.tenant === "string" ? params.tenant : "";
  const { store } = useTenant();
  const storeId = normalizeStoreId(
    storeIdOverride ?? store?._id ?? (store as { id?: string } | undefined)?.id,
  );
  const storeSlug = resolveStoreSlug(store, tenantFromPath);

  const builderQuery = useGetCategoriesQuery(storeId, {
    skip: !isBuilder || !storeId,
    refetchOnMountOrArgChange: true,
  });

  const publicQuery = useGetPublicCategoriesQuery(
    storeId ? { storeId, ...PUBLIC_CATEGORY_QUERY } : undefined,
    {
      skip: isBuilder || !storeId,
      refetchOnMountOrArgChange: true,
    },
  );

  const activeQuery = isBuilder ? builderQuery : publicQuery;

  const categories = useMemo(() => {
    if (!activeQuery.isSuccess || activeQuery.isError || !activeQuery.data?.data?.categories?.length) {
      return [];
    }
    return scopeToStore(
      filterActiveCategories(activeQuery.data.data.categories).map(normalizeCategoryRow),
      storeId,
    );
  }, [activeQuery.data, activeQuery.isSuccess, activeQuery.isError, storeId]);

  const isLoading =
    Boolean(storeId) &&
    (activeQuery.isLoading || activeQuery.isFetching) &&
    categories.length === 0;

  const isError =
    Boolean(storeId) &&
    activeQuery.isError &&
    categories.length === 0;

  return {
    storeId,
    storeSlug,
    categories,
    isLoading,
    isError,
  };
}

export type { Category };
