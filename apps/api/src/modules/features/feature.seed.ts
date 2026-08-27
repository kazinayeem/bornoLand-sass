/**
 * Bootstrap seed definitions — upserted safely on every migration run.
 * Existing records are never overwritten; only missing keys/rows are inserted.
 *
 * ONLY features that are actually implemented in the application are listed here.
 * Features are added here ONLY when the module is fully functional.
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

// ── Groups ──────────────────────────────────────────────────────────────────

export const SEED_GROUPS: SeedGroup[] = [
  { key: "commerce", name: "Commerce", sortOrder: 1 },
  { key: "inventory_mgmt", name: "Inventory Management", sortOrder: 2 },
  { key: "content", name: "Content", sortOrder: 3 },
  { key: "marketing", name: "Marketing & Tracking", sortOrder: 4 },
  { key: "platform", name: "Platform", sortOrder: 5 },
];

// ── Features (only implemented modules) ─────────────────────────────────────

export const SEED_FEATURES: SeedFeature[] = [
  // Commerce
  { key: "products", name: "Products", description: "Product catalog management", type: "limit", groupKey: "commerce", sortOrder: 1, usageCounterKey: "products", unit: "items", defaultLimit: 50 },
  { key: "categories", name: "Categories", description: "Product categories", type: "limit", groupKey: "commerce", sortOrder: 2, usageCounterKey: "categories", defaultLimit: 20 },
  { key: "inventory", name: "Inventory", description: "Current stock tracking and adjustments", type: "boolean", groupKey: "inventory_mgmt", sortOrder: 1, defaultEnabled: true },
  { key: "inventory_history", name: "Inventory History", description: "Stock movement history and ledger", type: "boolean", groupKey: "inventory_mgmt", sortOrder: 2, defaultEnabled: false },
  { key: "price_history", name: "Price History", description: "Track selling and compare price changes", type: "boolean", groupKey: "inventory_mgmt", sortOrder: 3, defaultEnabled: false },
  { key: "cost_history", name: "Cost History", description: "Track purchase and average cost changes", type: "boolean", groupKey: "inventory_mgmt", sortOrder: 4, defaultEnabled: false },
  { key: "suppliers", name: "Suppliers", description: "Supplier profiles and purchase history", type: "boolean", groupKey: "inventory_mgmt", sortOrder: 5, defaultEnabled: false },
  { key: "purchase_orders", name: "Purchase Orders", description: "Create and receive purchase orders", type: "boolean", groupKey: "inventory_mgmt", sortOrder: 6, defaultEnabled: false },
  { key: "batch_fifo", name: "Batch / FIFO Inventory", description: "Batch lots with FIFO allocation", type: "boolean", groupKey: "inventory_mgmt", sortOrder: 7, defaultEnabled: false },
  { key: "warehouses", name: "Warehouses", description: "Multi-warehouse stock and transfers", type: "boolean", groupKey: "inventory_mgmt", sortOrder: 8, defaultEnabled: false },
  { key: "barcode", name: "Barcode", description: "Generate, print, and search barcodes", type: "boolean", groupKey: "inventory_mgmt", sortOrder: 9, defaultEnabled: false },
  { key: "inventory_reports", name: "Inventory Reports", description: "Valuation, aging, and movement reports", type: "boolean", groupKey: "inventory_mgmt", sortOrder: 10, defaultEnabled: false },
  { key: "low_stock_alerts", name: "Low Stock Alerts", description: "Minimum stock alerts and notifications", type: "boolean", groupKey: "inventory_mgmt", sortOrder: 11, defaultEnabled: false },
  { key: "stock_transfer", name: "Stock Transfer", description: "Transfer stock between warehouses", type: "boolean", groupKey: "inventory_mgmt", sortOrder: 12, defaultEnabled: false },
  { key: "inventory_audit_log", name: "Inventory Audit Log", description: "Permanent audit trail for inventory actions", type: "boolean", groupKey: "inventory_mgmt", sortOrder: 13, defaultEnabled: false },
  { key: "orders", name: "Orders", description: "Order management", type: "limit", groupKey: "commerce", sortOrder: 4, usageCounterKey: "orders", unit: "orders", defaultLimit: 0 },
  { key: "customers", name: "Customers", description: "Customer records", type: "limit", groupKey: "commerce", sortOrder: 5, usageCounterKey: "customers", defaultLimit: 0 },
  { key: "product_variants", name: "Product Variants", description: "Variant combinations per product", type: "limit", groupKey: "commerce", sortOrder: 6, unit: "variants", defaultLimit: 0 },

  // Content
  { key: "cms", name: "CMS", description: "Content management system", type: "boolean", groupKey: "content", sortOrder: 10, defaultEnabled: true },
  { key: "page_builder", name: "Pages", description: "CMS page management", type: "limit", groupKey: "content", sortOrder: 11, usageCounterKey: "pages", defaultLimit: 10 },
  { key: "media", name: "Media", description: "Media library and file management", type: "limit", groupKey: "content", sortOrder: 12, usageCounterKey: "media", unit: "files", defaultEnabled: true, defaultLimit: 0 },
  { key: "builder", name: "Builder", description: "Visual store page builder", type: "boolean", groupKey: "content", sortOrder: 13, defaultEnabled: true },
  { key: "theme_builder", name: "Theme", description: "Theme customization and management", type: "boolean", groupKey: "content", sortOrder: 14, defaultEnabled: true },

  // Marketing & Tracking
  { key: "meta_pixel", name: "Meta Pixel", description: "Facebook & Instagram advertising pixel tracking", type: "boolean", groupKey: "marketing", sortOrder: 1, defaultEnabled: false },
  { key: "tiktok_pixel", name: "TikTok Pixel", description: "TikTok advertising pixel tracking", type: "boolean", groupKey: "marketing", sortOrder: 2, defaultEnabled: false },
  { key: "custom_tracking", name: "Custom Tracking Script", description: "Custom HTML / JS header and body scripts", type: "boolean", groupKey: "marketing", sortOrder: 3, defaultEnabled: false },
  { key: "google_analytics", name: "Google Analytics", description: "Google Analytics 4 measurement", type: "boolean", groupKey: "marketing", sortOrder: 4, defaultEnabled: false },
  { key: "conversion_tracking", name: "Conversion Tracking", description: "Advanced e-commerce conversion tracking", type: "boolean", groupKey: "marketing", sortOrder: 5, defaultEnabled: false },
  { key: "advanced_tracking", name: "Advanced Tracking", description: "Server-side and advanced matched tracking", type: "boolean", groupKey: "marketing", sortOrder: 6, defaultEnabled: false },

  // Platform
  { key: "analytics", name: "Analytics", description: "Store analytics and insights", type: "tier", groupKey: "platform", sortOrder: 20, defaultTier: "basic" },
  { key: "reports", name: "Reports", description: "Advanced business reports, analytics, exports and insights", type: "boolean", groupKey: "platform", sortOrder: 21 },
  { key: "staff", name: "Staff Members", description: "Team member accounts", type: "limit", groupKey: "platform", sortOrder: 21, usageCounterKey: "staff", defaultLimit: 1 },
  { key: "storage", name: "Storage", description: "File storage space", type: "limit", groupKey: "platform", sortOrder: 22, usageCounterKey: "storageMB", unit: "GB", defaultLimit: 1 },
  { key: "billing", name: "Billing", description: "Billing and subscription management", type: "boolean", groupKey: "platform", sortOrder: 23, defaultEnabled: true },
  { key: "branding", name: "Branding", description: "Store branding and customization", type: "boolean", groupKey: "platform", sortOrder: 24, defaultEnabled: true },
  // Commerce
  { key: "abandoned_cart", name: "Abandoned Cart", description: "Track and recover abandoned carts", type: "boolean", groupKey: "commerce", sortOrder: 8, defaultEnabled: false },
  { key: "incomplete_orders", name: "Incomplete Orders", description: "Track progressive checkout sessions and incomplete orders", type: "boolean", groupKey: "commerce", sortOrder: 9, defaultEnabled: false },
  { key: "checkout_recovery", name: "Checkout Recovery", description: "Generate secure checkout recovery links and recover sessions", type: "boolean", groupKey: "commerce", sortOrder: 10, defaultEnabled: false },
  { key: "recovery_analytics", name: "Recovery Analytics", description: "Advanced checkout abandonment and recovery analytics", type: "boolean", groupKey: "commerce", sortOrder: 11, defaultEnabled: false },
  { key: "courier", name: "Courier Management", description: "Third-party courier integrations (Pathao, RedX, Steadfast, Paperfly, Sundarban)", type: "boolean", groupKey: "commerce", sortOrder: 7, defaultEnabled: false },
  { key: "sslcommerz_payment", name: "SSLCommerz Payment Gateway", description: "Per-shop multi-tenant SSLCommerz payment gateway integration", type: "boolean", groupKey: "commerce", sortOrder: 12, defaultEnabled: false },
];

// ── Tiers (only for tier-type features) ─────────────────────────────────────

export const SEED_TIERS: SeedTier[] = [
  { featureKey: "analytics", tierKey: "disabled", label: "Disabled", rank: 0 },
  { featureKey: "analytics", tierKey: "basic", label: "Basic", rank: 1 },
  { featureKey: "analytics", tierKey: "advanced", label: "Advanced", rank: 2 },
  { featureKey: "analytics", tierKey: "enterprise", label: "Enterprise", rank: 3 },
];

// ── Limits ──────────────────────────────────────────────────────────────────

export const SEED_LIMITS: SeedLimit[] = [
  { featureKey: "products", unit: "items", defaultLimit: 50 },
  { featureKey: "categories", unit: "categories", defaultLimit: 20 },
  { featureKey: "media", unit: "files", defaultLimit: 0 },
  { featureKey: "product_variants", unit: "variants", defaultLimit: 0 },
  { featureKey: "storage", unit: "GB", defaultLimit: 1 },
  { featureKey: "staff", unit: "members", defaultLimit: 1 },
  { featureKey: "page_builder", unit: "pages", defaultLimit: 10 },
];
