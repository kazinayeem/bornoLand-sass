import { baseApi } from "@/redux/api/base-api";

export type ThemeSettings = {
  primaryColor: string;
  secondaryColor: string;
  font: string;
  buttonStyle: string;
  layoutWidth: string;
  darkMode: boolean;
  navbarStyle: string;
};

export type PlanLimits = {
  storage: number;
  products: number;
  categories: number;
  collections: number;
  brands: number;
  productVariants: number;
  productImages: number;
  orders: number;
  customers: number;
  staff: number;
  warehouses: number;
  blogs: number;
  pages: number;
  mediaUploads: number;
  apiKeys: number;
  customDomains: number;
  coupons: number;
  shippingZones: number;
  pickupLocations: number;
  paymentMethods: number;
  activeThemes: number;
  builderPages: number;
  menus: number;
  navItems: number;
  reviews: number;
  testimonials: number;
  announcements: number;
  newsletterSubscribers: number;
  campaigns: number;
  emailTemplates: number;
  automationRules: number;
  integrations: number;
  webhooks: number;
  languages: number;
  currencies: number;
  taxRules: number;
  inventoryLocations: number;
  posDevices: number;
  giftCards: number;
  returnRequests: number;
  wishlistItems: number;
  analyticsReports: number;
  exportRequests: number;
  staffRoles: number;
  cmsBlocks: number;
  dynamicSections: number;
  builderTemplates: number;
  forms: number;
  popups: number;
  qrCodes: number;
  redirectRules: number;
  customCss: number;
  customJs: number;
  customFonts: number;
};

export type PlanFeatureToggles = {
  productVariants: boolean;
  inventory: boolean;
  advancedInventory: boolean;
  digitalProducts: boolean;
  physicalProducts: boolean;
  subscriptions: boolean;
  bookings: boolean;
  giftCards: boolean;
  coupons: boolean;
  reviews: boolean;
  blog: boolean;
  cms: boolean;
  pageBuilder: boolean;
  dragDropBuilder: boolean;
  themeEditor: boolean;
  advancedAnalytics: boolean;
  seo: boolean;
  aiContent: boolean;
  customDomain: boolean;
  subdomain: boolean;
  whiteLabel: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  staffManagement: boolean;
  marketplace: boolean;
  pos: boolean;
  wholesale: boolean;
  dropshipping: boolean;
  shipping: boolean;
  localPickup: boolean;
  abandonedCart: boolean;
  emailMarketing: boolean;
  smsMarketing: boolean;
  pushNotification: boolean;
  liveChat: boolean;
  fileManager: boolean;
  mediaLibrary: boolean;
  bulkImport: boolean;
  bulkExport: boolean;
  csvImport: boolean;
  csvExport: boolean;
  googleLogin: boolean;
  facebookLogin: boolean;
  otpLogin: boolean;
  multiCurrency: boolean;
  multiLanguage: boolean;
  taxEngine: boolean;
  invoiceGenerator: boolean;
  customCheckout: boolean;
  checkoutFields: boolean;
  advancedCheckout: boolean;
  loyaltyPoints: boolean;
  referralSystem: boolean;
  affiliateSystem: boolean;
  storeVerification: boolean;
  backupRestore: boolean;
  auditLogs: boolean;
  developerMode: boolean;
  maintenanceMode: boolean;
  darkMode: boolean;
  visitorAnalytics: boolean;
  realtimeVisitors: boolean;
  analyticsExport: boolean;
};

export type Plan = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  priceBDT: number;
  priceYearly?: number;
  isCustomPrice?: boolean;
  trialDays: number;
  features: string[];
  limits: PlanLimits;
  featureToggles: PlanFeatureToggles;
  pricing?: {
    monthly?: number;
    quarterly?: number;
    halfYearly?: number;
    yearly?: number;
    lifetime?: number;
  };
  customDomain?: boolean;
  prioritySupport?: boolean;
  sortOrder?: number;
  visible?: boolean;
  isRecommended: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  description: string;
  category: string;
  storeType?: string;
  plan: string;
  planId?: Plan | string | null;
  billingStatus?: "trial" | "active" | "past_due" | "cancelled" | "paused";
  subscriptionStatus?: "trialing" | "active" | "past_due" | "cancelled" | "paused";
  renewalDate?: string | null;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
  published?: boolean;
  allowNewOrders?: boolean;
  status: string;
  logoUrl: string;
  logoMediaId?: string | null;
  faviconUrl?: string;
  faviconMediaId?: string | null;
  brandColor?: string;
  accentColor?: string;
  selectedTemplateId?: { _id: string; name: string; slug: string; category: string; preview: string } | string;
  theme: ThemeSettings;
  productCount?: number;
  orderCount?: number;
  revenueBDT?: number;
  createdAt: string;
  updatedAt: string;
};

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

type CreateStoreRequest = {
  name: string;
  shortName?: string;
  tagline?: string;
  slug: string;
  description?: string;
  category?: string;
  storeType?: string;
  plan?: string;
  selectedTemplateId?: string;
  logoUrl?: string;
  logoMediaId?: string | null;
  faviconUrl?: string;
  faviconMediaId?: string | null;
  brandColor?: string;
  accentColor?: string;
};

