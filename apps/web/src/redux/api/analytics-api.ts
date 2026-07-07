import { baseApi } from "./base-api";

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export interface AnalyticsStats {
  today: number;
  todayUnique: number;
  yesterday: number;
  yesterdayUnique: number;
  week: number;
  month: number;
  monthUnique: number;
  lastMonth: number;
  year: number;
  totalVisitors: number;
  uniqueVisitors: number;
  returningVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  liveVisitors: number;
}

export interface VisitorChartData {
  visitorsByDay: Array<{ date: string; visitors: number; pageViews: number; sessions: number }>;
  visitorsByMonth: Array<{ month: string; year: number; label: string; visitors: number; pageViews: number; sessions: number }>;
  visitorsByHour: Array<{ hour: number; visitors: number; pageViews: number }>;
  topProducts: Array<{ productId: string; name: string; views: number }>;
  topCategories: Array<{ categoryId: string; name: string; views: number }>;
  topPages: Array<{ url: string; title: string; views: number }>;
  topSearchQueries: Array<{ query: string; count: number }>;
}

export interface TrafficSource {
  _id: string;
  source: string;
  type: string;
  visits: number;
  uniqueVisitors: number;
  pageViews: number;
}

export interface DeviceData {
  devices: Array<{ name: string; count: number; percentage: number }>;
  browsers: Array<{ name: string; count: number; percentage: number }>;
  operatingSystems: Array<{ name: string; count: number; percentage: number }>;
  countries: Array<{ code: string; count: number; percentage: number }>;
}

export interface TopContent {
  topProducts: Array<{ productId: string; name: string; views: number }>;
  topCategories: Array<{ categoryId: string; name: string; views: number }>;
  topPages: Array<{ url: string; title: string; path: string; views: number }>;
  topSearches: Array<{ query: string; count: number }>;
}

export interface PlatformAnalytics {
  totalSessions: number;
  totalPageViews: number;
  totalUniqueVisitors: number;
  todaySessions: number;
  todayPageViews: number;
  monthSessions: number;
  monthPageViews: number;
  storeVisitorCounts: Array<{ storeId: string; visits: number; uniqueVisitors: number }>;
  topPlatformProducts: Array<{ productId: string; name: string; views: number }>;
  topCountries: Array<{ code: string; count: number }>;
  topReferrers: Array<{ source: string; visits: number }>;
  monthlyGrowth: Array<{ year: number; month: number; visitors: number; pageViews: number; sessions: number }>;
  activeStoresWithVisitors: number;
}

const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Store Owner Analytics
    getStoreAnalyticsStats: builder.query<ApiEnvelope<AnalyticsStats>, string>({
      query: (storeId) => ({ url: `/analytics/${storeId}/stats` }),
      providesTags: (_r, _e, storeId) => [{ type: "Analytics" as const, id: storeId }],
    }),
    getStoreVisitorCharts: builder.query<ApiEnvelope<VisitorChartData>, string>({
      query: (storeId) => ({ url: `/analytics/${storeId}/charts` }),
      providesTags: (_r, _e, storeId) => [{ type: "Analytics" as const, id: storeId }],
    }),
    getStoreTrafficSources: builder.query<ApiEnvelope<TrafficSource[]>, string>({
      query: (storeId) => ({ url: `/analytics/${storeId}/traffic-sources` }),
      providesTags: (_r, _e, storeId) => [{ type: "Analytics" as const, id: storeId }],
    }),
    getStoreDevices: builder.query<ApiEnvelope<DeviceData>, string>({
      query: (storeId) => ({ url: `/analytics/${storeId}/devices` }),
      providesTags: (_r, _e, storeId) => [{ type: "Analytics" as const, id: storeId }],
    }),
    getStoreTopContent: builder.query<ApiEnvelope<TopContent>, string>({
      query: (storeId) => ({ url: `/analytics/${storeId}/top-content` }),
      providesTags: (_r, _e, storeId) => [{ type: "Analytics" as const, id: storeId }],
    }),
    getLiveVisitors: builder.query<ApiEnvelope<{ visitors: unknown[]; count: number }>, string>({
      query: (storeId) => ({ url: `/analytics/${storeId}/live` }),
      providesTags: (_r, _e, storeId) => [{ type: "Analytics" as const, id: storeId }],
    }),

    // Platform Analytics
    getAdminPlatformAnalytics: builder.query<ApiEnvelope<PlatformAnalytics>, void>({
      query: () => ({ url: "/admin/analytics/overview" }),
      providesTags: [{ type: "Analytics" as const, id: "PLATFORM" }],
    }),
    getAdminStoreAnalytics: builder.query<ApiEnvelope<{ stats: AnalyticsStats; charts: VisitorChartData; devices: DeviceData }>, string>({
      query: (storeId) => ({ url: `/admin/analytics/stores/${storeId}` }),
      providesTags: (_r, _e, storeId) => [{ type: "Analytics" as const, id: storeId }],
    }),
    getAdminStoreVisitorStats: builder.query<ApiEnvelope<AnalyticsStats>, string>({
      query: (storeId) => ({ url: `/admin/analytics/stores/${storeId}/stats` }),
      providesTags: (_r, _e, storeId) => [{ type: "Analytics" as const, id: storeId }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetStoreAnalyticsStatsQuery,
  useGetStoreVisitorChartsQuery,
  useGetStoreTrafficSourcesQuery,
  useGetStoreDevicesQuery,
  useGetStoreTopContentQuery,
  useGetLiveVisitorsQuery,
  useGetAdminPlatformAnalyticsQuery,
  useGetAdminStoreAnalyticsQuery,
  useGetAdminStoreVisitorStatsQuery,
} = analyticsApi;

export default analyticsApi;
