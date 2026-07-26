import { baseApi } from "@/redux/api/base-api";

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export type ReportPreset =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "last3Months"
  | "last6Months"
  | "thisYear"
  | "lastYear"
  | "all"
  | "custom";

export type ReportDateRange = {
  preset?: ReportPreset;
  start?: string;
  end?: string;
};

export type ReportAdvancedFilters = {
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  courier?: string;
  search?: string;
  minAmount?: string;
  maxAmount?: string;
};

export type DashboardKPIs = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  netProfit: number;
  netIncome?: number;
  totalExpense?: number;
  grossSales: number;
  refundAmount: number;
  pendingOrders: number;
  cancelledOrders: number;
  completedOrders: number;
  deliveredOrders?: number;
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
  shippingCost?: number;
  taxCollected?: number;
  discountTotal?: number;
  codCollection?: number;
  onlineCollection?: number;
  returnRate?: number;
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
  courierBreakdown?: Array<{ _id: string; count: number; total: number }>;
  comparison?: {
    revenueChange: number;
    ordersChange: number;
    refundChange: number;
    shippingChange: number;
    previousRevenue: number;
    previousOrders: number;
  } | null;
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

function rangeParams(range?: ReportDateRange, advanced?: ReportAdvancedFilters) {
  const params: Record<string, string | undefined> = {};
  if (!range) return params;
  if (range.preset && range.preset !== "custom" && range.preset !== "all") {
    params.preset = range.preset;
  } else if (range.preset === "all") {
    params.preset = "all";
  } else if (range.start || range.end) {
    params.start = range.start;
    params.end = range.end;
  }
  if (advanced) {
    if (advanced.orderStatus) params.orderStatus = advanced.orderStatus;
    if (advanced.paymentStatus) params.paymentStatus = advanced.paymentStatus;
    if (advanced.paymentMethod) params.paymentMethod = advanced.paymentMethod;
    if (advanced.courier) params.courier = advanced.courier;
    if (advanced.search) params.search = advanced.search;
    if (advanced.minAmount) params.minAmount = advanced.minAmount;
    if (advanced.maxAmount) params.maxAmount = advanced.maxAmount;
  }
  return params;
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReportDashboard: builder.query<
      ApiEnvelope<DashboardKPIs>,
      { storeId: string; range?: ReportDateRange; advanced?: ReportAdvancedFilters }
    >({
      query: ({ storeId, range, advanced }) => ({
        url: `/reports/stores/${storeId}/dashboard`,
        params: rangeParams(range, advanced),
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
    getRevenueReport: builder.query<ApiEnvelope<RevenueReport>, { storeId: string; range?: ReportDateRange }>({
      query: ({ storeId, range }) => ({
        url: `/reports/stores/${storeId}/revenue`,
        params: rangeParams(range),
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
    getOrderReport: builder.query<ApiEnvelope<OrderReport>, { storeId: string; range?: ReportDateRange }>({
      query: ({ storeId, range }) => ({
        url: `/reports/stores/${storeId}/orders`,
        params: rangeParams(range),
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
    getCustomerReport: builder.query<ApiEnvelope<CustomerReport>, { storeId: string; range?: ReportDateRange }>({
      query: ({ storeId, range }) => ({
        url: `/reports/stores/${storeId}/customers`,
        params: rangeParams(range),
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
    getProductReport: builder.query<ApiEnvelope<ProductReport>, { storeId: string; range?: ReportDateRange }>({
      query: ({ storeId, range }) => ({
        url: `/reports/stores/${storeId}/products`,
        params: rangeParams(range),
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
    getCategoryReport: builder.query<ApiEnvelope<CategoryReport>, { storeId: string; range?: ReportDateRange }>({
      query: ({ storeId, range }) => ({
        url: `/reports/stores/${storeId}/categories`,
        params: rangeParams(range),
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
    getCouponReport: builder.query<ApiEnvelope<CouponReport>, { storeId: string; range?: ReportDateRange }>({
      query: ({ storeId, range }) => ({
        url: `/reports/stores/${storeId}/coupons`,
        params: rangeParams(range),
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Reports", id: storeId }],
    }),
    getMediaReport: builder.query<ApiEnvelope<MediaReport>, string>({
      query: (storeId) => ({ url: `/reports/stores/${storeId}/media` }),
      providesTags: (_r, _e, storeId) => [{ type: "Reports", id: storeId }],
    }),
    getSummaryReport: builder.query<
      ApiEnvelope<SummaryReport>,
      { storeId: string; period: "daily" | "weekly" | "monthly" | "yearly" }
    >({
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
