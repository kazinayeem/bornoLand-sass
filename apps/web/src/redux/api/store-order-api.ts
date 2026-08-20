import { baseApi } from "@/redux/api/base-api";

export type StoreOrderItem = {
  productId: string;
  variantId?: string;
  variantTitle?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type OrderShipment = {
  provider?: string;
  providerName?: string;
  consignmentId?: string;
  trackingNumber?: string;
  status?: string;
  environment?: "sandbox" | "production" | "";
  weightKg?: number;
  codAmount?: number;
  packageType?: string;
  specialInstruction?: string;
  estimatedCharge?: number | null;
  estimatedDelivery?: string;
  createdAt?: string;
  cancelledAt?: string;
  lastSyncedAt?: string;
  rawResponse?: unknown;
  lastError?: string;
  autoCreated?: boolean;
  attempts?: number;
};

export type StoreOrder = {
  _id: string;
  storeId: string;
  customerId: { _id: string; name: string; email: string; phone?: string };
  orderNumber: string;
  items: StoreOrderItem[];
  subtotal: number;
  shipping: number;
  deliveryCharge: number;
  deliveryZone: string;
  discount: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    area?: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  };
  notes: string;
  currencyCode: string;
  courier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  shipment?: OrderShipment | null;
  invoiceNumber?: string;
  verificationToken?: string;
  timeline?: Array<{
    status: string;
    note?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

type StoreOrderAnalytics = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  paidRevenue: number;
};

type ListOrdersResponse = {
  data: {
    orders: StoreOrder[];
    analytics: StoreOrderAnalytics;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type SingleOrderResponse = {
  data: { order: StoreOrder };
};

type OrderFilters = {
  storeId: string;
  status?: string;
  paymentStatus?: string;
  from?: string;
  to?: string;
  page?: string;
  limit?: string;
  search?: string;
};

export const storeOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreOrders: builder.query<ListOrdersResponse, OrderFilters>({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/orders`,
        params
      }),
      providesTags: (_result, _error, { storeId }) => [{ type: "Orders", id: storeId }]
    }),
    getStoreOrder: builder.query<SingleOrderResponse, { storeId: string; orderId: string }>({
      query: ({ storeId, orderId }) => ({
        url: `/stores/${storeId}/orders/${orderId}`
      }),
      providesTags: (_result, _error, { storeId, orderId }) => [
        { type: "Orders", id: storeId },
        { type: "Orders", id: `${storeId}_${orderId}` }
      ]
    }),
    updateOrderStatus: builder.mutation<SingleOrderResponse, { storeId: string; orderId: string; status: string }>({
      query: ({ storeId, orderId, status }) => ({
        url: `/stores/${storeId}/orders/${orderId}/status`,
        method: "PUT",
        body: { status }
      }),
      async onQueryStarted({ storeId, orderId, status }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          storeOrderApi.util.updateQueryData("getStoreOrders" as any, { storeId } as any, (draft: any) => {
            const order = draft?.data?.orders?.find((o: any) => o._id === orderId);
            if (order) {
              order.status = status;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { storeId, orderId }) => [
        { type: "Orders", id: storeId },
        { type: "Orders", id: `${storeId}_${orderId}` }
      ]
    }),
    updatePaymentStatus: builder.mutation<SingleOrderResponse, { storeId: string; orderId: string; paymentStatus: string }>({
      query: ({ storeId, orderId, paymentStatus }) => ({
        url: `/stores/${storeId}/orders/${orderId}/payment-status`,
        method: "PUT",
        body: { paymentStatus }
      }),
      async onQueryStarted({ storeId, orderId, paymentStatus }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          storeOrderApi.util.updateQueryData("getStoreOrders" as any, { storeId } as any, (draft: any) => {
            const order = draft?.data?.orders?.find((o: any) => o._id === orderId);
            if (order) {
              order.paymentStatus = paymentStatus;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { storeId, orderId }) => [
        { type: "Orders", id: storeId },
        { type: "Orders", id: `${storeId}_${orderId}` }
      ]
    }),

    getShipmentOptions: builder.query<
      {
        data: {
          order: {
            _id: string;
            orderNumber: string;
            total: number;
            paymentMethod: string;
            paymentStatus: string;
            itemCount: number;
            shippingAddress: {
              fullName: string;
              phone: string;
              street: string;
              area: string;
              city: string;
              state: string;
              zip: string;
              country: string;
              district: string;
              zone: string;
            };
            codAmount: number;
            isCod: boolean;
          };
          available: Array<{
            provider: string;
            name: string;
            environment: "sandbox" | "production";
            connectionStatus: string;
            enabled: boolean;
            recommended: boolean;
            estimatedCharge: number | null;
            estimatedDelivery: string | null;
            defaultWeightKg: number;
            codEnabled: boolean;
            coverage: {
              supported: boolean;
              reason?: string;
              matchedCity?: string;
              matchedZone?: string;
              matchedArea?: string;
            };
          }>;
          unavailable: Array<{
            provider: string;
            name: string;
            reason: string;
            environment?: string;
          }>;
          canCreate: boolean;
        };
      },
      { storeId: string; orderId: string }
    >({
      query: ({ storeId, orderId }) => `/stores/${storeId}/orders/${orderId}/shipment/options`,
    }),
    createOrderShipment: builder.mutation<
      SingleOrderResponse & { data: { order: StoreOrder; shipment?: OrderShipment } },
      {
        storeId: string;
        orderId: string;
        provider: string;
        weightKg?: number;
        specialInstruction?: string;
        packageType?: string;
        codAmount?: number;
      }
    >({
      query: ({ storeId, orderId, ...body }) => ({
        url: `/stores/${storeId}/orders/${orderId}/shipment`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { storeId, orderId }) => [
        { type: "Orders", id: storeId },
        { type: "Orders", id: `${storeId}_${orderId}` },
      ],
    }),
    cancelOrderShipment: builder.mutation<SingleOrderResponse, { storeId: string; orderId: string }>({
      query: ({ storeId, orderId }) => ({
        url: `/stores/${storeId}/orders/${orderId}/shipment/cancel`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { storeId, orderId }) => [
        { type: "Orders", id: storeId },
        { type: "Orders", id: `${storeId}_${orderId}` },
      ],
    }),
    trackOrderShipment: builder.mutation<
      {
        data: {
          order: StoreOrder;
          tracking: { ok: boolean; status?: string; events?: Array<{ at: string; status: string; note?: string }> };
          shipmentStatus: string;
        };
      },
      { storeId: string; orderId: string }
    >({
      query: ({ storeId, orderId }) => ({
        url: `/stores/${storeId}/orders/${orderId}/shipment/track`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { storeId, orderId }) => [
        { type: "Orders", id: storeId },
        { type: "Orders", id: `${storeId}_${orderId}` },
      ],
    }),
    createStoreOrder: builder.mutation<
      SingleOrderResponse,
      { storeId: string; body: Record<string, unknown> }
    >({
      query: ({ storeId, body }) => ({
        url: `/stores/${storeId}/orders`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { storeId }) => [
        { type: "Orders", id: storeId },
      ],
    }),
  }),
});

export const {
  useGetStoreOrdersQuery,
  useLazyGetStoreOrdersQuery,
  useGetStoreOrderQuery,
  useCreateStoreOrderMutation,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
  useGetShipmentOptionsQuery,
  useLazyGetShipmentOptionsQuery,
  useCreateOrderShipmentMutation,
  useCancelOrderShipmentMutation,
  useTrackOrderShipmentMutation,
} = storeOrderApi;

