"use client";

import { memo } from "react";
import type { Table } from "@tanstack/react-table";
import { Columns3, Download, Plus, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DataGridSearch } from "./DataGridSearch";
import { DataGridFilters } from "./DataGridFilters";
import { DataGridBulkActions } from "./DataGridBulkActions";
import { DataGridColumnVisibility } from "./DataGridColumnVisibility";
import { DataGridDensity } from "./DataGridDensity";
import { DataGridViewSwitcher } from "./DataGridViewSwitcher";
import { DataGridExport } from "./DataGridExport";
import type { DataGridBulkAction, DataGridFilterDefinition, DataGridPermissions, DataGridState } from "./types";
import { filterBulkActions } from "./utils/permissions";

type DataGridToolbarProps<TData> = {
  table: Table<TData>;
  state: DataGridState;
  onStateChange: (patch: Partial<DataGridState>) => void;
  onResetFilters: () => void;
  onRefresh?: () => void;
  onCreate?: () => void;
  onImport?: () => void;
  filters?: DataGridFilterDefinition[];
  bulkActions?: DataGridBulkAction<TData>[];
  selectedRows: TData[];
  permissions?: DataGridPermissions;
  isFetching?: boolean;
  hideSearch?: boolean;
  searchPlaceholder?: string;
  extra?: React.ReactNode;
  onExportCsv?: () => void;
  onExportPrint?: () => void;
};

function DataGridToolbarInner<TData>({
  table,
  state,
  onStateChange,
  onResetFilters,
  onRefresh,
  onCreate,
  onImport,
  filters,
  bulkActions,
  selectedRows,
  permissions,
  isFetching,
  hideSearch,
  searchPlaceholder,
  extra,
  onExportCsv,
  onExportPrint,
}: DataGridToolbarProps<TData>) {
  const visibleBulkActions = filterBulkActions(bulkActions, permissions);
  const hasSelection = selectedRows.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {!hideSearch ? (
            <DataGridSearch
              value={state.search}
              onChange={(search) => onStateChange({ search, page: 1 })}
              placeholder={searchPlaceholder}
              isFetching={isFetching}
            />
          ) : null}
          {filters && filters.length > 0 ? (
            <DataGridFilters
              definitions={filters}
              values={state.filters}
              onChange={(filtersPatch) => onStateChange({ filters: { ...state.filters, ...filtersPatch }, page: 1 })}
              onReset={onResetFilters}
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onRefresh ? (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isFetching}>
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              Refresh
            </Button>
          ) : null}
          <DataGridViewSwitcher
            value={state.viewMode}
            onChange={(viewMode) => onStateChange({ viewMode })}
          />
          <DataGridDensity
            value={state.density}
            onChange={(density) => onStateChange({ density })}
          />
          <DataGridColumnVisibility table={table} />
          {(permissions?.canExport ?? true) && (onExportCsv || onExportPrint) ? (
            <DataGridExport onExportCsv={onExportCsv} onPrint={onExportPrint} />
          ) : null}
          {(permissions?.canImport ?? false) && onImport ? (
            <Button variant="outline" size="sm" onClick={onImport}>
              <Upload className="h-4 w-4" /> Import
            </Button>
          ) : null}
          {(permissions?.canCreate ?? false) && onCreate ? (
            <Button size="sm" onClick={onCreate}>
              <Plus className="h-4 w-4" /> Create
            </Button>
          ) : null}
          {extra}
        </div>
      </div>

      {hasSelection && visibleBulkActions.length > 0 ? (
        <DataGridBulkActions
          count={selectedRows.length}
          actions={visibleBulkActions}
          rows={selectedRows}
          onClear={() => onStateChange({ rowSelection: {} })}
        />
      ) : null}
    </div>
  );
}

export const DataGridToolbar = memo(DataGridToolbarInner) as typeof DataGridToolbarInner;
