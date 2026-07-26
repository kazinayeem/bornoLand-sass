"use client";

import type { TabHelpers } from "./types";

const FEATURE_GROUPS: { label: string; keys: string[] }[] = [
  {
    label: "Products & Inventory",
    keys: ["productVariants", "inventory", "advancedInventory", "digitalProducts", "physicalProducts"],
  },
  {
    label: "Sales & Marketing",
    keys: ["coupons", "giftCards", "flashSales", "bundleDeals", "tieredPricing", "volumeDiscounts", "bogo", "freeShipping"],
  },
  {
    label: "Content & Design",
    keys: ["blog", "cms", "pageBuilder", "dragDropBuilder", "themeEditor", "fileManager", "mediaLibrary"],
  },
  {
    label: "Analytics & SEO",
    keys: ["advancedAnalytics", "seo", "customCheckout", "checkoutFields"],
  },
  {
    label: "Commerce Features",
    keys: ["subscriptions", "bookings", "pos", "wholesale", "dropshipping", "affiliateSystem", "loyaltyPoints", "referralSystem"],
  },
  {
    label: "Integrations",
    keys: ["apiAccess", "webhooks", "marketplace", "googleShopping", "facebookShop", "amazon", "ebay", "etsy", "shopify", "woocommerce", "bigcommerce"],
  },
  {
    label: "Marketing & Engagement",
    keys: ["abandonedCart", "emailMarketing", "smsMarketing", "pushNotification", "liveChat"],
  },
  {
    label: "Access & Login",
    keys: ["googleLogin", "facebookLogin", "otpLogin", "staffManagement"],
  },
  {
    label: "Localization",
    keys: ["multiCurrency", "multiLanguage"],
  },
  {
    label: "Advanced",
    keys: ["taxEngine", "invoiceGenerator", "backupRestore", "auditLogs", "developerMode", "maintenanceMode", "darkMode", "whiteLabel", "customDomain", "subdomain", "aiContent", "bulkImport", "bulkExport", "csvImport", "csvExport", "advancedCheckout", "expressCheckout", "savedCards", "buyNowPayLater", "shipping", "courier", "localPickup", "storeVerification"],
  },
];

const FEATURE_LABELS: Record<string, string> = {
  productVariants: "Product Variants",
  inventory: "Inventory Management",
  advancedInventory: "Advanced Inventory",
  digitalProducts: "Digital Products",
  physicalProducts: "Physical Products",
  subscriptions: "Subscriptions",
  bookings: "Bookings",
  giftCards: "Gift Cards",
  coupons: "Coupons",
  reviews: "Reviews",
  blog: "Blog",
  cms: "CMS",
  pageBuilder: "Page Builder",
  dragDropBuilder: "Drag & Drop Builder",
  themeEditor: "Theme Editor",
  advancedAnalytics: "Advanced Analytics",
  seo: "SEO",
  aiContent: "AI Content",
  customDomain: "Custom Domain",
  subdomain: "Subdomain",
  whiteLabel: "White Label",
  apiAccess: "API Access",
  webhooks: "Webhooks",
  staffManagement: "Staff Management",
  marketplace: "Marketplace",
  pos: "POS",
  wholesale: "Wholesale",
  dropshipping: "Dropshipping",
  shipping: "Shipping",
  courier: "Courier Management",
  localPickup: "Local Pickup",
  abandonedCart: "Abandoned Cart",
  emailMarketing: "Email Marketing",
  smsMarketing: "SMS Marketing",
  pushNotification: "Push Notifications",
  liveChat: "Live Chat",
  fileManager: "File Manager",
  mediaLibrary: "Media Library",
  bulkImport: "Bulk Import",
  bulkExport: "Bulk Export",
  csvImport: "CSV Import",
  csvExport: "CSV Export",
  googleLogin: "Google Login",
  facebookLogin: "Facebook Login",
  otpLogin: "OTP Login",
  multiCurrency: "Multi-Currency",
  multiLanguage: "Multi-Language",
  taxEngine: "Tax Engine",
  invoiceGenerator: "Invoice Generator",
  customCheckout: "Custom Checkout",
  checkoutFields: "Custom Checkout Fields",
  advancedCheckout: "Advanced Checkout",
  loyaltyPoints: "Loyalty Points",
  referralSystem: "Referral System",
  affiliateSystem: "Affiliate System",
  storeVerification: "Store Verification",
  backupRestore: "Backup & Restore",
  auditLogs: "Audit Logs",
  developerMode: "Developer Mode",
  maintenanceMode: "Maintenance Mode",
  darkMode: "Dark Mode",
  expressCheckout: "Express Checkout",
  savedCards: "Saved Cards",
  buyNowPayLater: "Buy Now Pay Later",
  flashSales: "Flash Sales",
  bundleDeals: "Bundle Deals",
  tieredPricing: "Tiered Pricing",
  volumeDiscounts: "Volume Discounts",
  bogo: "BOGO Deals",
  freeShipping: "Free Shipping",
  googleShopping: "Google Shopping",
  facebookShop: "Facebook Shop",
  amazon: "Amazon",
  ebay: "eBay",
  etsy: "Etsy",
  shopify: "Shopify Import",
  woocommerce: "WooCommerce Import",
  bigcommerce: "BigCommerce Import",
  giftWrapping: "Gift Wrapping",
  customPackaging: "Custom Packaging",
  subscriptionProducts: "Subscription Products",
  serviceProducts: "Service Products",
  preOrder: "Pre-Order",
  backInStock: "Back in Stock",
  priceAlerts: "Price Alerts",
  instagramShopping: "Instagram Shopping",
  tiktokAds: "TikTok Ads",
  pinterestAds: "Pinterest Ads",
  snapchatAds: "Snapchat Ads",
  facebookAds: "Facebook Ads",
  googleAds: "Google Ads",
  carbonOffset: "Carbon Offset",
  donation: "Donation",
};

