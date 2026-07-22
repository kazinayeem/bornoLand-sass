"use client";

import { useMemo } from "react";
import {
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
  type RowSelectionState,
} from "@tanstack/react-table";
import type { DataGridState } from "../types";

type UseDataGridTableOptions<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  getRowId: (row: TData) => string;
  state: DataGridState;
  pageCount: number;
  enableRowSelection?: boolean;
  enableMultiSort?: boolean;
  enableColumnResizing?: boolean;
  enableColumnPinning?: boolean;
  getSubRows?: (row: TData) => TData[] | undefined;
  onSortingChange: (sorting: DataGridState["sorting"]) => void;
  onColumnVisibilityChange: (visibility: DataGridState["columnVisibility"]) => void;
  onColumnOrderChange: (order: string[]) => void;
  onColumnPinningChange: (pinning: DataGridState["columnPinning"]) => void;
  onRowSelectionChange: (selection: RowSelectionState) => void;
  onExpandedChange: (expanded: ExpandedState) => void;
};

export function useDataGridTable<TData>({
  data,
  columns,
  getRowId,
  state,
  pageCount,
  enableRowSelection = false,
  enableMultiSort = true,
  enableColumnResizing = true,
  enableColumnPinning = true,
  getSubRows,
  onSortingChange,
  onColumnVisibilityChange,
  onColumnOrderChange,
  onColumnPinningChange,
  onRowSelectionChange,
  onExpandedChange,
}: UseDataGridTableOptions<TData>) {
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => getRowId(row),
    pageCount,
    state: {
      sorting: state.sorting,
      columnVisibility: state.columnVisibility,
      columnOrder: state.columnOrder,
      columnPinning: state.columnPinning,
      rowSelection: state.rowSelection,
      expanded: state.expanded,
      pagination: { pageIndex: state.page - 1, pageSize: state.pageSize },
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableRowSelection,
    enableMultiSort,
    enableColumnResizing,
    enableColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getSubRows,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(state.sorting) : updater;
      onSortingChange(next);
    },
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === "function" ? updater(state.columnVisibility) : updater;
      onColumnVisibilityChange(next);
    },
    onColumnOrderChange: (updater) => {
      const next = typeof updater === "function" ? updater(state.columnOrder) : updater;
      onColumnOrderChange(next);
    },
    onColumnPinningChange: (updater) => {
      const next = typeof updater === "function" ? updater(state.columnPinning) : updater;
      onColumnPinningChange(next);
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(state.rowSelection) : updater;
      onRowSelectionChange(next);
    },
    onExpandedChange: (updater) => {
      const next = typeof updater === "function" ? updater(state.expanded) : updater;
      onExpandedChange(next);
    },
  });

  const visibleColumns = useMemo(() => table.getVisibleLeafColumns(), [table]);

  return { table, visibleColumns };
}
