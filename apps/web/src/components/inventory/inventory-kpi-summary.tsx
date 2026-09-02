"use client";

import { Package, Layers, AlertTriangle, XCircle, TrendingUp, DollarSign, Sparkles } from "lucide-react";
import { formatBDT } from "@/lib/format-bdt";
import type { InventoryStats } from "@/redux/api/inventory-api";
import { cn } from "@/lib/utils";

type InventoryKpiSummaryProps = {
  stats?: InventoryStats;
  activeStockStatus?: string;
  onSelectStockStatus: (status: string) => void;
  isLoading?: boolean;
};

export function InventoryKpiSummary({
  stats,
  activeStockStatus = "",
  onSelectStockStatus,
  isLoading = false,
}: InventoryKpiSummaryProps) {
  const totalProducts = stats?.totalProducts ?? 0;
  const totalStock = stats?.totalStock ?? 0;
  const lowStockCount = stats?.lowStockCount ?? 0;
  const outOfStockCount = stats?.outOfStockCount ?? 0;
  const totalVariants = stats?.totalVariants ?? 0;
  const inventoryValue = stats?.inventoryValue ?? 0;
  const potentialRevenue = stats?.potentialRevenue ?? 0;

  return (
    <div className="space-y-3">
      {/* Primary KPI Row: 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <button
          type="button"
          onClick={() => onSelectStockStatus("")}
          className={cn(
            "flex flex-col justify-between rounded-2xl border p-4 text-left transition-all",
            activeStockStatus === ""
              ? "border-zinc-900 bg-white shadow-xs dark:border-zinc-100 dark:bg-zinc-950 ring-1 ring-zinc-900/10 dark:ring-zinc-100/20"
              : "border-zinc-200/80 bg-white/70 hover:border-zinc-300 hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:hover:border-zinc-700"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Products</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 tabular-nums">
              {isLoading ? "—" : totalProducts.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-400">Unique product catalogue</p>
          </div>
        </button>

        {/* Total Stock */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white/70 p-4 text-left dark:border-zinc-800/80 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Stock</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 tabular-nums">
              {isLoading ? "—" : totalStock.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-400">Physical units on hand</p>
          </div>
        </div>

        {/* Low Stock (Interactive Filter) */}
        <button
          type="button"
          onClick={() => onSelectStockStatus(activeStockStatus === "low_stock" ? "" : "low_stock")}
          className={cn(
            "flex flex-col justify-between rounded-2xl border p-4 text-left transition-all",
            activeStockStatus === "low_stock"
              ? "border-amber-500 bg-amber-50/50 shadow-xs dark:border-amber-500 dark:bg-amber-950/30 ring-1 ring-amber-500/20"
              : "border-zinc-200/80 bg-white/70 hover:border-amber-300 hover:bg-amber-50/30 dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:hover:border-amber-800"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Low Stock Alert</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold tracking-tight text-amber-900 dark:text-amber-200 tabular-nums">
                {isLoading ? "—" : lowStockCount.toLocaleString()}
              </p>
              {lowStockCount > 0 && (
                <span className="rounded-full bg-amber-200/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  Needs Reorder
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-amber-600/80 dark:text-amber-400/70">
              {activeStockStatus === "low_stock" ? "Filtering low stock (Click to clear)" : "Click to view low stock"}
            </p>
          </div>
        </button>

        {/* Out of Stock (Interactive Filter) */}
        <button
          type="button"
          onClick={() => onSelectStockStatus(activeStockStatus === "out_of_stock" ? "" : "out_of_stock")}
          className={cn(
            "flex flex-col justify-between rounded-2xl border p-4 text-left transition-all",
            activeStockStatus === "out_of_stock"
              ? "border-red-500 bg-red-50/50 shadow-xs dark:border-red-500 dark:bg-red-950/30 ring-1 ring-red-500/20"
              : "border-zinc-200/80 bg-white/70 hover:border-red-300 hover:bg-red-50/30 dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:hover:border-red-800"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">Out of Stock</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold tracking-tight text-red-900 dark:text-red-200 tabular-nums">
                {isLoading ? "—" : outOfStockCount.toLocaleString()}
              </p>
              {outOfStockCount > 0 && (
                <span className="rounded-full bg-red-200/60 px-2 py-0.5 text-[10px] font-bold text-red-800 dark:bg-red-900/60 dark:text-red-300">
                  Critical
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-red-600/80 dark:text-red-400/70">
              {activeStockStatus === "out_of_stock" ? "Filtering out of stock (Click to clear)" : "Click to view out of stock"}
            </p>
          </div>
        </button>
      </div>

      {/* Secondary Financial & Variant Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white/60 px-4 py-2.5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Total Variants</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums truncate">
              {isLoading ? "—" : `${totalVariants.toLocaleString()} active variants`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white/60 px-4 py-2.5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
          <DollarSign className="h-4 w-4 text-emerald-500" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Inventory Value (Cost basis)</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums truncate">
              {isLoading ? "—" : formatBDT(inventoryValue)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white/60 px-4 py-2.5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Potential Revenue (Retail basis)</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums truncate">
              {isLoading ? "—" : formatBDT(potentialRevenue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
