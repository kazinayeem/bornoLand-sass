export type InvoiceStatus = "paid" | "pending" | "rejected" | "refunded";
export type SubscriptionDuration = "monthly" | "quarterly" | "half_yearly" | "yearly" | "lifetime";

export type TimelineEvent = {
  event: string;
  date: string;
  description: string;
};

export type Invoice = {
  _id: string;
  invoiceNumber: string;
  storeId: string | { _id: string; name: string; slug: string; subdomain?: string };
  planId: { name: string; slug: string };
  userId?: string | { _id: string; name: string; email: string };
  duration: SubscriptionDuration;
  subtotal: number;
  discount: number;
  vatAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  gateway?: string;
  transactionId?: string;
  senderNumber?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
  issuedAt?: string;
  dueDate?: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyTaxId?: string;
  pdfUrl?: string;
  timeline?: TimelineEvent[];
  verificationCode?: string;
  approvedBy?: string;
  approvedAt?: string;
  subscriptionId?: string;
  paymentId?: string;
};

export type InvoiceListResponse = {
  success: boolean;
  data?: Invoice[];
  message?: string;
};

export type InvoiceDetailResponse = {
  success: boolean;
  data?: Invoice;
  message?: string;
};
