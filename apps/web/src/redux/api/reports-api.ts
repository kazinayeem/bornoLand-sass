import { baseApi } from "@/redux/api/base-api";

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export type ReportDateRange = {
  preset?: "today" | "yesterday" | "last7" | "last30" | "thisMonth" | "lastMonth" | "thisYear" | "all";
  start?: string;
  end?: string;
};

export type DashboardKPIs = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  netProfit: number;
  grossSales: number;
  refundAmount: number;
  pendingOrders: number;
  cancelledOrders: number;
  completedOrders: number;
  conversionRate: number;
  returningCustomers: number;
  newCustomers: number;
  productsSold: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  inventoryValue: number;
  couponsUsed: number;
  averageRating: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  ordersToday: number;
  storageUsage: { used: number; limit: number; percent: number };
  mediaUsage: number;
  pages: number;
  latestOrders?: Array<{
    _id: string;
    orderNumber: string;
    invoiceNumber?: string;
    total: number;
    status: string;
    paymentStatus?: string;
    paymentMethod?: string;
    createdAt: string;
    customerId?: { name?: string; email?: string } | string;
  }>;
  lowStockItems?: Array<{
    _id: string;
    name: string;
    stock: number;
    price?: number;
    sku?: string;
  }>;
  topProducts?: Array<{
    _id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  topCustomers?: Array<{
    _id: string;
    name?: string;
    email?: string;
    totalSpent: number;
    orderCount: number;
  }>;
  topCategories?: Array<{
    _id: string;
    revenue: number;
    units: number;
  }>;
  paymentMethods?: Array<{ _id: string; count: number; total: number }>;
  shippingMethods?: Array<{ _id: string; count: number; total: number }>;
};

export type RevenueReport = {
  daily: Array<{ _id: string; revenue: number; orders: number }>;
  byCategory: Array<{ _id: string; revenue: number; orders: number }>;
};

export type OrderReport = {
  byStatus: Array<{ _id: string; count: number; total: number }>;
  byPaymentMethod: Array<{ _id: string; count: number; total: number }>;
  recent: Array<Record<string, unknown>>;
};

export type CustomerReport = {
  total: number;
  newCustomers: number;
  topCustomers: Array<{ name: string; email: string; totalSpent: number; orderCount: number }>;
};

export type ProductReport = {
  total: number;
  lowStock: number;
  outOfStock: number;
  topProducts: Array<{ name: string; totalSold: number; revenue: number; stock: number }>;
};

export type CategoryReport = {
  byCategory: Array<{ name: string; revenue: number; orders: number; productCount: number }>;
};

export type CouponReport = {
  totalCoupons: number;
  usedCoupons: Array<{ _id: string; count: number; totalDiscount: number }>;
};

export type MediaReport = {
  storage: { used: number; limit: number; percent: number; fileCount: number } | null;
  filesByType: Array<{ _id: string; count: number; totalSize: number }>;
};

export type SummaryReport = {
  period: string;
  data: Array<{ _id: unknown; revenue: number; orders: number; avgOrderValue: number }>;
};

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReportDashboard: builder.query<ApiEnvelope<DashboardKPIs>, { storeId: string; range?: ReportDateRange }>({
      query: ({ storeId, range }) => ({
        url: `/reports/stores/${storeId}/dashboard`,
        params: range?.preset ? { preset: range.preset } : range?.start ? { start: range.start, end: range.end } : {},
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
    getRevenueReport: builder.query<ApiEnvelope<RevenueReport>, { storeId: string; range?: ReportDateRange }>({
      query: ({ storeId, range }) => ({
        url: `/reports/stores/${storeId}/revenue`,
        params: range?.preset ? { preset: range.preset } : range?.start ? { start: range.start, end: range.end } : {},
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
    getOrderReport: builder.query<ApiEnvelope<OrderReport>, { storeId: string; range?: ReportDateRange }>({
      query: ({ storeId, range }) => ({
        url: `/reports/stores/${storeId}/orders`,
        params: range?.preset ? { preset: range.preset } : range?.start ? { start: range.start, end: range.end } : {},
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
    getCustomerReport: builder.query<ApiEnvelope<CustomerReport>, { storeId: string; range?: ReportDateRange }>({
      query: ({ storeId, range }) => ({
        url: `/reports/stores/${storeId}/customers`,
        params: range?.preset ? { preset: range.preset } : range?.start ? { start: range.start, end: range.end } : {},
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
    getProductReport: builder.query<ApiEnvelope<ProductReport>, { storeId: string; range?: ReportDateRange }>({
      query: ({ storeId, range }) => ({
        url: `/reports/stores/${storeId}/products`,
        params: range?.preset ? { preset: range.preset } : range?.start ? { start: range.start, end: range.end } : {},
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
    getCategoryReport: builder.query<ApiEnvelope<CategoryReport>, { storeId: string; range?: ReportDateRange }>({
      query: ({ storeId, range }) => ({
        url: `/reports/stores/${storeId}/categories`,
        params: range?.preset ? { preset: range.preset } : range?.start ? { start: range.start, end: range.end } : {},
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
    getCouponReport: builder.query<ApiEnvelope<CouponReport>, { storeId: string; range?: ReportDateRange }>({
      query: ({ storeId, range }) => ({
        url: `/reports/stores/${storeId}/coupons`,
        params: range?.preset ? { preset: range.preset } : range?.start ? { start: range.start, end: range.end } : {},
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
    getMediaReport: builder.query<ApiEnvelope<MediaReport>, string>({
      query: (storeId) => ({ url: `/reports/stores/${storeId}/media` }),
      providesTags: (_r, _e, storeId) => [{ type: "Reports", id: storeId }],
    }),
    getSummaryReport: builder.query<ApiEnvelope<SummaryReport>, { storeId: string; period: "daily" | "weekly" | "monthly" | "yearly" }>({
      query: ({ storeId, period }) => ({ url: `/reports/stores/${storeId}/summary/${period}` }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
  }),
});

export const {
  useGetReportDashboardQuery,
  useGetRevenueReportQuery,
  useGetOrderReportQuery,
  useGetCustomerReportQuery,
  useGetProductReportQuery,
  useGetCategoryReportQuery,
  useGetCouponReportQuery,
  useGetMediaReportQuery,
  useGetSummaryReportQuery,
} = reportsApi;
