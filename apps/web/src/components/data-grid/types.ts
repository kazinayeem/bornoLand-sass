import type { ColumnDef, ColumnPinningState, ExpandedState, SortingState, VisibilityState } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type DataGridDensity = "compact" | "default" | "comfortable";
export type DataGridViewMode = "table" | "card";

export type DataGridPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
};

export type DataGridSortState = SortingState;

export type DataGridQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, string | string[] | boolean | number | undefined>;
};

export type DataGridFilterDefinition = {
  id: string;
  label: string;
  type: "select" | "multiselect" | "date-range" | "text" | "boolean" | "tags";
  options?: { label: string; value: string }[];
  placeholder?: string;
};

export type DataGridRowAction<T> = {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: (row: T) => void;
  variant?: "default" | "danger";
  permission?: string;
  hidden?: (row: T) => boolean;
};

export type DataGridBulkAction<T> = {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: (rows: T[]) => void | Promise<void>;
  variant?: "default" | "danger" | "warning";
  permission?: string;
};

export type DataGridExportScope = "selected" | "filtered" | "page" | "all";

export type DataGridSavedView = {
  id: string;
  name: string;
  columnVisibility: VisibilityState;
  columnOrder: string[];
  columnPinning: ColumnPinningState;
  filters: Record<string, unknown>;
  sorting: DataGridSortState;
  density: DataGridDensity;
  search: string;
  pageSize: number;
};

export type DataGridPermissions = {
  canCreate?: boolean;
  canExport?: boolean;
  canImport?: boolean;
  canDelete?: boolean;
  hiddenColumns?: string[];
  hiddenBulkActions?: string[];
  hiddenRowActions?: string[];
};

export type DataGridState = {
  page: number;
  pageSize: number;
  search: string;
  sorting: DataGridSortState;
  filters: Record<string, string | string[] | boolean | undefined>;
  columnVisibility: VisibilityState;
  columnOrder: string[];
  columnPinning: ColumnPinningState;
  density: DataGridDensity;
  viewMode: DataGridViewMode;
  rowSelection: Record<string, boolean>;
  expanded: ExpandedState;
};

export type DataGridColumnMeta = {
  label?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  exportable?: boolean;
  permission?: string;
};

export type DataGridProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  getRowId: (row: TData) => string;
  pagination?: DataGridPagination;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  state: DataGridState;
  onStateChange: (patch: Partial<DataGridState>) => void;
  onQueryChange?: (params: DataGridQueryParams) => void;
  enableRowSelection?: boolean;
  enableMultiSort?: boolean;
  enableColumnResizing?: boolean;
  enableColumnPinning?: boolean;
  enableColumnOrdering?: boolean;
  enableColumnVisibility?: boolean;
  enableVirtualization?: boolean;
  enableInfiniteScroll?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  stickyHeader?: boolean;
  filters?: DataGridFilterDefinition[];
  rowActions?: DataGridRowAction<TData>[];
  bulkActions?: DataGridBulkAction<TData>[];
  permissions?: DataGridPermissions;
  savedViewsKey?: string;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRowClick?: (row: TData) => void;
  onCreate?: () => void;
  onImport?: () => void;
  onRefresh?: () => void;
  toolbarExtra?: ReactNode;
  subRows?: (row: TData) => TData[] | undefined;
  className?: string;
  estimatedRowHeight?: number;
  getSubRows?: (row: TData) => TData[] | undefined;
  hideSearch?: boolean;
  searchPlaceholder?: string;
};

export type LegacyColumn<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  render: (item: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  exportable?: boolean;
  permission?: string;
};

export type LegacySortConfig = {
  key: string;
  order: "asc" | "desc";
};

export type LegacyBulkAction<T> = {
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "danger" | "warning";
  onClick: (selected: T[]) => void;
};
