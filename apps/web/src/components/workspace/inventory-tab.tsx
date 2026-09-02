"use client";

import { useState, useCallback, useMemo } from "react";
import {
  useGetInventoryQuery,
  useGetInventoryStatsQuery,
  useBulkArchiveInventoryMutation,
  useBulkDeleteInventoryMutation,
  type InventoryItem,
} from "@/redux/api/inventory-api";
import { useGetCategoriesQuery } from "@/redux/api/category-api";
import { useGetInventoryWarehousesQuery } from "@/redux/api/inventory-api";
import { InventoryHeader } from "@/components/inventory/inventory-header";
import { InventoryKpiSummary } from "@/components/inventory/inventory-kpi-summary";
import {
  InventoryToolbar,
  type InventoryColumnId,
  type InventoryDensity,
  type InventoryFiltersState,
} from "@/components/inventory/inventory-toolbar";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { InventoryBulkBar } from "@/components/inventory/inventory-bulk-bar";
import { AdjustStockDrawer } from "@/components/inventory/adjust-stock-drawer";
import { StockTransferDrawer } from "@/components/inventory/stock-transfer-drawer";
import { InventoryDetailDrawer } from "@/components/inventory/inventory-detail-drawer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

const DEFAULT_VISIBLE_COLUMNS: Record<InventoryColumnId, boolean> = {
  product: true,
  sku: true,
  barcode: true,
  stock: true,
  price: true,
  cost: true,
  margin: true,
  status: true,
  type: true,
  category: true,
  actions: true,
};

const DEFAULT_FILTERS: InventoryFiltersState = {
  search: "",
  status: "",
  stockStatus: "",
  productType: "",
  category: "",
  brand: "",
  vendor: "",
  warehouse: "",
};

