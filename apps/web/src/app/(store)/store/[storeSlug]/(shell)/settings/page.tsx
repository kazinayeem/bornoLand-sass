"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Settings2,
  Sparkles,
  MapPin,
  Globe,
  DollarSign,
  Truck,
  Percent,
  CreditCard,
  ShoppingCart,
  Mail,
  FileText,
  Menu,
  Share2,
  Search,
  Globe2,
  BookOpen,
  HelpCircle,
  Lock,
  Cpu,
  Loader2,
  Package,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsTab } from "@/components/workspace/settings-tab";
import { BrandingTab } from "@/components/workspace/branding-tab";
import { StoreContactTab } from "@/components/cms/store-contact-tab";
import { CheckoutTab } from "@/components/workspace/checkout-tab";
import { PaymentsTab } from "@/components/workspace/payments-tab";
import { ShippingSettingsTab } from "@/components/workspace/shipping-settings-tab";
import { CourierSettingsTab } from "@/components/workspace/courier-settings-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import StoreEmailSettingsPage from "@/app/(store)/store/[storeSlug]/(shell)/settings/notifications/page";
import { CmsTab } from "@/components/workspace/cms-tab";
import { CmsFaqsEditor } from "@/components/cms/cms-faqs-editor";
import { useGetStoreFeatureAccessQuery, getFeatureByKey } from "@/redux/api/feature-api";
import { FeatureLocked } from "@/components/features/feature-gate";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";

/* ── Section definitions ──────────────────────────────────────────── */

export type SectionId =
  | "general"
  | "branding"
  | "contact"
  | "localization"
  | "currency"
  | "seo"
  | "domain"
  | "checkout"
  | "payments"
  | "shipping"
  | "courier"
  | "taxes"
  | "invoice"
  | "navigation"
  | "cms-pages"
  | "policies"
  | "faq"
  | "social-links"
  | "email"
  | "messages"
  | "security"
  | "advanced";

export type SettingsGroupKey = "GENERAL" | "STORE" | "COMMERCE" | "CONTENT" | "COMMUNICATION" | "ADVANCED";

export type SectionDef = {
  id: SectionId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  group: SettingsGroupKey;
  keywords?: string[];
};

export const SETTINGS_GROUPS: Record<SettingsGroupKey, { label: string; description: string }> = {
  GENERAL: { label: "General", description: "Basic store identity, branding, and contact details" },
  STORE: { label: "Store", description: "Localization, currency, search engine, and domain" },
  COMMERCE: { label: "Commerce", description: "Checkout rules, payments, shipping, taxes, and invoicing" },
  CONTENT: { label: "Content", description: "Storefront menus, static pages, legal policies, and FAQ" },
  COMMUNICATION: { label: "Communication", description: "Email notifications and customer message settings" },
  ADVANCED: { label: "Advanced", description: "Store security, developer tools, and advanced options" },
};

