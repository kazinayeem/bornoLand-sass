/**
 * Canonical Module Registry & Dependency Definitions for BornoLand Web Frontend.
 */

export type PlatformModuleCategory =
  | "commerce"
  | "pos"
  | "operations"
  | "people"
  | "growth"
  | "store"
  | "platform"
  | "finance";

export interface PlatformModuleDefinition {
  key: string;
  name: string;
  category: PlatformModuleCategory;
  description: string;
  iconName: string;
  dependencies: string[];
  status: "active" | "beta" | "planned";
  features: string[];
  limits?: string[];
  permissions: string[];
}

export const CANONICAL_MODULE_REGISTRY: Record<string, PlatformModuleDefinition> = {
  // ── COMMERCE ─────────────────────────────────────────────────────────────
  commerce: {
    key: "commerce",
    name: "Online Store & Catalog",
    category: "commerce",
    description: "Product catalog, categories, online orders, cart, customer checkout, coupons & reviews.",
    iconName: "ShoppingBag",
    dependencies: [],
    status: "active",
    features: [
      "products",
      "categories",
      "orders",
      "customers",
      "coupons",
      "reviews",
      "cart",
      "wishlist",
      "product_variants",
      "incomplete_orders",
      "abandoned_cart",
      "checkout_recovery",
    ],
    limits: ["products", "categories", "orders", "customers"],
    permissions: [
      "products:read",
      "products:create",
      "products:update",
      "products:delete",
      "products:export",
      "categories:read",
      "categories:create",
      "categories:update",
      "categories:delete",
      "orders:read",
      "orders:create",
      "orders:update",
      "orders:delete",
      "orders:export",
      "customers:read",
      "customers:create",
      "customers:update",
      "customers:delete",
      "coupons:read",
      "coupons:create",
      "coupons:update",
      "coupons:delete",
      "reviews:read",
      "reviews:update",
      "reviews:delete",
    ],
  },

  // ── POINT OF SALE ─────────────────────────────────────────────────────────
  pos: {
    key: "pos",
    name: "Point of Sale (POS)",
    category: "pos",
    description: "In-person cashier checkout, quick orders, barcode scanning, shift management & receipts.",
    iconName: "Calculator",
    dependencies: ["commerce"],
    status: "active",
    features: ["pos", "pos_checkout", "pos_receipts", "pos_shifts", "pos_barcode"],
    limits: ["pos_terminals", "pos_devices"],
    permissions: [
      "pos:read",
      "pos:create",
      "pos:update",
      "pos:delete",
      "pos:refund",
      "pos:manage",
    ],
  },

  // ── OPERATIONS / ERP ──────────────────────────────────────────────────────
  inventory: {
    key: "inventory",
    name: "Inventory Management",
    category: "operations",
    description: "Real-time stock tracking, stock adjustments, batch/FIFO tracking, cost & price history.",
    iconName: "Boxes",
    dependencies: ["commerce"],
    status: "active",
    features: [
      "inventory",
      "inventory_history",
      "price_history",
      "cost_history",
      "batch_fifo",
      "barcode",
      "low_stock_alerts",
      "inventory_audit_log",
      "inventory_reports",
    ],
    limits: ["inventory_locations"],
    permissions: [
      "inventory:read",
      "inventory:create",
      "inventory:update",
      "inventory:delete",
      "inventory:export",
      "inventory:manage",
    ],
  },

  warehouse: {
    key: "warehouse",
    name: "Multi-Warehouse & Stock Transfers",
    category: "operations",
    description: "Manage multiple storage facilities, inter-warehouse stock transfers, and location tracking.",
    iconName: "Building2",
    dependencies: ["inventory"],
    status: "active",
    features: ["warehouses", "stock_transfer", "warehouse_locations"],
    limits: ["warehouses"],
    permissions: [
      "warehouse:read",
      "warehouse:create",
      "warehouse:update",
      "warehouse:delete",
      "warehouse:manage",
    ],
  },

  procurement: {
    key: "procurement",
    name: "Procurement & Suppliers",
    category: "operations",
    description: "Supplier relationship management, purchase orders, and receiving workflow.",
    iconName: "Truck",
    dependencies: ["inventory"],
    status: "active",
    features: ["suppliers", "purchase_orders", "receiving_logs"],
    permissions: [
      "procurement:read",
      "procurement:create",
      "procurement:update",
      "procurement:delete",
      "procurement:manage",
    ],
  },

  shipping: {
    key: "shipping",
    name: "Shipping & Courier Logistics",
    category: "operations",
    description: "Delivery zones, shipping calculation, and Bangladeshi courier integrations (Pathao, RedX, Steadfast).",
    iconName: "Truck",
    dependencies: ["commerce"],
    status: "active",
    features: ["shipping", "courier", "delivery_zones"],
    permissions: [
      "shipping:read",
      "shipping:create",
      "shipping:update",
      "shipping:delete",
      "shipping:manage",
    ],
  },

  // ── PEOPLE / HRM ──────────────────────────────────────────────────────────
  hrm: {
    key: "hrm",
    name: "HR & Employee Management",
    category: "people",
    description: "Employee records, attendance tracking, shift scheduling, and payroll management.",
    iconName: "Users",
    dependencies: [],
    status: "planned",
    features: ["employees", "attendance", "leave_mgmt", "payroll"],
    limits: ["employees"],
    permissions: [
      "hrm:read",
      "hrm:create",
      "hrm:update",
      "hrm:delete",
      "hrm:manage",
    ],
  },

  // ── GROWTH & MARKETING ────────────────────────────────────────────────────
  analytics: {
    key: "analytics",
    name: "Analytics & Business Intelligence",
    category: "growth",
    description: "Store visitor metrics, live visitors, conversion tracking, traffic sources, and business reports.",
    iconName: "BarChart3",
    dependencies: [],
    status: "active",
    features: ["analytics", "visitor_analytics", "realtime_visitors", "reports", "export_analytics"],
    permissions: [
      "analytics:read",
      "analytics:export",
      "reports:read",
      "reports:export",
    ],
  },

  marketing: {
    key: "marketing",
    name: "Marketing & Tracking Pixels",
    category: "growth",
    description: "Meta Pixel, TikTok Pixel, Google Analytics 4, and custom tracking script injection.",
    iconName: "Megaphone",
    dependencies: [],
    status: "active",
    features: ["marketing", "meta_pixel", "tiktok_pixel", "google_analytics", "custom_tracking", "campaigns"],
    permissions: [
      "marketing:read",
      "marketing:create",
      "marketing:update",
      "marketing:delete",
    ],
  },

  // ── STORE & DESIGN ────────────────────────────────────────────────────────
  builder: {
    key: "builder",
    name: "Visual Store Builder & CMS",
    category: "store",
    description: "Visual drag-and-drop page builder, custom pages, themes, navigation menus, and SEO settings.",
    iconName: "Palette",
    dependencies: [],
    status: "active",
    features: ["builder", "theme_builder", "pages", "navigation", "custom_domain", "seo", "cms", "media"],
    limits: ["pages", "custom_domains", "storage"],
    permissions: [
      "pages:read",
      "pages:create",
      "pages:update",
      "pages:delete",
      "pages:manage",
      "media:read",
      "media:create",
      "media:delete",
      "settings:read",
      "settings:update",
      "settings:manage",
    ],
  },

  // ── PLATFORM & TEAM ───────────────────────────────────────────────────────
  team: {
    key: "team",
    name: "Team & Access Control",
    category: "platform",
    description: "Staff accounts, role management, invitation links, and granular resource permissions.",
    iconName: "ShieldCheck",
    dependencies: [],
    status: "active",
    features: ["staff", "role_management", "audit_logs"],
    limits: ["staff"],
    permissions: [
      "members:read",
      "members:create",
      "members:update",
      "members:delete",
      "members:manage",
    ],
  },

  // ── FINANCE ───────────────────────────────────────────────────────────────
  finance: {
    key: "finance",
    name: "Finance & Payments",
    category: "finance",
    description: "Multi-gateway payment settings, invoice management, tax engine, and billing.",
    iconName: "CreditCard",
    dependencies: ["commerce"],
    status: "active",
    features: ["payments", "sslcommerz_payment", "invoices", "tax_engine", "billing"],
    permissions: [
      "payments:read",
      "payments:create",
      "payments:update",
      "payments:delete",
      "payments:manage",
      "finance:read",
      "finance:manage",
    ],
  },
};

export function validateModuleDependencies(enabledModuleKeys: string[]): {
  valid: boolean;
  missingDependencies: Record<string, string[]>;
} {
  const enabledSet = new Set(enabledModuleKeys);
  const missingDependencies: Record<string, string[]> = {};
  let valid = true;

  for (const key of enabledModuleKeys) {
    const mod = CANONICAL_MODULE_REGISTRY[key];
    if (!mod) continue;

    const missing = mod.dependencies.filter((dep) => !enabledSet.has(dep));
    if (missing.length > 0) {
      missingDependencies[key] = missing;
      valid = false;
    }
  }

  return { valid, missingDependencies };
}

export function resolveRequiredModules(selectedModuleKeys: string[]): string[] {
  const resolved = new Set<string>(selectedModuleKeys);
  let addedNew = true;

  while (addedNew) {
    addedNew = false;
    for (const key of Array.from(resolved)) {
      const mod = CANONICAL_MODULE_REGISTRY[key];
      if (mod?.dependencies) {
        for (const dep of mod.dependencies) {
          if (!resolved.has(dep)) {
            resolved.add(dep);
            addedNew = true;
          }
        }
      }
    }
  }

  return Array.from(resolved);
}
