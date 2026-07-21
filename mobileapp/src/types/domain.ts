export type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  avatarUrl?: string;
};

export type SessionPayload = {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
  name: string;
  loginType: "user" | "admin";
  sessionVersion?: number;
};

export type Store = {
  _id: string;
  tenantId: string;
  userId: string;
  name: string;
  shortName?: string;
  tagline?: string;
  slug: string;
  subdomain: string;
  description?: string;
  category?: string;
  plan: string;
  planId?: { name?: string } | string | null;
  billingStatus?: string;
  subscriptionStatus?: string;
  trialEndsAt?: string | null;
  published?: boolean;
  status: string;
  logoUrl?: string;
  brandColor?: string;
  accentColor?: string;
  productCount?: number;
  orderCount?: number;
  revenueBDT?: number;
  createdAt: string;
  updatedAt?: string;
};

export type Product = {
  _id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string;
  productType?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  totalStock?: number;
  status: "active" | "inactive" | "draft" | "archived";
  sku?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  images?: string[];
  category?: string;
  featured?: boolean;
  variantCount?: number;
  createdAt?: string;
};

export type Customer = { _id: string; name: string; email: string; phone?: string };

export type Order = {
  _id: string;
  orderNumber: string;
  customerId?: Customer;
  items: Array<{ productId: string; name: string; price: number; quantity: number; image?: string }>;
  subtotal: number;
  shipping?: number;
  discount?: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  currencyCode?: string;
  shippingAddress?: { fullName?: string; phone?: string; street?: string; city?: string; state?: string; zip?: string };
  notes?: string;
  createdAt: string;
};

export type OrderAnalytics = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  paidRevenue: number;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  featured: boolean;
  sortOrder: number;
};

export type FeatureAccessItem = {
  key: string;
  name: string;
  description: string;
  type: "boolean" | "limit" | "tier";
  group: string;
  comingSoon?: boolean;
  enabled: boolean;
  limit: number;
  current: number;
  locked: boolean;
  lockReason?: string;
  requiredPlan?: { slug: string; name: string; priceBDT?: number };
};

export type StoreFeatureAccess = {
  storeId: string;
  storeStatus?: string;
  billingStatus?: string;
  subscriptionStatus?: string;
  allowNewOrders?: boolean;
  published?: boolean;
  currentPlan: { slug: string; name: string; priceBDT: number; priceYearly?: number } | null;
  features: FeatureAccessItem[];
  usage: Record<string, number>;
};

export type ScreenName =
  | "admin-dashboard"
  | "dashboard"
  | "stores"
  | "products"
  | "product-form"
  | "orders"
  | "order-detail"
  | "customers"
  | "reviews"
  | "categories"
  | "inventory"
  | "coupons"
  | "cms"
  | "pages"
  | "media"
  | "builder"
  | "theme"
  | "analytics"
  | "marketing"
  | "apps"
  | "reports"
  | "branding"
  | "domain"
  | "seo"
  | "invoices"
  | "invoice-detail"
  | "settings"
  | "delivery"
  | "payments"
  | "navigation"
  | "activity"
  | "billing"
  | "notifications"
  | "profile"
  | "account"
  | "security"
  | "help"
  | "more";

export type NavigationEntry = { name: ScreenName; params?: Record<string, unknown> };