export const SETTINGS_SECTIONS: SectionDef[] = [
  // GENERAL
  { id: "general", label: "General", description: "Store name, slug, description, and status", icon: Settings2, group: "GENERAL", keywords: ["store name", "slug", "about", "status"] },
  { id: "branding", label: "Branding", description: "Logo, favicon, brand colors, and visual mark", icon: Sparkles, group: "GENERAL", keywords: ["logo", "color", "favicon", "brand"] },
  { id: "contact", label: "Contact", description: "Public phone, email, address, and operating hours", icon: MapPin, group: "GENERAL", keywords: ["phone", "email", "support", "address"] },

  // STORE
  { id: "localization", label: "Localization", description: "Timezone, date format, and language", icon: Globe, group: "STORE", keywords: ["timezone", "date", "language", "locale"] },
  { id: "currency", label: "Currency", description: "Default currency code, symbol, and formatting", icon: DollarSign, group: "STORE", keywords: ["bdt", "usd", "symbol", "money", "pricing"] },
  { id: "seo", label: "SEO", description: "Search engine title, meta tags, and robots.txt", icon: Search, group: "STORE", keywords: ["meta", "google", "sitemap", "keywords"] },
  { id: "domain", label: "Domain", description: "Custom domain connection and SSL configuration", icon: Globe2, group: "STORE", keywords: ["cname", "dns", "ssl", "subdomain"] },

  // COMMERCE
  { id: "checkout", label: "Checkout", description: "Guest checkout, required fields, and minimum order", icon: ShoppingCart, group: "COMMERCE", keywords: ["cart", "guest", "order limit", "fields"] },
  { id: "payments", label: "Payments", description: "Cash on delivery, bKash, Nagad, and payment gateways", icon: CreditCard, group: "COMMERCE", keywords: ["cod", "bkash", "nagad", "gateway", "bank"] },
  { id: "shipping", label: "Shipping", description: "Delivery zones, rates, and free shipping thresholds", icon: Truck, group: "COMMERCE", keywords: ["delivery", "charge", "free shipping", "zone"] },
  { id: "courier", label: "Courier", description: "Steadfast, Pathao, and RedX logistics integration", icon: Package, group: "COMMERCE", keywords: ["steadfast", "pathao", "redx", "tracking"] },
  { id: "taxes", label: "Taxes", description: "Default tax rate and tax-inclusive pricing toggle", icon: Percent, group: "COMMERCE", keywords: ["tax", "vat", "gst", "percentage"] },
  { id: "invoice", label: "Invoice", description: "Invoice numbering format, prefix, and PDF template", icon: FileText, group: "COMMERCE", keywords: ["pdf", "receipt", "order bill", "numbering"] },

  // CONTENT
  { id: "navigation", label: "Navigation", description: "Header menus, footer menus, and navigation links", icon: Menu, group: "CONTENT", keywords: ["menu", "header", "footer", "links"] },
  { id: "cms-pages", label: "CMS Pages", description: "About us, custom content pages, and rich editors", icon: BookOpen, group: "CONTENT", keywords: ["about", "terms", "custom page"] },
  { id: "policies", label: "Policies", description: "Privacy policy, refund rules, and terms of service", icon: ShieldCheck, group: "CONTENT", keywords: ["privacy", "refund", "terms", "return"] },
  { id: "faq", label: "FAQ", description: "Frequently asked questions and accordion answers", icon: HelpCircle, group: "CONTENT", keywords: ["help", "questions", "answers"] },
  { id: "social-links", label: "Social Links", description: "Facebook, Instagram, YouTube, and WhatsApp links", icon: Share2, group: "CONTENT", keywords: ["facebook", "instagram", "whatsapp", "tiktok"] },

  // COMMUNICATION
  { id: "email", label: "Email Notifications", description: "Order confirmation, shipment, and customer templates", icon: Mail, group: "COMMUNICATION", keywords: ["smtp", "notifications", "alerts", "mail"] },
  { id: "messages", label: "Customer Messages", description: "Contact form inbox and customer inquiry settings", icon: MessageSquare, group: "COMMUNICATION", keywords: ["inbox", "inquiries", "contact"] },

  // ADVANCED
  { id: "security", label: "Security", description: "Store password protection and session management", icon: Lock, group: "ADVANCED", keywords: ["password", "protect", "auth", "session"] },
  { id: "advanced", label: "Advanced", description: "Developer API keys, webhooks, and store deletion", icon: Cpu, group: "ADVANCED", keywords: ["api", "webhook", "developer", "danger"] },
];

const SETTINGS_GROUP_ORDER: SettingsGroupKey[] = ["GENERAL", "STORE", "COMMERCE", "CONTENT", "COMMUNICATION", "ADVANCED"];

/* ── Placeholder Tab Component ────────────────────────────────────── */

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <StorePageCard>
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-apple-canvas-parchment text-apple-primary">
          <Settings2 className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-apple-ink">{title}</h3>
          <p className="text-sm text-apple-ink-muted-48 max-w-md">{description}</p>
        </div>
      </div>
    </StorePageCard>
  );
}

/* ── Loading Shell ────────────────────────────────────────────────── */

function LoadingShell() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-apple-primary" />
    </div>
  );
}

/* ── Main Settings Hub Page ───────────────────────────────────────── */

