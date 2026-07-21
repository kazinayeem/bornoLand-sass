"use client";

import { useState, useCallback, useEffect } from "react";
import { Loader2, Package, Search, X, AlertTriangle, History, BarChart3, Archive, Trash2, DollarSign, ChevronDown, Eye } from "lucide-react";
import { useGetInventoryQuery, useGetInventoryStatsQuery, useGetInventoryAnalyticsQuery, useGetStockHistoryQuery, useAdjustStockMutation, useBulkUpdateInventoryMutation, useBulkArchiveInventoryMutation, useBulkDeleteInventoryMutation } from "@/redux/api/inventory-api";
import { formatBDT, formatBDTShort } from "@/lib/format-bdt";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column, type BulkAction } from "@/components/ui/data-table";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { InventoryItem as InventoryItemType, StockLog } from "@/redux/api/inventory-api";

type SubTab = "all" | "history" | "analytics";

export function InventoryTab({ storeId }: { storeId: string }) {
  const [subTab, setSubTab] = useState<SubTab>("all");

  return (
    <div className="space-y-5">
      {/* Sub-tab bar */}
      <div className="flex items-center gap-1 rounded-apple-lg border border-apple-hairline bg-white p-1 w-fit">
        {[
          { id: "all" as SubTab, label: "All Inventory", icon: Package },
          { id: "history" as SubTab, label: "Stock History", icon: History },
          { id: "analytics" as SubTab, label: "Analytics", icon: BarChart3 },
        ].map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
              subTab === t.id ? "bg-apple-ink text-white " : "text-apple-ink-muted-48 hover:text-apple-ink"
            )}>
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "all" && <AllInventoryTab storeId={storeId} />}
      {subTab === "history" && <StockHistoryTab storeId={storeId} />}
      {subTab === "analytics" && <AnalyticsTab storeId={storeId} />}
    </div>
  );
}

/* ─────────────── ALL INVENTORY ─────────────── */

