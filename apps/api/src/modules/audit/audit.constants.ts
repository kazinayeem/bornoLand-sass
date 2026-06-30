export const AUDIT_MODULES = {
  AUTH: "auth",
  USERS: "users",
  STORES: "stores",
  PRODUCTS: "products",
  ORDERS: "orders",
  CUSTOMERS: "customers",
  COUPONS: "coupons",
  CMS: "cms",
  BUILDER: "builder",
  MEDIA: "media",
  SUBSCRIPTION: "subscription",
  PAYMENTS: "payments",
  PLATFORM: "platform",
  CATEGORIES: "categories",
  INVENTORY: "inventory",
} as const;

export type AuditModule = (typeof AUDIT_MODULES)[keyof typeof AUDIT_MODULES];

export const AUDIT_STATUS = {
  SUCCESS: "success",
  FAILURE: "failure",
} as const;

/** Retention windows in days by plan slug (enterprise = unlimited / null) */
export const AUDIT_RETENTION_DAYS: Record<string, number | null> = {
  free: 90,
  starter: 90,
  pro: 365,
  growth: 365,
  business: 365 * 3,
  enterprise: null,
};
