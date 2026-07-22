"use client";

import { memo, useCallback, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { DATA_GRID_DENSITY_CELL_PADDING, DATA_GRID_VIRTUALIZATION_THRESHOLD } from "./constants";
import { useDataGridTable } from "./hooks/use-data-grid-table";
import { DataGridToolbar } from "./DataGridToolbar";
import { DataGridHeader } from "./DataGridHeader";
import { DataGridVirtualRows } from "./DataGridVirtualRows";
import { DataGridPagination } from "./DataGridPagination";
import { DataGridSkeleton } from "./DataGridSkeleton";
import { DataGridEmpty } from "./DataGridEmpty";
import { DataGridError } from "./DataGridError";
import { DataGridLoading } from "./DataGridLoading";
import { DataGridFooter } from "./DataGridFooter";
import { DataGridInfiniteLoader } from "./DataGridInfiniteLoader";
import { DataGridRowActions } from "./DataGridRowActions";
import { exportRowsToCsv, printDataGrid } from "./utils/export-data";
import { filterColumnsByPermission, filterRowActions } from "./utils/permissions";
import type { DataGridColumnMeta, DataGridProps } from "./types";

function DataGridInner<TData>({
  data,
  columns,
  getRowId,
  pagination,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  onRetry,
  state,
  onStateChange,
  enableRowSelection = false,
  enableMultiSort = true,
  enableColumnResizing = true,
  enableColumnPinning = true,
  enableVirtualization = true,
  enableInfiniteScroll = false,
  hasNextPage,
  onLoadMore,
  stickyHeader = true,
  filters,
  rowActions,
  bulkActions,
  permissions,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRowClick,
  onCreate,
  onImport,
  onRefresh,
  toolbarExtra,
  getSubRows,
  className,
  estimatedRowHeight,
  hideSearch,
  searchPlaceholder,
}: DataGridProps<TData>) {
  const filteredColumns = useMemo(
    () => filterColumnsByPermission(columns, permissions),
    [columns, permissions],
  );

  const tableColumns = useMemo(() => {
    const defs: ColumnDef<TData, unknown>[] = [...filteredColumns];
    if (rowActions && rowActions.length > 0) {
      defs.push({
        id: "actions",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <DataGridRowActions row={row.original} actions={filterRowActions(rowActions, permissions)} />
        ),
        size: 48,
      });
    }
    return defs;
  }, [filteredColumns, permissions, rowActions]);

  const pageCount = pagination?.totalPages ?? 1;

  const { table } = useDataGridTable({
    data,
    columns: tableColumns,
    getRowId,
    state,
    pageCount,
    enableRowSelection,
    enableMultiSort,
    enableColumnResizing,
    enableColumnPinning,
    getSubRows,
    onSortingChange: (sorting) => onStateChange({ sorting, page: 1 }),
    onColumnVisibilityChange: (columnVisibility) => onStateChange({ columnVisibility }),
    onColumnOrderChange: (columnOrder) => onStateChange({ columnOrder }),
    onColumnPinningChange: (columnPinning) => onStateChange({ columnPinning }),
    onRowSelectionChange: (rowSelection) => onStateChange({ rowSelection }),
    onExpandedChange: (expanded) => onStateChange({ expanded }),
  });

  const selectedRows = useMemo(
    () => table.getSelectedRowModel().rows.map((row) => row.original),
    [table, state.rowSelection],
  );

  const resetFilters = useCallback(() => {
    onStateChange({ search: "", filters: {}, sorting: [], page: 1 });
  }, [onStateChange]);

  const handleExportCsv = useCallback(() => {
    exportRowsToCsv(data, tableColumns, "export.csv");
  }, [data, tableColumns]);

  const handlePrint = useCallback(() => {
    printDataGrid("Export");
  }, []);

  if (isLoading && data.length === 0) {
    return <DataGridSkeleton cols={tableColumns.length} className={className} />;
  }

  if (isError) {
    return <DataGridError message={errorMessage} onRetry={onRetry} />;
  }

  if (!isLoading && data.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <DataGridToolbar
          table={table}
          state={state}
          onStateChange={onStateChange}
          onResetFilters={resetFilters}
          onRefresh={onRefresh}
          onCreate={onCreate}
          onImport={onImport}
          filters={filters}
          bulkActions={bulkActions}
          selectedRows={selectedRows}
          permissions={permissions}
          isFetching={isFetching}
          extra={toolbarExtra}
          onExportCsv={handleExportCsv}
          onExportPrint={handlePrint}
        />
        <DataGridEmpty
          search={state.search}
          onClearSearch={() => onStateChange({ search: "", page: 1 })}
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  const shouldVirtualize = enableVirtualization && data.length >= DATA_GRID_VIRTUALIZATION_THRESHOLD;

  return (
    <div className={cn("space-y-4", className)} aria-busy={isLoading || isFetching || undefined}>
      <DataGridToolbar
        table={table}
        state={state}
        onStateChange={onStateChange}
        onResetFilters={resetFilters}
        onRefresh={onRefresh}
        onCreate={onCreate}
        onImport={onImport}
        filters={filters}
        bulkActions={bulkActions}
        selectedRows={selectedRows}
        permissions={permissions}
        isFetching={isFetching}
        hideSearch={hideSearch}
        searchPlaceholder={searchPlaceholder}
        extra={toolbarExtra}
        onExportCsv={handleExportCsv}
        onExportPrint={handlePrint}
      />

      {state.viewMode === "card" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((row) => {
            const id = getRowId(row);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onRowClick?.(row)}
                className="rounded-lg border border-apple-hairline bg-apple-canvas p-4 text-left transition-colors hover:bg-apple-canvas-parchment"
              >
                {tableColumns
                  .filter((col) => col.id !== "actions" && col.id !== "select")
                  .slice(0, 4)
                  .map((col) => {
                    const meta = col.meta as DataGridColumnMeta | undefined;
                    const cell = table.getRowModel().rows.find((r) => r.id === id)?.getVisibleCells()
                      .find((c) => c.column.id === col.id);
                    return (
                      <div key={col.id} className="mb-2 last:mb-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-apple-ink-muted-48">
                          {meta?.label ?? col.id}
                        </p>
                        <div className="text-sm text-apple-ink">
                          {cell ? flexRender(col.cell, cell.getContext()) : null}
                        </div>
                      </div>
                    );
                  })}
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className="relative overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2"
          data-grid-print-root
        >
          <DataGridLoading show={isFetching} />
          {shouldVirtualize ? (
            <DataGridVirtualRows
              table={table}
              density={state.density}
              enableSelection={enableRowSelection}
              rowActions={filterRowActions(rowActions, permissions)}
              onRowClick={onRowClick}
              estimatedRowHeight={estimatedRowHeight}
              stickyHeader={stickyHeader}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <DataGridHeader
                  table={table}
                  headerGroups={table.getHeaderGroups()}
                  density={state.density}
                  sticky={stickyHeader}
                  enableSelection={enableRowSelection}
                />
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b border-apple-divider-soft transition-colors last:border-0",
                        onRowClick && "cursor-pointer hover:bg-apple-canvas-parchment",
                        row.getIsSelected() && "bg-apple-primary/5",
                      )}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {enableRowSelection ? (
                        <td className={cn("w-10", DATA_GRID_DENSITY_CELL_PADDING[state.density])}>
                          <input
                            type="checkbox"
                            checked={row.getIsSelected()}
                            onChange={row.getToggleSelectedHandler()}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 rounded border-apple-hairline text-apple-primary focus:ring-2 focus:ring-apple-primary-focus"
                          />
                        </td>
                      ) : null}
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as DataGridColumnMeta | undefined;
                        return (
                          <td
                            key={cell.id}
                            className={cn(
                              "text-caption text-apple-ink-muted-80",
                              DATA_GRID_DENSITY_CELL_PADDING[state.density],
                              meta?.hideOnMobile && "hidden sm:table-cell",
                              meta?.hideOnTablet && "hidden lg:table-cell",
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <DataGridFooter table={table} total={pagination?.total} />
        </div>
      )}

      {enableInfiniteScroll ? (
        <DataGridInfiniteLoader hasNextPage={hasNextPage} isFetching={isFetching} onLoadMore={onLoadMore} />
      ) : pagination ? (
        <DataGridPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          pageSize={pagination.limit}
          onPageChange={(page) => onStateChange({ page })}
          onPageSizeChange={(pageSize) => onStateChange({ pageSize, page: 1 })}
          isLoading={isFetching}
        />
      ) : null}
    </div>
  );
}

export const DataGrid = memo(DataGridInner) as typeof DataGridInner;
