import type { ReportPreset } from "@/redux/api/reports-api";
import type { ReportModuleId } from "./types";

export type ReportModuleDef = {
  id: ReportModuleId;
  label: string;
  description: string;
  icon: string;
};

export const REPORT_MODULES: ReportModuleDef[] = [
  { id: "overview", label: "Overview", description: "KPI dashboard and live store pulse", icon: "layout-dashboard" },
  { id: "sales", label: "Sales", description: "Revenue trends and category mix", icon: "trending-up" },
  { id: "orders", label: "Orders", description: "Order volume by status and payment", icon: "shopping-cart" },
  { id: "products", label: "Products", description: "Top sellers and product performance", icon: "package" },
  { id: "inventory", label: "Inventory", description: "Stock levels and low-stock alerts", icon: "warehouse" },
  { id: "customers", label: "Customers", description: "New vs returning and top spenders", icon: "users" },
  { id: "payments", label: "Payments", description: "Payment methods and collections", icon: "credit-card" },
  { id: "shipping", label: "Shipping", description: "Shipping methods and costs", icon: "truck" },
  { id: "courier", label: "Courier", description: "Courier partner breakdown", icon: "bike" },
  { id: "categories", label: "Categories", description: "Sales by category", icon: "tags" },
  { id: "coupons", label: "Coupons", description: "Coupon usage and discounts", icon: "ticket" },
  { id: "tax", label: "Tax", description: "Tax collected and finance notes", icon: "receipt" },
  { id: "expense", label: "Expense", description: "Shipping, refunds, and cost breakdown", icon: "wallet" },
  { id: "profit-loss", label: "P&L", description: "Revenue, expense, and net income", icon: "scale" },
  { id: "performance", label: "Performance", description: "Conversion, AOV, and retention", icon: "gauge" },
  { id: "staff", label: "Staff", description: "Staff activity and audit trail", icon: "user-cog" },
  { id: "refunds", label: "Refunds", description: "Refund amounts and cancelled orders", icon: "rotate-ccw" },
  { id: "returns", label: "Returns", description: "Return rate and cancellations", icon: "undo-2" },
  { id: "wallet", label: "Wallet", description: "Store wallet and balances", icon: "landmark" },
  { id: "subscription", label: "Subscription", description: "Plan usage and store performance", icon: "crown" },
  { id: "custom", label: "Custom", description: "Build and save custom reports", icon: "sliders-horizontal" },
];

export const DATE_PRESETS: { value: ReportPreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "last3Months", label: "Last 3 months" },
  { value: "last6Months", label: "Last 6 months" },
  { value: "thisYear", label: "This year" },
  { value: "lastYear", label: "Last year" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom" },
];

export const ORDER_STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "All payments" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "All methods" },
  { value: "cod", label: "Cash on delivery" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "card", label: "Card" },
  { value: "bank", label: "Bank transfer" },
  { value: "online", label: "Online" },
] as const;

export const CUSTOM_REPORT_FIELDS = [
  { id: "orderNumber", label: "Order number", type: "string" },
  { id: "status", label: "Order status", type: "string" },
  { id: "paymentStatus", label: "Payment status", type: "string" },
  { id: "paymentMethod", label: "Payment method", type: "string" },
  { id: "total", label: "Order total", type: "number" },
  { id: "createdAt", label: "Created at", type: "date" },
  { id: "customerName", label: "Customer name", type: "string" },
  { id: "productName", label: "Product name", type: "string" },
  { id: "unitsSold", label: "Units sold", type: "number" },
  { id: "revenue", label: "Revenue", type: "number" },
  { id: "category", label: "Category", type: "string" },
  { id: "courier", label: "Courier", type: "string" },
] as const;

export const CUSTOM_GROUP_BY = [
  { value: "none", label: "No grouping" },
  { value: "status", label: "Order status" },
  { value: "paymentMethod", label: "Payment method" },
  { value: "paymentStatus", label: "Payment status" },
  { value: "category", label: "Category" },
  { value: "courier", label: "Courier" },
  { value: "day", label: "Day" },
] as const;

export const CUSTOM_AGGREGATES = [
  { value: "SUM", label: "Sum" },
  { value: "AVG", label: "Average" },
  { value: "COUNT", label: "Count" },
  { value: "MIN", label: "Min" },
  { value: "MAX", label: "Max" },
] as const;

export const DEFAULT_FILTER_STATE = {
  preset: "thisMonth" as ReportPreset,
  start: "",
  end: "",
  advanced: {
    orderStatus: "",
    paymentStatus: "",
    paymentMethod: "",
    courier: "",
    search: "",
    minAmount: "",
    maxAmount: "",
  },
  showAdvanced: false,
};
