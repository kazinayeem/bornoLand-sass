import { baseApi } from "@/redux/api/base-api";

export type PlatformPaymentMethod = {
  _id: string;
  type: "bkash" | "nagad" | "rocket" | "bank";
  label: string;
  accountNumber: string;
  merchantNumber?: string;
  personalNumber?: string;
  accountName?: string;
  bankName?: string;
  branchName?: string;
  instructions?: string;
  qrCodeUrl?: string;
  enabled: boolean;
  sortOrder: number;
};

export type SubscriptionPayment = {
  _id: string;
  storeId: string | { _id: string; name: string; slug: string; subdomain?: string };
  userId: string | { _id: string; name: string; email: string };
  tenantId?: string | { _id: string; name: string; slug: string };
  planId: string | { _id: string; name: string; slug: string; priceBDT: number };
  duration?: "monthly" | "quarterly" | "half_yearly" | "yearly" | "lifetime";
  amount: number;
  currency: string;
  paymentMethod: string;
  senderNumber: string;
  transactionId: string;
  screenshotUrl?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected" | "expired" | "requested_info";
  approvedAt?: string;
  rejectedReason?: string;
  requestInfoMessage?: string;
  requestInfoAt?: string;
  subscriptionExpireDate?: string;
  createdAt: string;
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

type SubmitPaymentRequest = {
  storeId: string;
  planId: string;
  duration?: "monthly" | "quarterly" | "half_yearly" | "yearly" | "lifetime";
  amount: number;
  paymentMethod: "bkash" | "nagad" | "rocket" | "bank";
  senderNumber: string;
  transactionId: string;
  screenshotUrl?: string;
  notes?: string;
};

export const subscriptionPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformPaymentMethods: builder.query<ApiEnvelope<{ methods: PlatformPaymentMethod[] }>, void>({
      query: () => ({ url: "/subscription-payments/platform-methods" }),
      providesTags: ["SubscriptionPayments"],
    }),
    getStoreSubscriptionPayments: builder.query<ApiEnvelope<{ payments: SubscriptionPayment[] }>, string>({
      query: (storeId) => ({ url: `/subscription-payments/stores/${storeId}` }),
      providesTags: (_r, _e, storeId) => [{ type: "SubscriptionPayments", id: storeId }],
    }),
    submitSubscriptionPayment: builder.mutation<ApiEnvelope<{ payment: SubscriptionPayment }>, SubmitPaymentRequest>({
      query: ({ storeId, ...body }) => ({
        url: `/subscription-payments/stores/${storeId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SubscriptionPayments", "Stores"],
    }),
    getAdminSubscriptionPayments: builder.query<
      ApiEnvelope<{ payments: SubscriptionPayment[] }>,
      { status?: string } | void
    >({
      query: (params) => ({
        url: "/subscription-payments",
        params: params?.status ? { status: params.status } : undefined,
      }),
      providesTags: ["SubscriptionPayments"],
    }),
    approveSubscriptionPayment: builder.mutation<ApiEnvelope<{ payment: SubscriptionPayment }>, string>({
      query: (id) => ({ url: `/subscription-payments/${id}/approve`, method: "POST", body: {} }),
      invalidatesTags: ["SubscriptionPayments", "Stores", "Dashboard"],
    }),
    rejectSubscriptionPayment: builder.mutation<
      ApiEnvelope<{ payment: SubscriptionPayment }>,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/subscription-payments/${id}/reject`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["SubscriptionPayments", "Stores"],
    }),
    requestInfoSubscriptionPayment: builder.mutation<
      ApiEnvelope<{ payment: SubscriptionPayment }>,
      { id: string; message: string }
    >({
      query: ({ id, message }) => ({
        url: `/subscription-payments/${id}/request-info`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: ["SubscriptionPayments"],
    }),
    getAdminPlatformPaymentMethods: builder.query<ApiEnvelope<{ methods: PlatformPaymentMethod[] }>, void>({
      query: () => ({ url: "/subscription-payments/admin/methods" }),
      providesTags: ["SubscriptionPayments"],
    }),
    updateAdminPlatformPaymentMethod: builder.mutation<
      ApiEnvelope<{ method: PlatformPaymentMethod }>,
      { type: string; data: Partial<PlatformPaymentMethod> }
    >({
      query: ({ type, data }) => ({
        url: `/subscription-payments/admin/methods/${type}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SubscriptionPayments"],
    }),
  }),
});

export const {
  useGetPlatformPaymentMethodsQuery,
  useGetStoreSubscriptionPaymentsQuery,
  useSubmitSubscriptionPaymentMutation,
  useGetAdminSubscriptionPaymentsQuery,
  useApproveSubscriptionPaymentMutation,
  useRejectSubscriptionPaymentMutation,
  useRequestInfoSubscriptionPaymentMutation,
  useGetAdminPlatformPaymentMethodsQuery,
  useUpdateAdminPlatformPaymentMethodMutation,
} = subscriptionPaymentApi;
