import { baseApi } from "@/redux/api/base-api";

type CartItemData = {
  productId: string;
  variantId?: string;
  variantTitle?: string;
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
      providesTags: ["Cart"],
      // The cart preview is mounted inside the builder canvas and re-renders often.
      // Avoid re-fetching on every mount — the cache lives for the session.
      refetchOnMountOrArgChange: false,
    }),
    addToCart: builder.mutation<ApiResponse<CartResponse>, { productId: string; quantity?: number; variantId?: string }>({
      query: (body) => ({
        url: "/cart/add",
        method: "POST",
        body,
        headers: getSessionHeaders()
      }),
      invalidatesTags: ["Cart"]
    }),
    updateCartItem: builder.mutation<ApiResponse<CartResponse>, { productId: string; quantity: number; variantId?: string }>({
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
