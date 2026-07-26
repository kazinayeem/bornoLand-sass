"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Save, Zap, Shield, HardDrive, DollarSign, Eye, Clock } from "lucide-react";
import { toast } from "sonner";
import type { Plan, PlanLimits, PlanFeatureToggles, PlanCourierAccess } from "@/redux/api/store-api";
import { useUpdatePlanMutation } from "@/redux/api/store-api";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { PlanPreviewCard } from "@/components/admin/plans/plan-preview-card";

const COURIER_PROVIDER_OPTIONS: Array<{
  slug: PlanCourierAccess["providers"][number];
  label: string;
}> = [
  { slug: "pathao", label: "Pathao" },
  { slug: "redx", label: "RedX" },
  { slug: "steadfast", label: "Steadfast" },
  { slug: "paperfly", label: "Paperfly" },
  { slug: "sundarban", label: "Sundarban" },
];

/* ── Tabs ─────────────────────────────────────────────────────────────────── */

const BUILDER_TABS = [
  { id: "general", label: "General", icon: "Zap" },
  { id: "pricing", label: "Pricing", icon: "DollarSign" },
  { id: "limits", label: "Limits", icon: "Shield" },
  { id: "features", label: "Features", icon: "Zap" },
  { id: "storage", label: "Storage", icon: "HardDrive" },
  { id: "trial", label: "Trial", icon: "Clock" },
  { id: "visibility", label: "Visibility", icon: "Eye" },
  { id: "preview", label: "Preview", icon: "Eye" },
];

/* ── Implemented Limit Groups ─────────────────────────────────────────────── */

type LimitGroup = {
  key: string;
  label: string;
  fields: Array<{ key: keyof PlanLimits; label: string; suffix?: string }>;
};

const LIMIT_GROUPS: LimitGroup[] = [
  {
    key: "catalog", label: "Catalog",
    fields: [
      { key: "products", label: "Products" },
      { key: "categories", label: "Categories" },
      { key: "productVariants", label: "Product Variants" },
      { key: "productImages", label: "Images per Product" },
    ],
  },
  {
    key: "commerce", label: "Commerce",
    fields: [
      { key: "orders", label: "Orders" },
      { key: "customers", label: "Customers" },
    ],
  },
  {
    key: "content", label: "Content & Pages",
    fields: [
      { key: "pages", label: "CMS Pages" },
      { key: "builderPages", label: "Builder Pages" },
      { key: "blogs", label: "Blog Posts" },
      { key: "menus", label: "Menus" },
      { key: "navItems", label: "Navigation Items" },
    ],
  },
  {
    key: "media", label: "Media & Storage",
    fields: [
      { key: "mediaUploads", label: "Media Uploads" },
      { key: "storage", label: "Storage (MB)", suffix: "MB" },
    ],
  },
  {
    key: "staff", label: "Staff & Access",
    fields: [
      { key: "staff", label: "Staff Accounts" },
      { key: "staffRoles", label: "Staff Roles" },
    ],
  },
];

/* ── Implemented Feature Groups ───────────────────────────────────────────── */

