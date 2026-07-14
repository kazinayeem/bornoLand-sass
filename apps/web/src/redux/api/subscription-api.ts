import { baseApi } from "@/redux/api/base-api";

export type UsageItem = {
  key: string;
  label: string;
  current: number;
  limit: number;
  percent: number;
  isUnlimited: boolean;
  isDisabled: boolean;
  remaining: number;
};

export type StorageInfo = {
  usedMB: number;
  limitMB: number;
  percent: number;
  usedFormatted: string;
  limitFormatted: string;
  remainingMB: number;
};

export type SubscriptionDashboardResponse = {
  store: {
    _id: string;
    name: string;
    slug: string;
    status: string;
    billingStatus: string;
    subscriptionStatus: string;
    trialEndsAt?: string;
    trialStartedAt?: string;
    renewalDate?: string;
    subscriptionDuration?: string;
    createdAt?: string;
    published: boolean;
    allowNewOrders: boolean;
    plan: string;
  };
  plan: {
    _id: string;
    name: string;
    slug: string;
    priceBDT: number;
    trialDays: number;
    limits: Record<string, number>;
    featureToggles: Record<string, boolean>;
    isActive: boolean;
  } | null;
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
};

export type DashboardStatsResponse = {
  usage: UsageItem[];
  storage: StorageInfo;
  plan: {
    _id: string;
    name: string;
    slug: string;
    priceBDT: number;
    trialDays: number;
    featureToggles: Record<string, boolean>;
  } | null;
};

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreSubscription: builder.query<{ success: boolean; data?: SubscriptionDashboardResponse; message?: string }, string>({
      query: (storeId) => ({ url: `/plans/store/${storeId}/subscription` }),
      providesTags: (_result, _error, id) => [{ type: "Subscriptions", id }],
    }),
    getStoreDashboardStats: builder.query<{ success: boolean; data?: DashboardStatsResponse; message?: string }, string>({
      query: (storeId) => ({ url: `/plans/store/${storeId}/stats` }),
      providesTags: (_result, _error, id) => [{ type: "Subscriptions", id }],
    }),
  }),
});

export const {
  useGetStoreSubscriptionQuery,
  useGetStoreDashboardStatsQuery,
} = subscriptionApi;
