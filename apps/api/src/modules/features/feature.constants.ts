export const FEATURE_TYPES = ["boolean", "limit", "tier"] as const;
export type FeatureType = (typeof FEATURE_TYPES)[number];

/** Legacy aliases stored in older records */
export const LEGACY_FEATURE_TYPES = ["numeric", "string"] as const;

export function normalizeFeatureType(type: string): FeatureType {
  if (type === "numeric") return "limit";
  if (type === "string") return "tier";
  if (type === "boolean" || type === "limit" || type === "tier") return type;
  return "boolean";
}

export type TierLevel = {
  key: string;
  label: string;
  rank: number;
  description?: string;
};

/** Maps legacy plan.limits fields to feature keys for one-time migration */
export const LEGACY_LIMIT_MAP: Record<string, string> = {
  products: "products",
  orders: "orders",
  categories: "categories",
  staff: "staff",
  storageGB: "storage",
  bandwidthGB: "bandwidth",
  domains: "custom_domain",
  themes: "theme_builder",
  builderPages: "page_builder",
  apiAccess: "api_access",
  analytics: "analytics",
  coupons: "coupons",
  reviews: "reviews",
  marketing: "marketing",
  customCode: "custom_code",
};

export function getTierRank(tiers: TierLevel[], tierKey: string): number {
  const tier = tiers.find((t) => t.key === tierKey);
  return tier?.rank ?? 0;
}

export function tierMeetsMinimum(tiers: TierLevel[], assignedTier: string, minimumTier: string): boolean {
  if (!assignedTier || assignedTier === "disabled" || assignedTier === "none") return false;
  if (!minimumTier || minimumTier === "disabled" || minimumTier === "none") return true;
  return getTierRank(tiers, assignedTier) >= getTierRank(tiers, minimumTier);
}

export function isTierDisabled(tierKey: string): boolean {
  return !tierKey || tierKey === "disabled" || tierKey === "none";
}
