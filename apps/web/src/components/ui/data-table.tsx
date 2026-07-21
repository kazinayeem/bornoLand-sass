"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/ui/search-bar";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { TableLoadingOverlay } from "@/components/loading/table-loading-overlay";
import { EmptyState, NoResults } from "@/components/ui/empty-state";
import type { LucideIcon } from "lucide-react";

export type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  render: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
};

export type SortConfig = {
  key: string;
  order: "asc" | "desc";
};

export type BulkAction<T> = {
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "danger" | "warning";
  onClick: (selected: T[]) => void;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  isFetching?: boolean;
  emptyIcon?: LucideIcon;
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
  sort?: SortConfig;
  onSort?: (sort: SortConfig) => void;
  bulkActions?: BulkAction<T>[];
  onRowClick?: (item: T) => void;
  stickyHeader?: boolean;
  className?: string;
  rowClassName?: string;
  hideSearch?: boolean;
  hidePagination?: boolean;
};

export function DataTable<T>({
  data, columns, keyExtractor, isLoading, isFetching,
  emptyIcon, emptyTitle, emptyDescription, emptyAction,
  searchValue, onSearchChange, searchPlaceholder,
  page, totalPages, total, pageSize, onPageChange, onPageSizeChange,
  sort, onSort,
  bulkActions,
  onRowClick,
  stickyHeader = true,
  className, rowClassName,
  hideSearch, hidePagination,
}: DataTableProps<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const allSelected = useMemo(
    () => data.length > 0 && selected.size === data.length,
    [data.length, selected.size]
  );

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelected(new Set());
      setSelectMode(false);
    } else {
      setSelected(new Set(data.map(keyExtractor)));
      setSelectMode(true);
    }
  }, [allSelected, data, keyExtractor]);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (next.size === 0) setSelectMode(false);
      else setSelectMode(true);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
    setSelectMode(false);
  }, []);

  const sortIcon = (key: string) => {
    if (!sort || sort.key !== key) return <ChevronsUpDown className="h-3.5 w-3.5 text-apple-ink-muted-48" />;
    return sort.order === "asc"
      ? <ChevronUp className="h-3.5 w-3.5 text-apple-ink" />
      : <ChevronDown className="h-3.5 w-3.5 text-apple-ink" />;
  };

  const handleSort = (key: string) => {
    if (!onSort) return;
    const currentOrder = sort?.key === key ? sort.order : "desc";
    onSort({ key, order: currentOrder === "asc" ? "desc" : "asc" });
  };

  if (isLoading && data.length === 0) {
    return (
      <div className={className}>
        {!hideSearch && <div className="mb-4"><SearchBar value="" onChange={() => {}} placeholder={searchPlaceholder} /></div>}
        <TableSkeleton rows={5} cols={columns.length} />
      </div>
    );
  }

  if (data.length === 0 && searchValue) {
    return (
      <div className={className}>
        {!hideSearch && onSearchChange && (
          <div className="mb-4">
            <SearchBar value={searchValue} onChange={onSearchChange} placeholder={searchPlaceholder} />
          </div>
        )}
        <NoResults search={searchValue} onClear={() => onSearchChange?.("")} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle || "No data"}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)} aria-busy={isLoading || isFetching || undefined}>
      {/* Toolbar */}
      {(!hideSearch || selectMode) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {!hideSearch && onSearchChange && (
            <SearchBar
              value={searchValue || ""}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              className="w-full sm:max-w-xs"
              aria-busy={isFetching || undefined}
            />
          )}
          {selectMode && bulkActions && (
            <div className="flex items-center gap-2">
              <span className="text-caption text-apple-ink-muted-48">{selected.size} selected</span>
              {bulkActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    action.onClick(data.filter((d) => selected.has(keyExtractor(d))));
                    clearSelection();
                  }}
                  className={cn(
                    "btn-press inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-caption transition-colors",
                    action.variant === "danger" ? "bg-red-50 text-red-700 hover:bg-red-100" :
                    action.variant === "warning" ? "bg-amber-50 text-amber-700 hover:bg-amber-100" :
                    "bg-apple-canvas-parchment text-apple-ink-muted-80 hover:bg-apple-surface-pearl"
                  )}
                >
                  {action.icon && <action.icon className="h-3.5 w-3.5" />}
                  {action.label}
                </button>
              ))}
              <button onClick={clearSelection} className="ml-2 text-caption text-apple-ink-muted-48 hover:text-apple-ink">Cancel</button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="relative overflow-x-auto rounded-lg border border-apple-hairline bg-apple-canvas dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2">
        <TableLoadingOverlay show={isFetching} label="Updating results" />
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className={cn("border-b border-apple-divider-soft bg-apple-canvas-parchment/80", stickyHeader && "sticky top-0 z-10 backdrop-blur-sm dark:bg-apple-surface-tile-3/80")}>
              {bulkActions && (
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-apple-hairline text-apple-primary focus:ring-2 focus:ring-apple-primary-focus"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-caption-strong uppercase tracking-wider text-apple-ink-muted-48",
                    col.sortable && "cursor-pointer select-none hover:text-apple-ink",
                    col.hideOnMobile && "hidden sm:table-cell",
                    col.hideOnTablet && "hidden lg:table-cell",
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && sortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => {
              const id = keyExtractor(item);
              return (
                <motion.tr
                  key={id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={cn(
                    "border-b border-apple-divider-soft transition-colors last:border-0",
                    onRowClick && "cursor-pointer hover:bg-apple-canvas-parchment dark:hover:bg-apple-surface-tile-3",
                    selected.has(id) && "bg-apple-primary/5",
                    rowClassName
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {bulkActions && (
                    <td className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(id)}
                        onChange={() => toggleOne(id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-apple-hairline text-apple-primary focus:ring-2 focus:ring-apple-primary-focus"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-caption text-apple-ink-muted-80 dark:text-apple-body-muted",
                        col.hideOnMobile && "hidden sm:table-cell",
                        col.hideOnTablet && "hidden lg:table-cell",
                        col.className
                      )}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!hidePagination && onPageChange && totalPages !== undefined && (
        <Pagination
          page={page || 1}
          totalPages={totalPages}
          onPageChange={onPageChange}
          total={total}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          aria-busy={isFetching || undefined}
        />
      )}
    </div>
  );
}
