import { baseApi } from "./base-api";

export type PixelStatus = "not_configured" | "connected" | "active" | "invalid" | "disabled";

export type MetaPixelConfig = {
  enabled: boolean;
  pixelId: string;
  advancedMatching: boolean;
  automaticEvents: boolean;
  testEventCode?: string;
  lastVerifiedAt?: string | null;
  status: PixelStatus;
};

export type TikTokPixelConfig = {
  enabled: boolean;
  pixelId: string;
  automaticEvents: boolean;
  testEventCode?: string;
  lastVerifiedAt?: string | null;
  status: PixelStatus;
};

export type TrackingEventLog = {
  eventId: string;
  eventName: string;
  platform: "meta" | "tiktok" | "all";
  status: "sent" | "skipped" | "error";
  payloadSummary?: Record<string, unknown>;
  timestamp: string;
};

export type StoreTrackingSettings = {
  _id: string;
  storeId: string;
  metaPixel: MetaPixelConfig;
  tiktokPixel: TikTokPixelConfig;
  googleAnalytics?: {
    enabled: boolean;
    measurementId: string;
  };
  customTracking?: {
    enabled: boolean;
    headerScript: string;
    bodyScript: string;
  };
  recentEvents: TrackingEventLog[];
  updatedAt?: string;
};

export type StoreTrackingDataResponse = {
  settings: StoreTrackingSettings;
  entitlements: {
    metaPixel: boolean;
    tiktokPixel: boolean;
    customTracking: boolean;
    googleAnalytics: boolean;
  };
  plan: {
    name: string;
    slug: string;
    priceBDT: number;
  };
  lockDetails: {
    metaPixel: {
      featureName: string;
      currentPlan?: { slug: string; name: string };
      requiredPlan?: { slug: string; name: string; priceBDT?: number };
    } | null;
    tiktokPixel: {
      featureName: string;
      currentPlan?: { slug: string; name: string };
      requiredPlan?: { slug: string; name: string; priceBDT?: number };
    } | null;
    customTracking: {
      featureName: string;
      currentPlan?: { slug: string; name: string };
      requiredPlan?: { slug: string; name: string; priceBDT?: number };
    } | null;
    googleAnalytics: {
      featureName: string;
      currentPlan?: { slug: string; name: string };
      requiredPlan?: { slug: string; name: string; priceBDT?: number };
    } | null;
  };
};

export type AdminTrackingOverviewStats = {
  totalStores: number;
  totalWithTracking: number;
  totalMetaActive: number;
  totalTikTokActive: number;
  adoptionRate: number;
};

export type AdminTrackingPlanStat = {
  planName: string;
  planSlug: string;
  totalStores: number;
  metaActive: number;
  tiktokActive: number;
  totalTracking: number;
};

export type AdminTrackingStoreRow = {
  _id: string;
  storeName: string;
  slug: string;
  subdomain: string;
  planName: string;
  planSlug: string;
  subscriptionStatus: string;
  billingStatus: string;
  metaPixel: {
    enabled: boolean;
    pixelIdMasked: string;
    status: string;
    allowedOnPlan: boolean;
  };
  tiktokPixel: {
    enabled: boolean;
    pixelIdMasked: string;
    status: string;
    allowedOnPlan: boolean;
  };
  anyTrackingEnabled: boolean;
  createdAt: string;
};

export type AdminTrackingOverviewResponse = {
  stats: AdminTrackingOverviewStats;
  planStats: AdminTrackingPlanStat[];
  stores: AdminTrackingStoreRow[];
};

export const trackingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreTracking: builder.query<{ success: boolean; data: StoreTrackingDataResponse }, string>({
      query: (storeId) => ({
        url: `/stores/${storeId}/tracking`,
      }),
      providesTags: (_res, _err, storeId) => [{ type: "Tracking", id: storeId }],
    }),

    updateMetaPixel: builder.mutation<
      { success: boolean; message?: string; data: { metaPixel: MetaPixelConfig } },
      { storeId: string; data: { enabled: boolean; pixelId: string; advancedMatching?: boolean; automaticEvents?: boolean; testEventCode?: string } }
    >({
      query: ({ storeId, data }) => ({
        url: `/stores/${storeId}/tracking/meta`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { storeId }) => [{ type: "Tracking", id: storeId }],
    }),

    updateTikTokPixel: builder.mutation<
      { success: boolean; message?: string; data: { tiktokPixel: TikTokPixelConfig } },
      { storeId: string; data: { enabled: boolean; pixelId: string; automaticEvents?: boolean; testEventCode?: string } }
    >({
      query: ({ storeId, data }) => ({
        url: `/stores/${storeId}/tracking/tiktok`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { storeId }) => [{ type: "Tracking", id: storeId }],
    }),

    testPixelConnection: builder.mutation<
      { success: boolean; message?: string; data: { platform: string; pixelId: string; status: PixelStatus; enabled: boolean; verifiedAt: string; message: string } },
      { storeId: string; platform: "meta" | "tiktok" }
    >({
      query: ({ storeId, platform }) => ({
        url: `/stores/${storeId}/tracking/test`,
        method: "POST",
        body: { platform },
      }),
      invalidatesTags: (_res, _err, { storeId }) => [{ type: "Tracking", id: storeId }],
    }),

    logTrackingEvent: builder.mutation<
      { success: boolean; data: { event: TrackingEventLog } },
      { storeId: string; data: { eventName: string; platform?: "meta" | "tiktok" | "all"; status?: "sent" | "skipped" | "error"; payloadSummary?: Record<string, unknown> } }
    >({
      query: ({ storeId, data }) => ({
        url: `/stores/${storeId}/tracking/events`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_res, _err, { storeId }) => [{ type: "Tracking", id: storeId }],
    }),

    getAdminTrackingOverview: builder.query<
      { success: boolean; data: AdminTrackingOverviewResponse },
      { search?: string; plan?: string; platform?: string } | void
    >({
      query: (params) => ({
        url: "/admin/tracking/overview",
        params: params || undefined,
      }),
      providesTags: ["Tracking"],
    }),
  }),
});

export const {
  useGetStoreTrackingQuery,
  useUpdateMetaPixelMutation,
  useUpdateTikTokPixelMutation,
  useTestPixelConnectionMutation,
  useLogTrackingEventMutation,
  useGetAdminTrackingOverviewQuery,
} = trackingApi;
