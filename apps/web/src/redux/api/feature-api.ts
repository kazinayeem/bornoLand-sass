import { baseApi } from "@/redux/api/base-api";

export type FeatureType = "boolean" | "limit" | "tier";

export type FeatureAccessItem = {
  key: string;
  name: string;
  description: string;
  type: FeatureType;
  group: string;
  groupKey?: string;
  comingSoon?: boolean;
  unit?: string;
  enabled: boolean;
  limit: number;
  tierKey?: string;
  tierLabel?: string;
  tiers?: Array<{ key: string; label: string; rank: number }>;
  value: string;
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
  currentPlan: {
    slug: string;
    name: string;
    priceBDT: number;
    priceYearly?: number;
  } | null;
  features: FeatureAccessItem[];
  usage: Record<string, number>;
};

export type PlatformFeature = {
  _id: string;
  key: string;
  name: string;
  description: string;
  type: FeatureType | "numeric" | "string";
  group: string;
  groupKey?: string;
  sortOrder: number;
  usageCounterKey?: string;
  unit?: string;
  defaultEnabled?: boolean;
  defaultLimit?: number;
  defaultTier?: string;
  comingSoon?: boolean;
  isActive: boolean;
};

export type FeatureGroup = {
  _id: string;
  key: string;
  name: string;
  description?: string;
  sortOrder: number;
};

export type FeatureTier = {
  _id?: string;
  featureKey?: string;
  tierKey: string;
  label: string;
  rank: number;
  description?: string;
};

export type PlanFeatureAssignment = {
  featureKey: string;
  name: string;
  type: FeatureType | "numeric" | "string";
  group: string;
  groupKey?: string;
  comingSoon?: boolean;
  enabled: boolean;
  limit: number;
  tierKey?: string;
  value: string;
  tiers?: FeatureTier[];
  limitMeta?: { unit?: string; defaultLimit?: number };
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

function normalizeType(type: string): FeatureType {
  if (type === "numeric") return "limit";
  if (type === "string") return "tier";
  if (type === "boolean" || type === "limit" || type === "tier") return type;
  return "boolean";
}

export const featureApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreFeatureAccess: builder.query<ApiEnvelope<StoreFeatureAccess>, string>({
      query: (storeId) => ({ url: `/features/stores/${storeId}/access` }),
      providesTags: (_r, _e, storeId) => [{ type: "Features", id: storeId }],
    }),
    getAdminFeatures: builder.query<ApiEnvelope<{ features: PlatformFeature[] }>, { group?: string } | void>({
      query: (params) => ({
        url: "/features",
        params: params?.group ? { group: params.group } : undefined,
      }),
      providesTags: ["Features"],
    }),
    getAdminFeatureGroups: builder.query<ApiEnvelope<{ groups: FeatureGroup[] }>, void>({
      query: () => ({ url: "/features/groups" }),
      providesTags: ["Features"],
    }),
    getAdminFeatureDetail: builder.query<
      ApiEnvelope<{ feature: PlatformFeature; tiers: FeatureTier[]; limitMeta?: { unit?: string } }>,
      string
    >({
      query: (key) => ({ url: `/features/${key}` }),
      providesTags: (_r, _e, key) => [{ type: "Features", id: key }],
    }),
    createAdminFeature: builder.mutation<
      ApiEnvelope<{ feature: PlatformFeature }>,
      Partial<PlatformFeature> & { tiers?: FeatureTier[] }
    >({
      query: (body) => ({ url: "/features", method: "POST", body }),
      invalidatesTags: ["Features"],
    }),
    updateAdminFeature: builder.mutation<
      ApiEnvelope<{ feature: PlatformFeature }>,
      { key: string; data: Partial<PlatformFeature> }
    >({
      query: ({ key, data }) => ({ url: `/features/${key}`, method: "PUT", body: data }),
      invalidatesTags: ["Features"],
    }),
    deleteAdminFeature: builder.mutation<ApiEnvelope<unknown>, string>({
      query: (key) => ({ url: `/features/${key}`, method: "DELETE" }),
      invalidatesTags: ["Features"],
    }),
    setAdminFeatureTiers: builder.mutation<ApiEnvelope<{ tiers: FeatureTier[] }>, { key: string; tiers: FeatureTier[] }>({
      query: ({ key, tiers }) => ({ url: `/features/${key}/tiers`, method: "PUT", body: { tiers } }),
      invalidatesTags: ["Features"],
    }),
    getPlanFeatureAssignments: builder.query<
      ApiEnvelope<{ planId: string; groups?: FeatureGroup[]; features: PlanFeatureAssignment[] }>,
      string
    >({
      query: (planId) => ({ url: `/features/plans/${planId}` }),
      providesTags: (_r, _e, planId) => [{ type: "Features", id: `plan-${planId}` }],
    }),
    setPlanFeatureAssignments: builder.mutation<
      ApiEnvelope<{ planId: string; features: PlanFeatureAssignment[] }>,
      { planId: string; features: Array<{ featureKey: string; enabled?: boolean; limit?: number; tierKey?: string; value?: string }> }
    >({
      query: ({ planId, features }) => ({ url: `/features/plans/${planId}`, method: "PUT", body: { features } }),
      invalidatesTags: (_r, _e, { planId }) => ["Features", { type: "Features", id: `plan-${planId}` }, "Stores"],
    }),
  }),
});

export const {
  useGetStoreFeatureAccessQuery,
  useGetAdminFeaturesQuery,
  useGetAdminFeatureGroupsQuery,
  useGetAdminFeatureDetailQuery,
  useCreateAdminFeatureMutation,
  useUpdateAdminFeatureMutation,
  useDeleteAdminFeatureMutation,
  useSetAdminFeatureTiersMutation,
  useGetPlanFeatureAssignmentsQuery,
  useSetPlanFeatureAssignmentsMutation,
} = featureApi;

/** Map nav labels to feature keys */
export const NAV_FEATURE_MAP: Record<string, string> = {
  Products: "products",
  Categories: "categories",
  Inventory: "inventory",
  Orders: "orders",
  Customers: "customers",
  Reviews: "reviews",
  Coupons: "coupons",
  CMS: "cms",
  Media: "media",
  Analytics: "analytics",
  Marketing: "marketing",
  Apps: "apps",
  Theme: "theme_builder",
  Domain: "custom_domain",
  SEO: "seo",
  Reports: "reports",
  Builder: "builder",
};

export function getFeatureByKey(features: FeatureAccessItem[], key: string) {
  return features.find((f) => f.key === key);
}

export function isFeatureLocked(features: FeatureAccessItem[], key: string) {
  const feature = getFeatureByKey(features, key);
  return feature?.locked ?? false;
}

export function isLimitReached(features: FeatureAccessItem[], key: string) {
  const feature = getFeatureByKey(features, key);
  if (!feature || feature.type !== "limit" || feature.limit === 0) return false;
  return feature.current >= feature.limit;
}

export function normalizeFeatureType(type: string): FeatureType {
  return normalizeType(type);
}
