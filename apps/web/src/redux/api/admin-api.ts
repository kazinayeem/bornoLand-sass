import { baseApi } from "@/redux/api/base-api";

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
  selectedTemplateId?: { _id: string; name: string; slug: string } | string;
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
    })
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
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation
} = adminApi;
