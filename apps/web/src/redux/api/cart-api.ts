import { baseApi } from "@/redux/api/base-api";
import { getCartAuthHeaders, logCartDebug, summarizeCartItems } from "@/lib/cart-session";

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
  customerId?: string;
  sessionId?: string;
  items: CartItemData[];
  subtotal: number;
  discount?: number;
  couponCode?: string;
  itemCount: number;
};


type CartResponse = {
  cart: CartData;
  merged?: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export type SyncCartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<ApiResponse<CartResponse>, void>({
      query: () => ({
        url: "/cart",
        headers: getCartAuthHeaders(),
      }),
      providesTags: ["Cart"],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const cart = data?.data?.cart;
          logCartDebug("backend cart fetched", {
            cartId: cart?._id ?? null,
            storeId: cart?.storeId ?? null,
            customerId: cart?.customerId ?? null,
            ...summarizeCartItems(cart?.items ?? []),
          });
        } catch {
          // ignore
        }
      },
    }),
    addToCart: builder.mutation<
      ApiResponse<CartResponse>,
      { productId: string; quantity?: number; variantId?: string }
    >({
      query: (body) => ({
        url: "/cart/add",
        method: "POST",
        body,
        headers: getCartAuthHeaders(),
      }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation<
      ApiResponse<CartResponse>,
      { productId: string; quantity: number; variantId?: string }
    >({
      query: (body) => ({
        url: "/cart/update",
        method: "PUT",
        body,
        headers: getCartAuthHeaders(),
      }),
      invalidatesTags: ["Cart"],
    }),
    removeFromCart: builder.mutation<ApiResponse<CartResponse>, string>({
      query: (productId) => ({
        url: `/cart/remove/${productId}`,
        method: "DELETE",
        headers: getCartAuthHeaders(),
      }),
      invalidatesTags: ["Cart"],
    }),
    mergeCart: builder.mutation<ApiResponse<CartResponse>, void>({
      query: () => ({
        url: "/cart/merge",
        method: "POST",
        headers: getCartAuthHeaders(),
      }),
      invalidatesTags: ["Cart"],
    }),
    syncCart: builder.mutation<ApiResponse<CartResponse>, { items: SyncCartItem[] }>({
      query: (body) => ({
        url: "/cart/sync",
        method: "POST",
        body,
        headers: getCartAuthHeaders(),
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useMergeCartMutation,
  useSyncCartMutation,
  useLazyGetCartQuery,
} = cartApi;
