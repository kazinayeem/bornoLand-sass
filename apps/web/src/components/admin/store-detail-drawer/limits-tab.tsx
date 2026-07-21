"use client";

import { XCircle } from "lucide-react";
import type { TabHelpers } from "./types";

const LIMIT_GROUPS: { label: string; keys: string[] }[] = [
  {
    label: "Products & Categories",
    keys: ["products", "categories", "collections", "brands", "productVariants", "productImages"],
  },
  {
    label: "Orders & Customers",
    keys: ["orders", "customers", "reviews", "wishlistItems", "returnRequests"],
  },
  {
    label: "Content & Pages",
    keys: ["builderPages", "pages", "cmsBlocks", "blogs", "dynamicSections", "builderTemplates"],
  },
  {
    label: "Staff & Access",
    keys: ["staff", "staffRoles", "apiKeys"],
  },
  {
    label: "Marketing & Sales",
    keys: ["coupons", "shippingZones", "pickupLocations", "giftCards", "campaigns", "emailTemplates", "automationRules", "popups", "forms", "announcements", "testimonials"],
  },
  {
    label: "Media & Storage",
    keys: ["mediaUploads", "customCss", "customJs", "customFonts"],
  },
  {
    label: "Integrations & Config",
    keys: ["integrations", "webhooks", "languages", "currencies", "taxRules", "inventoryLocations", "posDevices", "paymentMethods", "activeThemes", "menus", "navItems", "customDomains"],
  },
  {
    label: "Advanced",
    keys: ["analyticsReports", "exportRequests", "qrCodes", "redirectRules", "warehouses"],
  },
];

const LIMIT_LABELS: Record<string, string> = {
  storage: "Storage (MB)", products: "Products", categories: "Categories",
  collections: "Collections", brands: "Brands", productVariants: "Product Variants",
  productImages: "Images per Product", orders: "Orders", customers: "Customers",
  staff: "Staff Members", warehouses: "Warehouses", pages: "CMS Pages",
  builderPages: "Builder Pages", mediaUploads: "Media Uploads", apiKeys: "API Keys",
  customDomains: "Custom Domains", coupons: "Coupons", shippingZones: "Shipping Zones",
  pickupLocations: "Pickup Locations", paymentMethods: "Payment Methods",
  activeThemes: "Active Themes", menus: "Menus", navItems: "Navigation Items",
  reviews: "Reviews", testimonials: "Testimonials", announcements: "Announcements",
  newsletterSubscribers: "Newsletter Subscribers", campaigns: "Campaigns",
  emailTemplates: "Email Templates", automationRules: "Automation Rules",
  integrations: "Integrations", webhooks: "Webhooks", languages: "Languages",
  currencies: "Currencies", taxRules: "Tax Rules", inventoryLocations: "Inventory Locations",
  posDevices: "POS Devices", giftCards: "Gift Cards", returnRequests: "Return Requests",
  wishlistItems: "Wishlist Items", analyticsReports: "Analytics Reports",
  exportRequests: "Export Requests", staffRoles: "Staff Roles", cmsBlocks: "CMS Blocks",
  dynamicSections: "Dynamic Sections", builderTemplates: "Builder Templates",
  forms: "Forms", popups: "Popups", qrCodes: "QR Codes", redirectRules: "Redirect Rules",
  customCss: "Custom CSS (MB)", customJs: "Custom JS (MB)", customFonts: "Custom Fonts (MB)",
  blogs: "Blogs",
};

export function LimitsTab({ helpers }: { helpers: TabHelpers }) {
  const { localLimits, setLocalLimits, settingsData, markDirty } = helpers;
  const effectiveLimits = settingsData?.effectiveLimits ?? {};
  const allKeys = LIMIT_GROUPS.flatMap((g) => g.keys);

  const getPlanValue = (key: string): string => {
    const v = effectiveLimits[key];
    if (v == null) return "—";
    if (v === -1) return "∞";
    return String(v);
  };

  const getOverrideValue = (key: string): string => {
    const v = localLimits[key];
    if (v === undefined || v === null) return "Plan default";
    return String(v);
  };

  const setLimit = (key: string, value: string) => {
    const num = value === "" ? null : Number(value);
    setLocalLimits((prev) => ({ ...prev, [key]: num }));
    markDirty();
  };

  const resetLimit = (key: string) => {
    setLocalLimits((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    markDirty();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <p className="text-sm text-apple-ink-muted-48">
        Override individual plan limits for this store. Leave a field empty to use the plan default.
        Set to <strong>-1</strong> for unlimited.
      </p>

      {LIMIT_GROUPS.map((group) => {
        const groupKeys = group.keys.filter((k) => allKeys.includes(k));
        if (groupKeys.length === 0) return null;

        return (
          <div key={group.label} className="rounded-xl border border-zinc-200 bg-white">
            <div className="border-b border-zinc-100 px-5 py-3">
              <h4 className="text-sm font-semibold text-apple-ink-muted-80">{group.label}</h4>
            </div>
            <div className="divide-y divide-zinc-50">
              {groupKeys.map((key) => (
                <div key={key} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-apple-ink-muted-80">
                      {LIMIT_LABELS[key] ?? key}
                    </p>
                    <p className="text-xs text-apple-ink-muted-48">
                      Plan: {getPlanValue(key)} · Override: {getOverrideValue(key)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      className="h-9 w-24 rounded-lg border border-zinc-200 px-3 text-sm text-right focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Plan"
                      value={
                        localLimits[key] !== undefined && localLimits[key] !== null
                          ? String(localLimits[key])
                          : ""
                      }
                      onChange={(e) => setLimit(key, e.target.value)}
                    />
                    <button
                      onClick={() => resetLimit(key)}
                      className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-red-50 hover:text-red-500"
                      title="Reset to plan default"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
