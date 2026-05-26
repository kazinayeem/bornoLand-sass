import { baseApi } from "@/redux/api/base-api";

export type StoreOrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
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
    city: string;
    state: string;
    zip: string;
    country?: string;
  };
  notes: string;
  currencyCode: string;
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
      invalidatesTags: (_result, _error, { storeId, orderId }) => [
        { type: "Orders", id: storeId },
        { type: "Orders", id: `${storeId}_${orderId}` }
      ]
    })
  })
});

export const {
  useGetStoreOrdersQuery,
  useGetStoreOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation
} = storeOrderApi;
