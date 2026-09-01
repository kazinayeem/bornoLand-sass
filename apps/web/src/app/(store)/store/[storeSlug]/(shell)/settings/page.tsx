"use client";

import { useCallback, useMemo, useState, Suspense, type ReactNode } from "react";
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

import { useLanguage, type Dictionary } from "@/providers/language-provider";

/* ── Section definitions ──────────────────────────────────────────── */

type SectionId =
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

type SettingsGroupKey = "GENERAL" | "STORE" | "COMMERCE" | "CONTENT" | "COMMUNICATION" | "ADVANCED";

type SectionDef = {
  id: SectionId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  group: SettingsGroupKey;
  keywords?: string[];
};

function getSettingsGroups(t: Dictionary): Record<SettingsGroupKey, { label: string; description: string }> {
  const g = t.settings.groups;
  return {
    GENERAL: { label: g.GENERAL, description: g.GENERALDesc },
    STORE: { label: g.STORE, description: g.STOREDesc },
    COMMERCE: { label: g.COMMERCE, description: g.COMMERCEDesc },
    CONTENT: { label: g.CONTENT, description: g.CONTENTDesc },
    COMMUNICATION: { label: g.COMMUNICATION, description: g.COMMUNICATIONDesc },
    ADVANCED: { label: g.ADVANCED, description: g.ADVANCEDDesc },
  };
}

function getSettingsSections(t: Dictionary): SectionDef[] {
  const s = t.settings.sections;
  return [
    // GENERAL
    { id: "general", label: s.general, description: s.generalDesc, icon: Settings2, group: "GENERAL", keywords: ["store name", "slug", "about", "status", "সাধারণ", "নাম"] },
    { id: "branding", label: s.branding, description: s.brandingDesc, icon: Sparkles, group: "GENERAL", keywords: ["logo", "color", "favicon", "brand", "লোগো", "রং", "ব্র্যান্ডিং"] },
    { id: "contact", label: s.contact, description: s.contactDesc, icon: MapPin, group: "GENERAL", keywords: ["phone", "email", "support", "address", "ফোন", "ইমেইল", "ঠিকানা", "যোগাযোগ"] },

    // STORE
    { id: "localization", label: s.localization, description: s.localizationDesc, icon: Globe, group: "STORE", keywords: ["timezone", "date", "language", "locale", "সময়", "তারিখ", "ভাষা", "স্থানীয়করণ"] },
    { id: "currency", label: s.currency, description: s.currencyDesc, icon: DollarSign, group: "STORE", keywords: ["bdt", "usd", "symbol", "money", "pricing", "টাকা", "মুদ্রা", "প্রতীক"] },
    { id: "seo", label: s.seo, description: s.seoDesc, icon: Search, group: "STORE", keywords: ["meta", "google", "sitemap", "keywords", "মেটা", "সার্চ"] },
    { id: "domain", label: s.domain, description: s.domainDesc, icon: Globe2, group: "STORE", keywords: ["cname", "dns", "ssl", "subdomain", "ডোমেইন"] },

    // COMMERCE
    { id: "checkout", label: s.checkout, description: s.checkoutDesc, icon: ShoppingCart, group: "COMMERCE", keywords: ["cart", "guest", "order limit", "fields", "চেকআউট"] },
    { id: "payments", label: s.payments, description: s.paymentsDesc, icon: CreditCard, group: "COMMERCE", keywords: ["cod", "bkash", "nagad", "gateway", "bank", "পেমেন্ট", "বিকাশ", "নগদ"] },
    { id: "shipping", label: s.shipping, description: s.shippingDesc, icon: Truck, group: "COMMERCE", keywords: ["delivery", "charge", "free shipping", "zone", "শিপিং", "ডেলিভারি"] },
    { id: "courier", label: s.courier, description: s.courierDesc, icon: Package, group: "COMMERCE", keywords: ["steadfast", "pathao", "redx", "tracking", "কুরিয়ার", "পাঠাও", "স্টিডফাস্ট"] },
    { id: "taxes", label: s.taxes, description: s.taxesDesc, icon: Percent, group: "COMMERCE", keywords: ["tax", "vat", "gst", "percentage", "ট্যাক্স", "ভ্যাট"] },
    { id: "invoice", label: s.invoice, description: s.invoiceDesc, icon: FileText, group: "COMMERCE", keywords: ["pdf", "receipt", "order bill", "numbering", "ইনভয়েস", "বিল"] },

    // CONTENT
    { id: "navigation", label: s.navigation, description: s.navigationDesc, icon: Menu, group: "CONTENT", keywords: ["menu", "header", "footer", "links", "নেভিগেশন", "মেনু"] },
    { id: "cms-pages", label: s.cmsPages, description: s.cmsPagesDesc, icon: BookOpen, group: "CONTENT", keywords: ["about", "terms", "custom page", "পেজ"] },
    { id: "policies", label: s.policies, description: s.policiesDesc, icon: ShieldCheck, group: "CONTENT", keywords: ["privacy", "refund", "terms", "return", "নীতিমালা"] },
    { id: "faq", label: s.faq, description: s.faqDesc, icon: HelpCircle, group: "CONTENT", keywords: ["help", "questions", "answers", "প্রশ্ন"] },
    { id: "social-links", label: s.socialLinks, description: s.socialLinksDesc, icon: Share2, group: "CONTENT", keywords: ["facebook", "instagram", "whatsapp", "tiktok", "সোশ্যাল"] },

    // COMMUNICATION
    { id: "email", label: s.email, description: s.emailDesc, icon: Mail, group: "COMMUNICATION", keywords: ["smtp", "notifications", "alerts", "mail", "ইমেইল"] },
    { id: "messages", label: s.messages, description: s.messagesDesc, icon: MessageSquare, group: "COMMUNICATION", keywords: ["inbox", "inquiries", "contact", "বার্তা"] },

    // ADVANCED
    { id: "security", label: s.security, description: s.securityDesc, icon: Lock, group: "ADVANCED", keywords: ["password", "protect", "auth", "session", "নিরাপত্তা"] },
    { id: "advanced", label: s.advanced, description: s.advancedDesc, icon: Cpu, group: "ADVANCED", keywords: ["api", "webhook", "developer", "danger", "অ্যাডভান্সড"] },
  ];
}

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

