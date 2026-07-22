import type { DataGridQueryParams, DataGridState } from "../types";

export function buildDataGridQueryParams(state: DataGridState): DataGridQueryParams {
  const primarySort = state.sorting[0];
  const filters = Object.fromEntries(
    Object.entries(state.filters).filter(([, value]) => {
      if (value === undefined || value === "" || value === false) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  );

  return {
    page: state.page,
    limit: state.pageSize,
    search: state.search.trim() || undefined,
    sortBy: primarySort?.id,
    sortOrder: primarySort ? (primarySort.desc ? "desc" : "asc") : undefined,
    filters: Object.keys(filters).length ? filters : undefined,
  };
}

export function serializeQueryParams(params: DataGridQueryParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.search) searchParams.set("search", params.search);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.filters) {
    searchParams.set("filters", JSON.stringify(params.filters));
  }
  return searchParams;
}
