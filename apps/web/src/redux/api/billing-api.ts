import { baseApi } from "@/redux/api/base-api";

export type SubscriptionDuration = "monthly" | "quarterly" | "half_yearly" | "yearly" | "lifetime";

export type BillingConfig = {
  trialEnabled: boolean;
  trialDays: number;
  currencyCode: string;
  currencySymbol: string;
  enabledDurations: Record<string, boolean>;
};

export type StoreSubscription = {
  _id: string;
  storeId: string;
  planId: { _id: string; name: string; slug: string; priceBDT: number; priceYearly?: number };
  duration: SubscriptionDuration;
  status: string;
  isTrial: boolean;
  startDate?: string;
  expireDate?: string;
  renewDate?: string;
  amount: number;
  currency: string;
};

export type BillingNotification = {
  id: string;
  _id: string;
  type: string;
  title: string;
  message: string;
  storeId?: string;
  read: boolean;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type Invoice = {
  _id: string;
  invoiceNumber: string;
  storeId: string | { _id: string; name: string; slug: string; subdomain?: string };
  planId: { name: string; slug: string };
  userId?: string | { _id: string; name: string; email: string };
  duration: SubscriptionDuration;
  subtotal: number;
  discount: number;
  vatAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: string;
  gateway?: string;
  transactionId?: string;
  senderNumber?: string;
  paidAt?: string;
  createdAt: string;
  verificationCode?: string;
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillingConfig: builder.query<ApiEnvelope<BillingConfig>, void>({
      query: () => ({ url: "/subscriptions/billing-config" }),
    }),
    getBillingStoreSubscription: builder.query<
      ApiEnvelope<{ subscription: StoreSubscription | null; remainingDays: number | null }>,
      string
    >({
      query: (storeId) => ({ url: `/subscriptions/stores/${storeId}` }),
      providesTags: (_r, _e, storeId) => [{ type: "Subscriptions", id: storeId }],
    }),
    getNotifications: builder.query<ApiEnvelope<{ notifications: BillingNotification[]; unreadCount: number; pagination: { page: number; limit: number; total: number; pages: number } }>, { page?: number; limit?: number; unreadOnly?: boolean } | void>({
      query: (params) => ({ url: "/notifications", params: params || undefined }),
      providesTags: ["Notifications"],
    }),
    getUnreadNotificationCount: builder.query<ApiEnvelope<{ count: number }>, void>({
      query: () => ({ url: "/notifications/unread-count" }),
      providesTags: ["Notifications"],
    }),
    markNotificationRead: builder.mutation<ApiEnvelope<unknown>, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PUT" }),
      invalidatesTags: ["Notifications"],
    }),
    markAllNotificationsRead: builder.mutation<ApiEnvelope<unknown>, void>({
      query: () => ({ url: "/notifications/read-all", method: "PUT" }),
      invalidatesTags: ["Notifications"],
    }),
    deleteNotification: builder.mutation<ApiEnvelope<unknown>, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: "DELETE" }),
      invalidatesTags: ["Notifications"],
    }),
    clearNotifications: builder.mutation<ApiEnvelope<{ deletedCount: number }>, void>({
      query: () => ({ url: "/notifications", method: "DELETE" }),
      invalidatesTags: ["Notifications"],
    }),
    getStoreInvoices: builder.query<ApiEnvelope<{ invoices: Invoice[] }>, string>({
      query: (storeId) => ({ url: `/invoices/stores/${storeId}` }),
      providesTags: (_r, _e, storeId) => [{ type: "Invoices", id: storeId }],
    }),
    getPlanPrice: builder.query<
      ApiEnvelope<{ plan: Record<string, unknown>; duration: SubscriptionDuration; amount: number }>,
      { planId: string; duration: SubscriptionDuration }
    >({
      query: ({ planId, duration }) => ({ url: `/plans/${planId}/price`, params: { duration } }),
    }),
    runBillingCron: builder.mutation<ApiEnvelope<Record<string, number>>, void>({
      query: () => ({ url: "/subscriptions/cron/run", method: "POST" }),
      invalidatesTags: ["Subscriptions", "Notifications", "Stores", "SubscriptionPayments"],
    }),
    initiateCheckout: builder.mutation<
      ApiEnvelope<{ payment: Record<string, unknown>; mockRedirectUrl: string }>,
      { storeId: string; planId: string; duration: string; paymentMethod: string }
    >({
      query: ({ storeId, ...body }) => ({
        url: `/plans/store/${storeId}/checkout`,
        method: "POST",
        body,
      }),
    }),
    checkoutCallback: builder.mutation<
      ApiEnvelope<Record<string, unknown>>,
      { paymentId: string; status: "success" | "cancelled" }
    >({
      query: (body) => ({ url: "/plans/checkout/callback", method: "POST", body }),
      invalidatesTags: ["Subscriptions", "Notifications", "Stores", "SubscriptionPayments", "Invoices"],
    }),
    // Admin invoice endpoints
    getAdminInvoices: builder.query<
      ApiEnvelope<{ invoices: Invoice[]; total: number; page: number; totalPages: number }>,
      { status?: string; storeId?: string; planId?: string; gateway?: string; search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/invoices/admin/search",
        params: params ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")) : undefined,
      }),
      providesTags: ["Invoices"],
    }),
    getAdminInvoice: builder.query<ApiEnvelope<{ invoice: Invoice }>, string>({
      query: (id) => ({ url: `/invoices/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Invoices", id }],
    }),
    updateInvoiceStatus: builder.mutation<
      ApiEnvelope<{ invoice: Invoice }>,
      { id: string; status: "paid" | "pending" | "rejected" | "refunded" }
    >({
      query: ({ id, status }) => ({
        url: `/invoices/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Invoices"],
    }),
    regenerateInvoiceToken: builder.mutation<ApiEnvelope<{ invoice: Invoice }>, string>({
      query: (id) => ({
        url: `/invoices/${id}/regenerate-token`,
        method: "POST",
      }),
      invalidatesTags: ["Invoices"],
    }),
    emailInvoice: builder.mutation<ApiEnvelope<{ sent: boolean }>, { id: string; email?: string }>({
      query: ({ id, ...body }) => ({
        url: `/invoices/${id}/email`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetBillingConfigQuery,
  useGetBillingStoreSubscriptionQuery,
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useClearNotificationsMutation,
  useGetStoreInvoicesQuery,
  useGetPlanPriceQuery,
  useRunBillingCronMutation,
  useInitiateCheckoutMutation,
  useCheckoutCallbackMutation,
  useGetAdminInvoicesQuery,
  useGetAdminInvoiceQuery,
  useUpdateInvoiceStatusMutation,
  useRegenerateInvoiceTokenMutation,
  useEmailInvoiceMutation,
} = billingApi;
