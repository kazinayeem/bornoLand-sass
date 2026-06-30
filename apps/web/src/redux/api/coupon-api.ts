import { baseApi } from "@/redux/api/base-api";

export type Coupon = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";
  value: number;
  minimumOrderAmount: number;
  maximumDiscount: number;
  firstOrderOnly: boolean;
  usageLimit: number;
  usagePerCustomer: number;
  usageCount: number;
  startsAt?: string;
  expiresAt?: string;
  autoApply: boolean;
  status: "draft" | "active" | "expired";
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<ApiEnvelope<{ coupons: Coupon[] }>, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/coupons` }),
      providesTags: (_r, _e, storeId) => [{ type: "Coupons", id: storeId }],
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
  }),
});

export const { useGetCouponsQuery, useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation } = couponApi;
