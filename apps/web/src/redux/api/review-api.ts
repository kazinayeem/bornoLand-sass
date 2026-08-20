import { baseApi } from "./base-api";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ReviewItem = {
  _id: string;
  storeId: string;
  productId: string;
  orderId?: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  rating: number;
  title?: string;
  body?: string;
  imageUrl?: string;
  images?: string[];
  status: ReviewStatus;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GetStoreReviewsResponse = {
  reviews: ReviewItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  averageRating: number;
};

export type GetPublicReviewsResponse = {
  reviews: ReviewItem[];
  total: number;
  averageRating: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  page: number;
  limit: number;
  totalPages: number;
};

export type SubmitReviewPayload = {
  storeId: string;
  productId: string;
  orderId?: string;
  customerName: string;
  customerEmail?: string;
  rating: number;
  title?: string;
  body?: string;
  imageUrl?: string;
  images?: string[];
};

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreReviews: builder.query<
      { success: boolean; data: GetStoreReviewsResponse },
      { storeId: string; status?: string; productId?: string; search?: string; page?: number; limit?: number }
    >({
      query: ({ storeId, status, productId, search, page = 1, limit = 20 }) => {
        const params = new URLSearchParams();
        if (status && status !== "all") params.set("status", status);
        if (productId) params.set("productId", productId);
        if (search) params.set("search", search);
        params.set("page", String(page));
        params.set("limit", String(limit));
        return {
          url: `/stores/${storeId}/reviews?${params.toString()}`,
        };
      },
      providesTags: (result) =>
        result?.data?.reviews
          ? [
              ...result.data.reviews.map(({ _id }) => ({ type: "Reviews" as const, id: _id })),
              { type: "Reviews", id: "LIST" },
            ]
          : [{ type: "Reviews", id: "LIST" }],
    }),

    getPublicReviews: builder.query<
      { success: boolean; data: GetPublicReviewsResponse },
      { storeId: string; productId?: string; page?: number; limit?: number }
    >({
      query: ({ storeId, productId, page = 1, limit = 10 }) => {
        const params = new URLSearchParams({ storeId });
        if (productId) params.set("productId", productId);
        params.set("page", String(page));
        params.set("limit", String(limit));
        return {
          url: `/public/reviews?${params.toString()}`,
        };
      },
      providesTags: (result) =>
        result?.data?.reviews
          ? [
              ...result.data.reviews.map(({ _id }) => ({ type: "Reviews" as const, id: _id })),
              { type: "Reviews", id: "PUBLIC_LIST" },
            ]
          : [{ type: "Reviews", id: "PUBLIC_LIST" }],
    }),

    updateReviewStatus: builder.mutation<
      { success: boolean; data: { review: ReviewItem } },
      { storeId: string; reviewId: string; status: ReviewStatus }
    >({
      query: ({ storeId, reviewId, status }) => ({
        url: `/stores/${storeId}/reviews/${reviewId}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: "Reviews", id: reviewId },
        { type: "Reviews", id: "LIST" },
        { type: "Reviews", id: "PUBLIC_LIST" },
      ],
    }),

    deleteReview: builder.mutation<
      { success: boolean; message?: string },
      { storeId: string; reviewId: string }
    >({
      query: ({ storeId, reviewId }) => ({
        url: `/stores/${storeId}/reviews/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Reviews", id: "LIST" }, { type: "Reviews", id: "PUBLIC_LIST" }],
    }),

    submitReview: builder.mutation<
      { success: boolean; data: { review: ReviewItem } },
      SubmitReviewPayload
    >({
      query: (payload) => ({
        url: `/public/reviews`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "Reviews", id: "LIST" }],
    }),
  }),
});

export const {
  useGetStoreReviewsQuery,
  useGetPublicReviewsQuery,
  useUpdateReviewStatusMutation,
  useDeleteReviewMutation,
  useSubmitReviewMutation,
} = reviewApi;
