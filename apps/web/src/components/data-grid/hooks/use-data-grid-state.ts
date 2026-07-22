"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnPinningState, SortingState, VisibilityState } from "@tanstack/react-table";
import { DATA_GRID_DEFAULT_PAGE_SIZE } from "../constants";
import type { DataGridDensity, DataGridState, DataGridViewMode } from "../types";
import { buildDataGridQueryParams } from "../utils/build-query-params";

type UseDataGridStateOptions = {
  initialPage?: number;
  initialPageSize?: number;
  initialSearch?: string;
  initialSorting?: SortingState;
  initialFilters?: Record<string, string | string[] | boolean | undefined>;
  initialDensity?: DataGridDensity;
  initialViewMode?: DataGridViewMode;
  onQueryChange?: (params: ReturnType<typeof buildDataGridQueryParams>) => void;
};

export function useDataGridState(options: UseDataGridStateOptions = {}) {
  const [state, setState] = useState<DataGridState>({
    page: options.initialPage ?? 1,
    pageSize: options.initialPageSize ?? DATA_GRID_DEFAULT_PAGE_SIZE,
    search: options.initialSearch ?? "",
    sorting: options.initialSorting ?? [],
    filters: options.initialFilters ?? {},
    columnVisibility: {},
    columnOrder: [],
    columnPinning: {},
    density: options.initialDensity ?? "default",
    viewMode: options.initialViewMode ?? "table",
    rowSelection: {},
    expanded: {},
  });

  const patchState = useCallback((patch: Partial<DataGridState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: 1,
      search: "",
      filters: {},
      sorting: options.initialSorting ?? [],
    }));
  }, [options.initialSorting]);

  const queryParams = useMemo(() => buildDataGridQueryParams(state), [state]);

  useEffect(() => {
    options.onQueryChange?.(queryParams);
  }, [options, queryParams]);

  return {
    state,
    setState,
    patchState,
    resetFilters,
    queryParams,
  };
}
