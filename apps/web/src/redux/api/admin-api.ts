import { baseApi } from "@/redux/api/base-api";

export type AdminStoreSettings = {
  store: Record<string, unknown>;
  override: Record<string, unknown> | null;
  usage: {
    products: number;
    categories: number;
    orders: number;
    customers: number;
    staff: number;
    pages: number;
    collections: number;
    reviews: number;
    coupons: number;
    media: number;
    storageMB: number;
    storageLimitMB: number;
    storageUsedBytes: number;
    storageUsedFormatted: string;
    storageLimitFormatted: string;
    storagePercent: number;
    storageRemainingMB: number;
  };
  effectiveLimits: Record<string, number>;
  effectiveFeatures: Record<string, boolean>;
  storage: { limitMB: number; unlimited: boolean };
};

export type AdminStoreStats = {
  revenue: number;
  orders: number;
  products: number;
  customers: number;
  media: number;
  monthlySales: Array<{ _id: { year: number; month: number }; revenue: number; orders: number }>;
  bestSelling: Array<{ _id: string; name: string; totalSold: number; revenue: number }>;
};

export type AdminAnalytics = {
  counts: {
    users: number; stores: number; products: number; orders: number;
    templates: number; suspendedStores: number; activeSubscriptions: number;
    pendingPayments: number;
  };
  revenue: {
    total: number;
    monthly: Array<{ month: string; revenue: number; orders: number }>;
  };
  growth: {
    users: Array<{ month: string; count: number }>;
    stores: Array<{ month: string; count: number }>;
  };
  storesByStatus: Record<string, number>;
  ordersByStatus: Record<string, number>;
  recentOrders: Array<Record<string, unknown>>;
};

export type AdminStore = {
  _id: string; tenantId: string; userId: { _id: string; name: string; email: string };
  name: string; slug: string; subdomain: string; description: string;
  category: string; plan: string; planId: string | null;
  billingStatus: string; subscriptionStatus: string; renewalDate: string | null;
  status: string; logoUrl: string;
  productCount: number; orderCount: number; revenueBDT: number;
  createdAt: string; updatedAt: string;
};

export type AdminUser = {
  _id: string; name: string; email: string; role: string; status: string;
  tenantId: string; storeCount: number; lastLoginAt: string;
  createdAt: string; updatedAt: string;
};

export type AdminProduct = {
  _id: string; storeId: { _id: string; name: string; slug: string; subdomain: string };
  name: string; slug: string; description: string; price: number;
  comparePrice: number; category: string; stock: number; status: string;
  sku: string; imageUrl: string; storeName: string; salesCount: number;
  createdAt: string;
};

