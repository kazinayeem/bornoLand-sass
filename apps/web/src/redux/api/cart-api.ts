import { baseApi } from "@/redux/api/base-api";

type CartItemData = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  _id?: string;
};

type CartData = {
  _id?: string;
  storeId?: string;
  items: CartItemData[];
  subtotal: number;
  itemCount: number;
};

type CartResponse = {
  cart: CartData;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

function getSessionHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
  if (token) return { Authorization: `Bearer ${token}` };
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("session_id") : null;
  return sessionId ? { "x-session-id": sessionId } : {};
}

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<ApiResponse<CartResponse>, void>({
      query: () => ({
        url: "/cart",
        headers: getSessionHeaders()
      }),
      providesTags: ["Cart"]
    }),
    addToCart: builder.mutation<ApiResponse<CartResponse>, { productId: string; quantity?: number }>({
      query: (body) => ({
        url: "/cart/add",
        method: "POST",
        body,
        headers: getSessionHeaders()
      }),
      invalidatesTags: ["Cart"]
    }),
    updateCartItem: builder.mutation<ApiResponse<CartResponse>, { productId: string; quantity: number }>({
      query: (body) => ({
        url: "/cart/update",
        method: "PUT",
        body,
        headers: getSessionHeaders()
      }),
      invalidatesTags: ["Cart"]
    }),
    removeFromCart: builder.mutation<ApiResponse<CartResponse>, string>({
      query: (productId) => ({
        url: `/cart/remove/${productId}`,
        method: "DELETE",
        headers: getSessionHeaders()
      }),
      invalidatesTags: ["Cart"]
    })
  })
});

export const { useGetCartQuery, useAddToCartMutation, useUpdateCartItemMutation, useRemoveFromCartMutation } = cartApi;
