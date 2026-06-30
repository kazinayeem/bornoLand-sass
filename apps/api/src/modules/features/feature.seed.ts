/**
 * Bootstrap seed definitions — upserted safely on every migration run.
 * Existing records are never overwritten; only missing keys/rows are inserted.
 */
import type { FeatureType } from "./feature.constants.js";

type SeedGroup = { key: string; name: string; sortOrder: number };
type SeedTier = { featureKey: string; tierKey: string; label: string; rank: number };
type SeedLimit = { featureKey: string; unit: string; defaultLimit: number };
type SeedFeature = {
  key: string;
  name: string;
  description: string;
  type: FeatureType;
  groupKey: string;
  sortOrder: number;
  usageCounterKey?: string;
  unit?: string;
  defaultEnabled?: boolean;
  defaultLimit?: number;
  defaultTier?: string;
};

export const SEED_GROUPS: SeedGroup[] = [
  { key: "commerce", name: "Commerce", sortOrder: 1 },
  { key: "marketing", name: "Marketing", sortOrder: 2 },
  { key: "content", name: "Content", sortOrder: 3 },
  { key: "appearance", name: "Appearance", sortOrder: 4 },
  { key: "insights", name: "Insights", sortOrder: 5 },
  { key: "platform", name: "Platform", sortOrder: 6 },
];

export const SEED_FEATURES: SeedFeature[] = [
  { key: "products", name: "Products", description: "Product catalog", type: "limit", groupKey: "commerce", sortOrder: 1, usageCounterKey: "products", unit: "items", defaultLimit: 50 },
  { key: "orders", name: "Orders", description: "Order management", type: "limit", groupKey: "commerce", sortOrder: 2, usageCounterKey: "orders", unit: "orders", defaultLimit: 0 },
  { key: "customers", name: "Customers", description: "Customer records", type: "limit", groupKey: "commerce", sortOrder: 3, usageCounterKey: "customers", defaultLimit: 0 },
  { key: "categories", name: "Categories", description: "Product categories", type: "limit", groupKey: "commerce", sortOrder: 4, usageCounterKey: "categories", defaultLimit: 20 },
  { key: "inventory", name: "Inventory", description: "Stock tracking", type: "boolean", groupKey: "commerce", sortOrder: 5 },
  { key: "product_variants", name: "Product Variants", description: "Variant combinations per product", type: "limit", groupKey: "commerce", sortOrder: 6, unit: "variants", defaultLimit: 0 },
  { key: "variant_bulk_tools", name: "Bulk Variant Tools", description: "Bulk variant management", type: "boolean", groupKey: "commerce", sortOrder: 7 },
  { key: "shipping", name: "Shipping", description: "Shipping zones", type: "boolean", groupKey: "commerce", sortOrder: 8 },
  { key: "payment_gateway", name: "Payment Gateway", description: "Online payments", type: "boolean", groupKey: "commerce", sortOrder: 9 },
  { key: "pos", name: "POS", description: "Point of sale", type: "boolean", groupKey: "commerce", sortOrder: 10 },
  { key: "coupons", name: "Coupons", description: "Discount coupons", type: "boolean", groupKey: "marketing", sortOrder: 10 },
  { key: "reviews", name: "Reviews", description: "Product reviews", type: "boolean", groupKey: "marketing", sortOrder: 11 },
  { key: "discounts", name: "Discounts", description: "Store discounts", type: "boolean", groupKey: "marketing", sortOrder: 12 },
  { key: "email_marketing", name: "Email Marketing", description: "Email campaigns", type: "boolean", groupKey: "marketing", sortOrder: 13 },
  { key: "abandoned_cart", name: "Abandoned Cart", description: "Cart recovery", type: "boolean", groupKey: "marketing", sortOrder: 14 },
  { key: "marketing", name: "Marketing", description: "Marketing tools", type: "boolean", groupKey: "marketing", sortOrder: 15 },
  { key: "cms", name: "CMS", description: "Content management", type: "boolean", groupKey: "content", sortOrder: 20 },
  { key: "blog", name: "Blog", description: "Blog posts", type: "boolean", groupKey: "content", sortOrder: 21 },
  { key: "media", name: "Media", description: "Media library", type: "limit", groupKey: "content", sortOrder: 22, usageCounterKey: "media", unit: "files", defaultEnabled: true, defaultLimit: 0 },
  { key: "page_builder", name: "Page Builder", description: "Visual pages", type: "limit", groupKey: "content", sortOrder: 23, usageCounterKey: "pages", defaultLimit: 10 },
  { key: "builder", name: "Builder", description: "Store builder", type: "boolean", groupKey: "content", sortOrder: 24 },
  { key: "theme_builder", name: "Theme Builder", description: "Theme customization", type: "boolean", groupKey: "appearance", sortOrder: 30 },
  { key: "custom_domain", name: "Custom Domain", description: "Custom domains", type: "boolean", groupKey: "appearance", sortOrder: 31 },
  { key: "seo", name: "SEO", description: "Search optimization", type: "tier", groupKey: "appearance", sortOrder: 32, defaultTier: "disabled" },
  { key: "analytics", name: "Analytics", description: "Store analytics", type: "tier", groupKey: "insights", sortOrder: 40, defaultTier: "disabled" },
  { key: "reports", name: "Reports", description: "Business reports", type: "tier", groupKey: "insights", sortOrder: 41, defaultTier: "disabled" },
  { key: "api_access", name: "API Access", description: "REST API", type: "tier", groupKey: "platform", sortOrder: 50, defaultTier: "disabled" },
  { key: "apps", name: "Apps", description: "App integrations", type: "boolean", groupKey: "platform", sortOrder: 51 },
  { key: "staff", name: "Staff Members", description: "Team members", type: "limit", groupKey: "platform", sortOrder: 52, usageCounterKey: "staff", defaultLimit: 1 },
  { key: "storage", name: "Storage", description: "File storage", type: "limit", groupKey: "platform", sortOrder: 53, usageCounterKey: "storageMB", unit: "GB", defaultLimit: 1 },
  { key: "bandwidth", name: "Bandwidth", description: "Monthly bandwidth", type: "limit", groupKey: "platform", sortOrder: 54, usageCounterKey: "bandwidthMB", unit: "GB", defaultLimit: 2 },
  { key: "export", name: "Export", description: "Data export", type: "boolean", groupKey: "platform", sortOrder: 55 },
  { key: "import", name: "Import", description: "Data import", type: "boolean", groupKey: "platform", sortOrder: 56 },
  { key: "custom_code", name: "Custom Code", description: "Custom HTML/CSS/JS", type: "boolean", groupKey: "platform", sortOrder: 57 },
  { key: "ai_features", name: "AI Features", description: "AI tools", type: "tier", groupKey: "platform", sortOrder: 58, defaultTier: "none" },
  { key: "multi_language", name: "Multi Language", description: "Multi-language", type: "boolean", groupKey: "platform", sortOrder: 59 },
  { key: "domains", name: "Domains", description: "Connected domains", type: "limit", groupKey: "appearance", sortOrder: 33, usageCounterKey: "domains", defaultLimit: 0 },
  { key: "templates", name: "Templates", description: "Store templates", type: "limit", groupKey: "appearance", sortOrder: 34, usageCounterKey: "templates", defaultLimit: 1 },
];

