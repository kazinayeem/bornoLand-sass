"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Columns,
  RotateCcw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type InventoryDensity = "compact" | "default" | "detailed";

export type InventoryColumnId =
  | "product"
  | "sku"
  | "barcode"
  | "stock"
  | "price"
  | "cost"
  | "margin"
  | "status"
  | "type"
  | "category"
  | "actions";

export type InventoryFiltersState = {
  search: string;
  status: string;
  stockStatus: string;
  productType: string;
  category: string;
  brand: string;
  vendor: string;
  warehouse: string;
};

type InventoryToolbarProps = {
  filters: InventoryFiltersState;
  onFilterChange: (patch: Partial<InventoryFiltersState>) => void;
  onResetFilters: () => void;
  categories?: Array<{ _id: string; name: string }>;
  warehouses?: Array<{ _id: string; name: string }>;
  density: InventoryDensity;
  onChangeDensity: (density: InventoryDensity) => void;
  visibleColumns: Record<InventoryColumnId, boolean>;
  onToggleColumn: (col: InventoryColumnId) => void;
  totalFiltered?: number;
  isLoading?: boolean;
};

export function InventoryToolbar({
  filters,
  onFilterChange,
  onResetFilters,
  categories = [],
  warehouses = [],
  density,
  onChangeDensity,
  visibleColumns,
  onToggleColumn,
  totalFiltered,
  isLoading = false,
}: InventoryToolbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Sync external filter changes to local search
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange({ search: localSearch });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, filters.search, onFilterChange]);

  // ⌘K global shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeFiltersCount = [
    Boolean(filters.status),
    Boolean(filters.stockStatus),
    Boolean(filters.productType),
    Boolean(filters.category),
    Boolean(filters.brand),
    Boolean(filters.vendor),
    Boolean(filters.warehouse),
    Boolean(filters.search),
  ].filter(Boolean).length;

  const selectClass =
    "h-9 rounded-xl border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:focus:border-zinc-100 dark:focus:ring-zinc-100";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Unified Search Input */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search name, SKU, barcode... (⌘K)"
            className="h-9 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-8 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onFilterChange({ search: "" });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls: Density & Columns */}
        <div className="flex items-center gap-2">
          {/* Density Selector */}
          <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => onChangeDensity("compact")}
              className={cn(
                "rounded-lg px-2 py-1 text-[11px] font-medium transition-colors",
                density === "compact"
                  ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-950 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() => onChangeDensity("default")}
              className={cn(
                "rounded-lg px-2 py-1 text-[11px] font-medium transition-colors",
                density === "default"
                  ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-950 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => onChangeDensity("detailed")}
              className={cn(
                "rounded-lg px-2 py-1 text-[11px] font-medium transition-colors",
                density === "detailed"
                  ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-950 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              Detailed
            </button>
          </div>

          {/* Column Customizer Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <Columns className="h-3.5 w-3.5 text-zinc-500" />
              <span>Columns</span>
            </button>

            {showColumnsMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowColumnsMenu(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 z-40 mt-1.5 w-48 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="px-2 py-1 text-[11px] font-semibold uppercase text-zinc-400">
                    Visible Columns
                  </p>
                  {(
                    [
                      { id: "sku", label: "SKU" },
                      { id: "barcode", label: "Barcode" },
                      { id: "stock", label: "Stock Level" },
                      { id: "price", label: "Selling Price" },
                      { id: "cost", label: "Cost Price" },
                      { id: "margin", label: "Margin %" },
                      { id: "status", label: "Status" },
                      { id: "type", label: "Product Type" },
                      { id: "category", label: "Category" },
                    ] as Array<{ id: InventoryColumnId; label: string }>
                  ).map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => onToggleColumn(col.id)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      <span>{col.label}</span>
                      {visibleColumns[col.id] && (
                        <Check className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Structured Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Stock Status Filter */}
        <select
          value={filters.stockStatus}
          onChange={(e) => onFilterChange({ stockStatus: e.target.value })}
          className={selectClass}
        >
          <option value="">Stock: All</option>
          <option value="in_stock">In Stock (&gt; 0)</option>
          <option value="low_stock">Low Stock (Needs Reorder)</option>
          <option value="out_of_stock">Out of Stock (0)</option>
        </select>

        {/* Product Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className={selectClass}
        >
          <option value="">Status: All</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Product Type Filter */}
        <select
          value={filters.productType}
          onChange={(e) => onFilterChange({ productType: e.target.value })}
          className={selectClass}
        >
          <option value="">Type: All</option>
          <option value="simple">Simple</option>
          <option value="variable">Variable</option>
        </select>

        {/* Category Filter */}
        {categories.length > 0 && (
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className={selectClass}
          >
            <option value="">Category: All</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        {/* Warehouse Filter */}
        {warehouses.length > 0 && (
          <select
            value={filters.warehouse}
            onChange={(e) => onFilterChange({ warehouse: e.target.value })}
            className={selectClass}
          >
            <option value="">Warehouse: All</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
        )}

        {/* Advanced Filters Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "h-9 gap-1.5 rounded-xl border-zinc-200 text-xs font-medium dark:border-zinc-800",
            showAdvanced && "bg-zinc-100 dark:bg-zinc-900"
          )}
        >
          <SlidersHorizontal className="h-3 w-3 text-zinc-500" />
          <span>More Filters</span>
        </Button>

        {/* Clear Filters (Only visible when active) */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="h-3 w-3 text-zinc-500" />
            <span>Clear Filters ({activeFiltersCount})</span>
          </button>
        )}

        {/* Total Results Counter */}
        {typeof totalFiltered === "number" && (
          <span className="ml-auto text-xs text-zinc-400 font-medium">
            {totalFiltered.toLocaleString()} products found
          </span>
        )}
      </div>

      {/* Collapsible Advanced Filters Drawer */}
      {showAdvanced && (
        <div className="grid gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Brand</label>
            <input
              type="text"
              value={filters.brand}
              onChange={(e) => onFilterChange({ brand: e.target.value })}
              placeholder="Filter by brand..."
              className="h-8 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Vendor / Supplier</label>
            <input
              type="text"
              value={filters.vendor}
              onChange={(e) => onFilterChange({ vendor: e.target.value })}
              placeholder="Filter by vendor..."
              className="h-8 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
        </div>
      )}
    </div>
  );
}
