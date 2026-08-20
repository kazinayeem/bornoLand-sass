import { baseApi } from "@/redux/api/base-api";

export type CouponType = "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";
export type CouponStatus = "draft" | "active" | "expired";

export type CouponTargetItem = {
  _id: string;
  name?: string;
  slug?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  price?: number;
  imageUrl?: string;
};

export type Coupon = {
  _id: string;
  storeId: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  buyQuantity: number;
  getQuantity: number;
  minimumOrderAmount: number;
  maximumDiscount: number;
  firstOrderOnly: boolean;
  customerIds?: (string | CouponTargetItem)[];
  productIds?: (string | CouponTargetItem)[];
  categoryIds?: (string | CouponTargetItem)[];
  usageLimit: number;
  usagePerCustomer: number;
  usageCount: number;
  startsAt?: string;
  expiresAt?: string;
  autoApply: boolean;
  status: CouponStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type ValidateCouponPayload = {
  storeId: string;
  code: string;
  subtotal: number;
  shipping?: number;
  customerId?: string;
  customerEmail?: string;
  items?: {
    productId: string;
    categoryId?: string;
    quantity: number;
    price: number;
  }[];
};

export type ValidateCouponResponse = {
  valid: boolean;
  coupon: {
    id: string;
    code: string;
    name: string;
    type: CouponType;
    value: number;
    minimumOrderAmount: number;
    maximumDiscount: number;
  };
  discount: number;
  shippingDiscount: number;
  finalSubtotal: number;
  finalTotal: number;
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<
      ApiEnvelope<{
        coupons: Coupon[];
        total: number;
        activeCount: number;
        totalUsage: number;
        pagination?: { page: number; limit: number; totalPages: number };
      }>,
      { storeId: string; search?: string; status?: string; page?: number; limit?: number } | string
    >({
      query: (arg) => {
        const storeId = typeof arg === "string" ? arg : arg.storeId;
        const params = new URLSearchParams();
        if (typeof arg !== "string") {
          if (arg.search) params.set("search", arg.search);
          if (arg.status && arg.status !== "all") params.set("status", arg.status);
          if (arg.page) params.set("page", String(arg.page));
          if (arg.limit) params.set("limit", String(arg.limit));
        }
        return { url: `/stores/${storeId}/coupons?${params.toString()}` };
      },
      providesTags: (_r, _e, arg) => [
        { type: "Coupons", id: typeof arg === "string" ? arg : arg.storeId },
      ],
    }),

    createCoupon: builder.mutation<ApiEnvelope<{ coupon: Coupon }>, { storeId: string; data: Partial<Coupon> }>({
      query: ({ storeId, data }) => ({ url: `/stores/${storeId}/coupons`, method: "POST", body: data }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Coupons", id: storeId }],
    }),

    updateCoupon: builder.mutation<ApiEnvelope<{ coupon: Coupon }>, { storeId: string; id: string; data: Partial<Coupon> }>({
      query: ({ storeId, id, data }) => ({ url: `/stores/${storeId}/coupons/${id}`, method: "PUT", body: data }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Coupons", id: storeId }],
    }),

    deleteCoupon: builder.mutation<ApiEnvelope<unknown>, { storeId: string; id: string }>({
      query: ({ storeId, id }) => ({ url: `/stores/${storeId}/coupons/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Coupons", id: storeId }],
    }),

    validateCoupon: builder.mutation<ApiEnvelope<ValidateCouponResponse>, ValidateCouponPayload>({
      query: (payload) => ({
        url: `/public/coupons/validate`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useValidateCouponMutation,
} = couponApi;