type UpdateStoreRequest = Partial<CreateStoreRequest> & {
  status?: string;
  theme?: Partial<ThemeSettings>;
  planId?: string;
  billingStatus?: Store["billingStatus"];
  subscriptionStatus?: Store["subscriptionStatus"];
  renewalDate?: string;
};

export type StoreBranding = Pick<
  Store,
  | "_id"
  | "name"
  | "shortName"
  | "tagline"
  | "logoUrl"
  | "logoMediaId"
  | "faviconUrl"
  | "faviconMediaId"
  | "brandColor"
  | "accentColor"
  | "plan"
  | "planId"
>;

type UpdateStoreBrandingRequest = Partial<
  Pick<
    Store,
    "name" | "shortName" | "tagline" | "logoUrl" | "logoMediaId" | "faviconUrl" | "faviconMediaId" | "brandColor" | "accentColor"
  >
>;

export const storeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createStore: builder.mutation<ApiEnvelope<{ store: Store }>, CreateStoreRequest>({
      query: (body) => ({ url: "/stores/create", method: "POST", body }),
      invalidatesTags: ["Stores"]
    }),
    getMyStores: builder.query<ApiEnvelope<{ stores: Store[] }>, void>({
      query: () => ({ url: "/stores/my-stores" }),
      providesTags: ["Stores"]
    }),
    getStore: builder.query<ApiEnvelope<{ store: Store }>, string>({
      query: (id) => ({ url: `/stores/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Stores", id }]
    }),
    getStoreBySlug: builder.query<ApiEnvelope<{ store: Store }>, string>({
      query: (slug) => ({ url: `/stores/by-slug/${slug}` }),
      providesTags: (result) => [{ type: "Stores", id: result?.data?.store?._id }],
    }),
    updateStore: builder.mutation<ApiEnvelope<{ store: Store }>, { id: string; data: UpdateStoreRequest }>({
      query: ({ id, data }) => ({ url: `/stores/${id}`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { id }) => ["Stores", { type: "Stores", id }]
    }),
    changeStoreTheme: builder.mutation<ApiEnvelope<{ store: Store }>, { id: string; data: { templateId?: string; theme?: Partial<ThemeSettings> } }>({
      query: ({ id, data }) => ({ url: `/stores/${id}/theme`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { id }) => ["Stores", { type: "Stores", id }]
    }),
    getStoreBranding: builder.query<ApiEnvelope<{ branding: StoreBranding }>, string>({
      query: (id) => ({ url: `/stores/${id}/branding` }),
      providesTags: (_result, _error, id) => [{ type: "Stores", id }],
    }),
    updateStoreBranding: builder.mutation<
      ApiEnvelope<{ branding: StoreBranding; store: Store }>,
      { id: string; data: UpdateStoreBrandingRequest }
    >({
      query: ({ id, data }) => ({ url: `/stores/${id}/branding`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { id }) => ["Stores", { type: "Stores", id }],
    }),
    deleteStoreLogo: builder.mutation<ApiEnvelope<{ branding: StoreBranding; store: Store }>, string>({
      query: (id) => ({ url: `/stores/${id}/branding/logo`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => ["Stores", { type: "Stores", id }],
    }),
    deleteStoreFavicon: builder.mutation<ApiEnvelope<{ branding: StoreBranding; store: Store }>, string>({
      query: (id) => ({ url: `/stores/${id}/branding/favicon`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => ["Stores", { type: "Stores", id }],
    }),
    deleteStore: builder.mutation<ApiEnvelope<{ storeName: string; storeSlug: string; tenantId: string }>, string>({
      query: (id) => ({ url: `/stores/${id}`, method: "DELETE" }),
      invalidatesTags: ["Stores"]
    }),
    getPlans: builder.query<ApiEnvelope<{ plans: Plan[] }>, { all?: boolean } | void>({
      query: (params) => ({
        url: "/plans",
        params: params?.all ? { all: "true" } : undefined,
      }),
      providesTags: ["Stores"]
    }),
    createPlan: builder.mutation<ApiEnvelope<{ plan: Plan }>, Omit<Plan, "_id" | "createdAt" | "updatedAt">>({
      query: (body) => ({ url: "/plans", method: "POST", body }),
      invalidatesTags: ["Stores"]
    }),
    updatePlan: builder.mutation<ApiEnvelope<{ plan: Plan }>, { id: string; data: Partial<Omit<Plan, "_id" | "createdAt" | "updatedAt">> }>({
      query: ({ id, data }) => ({ url: `/plans/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Stores"]
    }),
    deletePlan: builder.mutation<ApiEnvelope<never>, string>({
      query: (id) => ({ url: `/plans/${id}`, method: "DELETE" }),
      invalidatesTags: ["Stores"]
    }),
    duplicatePlan: builder.mutation<ApiEnvelope<{ plan: Plan }>, string>({
      query: (id) => ({ url: `/plans/${id}/duplicate`, method: "POST" }),
      invalidatesTags: ["Stores"]
    })
  })
});

export const {
  useCreateStoreMutation,
  useGetMyStoresQuery,
  useGetStoreQuery,
  useGetStoreBySlugQuery,
  useUpdateStoreMutation,
  useChangeStoreThemeMutation,
  useGetStoreBrandingQuery,
  useUpdateStoreBrandingMutation,
  useDeleteStoreLogoMutation,
  useDeleteStoreFaviconMutation,
  useDeleteStoreMutation,
  useGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useDuplicatePlanMutation
} = storeApi;