export function InventoryTab({
  storeId,
  storeSlug = "store",
  enableHistory = true,
  enableAnalytics = true,
  stockOnly = false,
  forceHistoryTab = false,
}: {
  storeId: string;
  storeSlug?: string;
  enableHistory?: boolean;
  enableAnalytics?: boolean;
  stockOnly?: boolean;
  forceHistoryTab?: boolean;
}) {
  // Density and Column state
  const [density, setDensity] = useState<InventoryDensity>("default");
  const [visibleColumns, setVisibleColumns] = useState<Record<InventoryColumnId, boolean>>(DEFAULT_VISIBLE_COLUMNS);

  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter state
  const [filters, setFilters] = useState<InventoryFiltersState>(DEFAULT_FILTERS);

  // Modals & Drawers state
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [transferTarget, setTransferTarget] = useState<InventoryItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<InventoryItem | null>(null);

  // Bulk confirm dialogs
  const [bulkAction, setBulkAction] = useState<"archive" | "delete" | null>(null);

  // API Queries
  const queryParams = useMemo(() => {
    const p: Record<string, string | number> = {
      page,
      perPage: pageSize,
      sort: sortField,
      order: sortOrder,
    };
    if (filters.search) p.search = filters.search;
    if (filters.status) p.status = filters.status;
    if (filters.stockStatus) p.stockStatus = filters.stockStatus;
    if (filters.productType) p.productType = filters.productType;
    if (filters.category) p.category = filters.category;
    if (filters.brand) p.brand = filters.brand;
    if (filters.vendor) p.vendor = filters.vendor;
    if (filters.warehouse) p.warehouse = filters.warehouse;
    return p;
  }, [page, pageSize, sortField, sortOrder, filters]);

  const { data, isLoading, isFetching } = useGetInventoryQuery(
    { storeId, params: queryParams },
    { skip: !storeId }
  );
  const { data: statsData, isLoading: loadingStats } = useGetInventoryStatsQuery(storeId, {
    skip: !storeId,
  });
  const { data: catsData } = useGetCategoriesQuery(storeId, { skip: !storeId });
  const { data: warehousesData } = useGetInventoryWarehousesQuery({ storeId }, { skip: !storeId });

  const categories = catsData?.data?.categories ?? [];
  const warehouses = warehousesData?.data?.items ?? [];

  const [bulkArchive, { isLoading: archiving }] = useBulkArchiveInventoryMutation();
  const [bulkDelete, { isLoading: deleting }] = useBulkDeleteInventoryMutation();

  const items: InventoryItem[] = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;
  const stats = statsData?.data;

  // Filter Handlers
  const handleFilterChange = useCallback((patch: Partial<InventoryFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const handleSortChange = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortOrder("desc");
      }
      setPage(1);
    },
    [sortField]
  );

  const handleToggleColumn = useCallback((col: InventoryColumnId) => {
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));
  }, []);

  // Selection Handlers
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (items.length === 0) return;
    const allVisibleSelected = items.every((i) => selectedIds.includes(i.productId));
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.productId));
    }
  }, [items, selectedIds]);

  // Bulk Actions
  const handleConfirmBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;

    try {
      if (bulkAction === "archive") {
        await bulkArchive({ storeId, productIds: selectedIds }).unwrap();
        toast.success(`Archived ${selectedIds.length} products`);
      } else if (bulkAction === "delete") {
        await bulkDelete({ storeId, productIds: selectedIds }).unwrap();
        toast.success(`Deleted ${selectedIds.length} products`);
      }
      setSelectedIds([]);
      setBulkAction(null);
    } catch {
      toast.error(`Failed to ${bulkAction} selected products`);
    }
  };

  // Export handler
  const handleExport = () => {
    if (items.length === 0) {
      toast.error("No inventory data to export");
      return;
    }
    const headers = ["Product Name", "SKU", "Barcode", "Stock", "Cost Price", "Selling Price", "Status", "Category"];
    const rows = items.map((i) => [
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.sku || ""}"`,
      `"${i.barcode || ""}"`,
      i.stock,
      i.costPrice || 0,
      i.sellingPrice || 0,
      i.status,
      `"${i.category || ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Inventory exported as CSV");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <InventoryHeader
        onAdjustStock={() => {
          if (items.length > 0) setAdjustTarget(items[0]);
        }}
        onTransferStock={() => {
          if (items.length > 0) setTransferTarget(items[0]);
        }}
        onExport={handleExport}
      />

      {/* KPI Cards Summary */}
      <InventoryKpiSummary
        stats={stats}
        activeStockStatus={filters.stockStatus}
        onSelectStockStatus={(stockStatus) => handleFilterChange({ stockStatus })}
        isLoading={loadingStats}
      />

      {/* Filter Toolbar */}
      <InventoryToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        categories={categories}
        warehouses={warehouses}
        density={density}
        onChangeDensity={setDensity}
        visibleColumns={visibleColumns}
        onToggleColumn={handleToggleColumn}
        totalFiltered={pagination?.totalFiltered ?? pagination?.total}
        isLoading={isFetching}
      />

      {/* Data Table */}
      <InventoryTable
        items={items}
        pagination={pagination}
        density={density}
        visibleColumns={visibleColumns}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onPageChange={setPage}
        onPerPageChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        onSortChange={handleSortChange}
        sortField={sortField}
        sortOrder={sortOrder}
        onRowClick={setDetailTarget}
        onAdjustStock={setAdjustTarget}
        onTransferStock={setTransferTarget}
        isLoading={isLoading || isFetching}
      />

      {/* Floating Bulk Action Bar */}
      <InventoryBulkBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkArchive={() => setBulkAction("archive")}
        onBulkDelete={() => setBulkAction("delete")}
        isProcessing={archiving || deleting}
      />

      {/* Adjust Stock Drawer / Modal */}
      <AdjustStockDrawer
        open={Boolean(adjustTarget)}
        onClose={() => setAdjustTarget(null)}
        product={adjustTarget}
        storeId={storeId}
      />

      {/* Stock Transfer Drawer / Modal */}
      <StockTransferDrawer
        open={Boolean(transferTarget)}
        onClose={() => setTransferTarget(null)}
        product={transferTarget}
        storeId={storeId}
      />

      {/* Product Detail Inspection Slide-over Drawer */}
      <InventoryDetailDrawer
        open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        product={detailTarget}
        storeId={storeId}
        storeSlug={storeSlug}
        onAdjustStock={(item) => {
          setDetailTarget(null);
          setAdjustTarget(item);
        }}
        onTransferStock={(item) => {
          setDetailTarget(null);
          setTransferTarget(item);
        }}
      />

      {/* Bulk Action Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(bulkAction)}
        onClose={() => setBulkAction(null)}
        onConfirm={handleConfirmBulkAction}
        title={bulkAction === "delete" ? "Delete selected products" : "Archive selected products"}
        message={`Are you sure you want to ${bulkAction} ${selectedIds.length} selected product(s)?`}
        confirmLabel={bulkAction === "delete" ? "Delete" : "Archive"}
        variant={bulkAction === "delete" ? "danger" : "warning"}
      />
    </div>
  );
}
