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
  _id: string;
  type: string;
  title: string;
  message: string;
  storeId?: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type Invoice = {
  _id: string;
  invoiceNumber: string;
  storeId: string;
  planId: { name: string; slug: string };
  duration: SubscriptionDuration;
  subtotal: number;
  vatAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: string;
  paidAt: string;
  createdAt: string;
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillingConfig: builder.query<ApiEnvelope<BillingConfig>, void>({
      query: () => ({ url: "/subscriptions/billing-config" }),
    }),
    getStoreSubscription: builder.query<
      ApiEnvelope<{ subscription: StoreSubscription | null; remainingDays: number | null }>,
      string
    >({
      query: (storeId) => ({ url: `/subscriptions/stores/${storeId}` }),
      providesTags: (_r, _e, storeId) => [{ type: "Subscriptions", id: storeId }],
    }),
    getNotifications: builder.query<ApiEnvelope<{ notifications: BillingNotification[] }>, void>({
      query: () => ({ url: "/notifications" }),
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
  }),
});

export const {
  useGetBillingConfigQuery,
  useGetStoreSubscriptionQuery,
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetStoreInvoicesQuery,
  useGetPlanPriceQuery,
  useRunBillingCronMutation,
} = billingApi;