type FeatureGroup = {
  key: string;
  label: string;
  toggles: Array<{ key: keyof PlanFeatureToggles; label: string; description?: string; alwaysEnabled?: boolean }>;
};

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    key: "products", label: "Products & Inventory",
    toggles: [
      { key: "productVariants", label: "Product Variants", description: "Multiple variants per product (size, color, etc.)" },
      { key: "inventory", label: "Inventory Tracking", description: "Track stock levels per product", alwaysEnabled: true },
      { key: "physicalProducts", label: "Physical Products", description: "Sell physical goods with shipping" },
      { key: "digitalProducts", label: "Digital Products", description: "Sell downloads, software, licenses" },
    ],
  },
  {
    key: "content", label: "Content & Pages",
    toggles: [
      { key: "cms", label: "CMS", description: "Content management system", alwaysEnabled: true },
      { key: "blog", label: "Blog", description: "Blog posts with categories" },
      { key: "pageBuilder", label: "Page Builder", description: "Visual page building" },
      { key: "dragDropBuilder", label: "Drag & Drop Builder", description: "Visual drag-and-drop editor" },
      { key: "themeEditor", label: "Theme Editor", description: "Customize store theme", alwaysEnabled: true },
    ],
  },
  {
    key: "media", label: "Media & Files",
    toggles: [
      { key: "mediaLibrary", label: "Media Library", description: "Central media and file manager", alwaysEnabled: true },
      { key: "bulkImport", label: "Bulk Import", description: "Import data in bulk" },
      { key: "bulkExport", label: "Bulk Export", description: "Export data in bulk" },
      { key: "csvImport", label: "CSV Import", description: "CSV file import" },
      { key: "csvExport", label: "CSV Export", description: "CSV file export" },
    ],
  },
  {
    key: "analytics", label: "Analytics & Insights",
    toggles: [
      { key: "visitorAnalytics", label: "Visitor Analytics", description: "Visitor tracking and analytics", alwaysEnabled: true },
      { key: "realtimeVisitors", label: "Real-time Visitors", description: "Live visitor dashboard" },
      { key: "analyticsExport", label: "Analytics Export", description: "Export analytics reports" },
      { key: "advancedAnalytics", label: "Advanced Analytics", description: "Advanced analytics and reports" },
      { key: "reports", label: "Reports", description: "Advanced business reports, analytics, exports and insights" },
    ],
  },
  {
    key: "management", label: "Management & Access",
    toggles: [
      { key: "staffManagement", label: "Staff Management", description: "Multi-user staff accounts" },
      { key: "apiAccess", label: "API Access", description: "REST API access" },
      { key: "subdomain", label: "Subdomain", description: "Platform subdomain (store.bornoland.com)", alwaysEnabled: true },
      { key: "customDomain", label: "Custom Domain", description: "Use your own domain name" },
      { key: "invoiceGenerator", label: "Invoice Generator", description: "Generate PDF invoices", alwaysEnabled: true },
    ],
  },
  {
    key: "operations", label: "Operations",
    toggles: [
      { key: "shipping", label: "Shipping", description: "Shipping rate management" },
      { key: "courier", label: "Courier Management", description: "Third-party courier integrations" },
      { key: "taxEngine", label: "Tax Engine", description: "Automated tax calculation" },
      { key: "maintenanceMode", label: "Maintenance Mode", description: "Put store in maintenance" },
      { key: "developerMode", label: "Developer Mode", description: "Custom code and debug tools" },
    ],
  },
];

/* ── Component ────────────────────────────────────────────────────────────── */

type Props = {
  plan: Plan;
  initialTab?: string;
};

