"use client";

import { useState } from "react";
import {
  Package,
  AlertTriangle,
  XCircle,
  MoreVertical,
  Plus,
  ArrowLeftRight,
  Eye,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { formatBDT } from "@/lib/format-bdt";
import type { InventoryItem, InventoryPagination } from "@/redux/api/inventory-api";
import type { InventoryColumnId, InventoryDensity } from "@/components/inventory/inventory-toolbar";
import { cn } from "@/lib/utils";

type InventoryTableProps = {
  items: InventoryItem[];
  pagination?: InventoryPagination;
  density: InventoryDensity;
  visibleColumns: Record<InventoryColumnId, boolean>;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSortChange: (sortField: string) => void;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onRowClick: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem) => void;
  onTransferStock: (item: InventoryItem) => void;
  isLoading?: boolean;
};

export function InventoryTable({
  items,
  pagination,
  density,
  visibleColumns,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onPageChange,
  onPerPageChange,
  onSortChange,
  sortField,
  sortOrder,
  onRowClick,
  onAdjustStock,
  onTransferStock,
  isLoading = false,
}: InventoryTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const isAllSelected = items.length > 0 && items.every((i) => selectedIds.includes(i.productId));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const rowPadding =
    density === "compact"
      ? "py-2 px-3 text-xs"
      : density === "detailed"
      ? "py-4 px-4 text-xs"
      : "py-3 px-3.5 text-xs";

  const thumbnailSize =
    density === "compact" ? "h-8 w-8" : density === "detailed" ? "h-12 w-12" : "h-10 w-10";

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden dark:border-zinc-800 dark:bg-zinc-950">
      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
              <th className="w-10 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isSomeSelected;
                  }}
                  onChange={onToggleSelectAll}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700"
                />
              </th>

              {visibleColumns.product && (
                <th
                  onClick={() => onSortChange("name")}
                  className="px-3.5 py-3 cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-200"
                >
                  Product
                </th>
              )}

              {visibleColumns.sku && (
                <th
                  onClick={() => onSortChange("sku")}
                  className="px-3.5 py-3 cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-200"
                >
                  SKU / Barcode
                </th>
              )}

              {visibleColumns.stock && (
                <th
                  onClick={() => onSortChange("stock")}
                  className="px-3.5 py-3 cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-200"
                >
                  Stock Level
                </th>
              )}

              {visibleColumns.price && (
                <th
                  onClick={() => onSortChange("price")}
                  className="px-3.5 py-3 cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-200"
                >
                  Selling Price
                </th>
              )}

              {visibleColumns.cost && (
                <th
                  onClick={() => onSortChange("costPrice")}
                  className="px-3.5 py-3 cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-200"
                >
                  Cost & Margin
                </th>
              )}

              {visibleColumns.status && <th className="px-3.5 py-3">Status</th>}

              {visibleColumns.type && <th className="px-3.5 py-3">Type</th>}

              {visibleColumns.category && <th className="px-3.5 py-3">Category</th>}

              <th className="w-20 px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {isLoading && items.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-xs text-zinc-400">
                  Loading inventory records...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center">
                  <Package className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                  <p className="mt-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    No products matching current filter
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Try adjusting your search keywords or resetting status filters.
                  </p>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isSelected = selectedIds.includes(item.productId);
                const isLow = item.lowStock || (item.stock > 0 && item.stock <= (item.lowStockThreshold ?? 5));
                const isOut = item.outOfStock || item.stock === 0;
                const cost = item.costPrice || 0;
                const price = item.sellingPrice || 0;
                const margin = price > 0 && cost > 0 ? (((price - cost) / price) * 100).toFixed(0) : null;

                return (
                  <tr
                    key={item.productId + (item.variantId || "")}
                    className={cn(
                      "group transition-colors hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40",
                      isSelected && "bg-zinc-50 dark:bg-zinc-900/60"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(item.productId)}
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700"
                      />
                    </td>

                    {/* Product Cell */}
                    {visibleColumns.product && (
                      <td className={rowPadding}>
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => onRowClick(item)}
                        >
                          <div
                            className={cn(
                              "shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden flex items-center justify-center",
                              thumbnailSize
                            )}
                          >
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-4 w-4 text-zinc-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900 group-hover:text-zinc-950 dark:text-zinc-100 dark:group-hover:text-white truncate max-w-xs">
                              {item.name}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-400">
                              {item.variantTitle && (
                                <span className="rounded-md bg-zinc-100 px-1.5 py-0.2 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                  {item.variantTitle}
                                </span>
                              )}
                              {item.hasVariants && !item.variantTitle && (
                                <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  <span>Has variants</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* SKU & Barcode */}
                    {visibleColumns.sku && (
                      <td className={rowPadding}>
                        <div className="font-mono text-[11px]">
                          <p className="text-zinc-900 dark:text-zinc-100 font-semibold">{item.sku || "—"}</p>
                          {item.barcode && <p className="text-zinc-400">{item.barcode}</p>}
                        </div>
                      </td>
                    )}

                    {/* Stock Level with Badge & Threshold */}
                    {visibleColumns.stock && (
                      <td className={rowPadding}>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
                              isOut
                                ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                : isLow
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            )}
                          >
                            {isOut ? (
                              <XCircle className="h-3 w-3" />
                            ) : isLow ? (
                              <AlertTriangle className="h-3 w-3" />
                            ) : null}
                            <span>{item.stock} in stock</span>
                          </span>

                          {item.lowStockThreshold != null && (
                            <span className="text-[10px] text-zinc-400" title={`Reorder threshold: ${item.lowStockThreshold}`}>
                              (min {item.lowStockThreshold})
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Price */}
                    {visibleColumns.price && (
                      <td className={rowPadding}>
                        <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                          {price > 0 ? formatBDT(price) : "—"}
                        </span>
                      </td>
                    )}

                    {/* Cost & Margin */}
                    {visibleColumns.cost && (
                      <td className={rowPadding}>
                        <div className="tabular-nums">
                          <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                            {cost > 0 ? formatBDT(cost) : "—"}
                          </span>
                          {margin != null && (
                            <span className="ml-2 rounded bg-emerald-50 px-1 py-0.2 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              {margin}% margin
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Status */}
                    {visibleColumns.status && (
                      <td className={rowPadding}>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                            item.status === "active"
                              ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
                          )}
                        >
                          {item.status}
                        </span>
                      </td>
                    )}

                    {/* Product Type */}
                    {visibleColumns.type && (
                      <td className={rowPadding}>
                        <span className="capitalize text-zinc-500 dark:text-zinc-400">
                          {item.productType}
                        </span>
                      </td>
                    )}

                    {/* Category */}
                    {visibleColumns.category && (
                      <td className={rowPadding}>
                        <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                          {item.category || "—"}
                        </span>
                      </td>
                    )}

                    {/* Row Actions */}
                    <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onAdjustStock(item)}
                          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                          title="Adjust Stock"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onRowClick(item)}
                          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Rows per page:</span>
            <select
              value={pagination.perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-zinc-400">
              Showing {((pagination.page - 1) * pagination.perPage) + 1}–
              {Math.min(pagination.page * pagination.perPage, pagination.totalFiltered || pagination.total)} of{" "}
              {pagination.totalFiltered || pagination.total}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!pagination.hasPrevPage}
              onClick={() => onPageChange(pagination.page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 disabled:opacity-40 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => onPageChange(pagination.page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 disabled:opacity-40 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