function StoreSettingsHubContent() {
  const { t } = useLanguage();
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

  const settingsGroups = useMemo(() => getSettingsGroups(t), [t]);
  const settingsSections = useMemo(() => getSettingsSections(t), [t]);

  const currentSection = useMemo(() => {
    return settingsSections.find((s) => s.id === activeSectionId) || settingsSections[0];
  }, [activeSectionId, settingsSections]);

  const setSection = useCallback(
    (id: SectionId) => {
      router.replace(`/store/${storeSlug}/settings?section=${id}`, { scroll: false });
    },
    [router, storeSlug]
  );

  // Search filter across sections (searches both BN & EN labels, descriptions, and keywords)
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return settingsSections;
    const q = searchQuery.toLowerCase().trim();
    return settingsSections.filter((s) => {
      const groupInfo = settingsGroups[s.group];
      return (
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.group.toLowerCase().includes(q) ||
        (groupInfo && groupInfo.label.toLowerCase().includes(q)) ||
        (s.keywords && s.keywords.some((k) => k.toLowerCase().includes(q)))
      );
    });
  }, [searchQuery, settingsSections, settingsGroups]);

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
              <h2 className="text-base font-semibold text-apple-ink">{t.settings.localization.title}</h2>
              <p className="text-xs text-apple-ink-muted-48">{t.settings.localization.subtitle}</p>
            </div>
            <SettingsTab storeId={storeId} />
          </StorePageCard>
        );
      case "currency":
        return (
          <StorePageCard>
            <div className="mb-4 space-y-1">
              <h2 className="text-base font-semibold text-apple-ink">{t.settings.currency.title}</h2>
              <p className="text-xs text-apple-ink-muted-48">{t.settings.currency.subtitle}</p>
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
              <h2 className="text-base font-semibold text-apple-ink">{t.settings.tax.title}</h2>
              <p className="text-xs text-apple-ink-muted-48">{t.settings.tax.subtitle}</p>
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
              <h2 className="text-base font-semibold text-apple-ink">{t.settings.sections.messages}</h2>
              <p className="text-xs text-apple-ink-muted-48">
                {t.settings.sections.messagesDesc}
              </p>
            </div>
            <StoreContactTab storeId={storeId} storeSlug={storeSlug} />
          </StorePageCard>
        );
      case "invoice":
        return (
          <PlaceholderTab
            title={t.settings.sections.invoice}
            description={t.settings.sections.invoiceDesc}
          />
        );
      case "navigation":
        return (
          <PlaceholderTab
            title={t.settings.sections.navigation}
            description={t.settings.sections.navigationDesc}
          />
        );
      case "social-links":
        return (
          <StorePageCard>
            <div className="mb-4 space-y-1">
              <h2 className="text-base font-semibold text-apple-ink">{t.settings.sections.socialLinks}</h2>
              <p className="text-xs text-apple-ink-muted-48">{t.settings.sections.socialLinksDesc}</p>
            </div>
            <StoreContactTab storeId={storeId} storeSlug={storeSlug} />
          </StorePageCard>
        );
      case "seo":
        return (
          <PlaceholderTab
            title={t.settings.sections.seo}
            description={t.settings.sections.seoDesc}
          />
        );
      case "domain":
        return (
          <PlaceholderTab
            title={t.settings.sections.domain}
            description={t.settings.sections.domainDesc}
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
              <h2 className="text-base font-semibold text-apple-ink">{t.settings.sections.policies}</h2>
              <p className="text-xs text-apple-ink-muted-48">{t.settings.sections.policiesDesc}</p>
            </div>
            <CmsTab storeId={storeId} storeSlug={storeSlug} />
          </StorePageCard>
        );
      case "faq":
        return <CmsFaqsEditor />;
      case "security":
        return (
          <PlaceholderTab
            title={t.settings.sections.security}
            description={t.settings.sections.securityDesc}
          />
        );
      case "advanced":
        return (
          <PlaceholderTab
            title={t.settings.sections.advanced}
            description={t.settings.sections.advancedDesc}
          />
        );
      default:
        return <PlaceholderTab title={t.settings.title} description={t.settings.subtitle} />;
    }
  }, [activeSectionId, isLoading, storeId, storeSlug, courierLocked, courierFeature, billingHref, accessData?.data?.currentPlan?.name, t]);

  /* ── Header Breadcrumbs ──────────────────────────────────────────── */

  const groupLabel = settingsGroups[currentSection.group]?.label || t.settings.groups.GENERAL;

  return (
    <div className="space-y-6">
      <StorePageHeader
        title={t.settings.title}
        description={t.settings.subtitle}
        breadcrumbs={[
          { label: t.storeNav.dashboard, href: `/store/${storeSlug}/dashboard` },
          { label: t.storeNav.settings, href: `/store/${storeSlug}/settings?section=general` },
          { label: groupLabel },
          { label: currentSection.label },
        ]}
      />

      {/* Two-Column Modern Settings Layout */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left Settings Sidebar Navigation */}
        <aside className="shrink-0 lg:w-64">
          <div className="sticky top-4 space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
            {/* Search Settings Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.settings.searchPlaceholder}
                className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 pl-8.5 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700"
              />
            </div>

            {/* Navigation Groups List */}
            <nav className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-3.5 pr-1 sidebar-scroll" aria-label="Settings navigation">
              {searchQuery.trim() ? (
                // Filtered search results
                <div>
                  <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    {t.settings.matchingSettings(filteredSections.length)}
                  </p>
                  {filteredSections.length === 0 ? (
                    <p className="px-2 py-6 text-center text-xs text-zinc-400">
                      {t.settings.noSettingsFound(searchQuery)}
                    </p>
                  ) : (
                    <ul className="space-y-0.5">
                      {filteredSections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSectionId === section.id;
                        const sGroupLabel = settingsGroups[section.group]?.label || section.group;
                        return (
                          <li key={section.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSection(section.id);
                                setSearchQuery("");
                              }}
                              className={cn(
                                "group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 h-9 text-left text-xs font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20",
                                isActive
                                  ? "bg-zinc-100 text-zinc-950 font-medium dark:bg-white/[0.08] dark:text-white"
                                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                              )}
                            >
                              {isActive && (
                                <span className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-zinc-900 dark:bg-white" />
                              )}
                              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-zinc-950 dark:text-white" : "text-zinc-400 group-hover:text-zinc-600")} />
                              <div className="min-w-0 flex-1">
                                <p className="truncate">{section.label}</p>
                                <p className="truncate text-[10px] text-zinc-400">{sGroupLabel}</p>
                              </div>
                              <ChevronRight className="h-3 w-3 shrink-0 text-zinc-300 dark:text-zinc-600" />
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
                  const groupConfig = settingsGroups[groupKey];
                  const groupSections = settingsSections.filter((s) => s.group === groupKey);
                  if (groupSections.length === 0) return null;

                  return (
                    <div key={groupKey} className="space-y-0.5">
                      <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
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
                                  "group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 h-8.5 text-left text-xs font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20",
                                  isActive
                                    ? "bg-zinc-100 text-zinc-950 font-medium dark:bg-white/[0.08] dark:text-white"
                                    : "text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-100"
                                )}
                              >
                                {isActive && (
                                  <span className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-zinc-900 dark:bg-white" />
                                )}
                                <Icon
                                  className={cn(
                                    "h-3.5 w-3.5 shrink-0 transition-colors duration-150",
                                    isActive
                                      ? "text-zinc-950 dark:text-white"
                                      : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
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
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{currentSection.label}</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{currentSection.description}</p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
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

export default function StoreSettingsHubPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <StoreSettingsHubContent />
    </Suspense>
  );
}
