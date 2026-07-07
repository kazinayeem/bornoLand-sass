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
  quantityChange: number;
  reason: string;
  note: string;
  updatedBy: string;
  source: string;
  createdAt: string;
};

export type StockHistoryResponse = {
  items: StockLog[];
  pagination: { page: number; perPage: number; total: number; totalPages: number; hasNextPage: boolean };
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
} = inventoryApi;