export type AdminOrder = {
  _id: string; storeId: { _id: string; name: string; slug: string };
  customerId: { _id: string; name: string; email: string };
  orderNumber: string; items: Array<{ productId: string; name: string; price: number; quantity: number; image: string }>;
  subtotal: number; shipping: number; deliveryCharge: number; discount: number; total: number;
  status: string; paymentMethod: string; paymentStatus: string;
  shippingAddress: { fullName: string; phone: string; street: string; city: string; state: string; zip: string };
  notes: string; createdAt: string;
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminAnalytics: builder.query<ApiEnvelope<AdminAnalytics>, void>({
      query: () => ({ url: "/admin/analytics" }),
      providesTags: ["Dashboard"]
    }),
    getAdminStores: builder.query<ApiEnvelope<{ stores: AdminStore[] }>, void>({
      query: () => ({ url: "/admin/stores" }),
      providesTags: ["Stores"]
    }),
    suspendStore: builder.mutation<ApiEnvelope<never>, string>({
      query: (id) => ({ url: `/admin/stores/${id}/suspend`, method: "PUT" }),
      invalidatesTags: ["Stores", "Dashboard"]
    }),
    activateStore: builder.mutation<ApiEnvelope<never>, string>({
      query: (id) => ({ url: `/admin/stores/${id}/activate`, method: "PUT" }),
      invalidatesTags: ["Stores", "Dashboard"]
    }),
    getAdminSubscriptionOverview: builder.query<ApiEnvelope<{
      totalSubscribers: number;
      totalActive: number;
      totalTrialing: number;
      totalExpired: number;
      totalRevenue: number;
      popularPlan: { name: string; slug: string; subscribers: number } | null;
      plans: Array<{ _id: string; name: string; slug: string; priceBDT: number; subscribers: number; active: number; trialing: number; expired: number }>;
    }>, void>({
      query: () => ({ url: "/admin/subscriptions/overview" }),
      providesTags: ["Subscriptions"],
    }),
    deleteAdminStore: builder.mutation<ApiEnvelope<never>, string>({
      query: (id) => ({ url: `/admin/stores/${id}`, method: "DELETE" }),
      invalidatesTags: ["Stores", "Dashboard"]
    }),
    changeStorePlan: builder.mutation<ApiEnvelope<never>, { id: string; data: { planId?: string; plan?: string } }>({
      query: ({ id, data }) => ({ url: `/admin/stores/${id}/plan`, method: "PUT", body: data }),
      invalidatesTags: ["Stores", "Dashboard"]
    }),
    getAdminUsers: builder.query<ApiEnvelope<{ users: AdminUser[] }>, void>({
      query: () => ({ url: "/admin/users" }),
      providesTags: ["User"]
    }),
    suspendUser: builder.mutation<ApiEnvelope<never>, string>({
      query: (id) => ({ url: `/admin/users/${id}/suspend`, method: "PUT" }),
      invalidatesTags: ["User", "Dashboard"]
    }),
    activateUser: builder.mutation<ApiEnvelope<never>, string>({
      query: (id) => ({ url: `/admin/users/${id}/activate`, method: "PUT" }),
      invalidatesTags: ["User", "Dashboard"]
    }),
    deleteAdminUser: builder.mutation<ApiEnvelope<never>, string>({
      query: (id) => ({ url: `/admin/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["User", "Dashboard"]
    }),
    getAdminProducts: builder.query<ApiEnvelope<{ products: AdminProduct[] }>, void>({
      query: () => ({ url: "/admin/products" }),
      providesTags: ["Products"]
    }),
    getAdminOrders: builder.query<ApiEnvelope<{ orders: AdminOrder[]; total: number; page: number; totalPages: number }>, {
      storeId?: string; status?: string; paymentStatus?: string; from?: string; to?: string; page?: string; limit?: string;
    }>({
      query: (params) => ({ url: "/admin/orders", params }),
      providesTags: ["Orders"]
    }),
    getAdminOrder: builder.query<ApiEnvelope<{ order: AdminOrder }>, string>({
      query: (id) => ({ url: `/admin/orders/${id}` }),
      providesTags: ["Orders"]
    }),
    getAdminPayments: builder.query<ApiEnvelope<{
      subscriptions: Array<Record<string, unknown>>;
      totals: { allTimeRevenue: number; pending: { total: number; count: number }; paid: { total: number; count: number } };
    }>, void>({
      query: () => ({ url: "/admin/payments" }),
      providesTags: ["Dashboard"]
    }),
    getPlatformSettings: builder.query<ApiEnvelope<{ settings: Record<string, unknown> }>, void>({
      query: () => ({ url: "/admin/settings" }),
      providesTags: ["StoreSettings"]
    }),
    updatePlatformSettings: builder.mutation<ApiEnvelope<{ settings: Record<string, unknown> }>, Record<string, unknown>>({
      query: (body) => ({ url: "/admin/settings", method: "PUT", body }),
      invalidatesTags: ["StoreSettings"]
    }),

    // ── Store Override & Enhanced Management ──────────────────
    getAdminStoreSettings: builder.query<ApiEnvelope<AdminStoreSettings>, string>({
      query: (id) => ({ url: `/admin/stores/${id}/settings` }),
      providesTags: (_result, _error, id) => [{ type: "StoreSettings" as const, id }],
    }),
    saveStoreOverrides: builder.mutation<
      ApiEnvelope<{ override: Record<string, unknown> }>,
      { id: string; data: Record<string, unknown> }
    >({
      query: ({ id, data }) => ({ url: `/admin/stores/${id}/overrides`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { id }) => [
        "Stores", "Dashboard", { type: "StoreSettings" as const, id },
      ],
    }),
    changeStorePlanEnhanced: builder.mutation<ApiEnvelope<{ plan: Record<string, unknown> }>, { id: string; planId: string }>({
      query: ({ id, planId }) => ({ url: `/admin/stores/${id}/plan`, method: "PUT", body: { planId } }),
      invalidatesTags: ["Stores", "Dashboard"],
    }),
    manageStoreTrial: builder.mutation<
      ApiEnvelope<{ trial: Record<string, unknown> }>,
      { id: string; action: string; days?: number; endsAt?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/admin/stores/${id}/trial`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "StoreSettings" as const, id }],
    }),
    manageStoreSubscription: builder.mutation<
      ApiEnvelope<{ subscription: Record<string, unknown> }>,
      { id: string; action: string; planId?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/admin/stores/${id}/subscription`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "StoreSettings" as const, id }],
    }),
    resetStore: builder.mutation<ApiEnvelope<{ reset: string }>, { id: string; type: string }>({
      query: ({ id, type }) => ({ url: `/admin/stores/${id}/reset/${type}`, method: "POST" }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "StoreSettings" as const, id }],
    }),
    recalculateStore: builder.mutation<ApiEnvelope<{ usage: Record<string, unknown> }>, string>({
      query: (id) => ({ url: `/admin/stores/${id}/recalculate`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [{ type: "StoreSettings" as const, id }],
    }),
    syncStoreSubscription: builder.mutation<ApiEnvelope<{ synced: Record<string, unknown> }>, string>({
      query: (id) => ({ url: `/admin/stores/${id}/sync-subscription`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [{ type: "StoreSettings" as const, id }],
    }),
    deleteAdminStoreCascade: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/admin/stores/${id}/cascade`, method: "DELETE" }),
      invalidatesTags: ["Stores", "Dashboard"],
    }),
    getAdminStoreStats: builder.query<ApiEnvelope<AdminStoreStats>, string>({
      query: (id) => ({ url: `/admin/stores/${id}/stats` }),
      providesTags: (_result, _error, id) => [{ type: "StoreSettings" as const, id }],
    }),
    getAdminStoreMedia: builder.query<ApiEnvelope<Record<string, unknown>>, string>({
      query: (id) => ({ url: `/admin/stores/${id}/media` }),
      providesTags: (_result, _error, id) => [{ type: "StoreSettings" as const, id }],
    }),
    manageStoreStaff: builder.mutation<
      ApiEnvelope<null>,
      { id: string; action: string; teamMemberId?: string; role?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/admin/stores/${id}/staff`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "StoreSettings" as const, id }],
    }),

    // ── Platform Analytics ───────────────────────────────────
    getPlatformOverview: builder.query<ApiEnvelope<Record<string, unknown>>, void>({
      query: () => ({ url: "/admin/platform/overview" }),
      providesTags: ["Dashboard"],
    }),
    getPlatformRevenueAnalytics: builder.query<ApiEnvelope<Record<string, unknown>>, void>({
      query: () => ({ url: "/admin/platform/revenue-analytics" }),
      providesTags: ["Dashboard"],
    }),
    getPlatformSubscriptionRevenue: builder.query<ApiEnvelope<Record<string, unknown>>, void>({
      query: () => ({ url: "/admin/platform/subscription-revenue" }),
      providesTags: ["Dashboard"],
    }),
    getPlatformPaymentDashboard: builder.query<ApiEnvelope<Record<string, unknown>>, void>({
      query: () => ({ url: "/admin/platform/payment-dashboard" }),
      providesTags: ["Dashboard"],
    }),
    getPlatformFinance: builder.query<ApiEnvelope<Record<string, unknown>>, void>({
      query: () => ({ url: "/admin/platform/finance" }),
      providesTags: ["Dashboard"],
    }),
    getPlatformReports: builder.query<
      ApiEnvelope<Record<string, unknown>>,
      { type: string; from?: string; to?: string }
    >({
      query: ({ type, from, to }) => ({
        url: `/admin/platform/reports/${type}`,
        params: { ...(from && { from }), ...(to && { to }) },
      }),
      providesTags: ["Dashboard"],
    }),
  })
});

export const {
  useGetAdminAnalyticsQuery,
  useGetAdminStoresQuery,
  useSuspendStoreMutation,
  useActivateStoreMutation,
  useDeleteAdminStoreMutation,
  useChangeStorePlanMutation,
  useGetAdminUsersQuery,
  useSuspendUserMutation,
  useActivateUserMutation,
  useDeleteAdminUserMutation,
  useGetAdminProductsQuery,
  useGetAdminOrdersQuery,
  useGetAdminOrderQuery,
  useGetAdminPaymentsQuery,
  useGetAdminSubscriptionOverviewQuery,
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
  useGetAdminStoreSettingsQuery,
  useSaveStoreOverridesMutation,
  useChangeStorePlanEnhancedMutation,
  useManageStoreTrialMutation,
  useManageStoreSubscriptionMutation,
  useResetStoreMutation,
  useRecalculateStoreMutation,
  useSyncStoreSubscriptionMutation,
  useDeleteAdminStoreCascadeMutation,
  useGetAdminStoreStatsQuery,
  useGetAdminStoreMediaQuery,
  useManageStoreStaffMutation,
  useGetPlatformOverviewQuery,
  useGetPlatformRevenueAnalyticsQuery,
  useGetPlatformSubscriptionRevenueQuery,
  useGetPlatformPaymentDashboardQuery,
  useGetPlatformFinanceQuery,
  useGetPlatformReportsQuery,
} = adminApi;
