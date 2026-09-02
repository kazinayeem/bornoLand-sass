"use client";

import { useState } from "react";
import {
  X,
  Package,
  Layers,
  TrendingUp,
  DollarSign,
  History,
  AlertTriangle,
  ArrowLeftRight,
  Plus,
  ExternalLink,
} from "lucide-react";
import { formatBDT } from "@/lib/format-bdt";
import { Button } from "@/components/ui/button";
import type { InventoryItem } from "@/redux/api/inventory-api";
import { useGetStockHistoryQuery } from "@/redux/api/inventory-api";
import { cn } from "@/lib/utils";
import Link from "next/link";

type InventoryDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  product: InventoryItem | null;
  storeId: string;
  storeSlug: string;
  onAdjustStock: (product: InventoryItem) => void;
  onTransferStock: (product: InventoryItem) => void;
};

type DrawerTab = "overview" | "history" | "batches";

export function InventoryDetailDrawer({
  open,
  onClose,
  product,
  storeId,
  storeSlug,
  onAdjustStock,
  onTransferStock,
}: InventoryDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");

  const { data: historyData, isLoading: loadingHistory } = useGetStockHistoryQuery(
    {
      storeId,
      params: { productId: product?.productId ?? "", perPage: 10 },
    },
    { skip: !open || !product || !storeId }
  );

  const historyLogs = historyData?.data?.items ?? [];

  if (!open || !product) return null;

  const currentStock = product.stock ?? 0;
  const costPrice = product.costPrice ?? 0;
  const sellingPrice = product.sellingPrice ?? 0;
  const profit = sellingPrice > 0 && costPrice > 0 ? sellingPrice - costPrice : null;
  const margin = profit != null && sellingPrice > 0 ? (profit / sellingPrice) * 100 : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl dark:bg-zinc-950 dark:border-l dark:border-zinc-800">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 p-5 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-6 w-6 text-zinc-400" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {product.name}
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                SKU: {product.sku || "—"} {product.barcode ? `· Barcode: ${product.barcode}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/store/${storeSlug}/products/${product.productId}/edit`}
              target="_blank"
              className="rounded-xl border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-900"
              title="Edit Product Details"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Drawer Tab Navigation */}
        <div className="flex border-b border-zinc-100 px-5 dark:border-zinc-800">
          {[
            { id: "overview", label: "Overview & Stock" },
            { id: "history", label: "Stock Movement Log" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as DrawerTab)}
              className={cn(
                "border-b-2 py-3 px-3 text-xs font-semibold transition-colors",
                activeTab === t.id
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Stock KPI Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <p className="text-[11px] font-medium text-zinc-500">Physical Stock</p>
                  <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {currentStock}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <p className="text-[11px] font-medium text-zinc-500">Reserved</p>
                  <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {product.reservedStock || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <p className="text-[11px] font-medium text-zinc-500">Available</p>
                  <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {product.availableStock ?? currentStock}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <p className="text-[11px] font-medium text-zinc-500">Reorder Alert</p>
                  <p className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {product.lowStockThreshold ?? 5}
                  </p>
                </div>
              </div>

              {/* Financial Valuation Card */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Financial Valuation & Margins
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div>
                    <span className="text-zinc-400">Selling Price:</span>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {sellingPrice > 0 ? formatBDT(sellingPrice) : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Cost Price:</span>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {costPrice > 0 ? formatBDT(costPrice) : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Gross Margin:</span>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {margin != null ? `${margin.toFixed(1)}%` : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Total Value:</span>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {costPrice > 0 ? formatBDT(costPrice * currentStock) : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-2.5 text-xs">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Classification & Details
                </p>
                <div className="flex justify-between border-b border-zinc-100 py-1.5 dark:border-zinc-800">
                  <span className="text-zinc-500">Category</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{product.category || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 py-1.5 dark:border-zinc-800">
                  <span className="text-zinc-500">Brand</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{product.brand || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 py-1.5 dark:border-zinc-800">
                  <span className="text-zinc-500">Vendor</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{product.vendor || "—"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Product Type</span>
                  <span className="font-medium capitalize text-zinc-900 dark:text-zinc-100">{product.productType}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {loadingHistory ? (
                <p className="text-xs text-zinc-400 text-center py-8">Loading history...</p>
              ) : historyLogs.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-8">No inventory movements recorded yet.</p>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {historyLogs.map((log) => (
                    <div key={log._id} className="py-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {log.reason || "Stock Adjustment"}
                        </span>
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 font-bold tabular-nums",
                            log.quantityChange > 0
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : log.quantityChange < 0
                              ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800"
                          )}
                        >
                          {log.quantityChange >= 0 ? `+${log.quantityChange}` : log.quantityChange}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>
                          {log.previousStock} → {log.newStock} units
                        </span>
                        <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                      {log.note && <p className="text-[11px] text-zinc-500 italic">"{log.note}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onTransferStock(product)}
            className="rounded-xl gap-1.5 text-xs"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>Transfer</span>
          </Button>

          <Button
            type="button"
            variant="dark"
            size="sm"
            onClick={() => onAdjustStock(product)}
            className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Adjust Stock</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