function AllInventoryTab({ storeId }: { storeId: string }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [productType, setProductType] = useState("");
  const [sort, setSort] = useState("updatedAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");

  // Adjust stock modal
  const [adjustTarget, setAdjustTarget] = useState<{ productId: string; name: string; variantId?: string; currentStock: number } | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState("manual_adjust");
  const [adjustNote, setAdjustNote] = useState("");

  // Stock history modal (per product)
  const [historyTarget, setHistoryTarget] = useState<{ productId: string; name: string } | null>(null);

  // Bulk confirm dialogs
  const [bulkAction, setBulkAction] = useState<"archive" | "delete" | null>(null);
  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const params: Record<string, string | number> = { page, perPage: pageSize, sort, order };
  if (search) params.search = search;
  if (status) params.status = status;
  if (stockStatus) params.stockStatus = stockStatus;
  if (productType) params.productType = productType;
  if (categoryFilter) params.category = categoryFilter;
  if (brandFilter) params.brand = brandFilter;
  if (vendorFilter) params.vendor = vendorFilter;

  const { data, isLoading, isFetching } = useGetInventoryQuery({ storeId, params });
  const { data: statsData } = useGetInventoryStatsQuery(storeId);
  const { data: historyData } = useGetStockHistoryQuery(
    { storeId, params: { productId: historyTarget?.productId ?? "", limit: 50, page: 1 } },
    { skip: !historyTarget }
  );

  const [adjustStock] = useAdjustStockMutation();
  const [bulkUpdate] = useBulkUpdateInventoryMutation();
  const [bulkArchive] = useBulkArchiveInventoryMutation();
  const [bulkDelete] = useBulkDeleteInventoryMutation();

  const items: InventoryItemType[] = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;
  const stats = statsData?.data;
  const stockHistory = historyData?.data?.items ?? [];

  const handleSort = useCallback((s: { key: string; order: "asc" | "desc" }) => {
    setSort(s.key);
    setOrder(s.order);
    setPage(1);
  }, []);

  const handleAdjustStock = async () => {
    if (!adjustTarget) return;
    try {
      await adjustStock({
        storeId,
        productId: adjustTarget.productId,
        quantity: adjustQty,
        variantId: adjustTarget.variantId,
        reason: adjustReason,
        note: adjustNote,
      }).unwrap();
      toast.success("Stock adjusted");
      setAdjustTarget(null);
      setAdjustQty(0);
      setAdjustNote("");
    } catch { toast.error("Failed to adjust stock"); }
  };

  const handleBulkArchive = async () => {
    try {
      await bulkArchive({ storeId, productIds: bulkIds }).unwrap();
      toast.success(`${bulkIds.length} products archived`);
      setBulkAction(null);
      setBulkIds([]);
    } catch { toast.error("Failed to archive products"); }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete({ storeId, productIds: bulkIds }).unwrap();
      toast.success(`${bulkIds.length} products deleted`);
      setBulkAction(null);
      setBulkIds([]);
    } catch { toast.error("Failed to delete products"); }
  };

  const activeFilterCount = [status, stockStatus, productType, categoryFilter, brandFilter, vendorFilter].filter(Boolean).length;

  const columns: Column<InventoryItemType>[] = [
    {
      key: "name", label: "Product", sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-apple-canvas-parchment flex items-center justify-center overflow-hidden">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <Package className="h-4 w-4 text-apple-ink-muted-48" />
            )}
          </div>
          <div className="min-w-0 max-w-[220px]">
            <p className="text-sm font-medium text-apple-ink truncate">{item.name}</p>
            {item.variantTitle && <p className="text-xs text-apple-ink-muted-48 truncate">{item.variantTitle}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "sku", label: "SKU", sortable: true, hideOnMobile: true,
      render: (item) => (
        <div className="text-xs text-apple-ink-muted-48 font-mono">
          <p>{item.sku || "—"}</p>
          {item.barcode && <p className="text-[10px] text-apple-ink-muted-48">{item.barcode}</p>}
        </div>
      ),
    },
    {
      key: "stock", label: "Stock", sortable: true,
      render: (item) => {
        const isLow = item.lowStock;
        const isOos = item.outOfStock;
        return (
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-semibold tabular-nums",
              isOos ? "text-red-500" : isLow ? "text-amber-600" : "text-emerald-600"
            )}>
              {item.stock}
            </span>
            {item.reservedStock > 0 && (
              <span className="text-[10px] text-apple-ink-muted-48">({item.reservedStock} reserved)</span>
            )}
          </div>
        );
      },
    },
    {
      key: "sellingPrice", label: "Price", sortable: true, hideOnMobile: true,
      render: (item) => (
        <div className="text-sm text-apple-ink-muted-80 tabular-nums">
          <p>{formatBDT(item.sellingPrice)}</p>
          {item.costPrice > 0 && (
            <p className="text-[10px] text-apple-ink-muted-48">Cost: {formatBDT(item.costPrice)}</p>
          )}
        </div>
      ),
    },
    {
      key: "status", label: "Status", sortable: true, hideOnTablet: true,
      render: (item) => (
        <Badge variant={item.status === "active" ? "success" : item.status === "draft" ? "default" : "slate"}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: "productType", label: "Type", hideOnTablet: true,
      render: (item) => (
        <span className="text-xs text-apple-ink-muted-48">{item.productType === "variable" ? "Variable" : "Simple"}</span>
      ),
    },
    {
      key: "category", label: "Category", hideOnTablet: true,
      render: (item) => <span className="text-xs text-apple-ink-muted-48">{item.category || "—"}</span>,
    },
    {
      key: "actions", label: "", className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); setAdjustTarget({ productId: item.productId, name: item.name, variantId: item.variantId ?? undefined, currentStock: item.stock }); }}
            className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Adjust Stock">
            <DollarSign className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setHistoryTarget({ productId: item.productId, name: item.name }); }}
            className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80 transition-colors" title="View History">
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const bulkActions: BulkAction<InventoryItemType>[] = [
    {
      label: "Archive", icon: Archive,
      onClick: (selected) => {
        setBulkIds(selected.map((s) => s.productId));
        setBulkAction("archive");
      },
    },
    {
      label: "Delete", icon: Trash2, variant: "danger",
      onClick: (selected) => {
        setBulkIds(selected.map((s) => s.productId));
        setBulkAction("delete");
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <StatCard label="Total Products" value={String(stats.totalProducts)} />
          <StatCard label="Total Variants" value={String(stats.totalVariants)} />
          <StatCard label="Total Stock" value={String(stats.totalStock)} />
          <StatCard label="Low Stock" value={String(stats.lowStockCount)} color="amber" />
          <StatCard label="Out of Stock" value={String(stats.outOfStockCount)} color="red" />
          <StatCard label="Inventory Value" value={formatBDTShort(stats.inventoryValue)} />
          <StatCard label="Potential Revenue" value={formatBDTShort(stats.potentialRevenue)} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-apple-ink-muted-48" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, SKU, barcode..."
            className="h-9 w-full rounded-xl border border-apple-hairline bg-white pl-9 pr-3 text-xs text-apple-ink outline-none focus:border-blue-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-apple-ink-muted-48 hover:text-apple-ink-muted-48">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-xl border border-apple-hairline bg-white px-2.5 text-xs text-apple-ink-muted-80 outline-none focus:border-blue-400">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select value={stockStatus} onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
          className="h-9 rounded-xl border border-apple-hairline bg-white px-2.5 text-xs text-apple-ink-muted-80 outline-none focus:border-blue-400">
          <option value="">All Stock</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        <select value={productType} onChange={(e) => { setProductType(e.target.value); setPage(1); }}
          className="h-9 rounded-xl border border-apple-hairline bg-white px-2.5 text-xs text-apple-ink-muted-80 outline-none focus:border-blue-400">
          <option value="">All Types</option>
          <option value="simple">Simple</option>
          <option value="variable">Variable</option>
        </select>
        <button onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
            showAdvanced || activeFilterCount > 0
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-apple-hairline bg-white text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
          )}>
          <ChevronDown className={cn("h-3 w-3 transition-transform", showAdvanced && "rotate-180")} />
          Advanced {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-apple-lg border border-apple-hairline bg-white p-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Category</label>
                <input value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  className="h-9 w-full rounded-xl border border-apple-hairline bg-white px-2.5 text-xs text-apple-ink-muted-80 outline-none focus:border-blue-400" placeholder="Filter by category" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Brand</label>
                <input value={brandFilter} onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
                  className="h-9 w-full rounded-xl border border-apple-hairline bg-white px-2.5 text-xs text-apple-ink-muted-80 outline-none focus:border-blue-400" placeholder="Filter by brand" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Vendor</label>
                <input value={vendorFilter} onChange={(e) => { setVendorFilter(e.target.value); setPage(1); }}
                  className="h-9 w-full rounded-xl border border-apple-hairline bg-white px-2.5 text-xs text-apple-ink-muted-80 outline-none focus:border-blue-400" placeholder="Filter by vendor" />
              </div>
              <div className="flex items-end">
                <button onClick={() => { setCategoryFilter(""); setBrandFilter(""); setVendorFilter(""); }}
                  className="h-9 w-full rounded-xl border border-apple-hairline bg-white px-2.5 text-xs font-medium text-apple-ink-muted-48 hover:bg-apple-canvas-parchment transition-colors">
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory Table */}
      <DataTable
        data={items}
        columns={columns}
        keyExtractor={(item) => `${item.productId}-${item.variantId ?? "base"}`}
        isLoading={isLoading || isFetching}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search inventory..."
        emptyIcon={Package}
        emptyTitle="No inventory items"
        emptyDescription="Products appear here once they have stock tracking enabled."
        sort={{ key: sort, order }}
        onSort={handleSort}
        bulkActions={bulkActions}
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        total={pagination?.totalFiltered ?? 0}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Adjust Stock Modal */}
      <AnimatePresence>
        {adjustTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setAdjustTarget(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-apple-lg border border-apple-hairline bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-apple-ink">Adjust Stock</h3>
              <p className="mt-1 text-sm text-apple-ink-muted-48">{adjustTarget.name}</p>
              <p className="mt-1 text-xs text-apple-ink-muted-48">Current stock: <span className="font-semibold">{adjustTarget.currentStock}</span></p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-apple-ink-muted-48">Quantity change (+/-)</label>
                  <div className="flex gap-2">
                    <button onClick={() => setAdjustQty(prev => (prev >= 0 ? -1 : prev - 1))}
                      className="h-9 w-9 rounded-xl border border-apple-hairline text-apple-ink-muted-80 hover:bg-apple-canvas-parchment text-sm font-semibold">−</button>
                    <input type="number" value={adjustQty} onChange={(e) => setAdjustQty(Number(e.target.value))}
                      className="h-9 flex-1 rounded-xl border border-apple-hairline bg-white px-3 text-sm text-center text-apple-ink outline-none focus:border-blue-400 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button onClick={() => setAdjustQty(prev => (prev <= 0 ? 1 : prev + 1))}
                      className="h-9 w-9 rounded-xl border border-apple-hairline text-apple-ink-muted-80 hover:bg-apple-canvas-parchment text-sm font-semibold">+</button>
                  </div>
                  <p className="mt-1 text-xs text-apple-ink-muted-48">
                    New stock: <span className={cn("font-semibold", (adjustTarget.currentStock + adjustQty) < 0 && "text-red-500")}>
                      {Math.max(0, adjustTarget.currentStock + adjustQty)}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-apple-ink-muted-48">Reason</label>
                  <select value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)}
                    className="h-9 w-full rounded-xl border border-apple-hairline bg-white px-2.5 text-xs text-apple-ink-muted-80 outline-none focus:border-blue-400">
                    <option value="manual_adjust">Manual Adjustment</option>
                    <option value="restock">Restock</option>
                    <option value="return">Return</option>
                    <option value="damage">Damage</option>
                    <option value="expired">Expired</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-apple-ink-muted-48">Note (optional)</label>
                  <input value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)}
                    className="h-9 w-full rounded-xl border border-apple-hairline bg-white px-2.5 text-xs text-apple-ink-muted-80 outline-none focus:border-blue-400" placeholder="e.g. Physical count adjustment"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button onClick={() => setAdjustTarget(null)}
                  className="rounded-xl border border-apple-hairline px-4 py-2 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment transition-colors">
                  Cancel
                </button>
                <button onClick={handleAdjustStock}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock History Drawer (per product) */}
      <AnimatePresence>
        {historyTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setHistoryTarget(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] rounded-apple-lg border border-apple-hairline bg-white p-6 shadow-2xl overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-apple-ink">Stock History</h3>
                  <p className="text-sm text-apple-ink-muted-48">{historyTarget.name}</p>
                </div>
                <button onClick={() => setHistoryTarget(null)} className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {stockHistory.length === 0 ? (
                <p className="py-8 text-center text-sm text-apple-ink-muted-48">No stock history recorded yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-apple-canvas-parchment text-left text-[10px] uppercase text-apple-ink-muted-48">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Change</th>
                      <th className="px-3 py-2">Previous</th>
                      <th className="px-3 py-2">New</th>
                      <th className="px-3 py-2">Reason</th>
                      <th className="px-3 py-2">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockHistory.map((log: StockLog) => (
                      <tr key={log._id} className="border-t border-zinc-50">
                        <td className="px-3 py-2.5 text-xs text-apple-ink-muted-48">{new Date(log.createdAt).toLocaleDateString()}</td>
                        <td className={cn("px-3 py-2.5 text-xs font-semibold tabular-nums", log.quantityChange > 0 ? "text-emerald-600" : "text-red-500")}>
                          {log.quantityChange > 0 ? "+" : ""}{log.quantityChange}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-apple-ink-muted-48">{log.previousStock}</td>
                        <td className="px-3 py-2.5 text-xs font-medium text-apple-ink">{log.newStock}</td>
                        <td className="px-3 py-2.5"><span className="rounded-md bg-apple-canvas-parchment px-1.5 py-0.5 text-[10px] font-medium text-apple-ink-muted-80">{log.reason.replace(/_/g, " ")}</span></td>
                        <td className="px-3 py-2.5 text-xs text-apple-ink-muted-48 max-w-[150px] truncate">{log.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Confirm */}
      <ConfirmDialog
        open={bulkAction === "archive"}
        onClose={() => setBulkAction(null)}
        onConfirm={handleBulkArchive}
        title="Archive Products"
        message={`Are you sure you want to archive ${bulkIds.length} products? They can be restored later.`}
        confirmLabel="Archive"
        variant="warning"
      />
      <ConfirmDialog
        open={bulkAction === "delete"}
        onClose={() => setBulkAction(null)}
        onConfirm={handleBulkDelete}
        title="Delete Products"
        message={`Are you sure you want to permanently delete ${bulkIds.length} products? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

/* ─────────────── STOCK HISTORY ─────────────── */

function StockHistoryTab({ storeId }: { storeId: string }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(30);
  const [reasonFilter, setReasonFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");

  const params: Record<string, string | number> = { page, perPage };
  if (reasonFilter) params.reason = reasonFilter;
  if (productFilter) params.productId = productFilter;

  const { data, isLoading } = useGetStockHistoryQuery({ storeId, params });
  const logs: StockLog[] = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  const columns: Column<StockLog>[] = [
    {
      key: "date", label: "Date",
      render: (log) => (
        <div>
          <p className="text-xs text-apple-ink-muted-80">{new Date(log.createdAt).toLocaleDateString()}</p>
          <p className="text-[10px] text-apple-ink-muted-48">{new Date(log.createdAt).toLocaleTimeString()}</p>
        </div>
      ),
    },
    {
      key: "productId", label: "Product",
      render: (log) => <span className="text-xs text-apple-ink-muted-48 font-mono">{log.productId.slice(-8)}</span>,
    },
    {
      key: "change", label: "Change",
      render: (log) => (
        <span className={cn("text-xs font-semibold tabular-nums", log.quantityChange > 0 ? "text-emerald-600" : "text-red-500")}>
          {log.quantityChange > 0 ? "+" : ""}{log.quantityChange}
        </span>
      ),
    },
    {
      key: "previousNew", label: "Stock", hideOnMobile: true,
      render: (log) => <span className="text-xs text-apple-ink-muted-48">{log.previousStock} → <span className="font-medium text-apple-ink">{log.newStock}</span></span>,
    },
    {
      key: "reason", label: "Reason",
      render: (log) => <span className="rounded-md bg-apple-canvas-parchment px-1.5 py-0.5 text-[10px] font-medium text-apple-ink-muted-80">{log.reason.replace(/_/g, " ")}</span>,
    },
    {
      key: "source", label: "Source", hideOnTablet: true,
      render: (log) => <span className="text-[10px] text-apple-ink-muted-48 capitalize">{log.source}</span>,
    },
    {
      key: "note", label: "Note", hideOnTablet: true,
      render: (log) => <span className="text-xs text-apple-ink-muted-48 max-w-[150px] truncate block">{log.note || "—"}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select value={reasonFilter} onChange={(e) => { setReasonFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-xl border border-apple-hairline bg-white px-2.5 text-xs text-apple-ink-muted-80 outline-none focus:border-blue-400">
          <option value="">All Reasons</option>
          {["manual_adjust", "order_placed", "order_refunded", "order_cancelled", "import", "bulk_update", "product_edit", "variant_edit", "restock", "return", "damage", "expired", "other"].map((r) => (
            <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
          ))}
        </select>
        <span className="text-xs text-apple-ink-muted-48">
          {pagination ? `${pagination.total} changes logged` : ""}
        </span>
      </div>
      <DataTable
        data={logs}
        columns={columns}
        keyExtractor={(log) => log._id}
        isLoading={isLoading}
        emptyIcon={History}
        emptyTitle="No stock history"
        emptyDescription="Stock changes are recorded here automatically."
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        total={pagination?.total ?? 0}
        pageSize={perPage}
        onPageChange={setPage}
        onPageSizeChange={setPerPage}
        hideSearch
      />
    </div>
  );
}

/* ─────────────── ANALYTICS ─────────────── */

function AnalyticsTab({ storeId }: { storeId: string }) {
  const { data, isLoading } = useGetInventoryAnalyticsQuery(storeId);
  const analytics = data?.data;

  if (isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Most Sold */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-apple-ink">Most Sold (Last 30 Days)</h3>
        <div className="overflow-hidden rounded-apple-lg border border-apple-hairline bg-white">
          <table className="w-full text-sm">
            <thead className="bg-apple-canvas-parchment text-left text-[10px] uppercase text-apple-ink-muted-48">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Total Sold</th>
                <th className="px-4 py-3">Changes</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.mostSold?.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-xs text-apple-ink-muted-48">No sales data yet.</td></tr>
              )}
              {analytics?.mostSold?.map((item) => (
                <tr key={item.productId} className="border-t border-zinc-50">
                  <td className="px-4 py-3 text-xs font-medium text-apple-ink">{item.name}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-emerald-600">{item.totalSold}</td>
                  <td className="px-4 py-3 text-xs text-apple-ink-muted-48">{item.changes} adjustments</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Slow Moving */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-apple-ink">Slow Moving (No sales in 90 days)</h3>
        <div className="overflow-hidden rounded-apple-lg border border-apple-hairline bg-white">
          <table className="w-full text-sm">
            <thead className="bg-apple-canvas-parchment text-left text-[10px] uppercase text-apple-ink-muted-48">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.slowMoving?.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-apple-ink-muted-48">No slow-moving items.</td></tr>
              )}
              {analytics?.slowMoving?.map((item, i) => (
                <tr key={item.productId ?? i} className="border-t border-zinc-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.imageUrl && <img src={item.imageUrl} className="h-6 w-6 rounded object-cover" />}
                      <span className="text-xs font-medium text-apple-ink">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-apple-ink-muted-48 font-mono">{item.sku || "—"}</td>
                  <td className="px-4 py-3 text-xs text-amber-600 font-semibold">{item.stock}</td>
                  <td className="px-4 py-3 text-xs text-apple-ink-muted-80">{formatBDT(item.price)}</td>
                  <td className="px-4 py-3 text-xs text-apple-ink-muted-48">{new Date(item.lastUpdated).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dead Stock */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-apple-ink">Dead Stock (90 days, 0 stock)</h3>
        <div className="overflow-hidden rounded-apple-lg border border-apple-hairline bg-white">
          <table className="w-full text-sm">
            <thead className="bg-apple-canvas-parchment text-left text-[10px] uppercase text-apple-ink-muted-48">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.deadStock?.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-apple-ink-muted-48">No dead stock items.</td></tr>
              )}
              {analytics?.deadStock?.map((item, i) => (
                <tr key={item.productId ?? i} className="border-t border-zinc-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.imageUrl && <img src={item.imageUrl} className="h-6 w-6 rounded object-cover" />}
                      <span className="text-xs font-medium text-apple-ink">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-apple-ink-muted-48 font-mono">{item.sku || "—"}</td>
                  <td className="px-4 py-3 text-xs text-red-500 font-semibold">{item.stock}</td>
                  <td className="px-4 py-3 text-xs text-apple-ink-muted-80">{formatBDT(item.price)}</td>
                  <td className="px-4 py-3 text-xs text-apple-ink-muted-48">{new Date(item.lastUpdated).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ─────────────── STAT CARD ─────────────── */

function StatCard({ label, value, color = "default" }: { label: string; value: string; color?: "default" | "amber" | "red" }) {
  return (
    <div className={cn(
      "rounded-xl border p-3",
      color === "amber" && "border-amber-100 bg-amber-50",
      color === "red" && "border-red-100 bg-red-50",
      color === "default" && "border-apple-divider-soft"
    )}>
      <p className={cn(
        "text-[10px] font-semibold uppercase tracking-wider",
        color === "amber" && "text-amber-700",
        color === "red" && "text-red-700",
        color === "default" && "text-apple-ink-muted-48"
      )}>{label}</p>
      <p className={cn(
        "mt-0.5 text-lg font-bold tabular-nums",
        color === "amber" && "text-amber-900",
        color === "red" && "text-red-900",
        color === "default" && "text-apple-ink"
      )}>{value}</p>
    </div>
  );
}