export const SEED_TIERS: SeedTier[] = [
  { featureKey: "analytics", tierKey: "disabled", label: "Disabled", rank: 0 },
  { featureKey: "analytics", tierKey: "basic", label: "Basic", rank: 1 },
  { featureKey: "analytics", tierKey: "advanced", label: "Advanced", rank: 2 },
  { featureKey: "analytics", tierKey: "enterprise", label: "Enterprise", rank: 3 },
  { featureKey: "seo", tierKey: "disabled", label: "Disabled", rank: 0 },
  { featureKey: "seo", tierKey: "basic", label: "Basic", rank: 1 },
  { featureKey: "seo", tierKey: "advanced", label: "Advanced", rank: 2 },
  { featureKey: "seo", tierKey: "professional", label: "Professional", rank: 3 },
  { featureKey: "api_access", tierKey: "disabled", label: "Disabled", rank: 0 },
  { featureKey: "api_access", tierKey: "read", label: "Read", rank: 1 },
  { featureKey: "api_access", tierKey: "read_write", label: "Read + Write", rank: 2 },
  { featureKey: "api_access", tierKey: "unlimited", label: "Unlimited", rank: 3 },
  { featureKey: "ai_features", tierKey: "none", label: "None", rank: 0 },
  { featureKey: "ai_features", tierKey: "basic", label: "Basic", rank: 1 },
  { featureKey: "ai_features", tierKey: "pro", label: "Pro", rank: 2 },
  { featureKey: "ai_features", tierKey: "enterprise", label: "Enterprise", rank: 3 },
  { featureKey: "reports", tierKey: "disabled", label: "Disabled", rank: 0 },
  { featureKey: "reports", tierKey: "basic", label: "Basic", rank: 1 },
  { featureKey: "reports", tierKey: "advanced", label: "Advanced", rank: 2 },
  { featureKey: "reports", tierKey: "enterprise", label: "Enterprise", rank: 3 },
];

export const SEED_LIMITS: SeedLimit[] = [
  { featureKey: "products", unit: "items", defaultLimit: 50 },
  { featureKey: "media", unit: "files", defaultLimit: 0 },
  { featureKey: "product_variants", unit: "variants", defaultLimit: 0 },
  { featureKey: "categories", unit: "categories", defaultLimit: 20 },
  { featureKey: "storage", unit: "GB", defaultLimit: 1 },
  { featureKey: "bandwidth", unit: "GB", defaultLimit: 2 },
  { featureKey: "staff", unit: "members", defaultLimit: 1 },
  { featureKey: "page_builder", unit: "pages", defaultLimit: 10 },
];