export function PlanBuilder({ plan, initialTab }: Props) {
  const router = useRouter();
  const [updatePlan, { isLoading: isSaving }] = useUpdatePlanMutation();

  const [activeTab, setActiveTab] = useState(initialTab || "general");
  const [name, setName] = useState(plan.name);
  const [slug, setSlug] = useState(plan.slug);
  const [description, setDescription] = useState(plan.description ?? "");
  const [priceBDT, setPriceBDT] = useState(plan.priceBDT);
  const [priceYearly, setPriceYearly] = useState(plan.priceYearly ?? 0);
  const [isCustomPrice, setIsCustomPrice] = useState(plan.isCustomPrice ?? false);
  const [trialDays, setTrialDays] = useState(plan.trialDays);
  const [sortOrder, setSortOrder] = useState(plan.sortOrder ?? 0);
  const [visible, setVisible] = useState(plan.visible ?? true);
  const [isRecommended, setIsRecommended] = useState(plan.isRecommended);
  const [isPopular, setIsPopular] = useState(plan.isPopular ?? false);
  const [isActive, setIsActive] = useState(plan.isActive);
  const [customDomain, setCustomDomain] = useState(plan.customDomain ?? false);
  const [prioritySupport, setPrioritySupport] = useState(plan.prioritySupport ?? false);
  const [features, setFeatures] = useState<string[]>((plan as any).features ?? []);

  const [pricing, setPricing] = useState({
    monthly: plan.pricing?.monthly ?? priceBDT,
    quarterly: plan.pricing?.quarterly ?? priceBDT * 3,
    halfYearly: plan.pricing?.halfYearly ?? priceBDT * 6,
    yearly: plan.pricing?.yearly ?? priceBDT * 12,
    lifetime: plan.pricing?.lifetime ?? 0,
  });

  // Only initialized limits for implemented modules
  const [limits, setLimits] = useState<PlanLimits>(() => ({
    storage: plan.limits?.storage ?? 512,
    products: plan.limits?.products ?? 10,
    categories: plan.limits?.categories ?? 5,
    collections: plan.limits?.collections ?? 5,
    brands: plan.limits?.brands ?? 3,
    productVariants: plan.limits?.productVariants ?? 0,
    productImages: plan.limits?.productImages ?? 5,
    orders: plan.limits?.orders ?? 50,
    customers: plan.limits?.customers ?? 50,
    staff: plan.limits?.staff ?? 1,
    warehouses: plan.limits?.warehouses ?? 0,
    blogs: plan.limits?.blogs ?? 0,
    pages: plan.limits?.pages ?? 5,
    mediaUploads: plan.limits?.mediaUploads ?? 100,
    apiKeys: plan.limits?.apiKeys ?? 0,
    customDomains: plan.limits?.customDomains ?? 0,
    coupons: plan.limits?.coupons ?? 0,
    shippingZones: plan.limits?.shippingZones ?? 1,
    pickupLocations: plan.limits?.pickupLocations ?? 0,
    paymentMethods: plan.limits?.paymentMethods ?? 1,
    activeThemes: plan.limits?.activeThemes ?? 1,
    builderPages: plan.limits?.builderPages ?? 3,
    menus: plan.limits?.menus ?? 1,
    navItems: plan.limits?.navItems ?? 10,
    reviews: plan.limits?.reviews ?? 0,
    testimonials: plan.limits?.testimonials ?? 0,
    announcements: plan.limits?.announcements ?? 0,
    newsletterSubscribers: plan.limits?.newsletterSubscribers ?? 0,
    campaigns: plan.limits?.campaigns ?? 0,
    emailTemplates: plan.limits?.emailTemplates ?? 0,
    automationRules: plan.limits?.automationRules ?? 0,
    integrations: plan.limits?.integrations ?? 0,
    webhooks: plan.limits?.webhooks ?? 0,
    languages: plan.limits?.languages ?? 1,
    currencies: plan.limits?.currencies ?? 1,
    taxRules: plan.limits?.taxRules ?? 0,
    inventoryLocations: plan.limits?.inventoryLocations ?? 1,
    posDevices: plan.limits?.posDevices ?? 0,
    giftCards: plan.limits?.giftCards ?? 0,
    returnRequests: plan.limits?.returnRequests ?? 0,
    wishlistItems: plan.limits?.wishlistItems ?? 0,
    analyticsReports: plan.limits?.analyticsReports ?? 0,
    exportRequests: plan.limits?.exportRequests ?? 0,
    staffRoles: plan.limits?.staffRoles ?? 1,
    cmsBlocks: plan.limits?.cmsBlocks ?? 0,
    dynamicSections: plan.limits?.dynamicSections ?? 0,
    builderTemplates: plan.limits?.builderTemplates ?? 0,
    forms: plan.limits?.forms ?? 0,
    popups: plan.limits?.popups ?? 0,
    qrCodes: plan.limits?.qrCodes ?? 0,
    redirectRules: plan.limits?.redirectRules ?? 0,
    customCss: plan.limits?.customCss ?? 0,
    customJs: plan.limits?.customJs ?? 0,
    customFonts: plan.limits?.customFonts ?? 0,
  }));

  const [toggles, setToggles] = useState<PlanFeatureToggles>(() => ({
    productVariants: plan.featureToggles?.productVariants ?? false,
    inventory: plan.featureToggles?.inventory ?? false,
    advancedInventory: plan.featureToggles?.advancedInventory ?? false,
    digitalProducts: plan.featureToggles?.digitalProducts ?? false,
    physicalProducts: plan.featureToggles?.physicalProducts ?? false,
    subscriptions: plan.featureToggles?.subscriptions ?? false,
    bookings: plan.featureToggles?.bookings ?? false,
    giftCards: plan.featureToggles?.giftCards ?? false,
    coupons: plan.featureToggles?.coupons ?? false,
    reviews: plan.featureToggles?.reviews ?? false,
    blog: plan.featureToggles?.blog ?? false,
    cms: plan.featureToggles?.cms ?? false,
    pageBuilder: plan.featureToggles?.pageBuilder ?? false,
    dragDropBuilder: plan.featureToggles?.dragDropBuilder ?? false,
    themeEditor: plan.featureToggles?.themeEditor ?? false,
    advancedAnalytics: plan.featureToggles?.advancedAnalytics ?? false,
    seo: plan.featureToggles?.seo ?? false,
    aiContent: plan.featureToggles?.aiContent ?? false,
    customDomain: plan.featureToggles?.customDomain ?? false,
    subdomain: plan.featureToggles?.subdomain ?? true,
    whiteLabel: plan.featureToggles?.whiteLabel ?? false,
    apiAccess: plan.featureToggles?.apiAccess ?? false,
    webhooks: plan.featureToggles?.webhooks ?? false,
    staffManagement: plan.featureToggles?.staffManagement ?? false,
    marketplace: plan.featureToggles?.marketplace ?? false,
    pos: plan.featureToggles?.pos ?? false,
    wholesale: plan.featureToggles?.wholesale ?? false,
    dropshipping: plan.featureToggles?.dropshipping ?? false,
    shipping: plan.featureToggles?.shipping ?? false,
    localPickup: plan.featureToggles?.localPickup ?? false,
    abandonedCart: plan.featureToggles?.abandonedCart ?? false,
    emailMarketing: plan.featureToggles?.emailMarketing ?? false,
    smsMarketing: plan.featureToggles?.smsMarketing ?? false,
    pushNotification: plan.featureToggles?.pushNotification ?? false,
    liveChat: plan.featureToggles?.liveChat ?? false,
    fileManager: plan.featureToggles?.fileManager ?? false,
    mediaLibrary: plan.featureToggles?.mediaLibrary ?? true,
    bulkImport: plan.featureToggles?.bulkImport ?? false,
    bulkExport: plan.featureToggles?.bulkExport ?? false,
    csvImport: plan.featureToggles?.csvImport ?? false,
    csvExport: plan.featureToggles?.csvExport ?? false,
    googleLogin: plan.featureToggles?.googleLogin ?? false,
    facebookLogin: plan.featureToggles?.facebookLogin ?? false,
    otpLogin: plan.featureToggles?.otpLogin ?? false,
    multiCurrency: plan.featureToggles?.multiCurrency ?? false,
    multiLanguage: plan.featureToggles?.multiLanguage ?? false,
    taxEngine: plan.featureToggles?.taxEngine ?? false,
    invoiceGenerator: plan.featureToggles?.invoiceGenerator ?? false,
    customCheckout: plan.featureToggles?.customCheckout ?? false,
    checkoutFields: plan.featureToggles?.checkoutFields ?? false,
    advancedCheckout: plan.featureToggles?.advancedCheckout ?? false,
    loyaltyPoints: plan.featureToggles?.loyaltyPoints ?? false,
    referralSystem: plan.featureToggles?.referralSystem ?? false,
    affiliateSystem: plan.featureToggles?.affiliateSystem ?? false,
    storeVerification: plan.featureToggles?.storeVerification ?? false,
    backupRestore: plan.featureToggles?.backupRestore ?? false,
    auditLogs: plan.featureToggles?.auditLogs ?? false,
    developerMode: plan.featureToggles?.developerMode ?? false,
    maintenanceMode: plan.featureToggles?.maintenanceMode ?? false,
    darkMode: plan.featureToggles?.darkMode ?? false,
    visitorAnalytics: plan.featureToggles?.visitorAnalytics ?? false,
    realtimeVisitors: plan.featureToggles?.realtimeVisitors ?? false,
    analyticsExport: plan.featureToggles?.analyticsExport ?? false,
    reports: plan.featureToggles?.reports ?? false,
    courier: plan.featureToggles?.courier ?? plan.courierAccess?.enabled ?? false,
  }));

  const [courierAccess, setCourierAccess] = useState<PlanCourierAccess>(() => ({
    enabled: plan.courierAccess?.enabled ?? plan.featureToggles?.courier ?? false,
    allProviders: plan.courierAccess?.allProviders ?? false,
    providers: plan.courierAccess?.providers ?? [],
  }));

  const [featureText, setFeatureText] = useState(plan.features?.join("\n") ?? "");

  const updateLimit = useCallback((key: keyof PlanLimits, value: number) => {
    setLimits((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateToggle = useCallback((key: keyof PlanFeatureToggles, value: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: value }));
    if (key === "courier") {
      setCourierAccess((prev) => ({
        ...prev,
        enabled: value,
        allProviders: value ? prev.allProviders || prev.providers.length === 0 : false,
        providers:
          value && prev.providers.length === 0 && !prev.allProviders
            ? COURIER_PROVIDER_OPTIONS.map((p) => p.slug)
            : value
              ? prev.providers
              : [],
      }));
    }
  }, []);

  const toggleCourierProvider = useCallback((slug: PlanCourierAccess["providers"][number]) => {
    setCourierAccess((prev) => {
      const nextProviders = prev.providers.includes(slug)
        ? prev.providers.filter((p) => p !== slug)
        : [...prev.providers, slug];
      const enabled = prev.allProviders || nextProviders.length > 0;
      setToggles((t) => ({ ...t, courier: enabled }));
      return {
        enabled,
        allProviders: false,
        providers: nextProviders,
      };
    });
  }, []);

  const toggleAllCouriers = useCallback((checked: boolean) => {
    setCourierAccess({
      enabled: checked,
      allProviders: checked,
      providers: checked ? COURIER_PROVIDER_OPTIONS.map((p) => p.slug) : [],
    });
    setToggles((t) => ({ ...t, courier: checked }));
  }, []);

  const handleSave = async () => {
    const payload = {
      name,
      slug,
      description,
      priceBDT,
      priceYearly,
      isCustomPrice,
      trialDays,
      sortOrder,
      visible,
      isRecommended,
      isPopular,
      isActive,
      customDomain,
      prioritySupport,
      features: featureText.split("\n").map((f) => f.trim()).filter(Boolean),
      pricing: {
        monthly: pricing.monthly || priceBDT,
        quarterly: pricing.quarterly || priceBDT * 3,
        halfYearly: pricing.halfYearly || priceBDT * 6,
        yearly: pricing.yearly || priceBDT * 12,
        lifetime: pricing.lifetime || 0,
      },
      limits,
      featureToggles: {
        ...toggles,
        courier: courierAccess.enabled || courierAccess.allProviders || courierAccess.providers.length > 0,
      },
      courierAccess: {
        enabled: courierAccess.enabled || courierAccess.allProviders || courierAccess.providers.length > 0,
        allProviders: courierAccess.allProviders,
        providers: courierAccess.allProviders
          ? COURIER_PROVIDER_OPTIONS.map((p) => p.slug)
          : courierAccess.providers,
      },
    };

    try {
      await updatePlan({ id: plan._id, data: payload }).unwrap();
      toast.success("Plan saved successfully");
      router.refresh();
    } catch (error) {
      const msg =
        error && typeof error === "object" && "data" in error
          ? (error as { data: { message?: string } }).data?.message ?? "Failed to save plan"
          : "Failed to save plan";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-apple-ink">{plan.name}</h1>
          <p className="text-sm text-apple-ink-muted-48">/{plan.slug}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : "Save Plan"}
        </button>
      </div>

      <AdminTabs tabs={BUILDER_TABS} active={activeTab} onChange={setActiveTab} />

      {/* ────────────── GENERAL ────────────── */}
      {activeTab === "general" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-apple-ink-muted-80">Plan Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="text-sm font-medium text-apple-ink-muted-80">Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-mono focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-apple-ink-muted-80">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>

          <div>
            <label className="text-sm font-medium text-apple-ink-muted-80">Feature Bullets (one per line)</label>
            <textarea value={featureText} onChange={(e) => setFeatureText(e.target.value)} rows={5}
              placeholder="Up to 50 products&#10;Free custom domain&#10;24/7 support"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-apple-ink-muted-80">Sort Order</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
        </div>
      )}

      {/* ────────────── PRICING ────────────── */}
      {activeTab === "pricing" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-apple-ink-muted-80">Monthly (BDT)</label>
              <input type="number" value={pricing.monthly} onChange={(e) => setPricing((p) => ({ ...p, monthly: Number(e.target.value) }))}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="text-sm font-medium text-apple-ink-muted-80">Quarterly (BDT)</label>
              <input type="number" value={pricing.quarterly} onChange={(e) => setPricing((p) => ({ ...p, quarterly: Number(e.target.value) }))}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="text-sm font-medium text-apple-ink-muted-80">Half Yearly (BDT)</label>
              <input type="number" value={pricing.halfYearly} onChange={(e) => setPricing((p) => ({ ...p, halfYearly: Number(e.target.value) }))}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="text-sm font-medium text-apple-ink-muted-80">Yearly (BDT)</label>
              <input type="number" value={pricing.yearly} onChange={(e) => setPricing((p) => ({ ...p, yearly: Number(e.target.value) }))}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="text-sm font-medium text-apple-ink-muted-80">Lifetime (BDT)</label>
              <input type="number" value={pricing.lifetime} onChange={(e) => setPricing((p) => ({ ...p, lifetime: Number(e.target.value) }))}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="text-sm font-medium text-apple-ink-muted-80">Yearly Discounted (BDT)</label>
              <input type="number" value={priceYearly} onChange={(e) => setPriceYearly(Number(e.target.value))}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isCustomPrice} onChange={(e) => setIsCustomPrice(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-apple-ink-muted-80">Custom price (contact us)</span>
          </label>
        </div>
      )}

      {/* ────────────── LIMITS ────────────── */}
      {activeTab === "limits" && (
        <div className="space-y-8">
          {LIMIT_GROUPS.map((group) => (
            <div key={group.key}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-apple-ink-muted-48">{group.label}</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {group.fields.map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-medium text-apple-ink-muted-80">{field.label}</label>
                    <div className="relative mt-1">
                      <input
                        type="number" min={0}
                        value={limits[field.key]}
                        onChange={(e) => updateLimit(field.key, Number(e.target.value))}
                        className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      {field.suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-apple-ink-muted-48">{field.suffix}</span>}
                    </div>
                    <p className="mt-0.5 text-[10px] text-apple-ink-muted-48">0 = unlimited</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ────────────── FEATURES ────────────── */}
      {activeTab === "features" && (
        <div className="space-y-8">
          {FEATURE_GROUPS.map((group) => (
            <div key={group.key}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-apple-ink-muted-48">{group.label}</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {group.toggles.map((feat) => (
                  <label
                    key={feat.key}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-apple-canvas-parchment ${
                      toggles[feat.key] ? "border-blue-200 bg-blue-50/50" : "border-zinc-200"
                    } ${feat.alwaysEnabled ? "opacity-75" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={toggles[feat.key]}
                      onChange={(e) => updateToggle(feat.key, e.target.checked)}
                      disabled={feat.alwaysEnabled}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-apple-ink">{feat.label}</p>
                      {feat.description && (
                        <p className="mt-0.5 text-xs text-apple-ink-muted-48">{feat.description}</p>
                      )}
                      {feat.alwaysEnabled && (
                        <p className="mt-0.5 text-[10px] font-medium text-blue-600">Always enabled</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-apple-ink">Courier Access</h3>
            <p className="mt-1 text-xs text-apple-ink-muted-48">
              Choose which courier providers stores on this plan can configure. Selecting &quot;All Couriers&quot;
              grants every provider.
            </p>

            <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 p-3 hover:bg-apple-canvas-parchment">
              <input
                type="checkbox"
                checked={courierAccess.allProviders}
                onChange={(e) => toggleAllCouriers(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-apple-ink">All Couriers</p>
                <p className="text-xs text-apple-ink-muted-48">Pathao, RedX, Steadfast, Paperfly, Sundarban</p>
              </div>
            </label>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {COURIER_PROVIDER_OPTIONS.map((provider) => {
                const checked =
                  courierAccess.allProviders || courierAccess.providers.includes(provider.slug);
                return (
                  <label
                    key={provider.slug}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-apple-canvas-parchment ${
                      checked ? "border-blue-200 bg-blue-50/50" : "border-zinc-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={courierAccess.allProviders}
                      onChange={() => toggleCourierProvider(provider.slug)}
                      className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-apple-ink">{provider.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ────────────── STORAGE ────────────── */}
      {activeTab === "storage" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-apple-ink-muted-80">Storage Limit (MB)</label>
              <input
                type="number" min={0}
                value={limits.storage}
                onChange={(e) => updateLimit("storage", Number(e.target.value))}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1 text-xs text-apple-ink-muted-48">
                {limits.storage >= 1024
                  ? `= ${(limits.storage / 1024).toFixed(1)} GB`
                  : `${limits.storage} MB`}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-apple-ink-muted-80">Media Uploads</label>
              <input
                type="number" min={0}
                value={limits.mediaUploads}
                onChange={(e) => updateLimit("mediaUploads", Number(e.target.value))}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="mt-1 text-xs text-apple-ink-muted-48">0 = unlimited</p>
            </div>
          </div>
        </div>
      )}

      {/* ────────────── TRIAL ────────────── */}
      {activeTab === "trial" && (
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-apple-ink-muted-80">Trial Days</label>
            <input
              type="number" min={0}
              value={trialDays}
              onChange={(e) => setTrialDays(Number(e.target.value))}
              className="mt-1 h-10 w-full max-w-xs rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="mt-1 text-xs text-apple-ink-muted-48">Set to 0 to disable trial</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-700">
              Trial expiration is handled automatically by the daily cron job.
              When the trial ends, the store is downgraded and premium features are disabled.
            </p>
          </div>
        </div>
      )}

      {/* ────────────── VISIBILITY ────────────── */}
      {activeTab === "visibility" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
              <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
              <div>
                <p className="text-sm font-medium text-apple-ink">Visible</p>
                <p className="text-xs text-apple-ink-muted-48">Show this plan on the pricing page</p>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
              <input type="checkbox" checked={isRecommended} onChange={(e) => setIsRecommended(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
              <div>
                <p className="text-sm font-medium text-apple-ink">Recommended</p>
                <p className="text-xs text-apple-ink-muted-48">Highlight as "Most Popular"</p>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
              <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
              <div>
                <p className="text-sm font-medium text-apple-ink">Most Popular</p>
                <p className="text-xs text-apple-ink-muted-48">Show a separate popular badge on the public pricing page</p>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
              <div>
                <p className="text-sm font-medium text-apple-ink">Active</p>
                <p className="text-xs text-apple-ink-muted-48">Allow new subscriptions</p>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
              <input type="checkbox" checked={customDomain} onChange={(e) => setCustomDomain(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
              <div>
                <p className="text-sm font-medium text-apple-ink">Custom Domain</p>
                <p className="text-xs text-apple-ink-muted-48">Allow custom domain mapping</p>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
              <input type="checkbox" checked={prioritySupport} onChange={(e) => setPrioritySupport(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
              <div>
                <p className="text-sm font-medium text-apple-ink">Priority Support</p>
                <p className="text-xs text-apple-ink-muted-48">24/7 priority support</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ────────────── PREVIEW ────────────── */}
      {activeTab === "preview" && (
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
            <PlanPreviewCard
              plan={plan}
              form={{
                name,
                description,
                priceBDT,
                pricing: {
                  monthly: pricing.monthly || priceBDT,
                  quarterly: pricing.quarterly || priceBDT * 3,
                  halfYearly: pricing.halfYearly || priceBDT * 6,
                  yearly: pricing.yearly || priceBDT * 12,
                  lifetime: pricing.lifetime || 0,
                },
                features: featureText,
                trialDays,
                isRecommended,
                isActive,
                visible,
                limits,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
