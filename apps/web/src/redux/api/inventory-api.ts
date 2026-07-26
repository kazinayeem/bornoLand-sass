import { baseApi } from "@/redux/api/base-api";

export type InventoryItem = {
  productId: string;
  variantId?: string | null;
  name: string;
  variantTitle?: string;
  slug?: string;
  sku: string;
  barcode: string;
  imageUrl: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  lowStock: boolean;
  outOfStock: boolean;
  costPrice: number;
  sellingPrice: number;
  profit: number;
  status: string;
  productType: string;
  category: string;
  brand: string;
  vendor: string;
  tags: string[];
  featured: boolean;
  hasVariants: boolean;
  updatedAt: string;
  createdAt: string;
};

export type InventoryPagination = {
  page: number;
  perPage: number;
  total: number;
  totalFiltered: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type InventoryListResponse = {
  items: InventoryItem[];
  pagination: InventoryPagination;
};

export type InventoryStats = {
  totalProducts: number;
  totalVariants: number;
  totalItems: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  inventoryValue: number;
  potentialRevenue: number;
  avgPrice: number;
};

export type InventoryAnalytics = {
  mostSold: Array<{ productId: string; name: string; totalSold: number; changes: number }>;
  slowMoving: Array<{ productId: string; name: string; sku: string; stock: number; price: number; imageUrl: string; lastUpdated: string }>;
  deadStock: Array<{ productId: string; name: string; sku: string; stock: number; price: number; imageUrl: string; lastUpdated: string }>;
};

export type StockLog = {
  _id: string;
  productId: string;
  variantId?: string;
  previousStock: number;
  newStock: number;
  beforeQuantity?: number;
  afterQuantity?: number;
  quantityChange: number;
  reason: string;
  note: string;
  updatedBy: string;
  source: string;
  reference?: string;
  createdAt: string;
};

export type StockHistoryResponse = {
  items: StockLog[];
  pagination: { page: number; perPage: number; total: number; totalPages: number; hasNextPage: boolean };
};

export type InventorySupplier = {
  _id: string;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  status: "active" | "inactive" | "blocked";
  notes?: string;
  totalPurchases?: number;
  outstandingDue?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type InventoryWarehouse = {
  _id: string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  isDefault?: boolean;
  status?: string;
  managerName?: string;
  managerEmail?: string;
  createdAt?: string;
};

export type InventoryPurchaseOrder = {
  _id: string;
  poNumber: string;
  status: string;
  supplierId?: string | { _id: string; name?: string };
  warehouseId?: string | { _id: string; name?: string };
  items: Array<{
    productId: string;
    variantId?: string | null;
    sku?: string;
    name?: string;
    quantity: number;
    receivedQty?: number;
    unitCost?: number;
  }>;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  total?: number;
  notes?: string;
  createdAt?: string;
};

export type InventoryTransfer = {
  _id: string;
  transferNumber?: string;
  status: string;
  fromWarehouseId?: string | { _id: string; name?: string };
  toWarehouseId?: string | { _id: string; name?: string };
  items?: Array<{ productId: string; quantity: number; name?: string; sku?: string }>;
  notes?: string;
  createdAt?: string;
};

export type InventoryBatch = {
  _id: string;
  batchNumber: string;
  lotNumber?: string;
  productId: string;
  variantId?: string | null;
  supplierId?: string | null;
  buyCost?: number;
  remainingQuantity: number;
  initialQuantity?: number;
  purchaseDate?: string;
  expiryDate?: string | null;
  status?: string;
};

export type PriceHistoryItem = {
  _id: string;
  productId: string;
  field: string;
  previousPrice: number;
  newPrice: number;
  reason?: string;
  createdBy?: string;
  createdAt: string;
};

export type CostHistoryItem = {
  _id: string;
  productId: string;
  field?: string;
  previousCost: number;
  newCost: number;
  averageCost?: number;
  reason?: string;
  createdAt: string;
};

export type InventoryAuditItem = {
  _id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  actorName?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  device?: string;
  createdAt: string;
};

export type LowStockAlertSettings = {
  lowStockAlertEnabled: boolean;
  lowStockMinQuantity: number | null;
  lowStockAlertEmail: string;
  lowStockNotifyOwner: boolean;
};

type ApiEnvelope<T> = { ok?: boolean; success?: boolean; data?: T; message?: string };

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<ApiEnvelope<InventoryListResponse>, { storeId: string; params?: Record<string, string | number> }>({
      query: ({ storeId, params }) => ({
        url: `/stores/${storeId}/inventory`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: storeId }],
    }),
    getInventoryStats: builder.query<ApiEnvelope<InventoryStats>, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/inventory/stats` }),
      providesTags: (_r, _e, storeId) => [{ type: "Inventory", id: `${storeId}-stats` }],
    }),
    getInventoryAnalytics: builder.query<ApiEnvelope<InventoryAnalytics>, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/inventory/analytics` }),
    }),
    getStockHistory: builder.query<ApiEnvelope<StockHistoryResponse>, { storeId: string; params?: Record<string, string | number> }>({
      query: ({ storeId, params }) => ({
        url: `/stores/${storeId}/inventory/history`,
        params,
      }),
    }),
    adjustStock: builder.mutation<ApiEnvelope<unknown>, { storeId: string; productId: string; quantity: number; variantId?: string; reason?: string; note?: string }>({
      query: ({ storeId, productId, ...body }) => ({
        url: `/stores/${storeId}/inventory/${productId}/adjust`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: storeId }, "Products"],
    }),
    bulkUpdateInventory: builder.mutation<ApiEnvelope<unknown>, { storeId: string; operations: Array<{ productId: string; variantId?: string; stock?: number; adjustment?: number; reason?: string; note?: string }> }>({
      query: ({ storeId, operations }) => ({
        url: `/stores/${storeId}/inventory/bulk/update`,
        method: "POST",
        body: { operations },
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: storeId }, "Products"],
    }),
    bulkArchiveInventory: builder.mutation<ApiEnvelope<unknown>, { storeId: string; productIds: string[] }>({
      query: ({ storeId, productIds }) => ({
        url: `/stores/${storeId}/inventory/bulk/archive`,
        method: "POST",
        body: { productIds },
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: storeId }, "Products"],
    }),
    bulkDeleteInventory: builder.mutation<ApiEnvelope<unknown>, { storeId: string; productIds: string[] }>({
      query: ({ storeId, productIds }) => ({
        url: `/stores/${storeId}/inventory/bulk/delete`,
        method: "POST",
        body: { productIds },
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: storeId }, "Products"],
    }),

    // ─── ERP ────────────────────────────────────────────────────────────────
    getInventorySuppliers: builder.query<
      ApiEnvelope<{ items: InventorySupplier[]; total: number; page: number; perPage: number }>,
      { storeId: string; params?: Record<string, string | number> }
    >({
      query: ({ storeId, params }) => ({ url: `/stores/${storeId}/inventory/suppliers`, params }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-suppliers` }],
    }),
    createInventorySupplier: builder.mutation<ApiEnvelope<{ data?: InventorySupplier }>, { storeId: string; body: Partial<InventorySupplier> }>({
      query: ({ storeId, body }) => ({ url: `/stores/${storeId}/inventory/suppliers`, method: "POST", body }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-suppliers` }],
    }),
    updateInventorySupplier: builder.mutation<ApiEnvelope<unknown>, { storeId: string; id: string; body: Partial<InventorySupplier> }>({
      query: ({ storeId, id, body }) => ({ url: `/stores/${storeId}/inventory/suppliers/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-suppliers` }],
    }),
    deleteInventorySupplier: builder.mutation<ApiEnvelope<unknown>, { storeId: string; id: string }>({
      query: ({ storeId, id }) => ({ url: `/stores/${storeId}/inventory/suppliers/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-suppliers` }],
    }),

    getInventoryWarehouses: builder.query<
      ApiEnvelope<{ items: InventoryWarehouse[]; total: number }>,
      { storeId: string; params?: Record<string, string | number> }
    >({
      query: ({ storeId, params }) => ({ url: `/stores/${storeId}/inventory/warehouses`, params }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-warehouses` }],
    }),
    createInventoryWarehouse: builder.mutation<ApiEnvelope<unknown>, { storeId: string; body: Partial<InventoryWarehouse> }>({
      query: ({ storeId, body }) => ({ url: `/stores/${storeId}/inventory/warehouses`, method: "POST", body }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-warehouses` }],
    }),
    updateInventoryWarehouse: builder.mutation<ApiEnvelope<unknown>, { storeId: string; id: string; body: Partial<InventoryWarehouse> }>({
      query: ({ storeId, id, body }) => ({ url: `/stores/${storeId}/inventory/warehouses/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-warehouses` }],
    }),
    deleteInventoryWarehouse: builder.mutation<ApiEnvelope<unknown>, { storeId: string; id: string }>({
      query: ({ storeId, id }) => ({ url: `/stores/${storeId}/inventory/warehouses/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-warehouses` }],
    }),

    getInventoryPurchaseOrders: builder.query<
      ApiEnvelope<{ items: InventoryPurchaseOrder[]; total: number }>,
      { storeId: string; params?: Record<string, string | number> }
    >({
      query: ({ storeId, params }) => ({ url: `/stores/${storeId}/inventory/purchase-orders`, params }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-pos` }],
    }),
    createInventoryPurchaseOrder: builder.mutation<
      ApiEnvelope<unknown>,
      {
        storeId: string;
        body: {
          supplierId: string;
          warehouseId?: string;
          status?: string;
          items: Array<{ productId: string; quantity: number; unitCost?: number; name?: string; sku?: string }>;
          notes?: string;
        };
      }
    >({
      query: ({ storeId, body }) => ({ url: `/stores/${storeId}/inventory/purchase-orders`, method: "POST", body }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "Inventory", id: `${storeId}-pos` },
        { type: "Inventory", id: storeId },
      ],
    }),
    updateInventoryPurchaseOrder: builder.mutation<ApiEnvelope<unknown>, { storeId: string; id: string; body: Record<string, unknown> }>({
      query: ({ storeId, id, body }) => ({ url: `/stores/${storeId}/inventory/purchase-orders/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-pos` }],
    }),
    receiveInventoryPurchaseOrder: builder.mutation<
      ApiEnvelope<unknown>,
      { storeId: string; id: string; body?: { items?: Array<{ productId: string; quantity: number }> } }
    >({
      query: ({ storeId, id, body }) => ({
        url: `/stores/${storeId}/inventory/purchase-orders/${id}/receive`,
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "Inventory", id: `${storeId}-pos` },
        { type: "Inventory", id: storeId },
        { type: "Inventory", id: `${storeId}-batches` },
      ],
    }),

    getInventoryTransfers: builder.query<
      ApiEnvelope<{ items: InventoryTransfer[]; total: number }>,
      { storeId: string; params?: Record<string, string | number> }
    >({
      query: ({ storeId, params }) => ({ url: `/stores/${storeId}/inventory/transfers`, params }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-transfers` }],
    }),
    createInventoryTransfer: builder.mutation<
      ApiEnvelope<unknown>,
      {
        storeId: string;
        body: {
          fromWarehouseId: string;
          toWarehouseId: string;
          items: Array<{ productId: string; quantity: number; variantId?: string }>;
          notes?: string;
        };
      }
    >({
      query: ({ storeId, body }) => ({ url: `/stores/${storeId}/inventory/transfers`, method: "POST", body }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-transfers` }],
    }),
    approveInventoryTransfer: builder.mutation<ApiEnvelope<unknown>, { storeId: string; id: string }>({
      query: ({ storeId, id }) => ({ url: `/stores/${storeId}/inventory/transfers/${id}/approve`, method: "POST" }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-transfers` }],
    }),
    completeInventoryTransfer: builder.mutation<ApiEnvelope<unknown>, { storeId: string; id: string }>({
      query: ({ storeId, id }) => ({ url: `/stores/${storeId}/inventory/transfers/${id}/complete`, method: "POST" }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "Inventory", id: `${storeId}-transfers` },
        { type: "Inventory", id: storeId },
      ],
    }),

    getInventoryBatches: builder.query<
      ApiEnvelope<{ items: InventoryBatch[]; total: number }>,
      { storeId: string; params?: Record<string, string | number> }
    >({
      query: ({ storeId, params }) => ({ url: `/stores/${storeId}/inventory/batches`, params }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-batches` }],
    }),

    getInventoryPriceHistory: builder.query<
      ApiEnvelope<{ items: PriceHistoryItem[]; total: number }>,
      { storeId: string; params?: Record<string, string | number> }
    >({
      query: ({ storeId, params }) => ({ url: `/stores/${storeId}/inventory/price-history`, params }),
    }),
    getInventoryCostHistory: builder.query<
      ApiEnvelope<{ items: CostHistoryItem[]; total: number }>,
      { storeId: string; params?: Record<string, string | number> }
    >({
      query: ({ storeId, params }) => ({ url: `/stores/${storeId}/inventory/cost-history`, params }),
    }),
    getInventoryAudit: builder.query<
      ApiEnvelope<{ items: InventoryAuditItem[]; total: number }>,
      { storeId: string; params?: Record<string, string | number> }
    >({
      query: ({ storeId, params }) => ({ url: `/stores/${storeId}/inventory/audit`, params }),
    }),
    getInventoryTimeline: builder.query<
      ApiEnvelope<{ items: Array<{ _id: string; eventType: string; title: string; detail?: string; createdAt: string; actorName?: string }> }>,
      { storeId: string; productId: string }
    >({
      query: ({ storeId, productId }) => ({ url: `/stores/${storeId}/inventory/timeline/${productId}` }),
    }),

    getInventoryValuationReport: builder.query<ApiEnvelope<unknown>, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/inventory/reports/valuation` }),
    }),
    getInventoryAgingReport: builder.query<ApiEnvelope<unknown>, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/inventory/reports/aging` }),
    }),

    searchInventoryBarcode: builder.query<ApiEnvelope<unknown>, { storeId: string; barcode: string }>({
      query: ({ storeId, barcode }) => ({
        url: `/stores/${storeId}/inventory/barcode/search`,
        params: { barcode },
      }),
    }),
    generateInventoryBarcode: builder.mutation<
      ApiEnvelope<{ barcode: string }>,
      { storeId: string; productId: string; variantId?: string }
    >({
      query: ({ storeId, ...body }) => ({
        url: `/stores/${storeId}/inventory/barcode/generate`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: storeId }, "Products"],
    }),

    getInventoryAlertSettings: builder.query<ApiEnvelope<LowStockAlertSettings>, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/inventory/alerts/settings` }),
      providesTags: (_r, _e, storeId) => [{ type: "Inventory", id: `${storeId}-alerts` }],
    }),
    updateInventoryAlertSettings: builder.mutation<ApiEnvelope<LowStockAlertSettings>, { storeId: string; body: Partial<LowStockAlertSettings> }>({
      query: ({ storeId, body }) => ({
        url: `/stores/${storeId}/inventory/alerts/settings`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: `${storeId}-alerts` }],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetInventoryStatsQuery,
  useGetInventoryAnalyticsQuery,
  useGetStockHistoryQuery,
  useAdjustStockMutation,
  useBulkUpdateInventoryMutation,
  useBulkArchiveInventoryMutation,
  useBulkDeleteInventoryMutation,
  useGetInventorySuppliersQuery,
  useCreateInventorySupplierMutation,
  useUpdateInventorySupplierMutation,
  useDeleteInventorySupplierMutation,
  useGetInventoryWarehousesQuery,
  useCreateInventoryWarehouseMutation,
  useUpdateInventoryWarehouseMutation,
  useDeleteInventoryWarehouseMutation,
  useGetInventoryPurchaseOrdersQuery,
  useCreateInventoryPurchaseOrderMutation,
  useUpdateInventoryPurchaseOrderMutation,
  useReceiveInventoryPurchaseOrderMutation,
  useGetInventoryTransfersQuery,
  useCreateInventoryTransferMutation,
  useApproveInventoryTransferMutation,
  useCompleteInventoryTransferMutation,
  useGetInventoryBatchesQuery,
  useGetInventoryPriceHistoryQuery,
  useGetInventoryCostHistoryQuery,
  useGetInventoryAuditQuery,
  useGetInventoryTimelineQuery,
  useGetInventoryValuationReportQuery,
  useGetInventoryAgingReportQuery,
  useLazySearchInventoryBarcodeQuery,
  useGenerateInventoryBarcodeMutation,
  useGetInventoryAlertSettingsQuery,
  useUpdateInventoryAlertSettingsMutation,
} = inventoryApi;
