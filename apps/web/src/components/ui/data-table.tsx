"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/ui/search-bar";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
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
  data, columns, keyExtractor, isLoading,
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
    if (!sort || sort.key !== key) return <ChevronsUpDown className="h-3.5 w-3.5 text-zinc-300" />;
    return sort.order === "asc"
      ? <ChevronUp className="h-3.5 w-3.5 text-zinc-900" />
      : <ChevronDown className="h-3.5 w-3.5 text-zinc-900" />;
  };

  const handleSort = (key: string) => {
    if (!onSort) return;
    const currentOrder = sort?.key === key ? sort.order : "desc";
    onSort({ key, order: currentOrder === "asc" ? "desc" : "asc" });
  };

  if (isLoading) {
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
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      {(!hideSearch || selectMode) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {!hideSearch && onSearchChange && (
            <SearchBar value={searchValue || ""} onChange={onSearchChange} placeholder={searchPlaceholder} className="w-full sm:max-w-xs" />
          )}
          {selectMode && bulkActions && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">{selected.size} selected</span>
              {bulkActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    action.onClick(data.filter((d) => selected.has(keyExtractor(d))));
                    clearSelection();
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
                    action.variant === "danger" ? "bg-red-50 text-red-700 hover:bg-red-100" :
                    action.variant === "warning" ? "bg-amber-50 text-amber-700 hover:bg-amber-100" :
                    "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  )}
                >
                  {action.icon && <action.icon className="h-3.5 w-3.5" />}
                  {action.label}
                </button>
              ))}
              <button onClick={clearSelection} className="text-sm text-zinc-400 hover:text-zinc-600 ml-2">Cancel</button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className={cn("border-b border-zinc-100 bg-zinc-50/50", stickyHeader && "sticky top-0 z-10")}>
              {bulkActions && (
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-900"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500",
                    col.sortable && "cursor-pointer select-none hover:text-zinc-700",
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
                    "border-b border-zinc-50 transition-colors last:border-0",
                    onRowClick && "cursor-pointer hover:bg-zinc-50",
                    selected.has(id) && "bg-blue-50/50",
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
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-900"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-sm text-zinc-700",
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
        />
      )}
    </div>
  );
}