export default function StoreSettingsHubPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { storeId, store, isLoading } = useStorePage();
  const storeSlug = (params.storeSlug as string) || store?.slug || "";
  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId ?? "", { skip: !storeId });

  const courierFeature = getFeatureByKey(accessData?.data?.features ?? [], "courier");
  const courierLocked = courierFeature?.locked ?? false;
  const billingHref = storeSlug ? `/store/${storeSlug}/billing` : "#";

  const activeSectionId = (searchParams.get("section") || "general") as SectionId;
  const [searchQuery, setSearchQuery] = useState("");

  const currentSection = useMemo(() => {
    return SETTINGS_SECTIONS.find((s) => s.id === activeSectionId) || SETTINGS_SECTIONS[0];
  }, [activeSectionId]);

  const setSection = useCallback(
    (id: SectionId) => {
      router.replace(`/store/${storeSlug}/settings?section=${id}`, { scroll: false });
    },
    [router, storeSlug]
  );

  // Search filter across sections
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SETTINGS_SECTIONS;
    const q = searchQuery.toLowerCase().trim();
    return SETTINGS_SECTIONS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.group.toLowerCase().includes(q) ||
        (s.keywords && s.keywords.some((k) => k.toLowerCase().includes(q)))
    );
  }, [searchQuery]);

  /* ── Tab Content Renderer ────────────────────────────────────────── */

  const tabContent = useMemo<ReactNode>(() => {
    if (isLoading || !storeId) return <LoadingShell />;

    switch (activeSectionId) {
      case "general":
        return (
          <StorePageCard>
            <SettingsTab storeId={storeId} />
          </StorePageCard>
        );
      case "branding":
        return <BrandingTab storeId={storeId} storeSlug={storeSlug} />;
      case "contact":
        return <StoreContactTab storeId={storeId} storeSlug={storeSlug} />;
      case "localization":
        return (
          <StorePageCard>
            <div className="mb-4 space-y-1">
              <h2 className="text-base font-semibold text-apple-ink">Localization</h2>
              <p className="text-xs text-apple-ink-muted-48">Configure timezone, country standard, and regional defaults.</p>
            </div>
            <SettingsTab storeId={storeId} />
          </StorePageCard>
        );
      case "currency":
        return (
          <StorePageCard>
            <div className="mb-4 space-y-1">
              <h2 className="text-base font-semibold text-apple-ink">Currency & Formatting</h2>
              <p className="text-xs text-apple-ink-muted-48">Configure base transaction currency (BDT, USD) and decimal rules.</p>
            </div>
            <SettingsTab storeId={storeId} />
          </StorePageCard>
        );
      case "shipping":
        return <ShippingSettingsTab storeId={storeId} />;
      case "courier":
        if (courierLocked && courierFeature) {
          return (
            <FeatureLocked
              feature={courierFeature}
              billingHref={billingHref}
              currentPlan={accessData?.data?.currentPlan?.name}
            />
          );
        }
        return <CourierSettingsTab storeId={storeId} />;
      case "taxes":
        return (
          <StorePageCard>
            <div className="mb-4 space-y-1">
              <h2 className="text-base font-semibold text-apple-ink">Taxes & VAT</h2>
              <p className="text-xs text-apple-ink-muted-48">Set default product tax percentage and tax-included pricing rules.</p>
            </div>
            <SettingsTab storeId={storeId} />
          </StorePageCard>
        );
      case "payments":
        return <PaymentsTab storeId={storeId} />;
      case "checkout":
        return <CheckoutTab storeId={storeId} />;
      case "email":
        return <StoreEmailSettingsPage />;
      case "messages":
        return (
          <StorePageCard>
            <div className="mb-4 space-y-1">
              <h2 className="text-base font-semibold text-apple-ink">Customer Message Settings</h2>
              <p className="text-xs text-apple-ink-muted-48">
                Manage contact form inquiries directly from the{" "}
                <Link href={`/store/${storeSlug}/customer-messages`} className="text-apple-primary font-semibold underline">
                  Messages Inbox
                </Link>
                .
              </p>
            </div>
            <StoreContactTab storeId={storeId} storeSlug={storeSlug} />
          </StorePageCard>
        );
      case "invoice":
        return (
          <PlaceholderTab
            title="Invoice Configuration"
            description="Automatic invoice numbering, custom tax invoice prefixes, and printable templates."
          />
        );
      case "navigation":
        return (
          <PlaceholderTab
            title="Storefront Navigation"
            description="Configure header menus, mega menus, footer links, and category shortcuts."
          />
        );
      case "social-links":
        return (
          <StorePageCard>
            <div className="mb-4 space-y-1">
              <h2 className="text-base font-semibold text-apple-ink">Social Media Links</h2>
              <p className="text-xs text-apple-ink-muted-48">Links to your Facebook, Instagram, YouTube, and WhatsApp.</p>
            </div>
            <StoreContactTab storeId={storeId} storeSlug={storeSlug} />
          </StorePageCard>
        );
      case "seo":
        return (
          <PlaceholderTab
            title="Search Engine Optimization (SEO)"
            description="Configure homepage title, meta description, Open Graph share image, and sitemap settings."
          />
        );
      case "domain":
        return (
          <PlaceholderTab
            title="Custom Domain Connection"
            description="Connect your own domain (e.g. yourstore.com) with automatic free SSL certification."
          />
        );
      case "cms-pages":
        return (
          <StorePageCard>
            <CmsTab storeId={storeId} storeSlug={storeSlug} />
          </StorePageCard>
        );
      case "policies":
        return (
          <StorePageCard>
            <div className="mb-4 space-y-1">
              <h2 className="text-base font-semibold text-apple-ink">Legal & Store Policies</h2>
              <p className="text-xs text-apple-ink-muted-48">Privacy Policy, Terms of Service, and Refund Policy pages.</p>
            </div>
            <CmsTab storeId={storeId} storeSlug={storeSlug} />
          </StorePageCard>
        );
      case "faq":
        return <CmsFaqsEditor />;
      case "security":
        return (
          <PlaceholderTab
            title="Store Security"
            description="Password-protect your storefront during development, IP restriction, and session controls."
          />
        );
      case "advanced":
        return (
          <PlaceholderTab
            title="Advanced & Developer"
            description="API access keys, webhook endpoints, and advanced shop configuration."
          />
        );
      default:
        return <PlaceholderTab title="Settings" description="Select a setting from the menu on the left." />;
    }
  }, [activeSectionId, isLoading, storeId, storeSlug, courierLocked, courierFeature, billingHref, accessData?.data?.currentPlan?.name]);

  /* ── Header Breadcrumbs ──────────────────────────────────────────── */

  const groupLabel = SETTINGS_GROUPS[currentSection.group]?.label || "General";

  return (
    <div className="space-y-6">
      <StorePageHeader
        title="Store Settings"
        description="Configure branding, commerce operations, localization, content, and communications."
        breadcrumbs={[
          { label: "Dashboard", href: `/store/${storeSlug}/dashboard` },
          { label: "Settings", href: `/store/${storeSlug}/settings?section=general` },
          { label: groupLabel },
          { label: currentSection.label },
        ]}
      />

      {/* Two-Column Modern Settings Layout */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left Settings Sidebar Navigation */}
        <aside className="shrink-0 lg:w-64">
          <div className="sticky top-4 space-y-4 rounded-2xl border border-apple-hairline bg-apple-canvas p-3 shadow-xs">
            {/* Search Settings Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-apple-ink-muted-48" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings..."
                className="h-9 w-full rounded-xl border border-apple-hairline bg-apple-canvas-parchment/60 pl-8 pr-3 text-xs text-apple-ink placeholder:text-apple-ink-muted-48 focus:border-apple-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-apple-primary/10 transition-all"
              />
            </div>

            {/* Navigation Groups List */}
            <nav className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-4 pr-1" aria-label="Settings navigation">
              {searchQuery.trim() ? (
                // Filtered search results
                <div>
                  <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-apple-ink-muted-48">
                    Matching Settings ({filteredSections.length})
                  </p>
                  {filteredSections.length === 0 ? (
                    <p className="px-2 py-4 text-center text-xs text-apple-ink-muted-48">
                      No settings found for &quot;{searchQuery}&quot;
                    </p>
                  ) : (
                    <ul className="space-y-0.5">
                      {filteredSections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSectionId === section.id;
                        return (
                          <li key={section.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSection(section.id);
                                setSearchQuery("");
                              }}
                              className={cn(
                                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors",
                                isActive
                                  ? "bg-apple-primary/10 text-apple-primary font-semibold"
                                  : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment hover:text-apple-ink"
                              )}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate">{section.label}</p>
                                <p className="truncate text-[10px] text-apple-ink-muted-48">{section.group}</p>
                              </div>
                              <ChevronRight className="h-3 w-3 shrink-0 text-apple-ink-muted-48/50" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : (
                // Grouped full list
                SETTINGS_GROUP_ORDER.map((groupKey) => {
                  const groupConfig = SETTINGS_GROUPS[groupKey];
                  const groupSections = SETTINGS_SECTIONS.filter((s) => s.group === groupKey);
                  if (groupSections.length === 0) return null;

                  return (
                    <div key={groupKey} className="space-y-0.5">
                      <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-apple-ink-muted-48">
                        {groupConfig.label}
                      </p>
                      <ul className="space-y-0.5">
                        {groupSections.map((section) => {
                          const Icon = section.icon;
                          const isActive = activeSectionId === section.id;
                          return (
                            <li key={section.id}>
                              <button
                                type="button"
                                onClick={() => setSection(section.id)}
                                className={cn(
                                  "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-all duration-150",
                                  isActive
                                    ? "bg-apple-primary/10 text-apple-primary font-semibold"
                                    : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment hover:text-apple-ink"
                                )}
                              >
                                <Icon
                                  className={cn(
                                    "h-4 w-4 shrink-0 transition-colors",
                                    isActive
                                      ? "text-apple-primary"
                                      : "text-apple-ink-muted-48 group-hover:text-apple-ink-muted-80"
                                  )}
                                />
                                <span className="flex-1 truncate">{section.label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })
              )}
            </nav>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="min-w-0 flex-1 space-y-4">
          <div className="rounded-2xl border border-apple-hairline bg-apple-canvas p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-apple-hairline pb-3">
              <div>
                <h2 className="text-base font-semibold text-apple-ink">{currentSection.label}</h2>
                <p className="text-xs text-apple-ink-muted-48">{currentSection.description}</p>
              </div>
              <span className="rounded-full bg-apple-canvas-parchment px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">
                {groupLabel}
              </span>
            </div>

            <div className="pt-4">{tabContent}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
