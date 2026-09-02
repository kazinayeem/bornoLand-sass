import type { ReactNode } from "react";

export type DocumentPageSize = "a4-portrait" | "a4-landscape" | "thermal-80" | "thermal-58";

export interface StoreIdentity {
  name: string;
  shortName?: string;
  logoUrl?: string;
  brandColor?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  binOrTin?: string;
}

export interface PayslipData {
  payslipNumber: string;
  period: string; // e.g. "August 2026" or "আগস্ট ২০২৬"
  paymentDate?: string | Date;
  status: "paid" | "approved" | "pending" | "rejected";
  paymentMethod?: string;
  employee: {
    code: string;
    name: string;
    designation: string;
    department: string;
    joiningDate?: string | Date;
    bankAccount?: string;
    phone?: string;
  };
  earnings: {
    basicSalary: number;
    houseRent: number;
    medical: number;
    conveyance?: number;
    overtimeHours?: number;
    overtimePay?: number;
    otherAllowances?: number;
    bonus?: number;
  };
  deductions: {
    taxDeduction?: number;
    providentFundDeduction?: number;
    unpaidLeaveDeduction?: number;
    otherDeductions?: number;
  };
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  notes?: string;
}

export interface InvoiceItem {
  id?: string;
  sku?: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber?: string;
  issueDate: string | Date;
  dueDate?: string | Date;
  status: "paid" | "unpaid" | "partial" | "refunded" | "cancelled";
  paymentMethod?: string;
  paymentReference?: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    billingAddress?: string;
    shippingAddress?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  discountTotal?: number;
  taxTotal?: number;
  shippingCharge?: number;
  grandTotal: number;
  paidAmount?: number;
  dueAmount?: number;
  notes?: string;
  terms?: string;
}

export interface PosReceiptData {
  receiptNumber: string;
  orderNumber?: string;
  dateTime: string | Date;
  cashierName?: string;
  registerOrCounter?: string;
  shiftNumber?: string;
  customer?: {
    name?: string;
    phone?: string;
  };
  items: {
    title: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    total: number;
  }[];
  subtotal: number;
  discount?: number;
  tax?: number;
  grandTotal: number;
  paymentMethod: string;
  tenderedAmount?: number;
  changeAmount?: number;
  notes?: string;
}

export interface FinancialStatementData {
  statementType: "trial-balance" | "profit-loss" | "balance-sheet" | "all";
  period: string;
  asOfDate: string | Date;
  currency?: string;
  trialBalance?: {
    code: string;
    name: string;
    type: string;
    debit: number;
    credit: number;
  }[];
  profitAndLoss?: {
    revenues: { code: string; name: string; amount?: number; currentBalance?: number }[];
    expenses: { code: string; name: string; amount?: number; currentBalance?: number }[];
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
  };
  balanceSheet?: {
    assets: { code: string; name: string; amount?: number; currentBalance?: number }[];
    liabilities: { code: string; name: string; amount?: number; currentBalance?: number }[];
    equity: { code: string; name: string; amount?: number; currentBalance?: number }[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
  };
}

export interface TabularReportData {
  title: string;
  subtitle?: string;
  period?: string;
  generatedBy?: string;
  generatedAt?: string | Date;
  filters?: Record<string, string>;
  summaryCards?: { label: string; value: string | number; change?: string }[];
  headers: string[];
  rows: (string | number)[][];
  totals?: (string | number)[];
  notes?: string;
}