export function FeaturesTab({ helpers }: { helpers: TabHelpers }) {
  const { localFeatures, setLocalFeatures, settingsData, markDirty } = helpers;
  const effectiveFeatures = settingsData?.effectiveFeatures ?? {};

  const getPlanValue = (key: string): boolean => {
    return effectiveFeatures[key] ?? false;
  };

  const getOverrideValue = (key: string): boolean | null => {
    const v = localFeatures[key];
    return v !== undefined && v !== null ? Boolean(v) : null;
  };

  const toggleFeature = (key: string) => {
    const current = getOverrideValue(key);
    let newVal: boolean | null;
    if (current === null) {
      newVal = !getPlanValue(key);
    } else {
      newVal = !current;
    }
    setLocalFeatures((prev) => ({ ...prev, [key]: newVal }));
    markDirty();
  };

  const resetFeature = (key: string) => {
    setLocalFeatures((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    markDirty();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <p className="text-sm text-apple-ink-muted-48">
        Toggle individual features on/off for this store. The toggle shows the effective state (override if set, else plan default).
        Click <strong>Reset</strong> to revert to plan default.
      </p>

      {FEATURE_GROUPS.map((group) => (
        <div key={group.label} className="rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-5 py-3">
            <h4 className="text-sm font-semibold text-apple-ink-muted-80">{group.label}</h4>
          </div>
          <div className="grid gap-px bg-zinc-100 sm:grid-cols-2 lg:grid-cols-3">
            {group.keys.map((key) => {
              const effective = getOverrideValue(key) ?? getPlanValue(key);
              const isOverridden = getOverrideValue(key) !== null;

              return (
                <div key={key} className="flex items-center justify-between gap-2 bg-white px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-apple-ink-muted-80 truncate">
                      {FEATURE_LABELS[key] ?? key}
                    </p>
                    <p className="text-xs text-apple-ink-muted-48">
                      Plan: {getPlanValue(key) ? "On" : "Off"}
                      {isOverridden && " · Overridden"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleFeature(key)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        effective ? "bg-blue-600" : "bg-zinc-200"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          effective ? "translate-x-[22px]" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    {isOverridden && (
                      <button
                        onClick={() => resetFeature(key)}
                        className="rounded px-2 py-1 text-xs text-apple-ink-muted-48 hover:text-apple-ink-muted-80"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
