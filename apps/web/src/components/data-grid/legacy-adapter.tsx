"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataGrid } from "./DataGrid";
import { useDataGridState } from "./hooks/use-data-grid-state";
import { legacyColumnsToColumnDefs } from "./utils/column-helpers";
import type { LegacyBulkAction, LegacyColumn, LegacySortConfig, DataGridExportMeta } from "./types";

type LegacyDataTableProps<T> = {
  data: T[];
  columns: LegacyColumn<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  isFetching?: boolean;
  emptyIcon?: React.ComponentProps<typeof DataGrid<T>>["emptyIcon"];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  page?: number;
  totalPages?: number;
  total?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  sort?: LegacySortConfig;
  onSort?: (sort: LegacySortConfig) => void;
  bulkActions?: LegacyBulkAction<T>[];
  onRowClick?: (item: T) => void;
  stickyHeader?: boolean;
  className?: string;
  rowClassName?: string;
  hideSearch?: boolean;
  hidePagination?: boolean;
  exportMeta?: DataGridExportMeta;
  toolbarExtra?: React.ReactNode;
  onExportOverride?: {
    csv?: () => void;
    pdf?: () => void;
  };
  permissions?: React.ComponentProps<typeof DataGrid<T>>["permissions"];
};

export function LegacyDataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading,
  isFetching,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  page = 1,
  totalPages = 1,
  total,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  sort,
  onSort,
  bulkActions,
  onRowClick,
  stickyHeader = true,
  className,
  hideSearch,
  hidePagination,
  exportMeta,
  toolbarExtra,
  onExportOverride,
  permissions,
}: LegacyDataTableProps<T>) {
  const columnDefs = useMemo(() => legacyColumnsToColumnDefs(columns), [columns]);

  const { state, patchState } = useDataGridState({
    initialPage: page,
    initialPageSize: pageSize,
    initialSearch: searchValue ?? "",
    initialSorting: sort ? [{ id: sort.key, desc: sort.order === "desc" }] : [],
  });

  const syncedState = useMemo(
    () => ({
      ...state,
      page,
      pageSize,
      search: searchValue ?? state.search,
      sorting: sort ? [{ id: sort.key, desc: sort.order === "desc" }] : state.sorting,
    }),
    [state, page, pageSize, searchValue, sort],
  );

  const mappedBulkActions = useMemo(
    () =>
      bulkActions?.map((action, index) => ({
        id: `bulk-${index}`,
        label: action.label,
        icon: action.icon,
        variant: action.variant,
        onClick: action.onClick,
      })),
    [bulkActions],
  );

  return (
    <DataGrid
      data={data}
      columns={columnDefs as ColumnDef<T, unknown>[]}
      getRowId={keyExtractor}
      isLoading={isLoading}
      isFetching={isFetching}
      state={syncedState}
      onStateChange={(patch) => {
        patchState(patch);
        if (patch.search !== undefined) onSearchChange?.(patch.search);
        if (patch.page !== undefined) onPageChange?.(patch.page);
        if (patch.pageSize !== undefined) onPageSizeChange?.(patch.pageSize);
        if (patch.sorting) {
          const next = patch.sorting[0];
          if (next && onSort) onSort({ key: next.id, order: next.desc ? "desc" : "asc" });
        }
      }}
      pagination={
        hidePagination
          ? undefined
          : {
              page,
              limit: pageSize,
              total: total ?? data.length,
              totalPages: totalPages || 1,
              hasNext: page < (totalPages || 1),
              hasPrevious: page > 1,
            }
      }
      enableRowSelection={Boolean(mappedBulkActions?.length)}
      bulkActions={mappedBulkActions}
      onRowClick={onRowClick}
      stickyHeader={stickyHeader}
      className={className}
      emptyIcon={emptyIcon}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
      enableVirtualization={data.length >= 50}
      hideSearch={hideSearch}
      searchPlaceholder={searchPlaceholder}
      exportMeta={exportMeta}
      toolbarExtra={toolbarExtra}
      onExportCsv={onExportOverride?.csv}
      onExportPdf={onExportOverride?.pdf}
      permissions={permissions}
    />
  );
}

export type {
  LegacyColumn as Column,
  LegacyBulkAction as BulkAction,
  LegacySortConfig as SortConfig,
} from "./types";
