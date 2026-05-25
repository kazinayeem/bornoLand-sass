import { baseApi } from "@/redux/api/base-api";

type OrderItemData = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type ShippingAddress = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  zip?: string;
  country?: string;
};

type OrderData = {
  _id: string;
  storeId: string;
  customerId: string;
  orderNumber: string;
  items: OrderItemData[];
  subtotal: number;
  shipping: number;
  deliveryCharge: number;
  deliveryZone: string;
  total: number;
  status: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<ApiResponse<{ order: OrderData }>, { shippingAddress: ShippingAddress; paymentMethod?: string; deliveryZoneId?: string; notes?: string }>({
      query: (body) => ({
        url: "/orders/create",
        method: "POST",
        body,
        headers: getAuthHeaders()
      }),
      invalidatesTags: ["Cart", "Orders"]
    }),
    getOrders: builder.query<ApiResponse<{ orders: OrderData[] }>, void>({
      query: () => ({
        url: "/orders",
        headers: getAuthHeaders()
      }),
      providesTags: ["Orders"]
    }),
    getOrder: builder.query<ApiResponse<{ order: OrderData }>, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        headers: getAuthHeaders()
      }),
      providesTags: ["Orders"]
    })
  })
});

export const { useCreateOrderMutation, useGetOrdersQuery, useGetOrderQuery } = orderApi;
