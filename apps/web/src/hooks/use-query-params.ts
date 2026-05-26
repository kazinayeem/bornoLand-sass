"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type QueryParams = {
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
  status?: string;
  [key: string]: string | number | undefined;
};

export function useQueryParams(defaults?: Partial<QueryParams>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    searchParams.forEach((v, k) => { p[k] = v; });
    return {
      search: p.search || defaults?.search?.toString() || "",
      page: Number(p.page) || defaults?.page || 1,
      pageSize: Number(p.pageSize) || defaults?.pageSize || 20,
      sort: p.sort || defaults?.sort || "",
      order: (p.order as "asc" | "desc") || defaults?.order || "desc",
      status: p.status || defaults?.status || "",
      ...defaults,
      ...Object.fromEntries(searchParams.entries()),
    } as QueryParams;
  }, [searchParams, defaults]);

  const setParams = useCallback(
    (updates: Partial<QueryParams>) => {
      const current = Object.fromEntries(searchParams.entries());
      const next = { ...current };

      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "" || value === null) {
          delete next[key];
        } else {
          next[key] = String(value);
        }
      }

      if (updates.search !== undefined || updates.status !== undefined || updates.sort !== undefined) {
        delete next.page;
      }

      const qs = new URLSearchParams(next).toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setSearch = useCallback((search: string) => setParams({ search: search || undefined }), [setParams]);
  const setPage = useCallback((page: number) => setParams({ page: page > 1 ? page : undefined }), [setParams]);
  const setPageSize = useCallback((pageSize: number) => setParams({ pageSize: pageSize !== 20 ? pageSize : undefined, page: undefined }), [setParams]);
  const setSort = useCallback((sort: string) => {
    setParams({ sort, order: params.order === "asc" ? "desc" : "asc", page: undefined });
  }, [setParams, params.order]);
  const setStatus = useCallback((status: string) => setParams({ status: status || undefined, page: undefined }), [setParams]);
  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    ...params,
    setParams,
    setSearch,
    setPage,
    setPageSize,
    setSort,
    setStatus,
    resetFilters,
    queryString: searchParams.toString(),
  };
}
