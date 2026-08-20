export type UserRole =
  | "super_admin"
  | "workspace_owner"
  | "store_owner"
  | "store_admin"
  | "staff"
  | "viewer";

export type PlanSlug = "free" | "starter" | "pro" | "business" | "enterprise";

export type FeatureKey =
  | "theme_builder"
  | "advanced_themes"
  | "custom_domain"
  | "analytics_advanced"
  | "courier_integration"
  | "staff_management"
  | "export_data";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  workspace_owner: 80,
  store_owner: 70,
  store_admin: 50,
  staff: 30,
  viewer: 10,
};

const PLAN_FEATURE_MATRIX: Record<FeatureKey, PlanSlug[]> = {
  theme_builder: ["pro", "business", "enterprise"],
  advanced_themes: ["starter", "pro", "business", "enterprise"],
  custom_domain: ["business", "enterprise"],
  analytics_advanced: ["pro", "business", "enterprise"],
  courier_integration: ["starter", "pro", "business", "enterprise"],
  staff_management: ["pro", "business", "enterprise"],
  export_data: ["business", "enterprise"],
};

export function hasMinRole(userRole: UserRole | string | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  const current = ROLE_HIERARCHY[userRole as UserRole] ?? 0;
  const target = ROLE_HIERARCHY[requiredRole] ?? 0;
  return current >= target;
}

export function isFeatureAllowedForPlan(feature: FeatureKey, planSlug: PlanSlug | string | undefined): boolean {
  if (!planSlug) return feature === "advanced_themes";
  const normalizedPlan = planSlug.toLowerCase() as PlanSlug;
  const allowedPlans = PLAN_FEATURE_MATRIX[feature] ?? [];
  return allowedPlans.includes(normalizedPlan);
}

export function canAccessThemeBuilder(userRole?: string, planSlug?: string): { allowed: boolean; reason?: string } {
  if (userRole === "super_admin") return { allowed: true };
  if (userRole === "viewer") {
    return { allowed: false, reason: "Viewers do not have edit permissions." };
  }
  if (!isFeatureAllowedForPlan("theme_builder", planSlug)) {
    return {
      allowed: false,
      reason: "Theme Builder requires a Pro plan or higher. Upgrade to unlock visual store customization.",
    };
  }
  return { allowed: true };
}
