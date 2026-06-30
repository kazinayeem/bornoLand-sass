import { baseApi } from "@/redux/api/base-api";

export type InventoryItem = {
  productId: string;
  variantId?: string;
  name: string;
  variantTitle?: string;
  sku?: string;
  stock: number;
  threshold: number;
  lowStock: boolean;
  status: string;
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<
      ApiEnvelope<{
        items: InventoryItem[];
        summary: { totalSkus: number; lowStockCount: number; outOfStockCount: number; alertsEnabled: boolean };
        lowStock: InventoryItem[];
        outOfStock: InventoryItem[];
      }>,
      string
    >({
      query: (storeId) => ({ url: `/stores/${storeId}/inventory` }),
      providesTags: (_r, _e, storeId) => [{ type: "Inventory", id: storeId }],
    }),
    adjustStock: builder.mutation<
      ApiEnvelope<unknown>,
      { storeId: string; productId: string; quantity: number; variantId?: string }
    >({
      query: ({ storeId, productId, ...body }) => ({
        url: `/stores/${storeId}/inventory/${productId}/adjust`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Inventory", id: storeId }, "Products"],
    }),
  }),
});

export const { useGetInventoryQuery, useAdjustStockMutation } = inventoryApi;
