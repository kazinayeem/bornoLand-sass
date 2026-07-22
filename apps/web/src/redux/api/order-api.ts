import { baseApi } from "@/redux/api/base-api";
import { getCartAuthHeaders, logCartDebug, summarizeCartItems, cartIdentityDebug } from "@/lib/cart-session";

type OrderItemData = {
  productId: string;
  variantId?: string;
  variantTitle?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  email?: string;
  label?: "Home" | "Office" | "Other";
  country?: string;
  state?: string;
  city: string;
  area?: string;
  street: string;
  apartment?: string;
  zip?: string;
  landmark?: string;
  orderNotes?: string;
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
  discount?: number;
  tax?: number;
  total: number;
  status: string;
  paymentStatus?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  notes?: string;
  courier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
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

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export type CreateOrderPayload = {
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  deliveryZoneId?: string;
  notes?: string;
  cartId?: string;
  storeId?: string;
  customerId?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    name?: string;
  }>;
};

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<ApiResponse<{ order: OrderData }>, CreateOrderPayload>({
      query: (body) => {
        logCartDebug("create order payload", {
          ...cartIdentityDebug(),
          cartId: body.cartId ?? null,
          storeId: body.storeId ?? null,
          customerId: body.customerId ?? null,
          ...summarizeCartItems(body.items),
        });
        return {
          url: "/orders/create",
          method: "POST",
          body,
          headers: getCartAuthHeaders(),
        };
      },
      invalidatesTags: ["Cart", "Orders", "Customer"],
    }),
    getOrders: builder.query<ApiResponse<{ orders: OrderData[] }>, void>({
      query: () => ({
        url: "/orders",
        headers: getCartAuthHeaders(),
      }),
      providesTags: ["Orders"],
    }),
    getOrder: builder.query<ApiResponse<{ order: OrderData }>, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        headers: getCartAuthHeaders(),
      }),
      providesTags: ["Orders"],
    }),
  }),
});

export const { useCreateOrderMutation, useGetOrdersQuery, useGetOrderQuery } = orderApi;
