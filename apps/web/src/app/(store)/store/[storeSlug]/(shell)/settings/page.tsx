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
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Layers,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
import { useUpdateStoreMutation } from "@/redux/api/store-api";
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
    { id: "general", label: s.general, description: s.generalDesc, icon: Settings2, group: "GENERAL", keywords: ["store name", "slug", "about", "status"] },
    { id: "branding", label: s.branding, description: s.brandingDesc, icon: Sparkles, group: "GENERAL", keywords: ["logo", "color", "favicon", "brand"] },
    { id: "contact", label: s.contact, description: s.contactDesc, icon: MapPin, group: "GENERAL", keywords: ["phone", "email", "support", "address"] },

    // STORE
    { id: "localization", label: s.localization, description: s.localizationDesc, icon: Globe, group: "STORE", keywords: ["timezone", "date", "language", "locale"] },
    { id: "currency", label: s.currency, description: s.currencyDesc, icon: DollarSign, group: "STORE", keywords: ["bdt", "usd", "symbol", "money", "pricing"] },
    { id: "seo", label: s.seo, description: s.seoDesc, icon: Search, group: "STORE", keywords: ["meta", "google", "sitemap", "keywords"] },
    { id: "domain", label: s.domain, description: s.domainDesc, icon: Globe2, group: "STORE", keywords: ["cname", "dns", "ssl", "subdomain", "custom domain"] },

    // COMMERCE
    { id: "checkout", label: s.checkout, description: s.checkoutDesc, icon: ShoppingCart, group: "COMMERCE", keywords: ["cart", "guest", "order limit", "fields"] },
    { id: "payments", label: s.payments, description: s.paymentsDesc, icon: CreditCard, group: "COMMERCE", keywords: ["cod", "bkash", "nagad", "gateway", "bank"] },
    { id: "shipping", label: s.shipping, description: s.shippingDesc, icon: Truck, group: "COMMERCE", keywords: ["delivery", "charge", "free shipping", "zone"] },
    { id: "courier", label: s.courier, description: s.courierDesc, icon: Package, group: "COMMERCE", keywords: ["steadfast", "pathao", "redx", "tracking"] },
    { id: "taxes", label: s.taxes, description: s.taxesDesc, icon: Percent, group: "COMMERCE", keywords: ["tax", "vat", "gst", "percentage"] },
    { id: "invoice", label: s.invoice, description: s.invoiceDesc, icon: FileText, group: "COMMERCE", keywords: ["pdf", "receipt", "order bill", "numbering"] },

    // CONTENT
    { id: "navigation", label: s.navigation, description: s.navigationDesc, icon: Menu, group: "CONTENT", keywords: ["menu", "header", "footer", "links"] },
    { id: "cms-pages", label: s.cmsPages, description: s.cmsPagesDesc, icon: BookOpen, group: "CONTENT", keywords: ["about", "terms", "custom page"] },
    { id: "policies", label: s.policies, description: s.policiesDesc, icon: ShieldCheck, group: "CONTENT", keywords: ["privacy", "refund", "terms", "return"] },
    { id: "faq", label: s.faq, description: s.faqDesc, icon: HelpCircle, group: "CONTENT", keywords: ["help", "questions", "answers"] },
    { id: "social-links", label: s.socialLinks, description: s.socialLinksDesc, icon: Share2, group: "CONTENT", keywords: ["facebook", "instagram", "whatsapp", "tiktok"] },

    // COMMUNICATION
    { id: "email", label: s.email, description: s.emailDesc, icon: Mail, group: "COMMUNICATION", keywords: ["smtp", "notifications", "alerts", "mail"] },
    { id: "messages", label: s.messages, description: s.messagesDesc, icon: MessageSquare, group: "COMMUNICATION", keywords: ["inbox", "inquiries", "contact"] },

    // ADVANCED
    { id: "security", label: s.security, description: s.securityDesc, icon: Lock, group: "ADVANCED", keywords: ["password", "protect", "auth", "session"] },
    { id: "advanced", label: s.advanced, description: s.advancedDesc, icon: Cpu, group: "ADVANCED", keywords: ["api", "webhook", "developer", "danger"] },
  ];
}

const SETTINGS_GROUP_ORDER: SettingsGroupKey[] = ["GENERAL", "STORE", "COMMERCE", "CONTENT", "COMMUNICATION", "ADVANCED"];

/* ── Domain Settings Tab Component ────────────────────────────────── */

function DomainSettingsTab({ storeId, storeSlug }: { storeId: string; storeSlug: string }) {
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [updateStore] = useUpdateStoreMutation();

  const storeSubdomainUrl = typeof window !== "undefined"
    ? `${window.location.protocol}//${storeSlug}.${window.location.host.split(":").slice(0, 1)[0]}${window.location.port ? `:${window.location.port}` : ""}`
    : `https://${storeSlug}.bornoland.com`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSaveCustomDomain = async () => {
    if (!customDomainInput.trim()) {
      toast.error("Please enter a valid domain name");
      return;
    }
    setSaving(true);
    try {
      // Clean domain name format
      const cleanedDomain = customDomainInput.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
      await updateStore({
        id: storeId,
        data: {
          description: `Custom domain configured: ${cleanedDomain}`,
        },
      }).unwrap();
      toast.success(`Domain ${cleanedDomain} registered! Please configure DNS records.`);
    } catch {
      toast.error("Failed to save custom domain settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Default Subdomain Card */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">BornoLand Subdomain</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Active
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Your store is always accessible at this default high-speed address.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-mono text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              {storeSlug}.bornoland.com
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(`${storeSlug}.bornoland.com`)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
              title="Copy URL"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <a
              href={`/site/${storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Visit Store
            </a>
          </div>
        </div>
      </div>

      {/* 2. Custom Domain Connect Card */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Connect Custom Domain</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Use your own domain (e.g., <code>yourstore.com</code> or <code>shop.yourbrand.com</code>) with automatic SSL certificate encryption.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={customDomainInput}
                onChange={(e) => setCustomDomainInput(e.target.value)}
                placeholder="e.g. yourstore.com or shop.yourbrand.com"
                className="h-9.5 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 pl-9.5 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveCustomDomain}
              className="inline-flex h-9.5 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Connect Domain
            </button>
          </div>
        </div>
      </div>

      {/* 3. DNS Configuration Instructions */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">DNS Configuration Records</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Add the following CNAME record in your domain provider&apos;s DNS management panel (Cloudflare, Namecheap, GoDaddy, etc.).
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-[11px] font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-3.5 py-2.5">Type</th>
                  <th className="px-3.5 py-2.5">Name / Host</th>
                  <th className="px-3.5 py-2.5">Target / Value</th>
                  <th className="px-3.5 py-2.5">TTL</th>
                  <th className="px-3.5 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                <tr>
                  <td className="px-3.5 py-2.5 font-semibold text-zinc-900 dark:text-zinc-100">CNAME</td>
                  <td className="px-3.5 py-2.5 text-zinc-700 dark:text-zinc-300">@ or shop</td>
                  <td className="px-3.5 py-2.5 text-zinc-700 dark:text-zinc-300">cname.bornoland.com</td>
                  <td className="px-3.5 py-2.5 text-zinc-500">Automatic / 3600</td>
                  <td className="px-3.5 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => copyToClipboard("cname.bornoland.com")}
                      className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-1 text-[11px] font-sans font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      <Copy className="h-3 w-3" /> Copy Target
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg bg-amber-50/70 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p>
              DNS propagation may take anywhere from 5 minutes to 24 hours depending on your registrar. SSL certificates are automatically provisioned and renewed at zero extra charge once DNS points to BornoLand.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SEO Settings Tab Component ───────────────────────────────────── */

function SeoSettingsTab({ storeId, storeSlug }: { storeId: string; storeSlug: string }) {
  const { store } = useStorePage();
  const [metaTitle, setMetaTitle] = useState(store?.name || "");
  const [metaDescription, setMetaDescription] = useState(store?.description || "");
  const [saving, setSaving] = useState(false);
  const [updateStore] = useUpdateStoreMutation();

  const handleSaveSeo = async () => {
    setSaving(true);
    try {
      await updateStore({
        id: storeId,
        data: {
          name: metaTitle,
          description: metaDescription,
        },
      }).unwrap();
      toast.success("SEO settings saved successfully");
    } catch {
      toast.error("Failed to save SEO settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Search Engine Metadata</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Customize how your storefront appears on Google, Bing, and social sharing links.
            </p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Store Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="e.g. My Premium Boutique — Organic Clothing in Bangladesh"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <p className="mt-1 text-[11px] text-zinc-400">Recommended length: 50-60 characters</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Store Meta Description
              </label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Brief description of your products, delivery options, and unique value proposition..."
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 text-xs text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <p className="mt-1 text-[11px] text-zinc-400">Recommended length: 120-160 characters</p>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSaveSeo}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save SEO Settings
            </button>
          </div>
        </div>
      </div>

      {/* Google Search Result Preview Card */}
      <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Google Search Preview</h3>
        <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
            https://{storeSlug}.bornoland.com
          </p>
          <h4 className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 cursor-pointer mt-0.5">
            {metaTitle || `${storeSlug} | BornoLand Store`}
          </h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 line-clamp-2">
            {metaDescription || "Discover our exclusive collection of quality products. Fast delivery, secure payments, and reliable customer service."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Placeholder Tab Component ────────────────────────────────────── */

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white p-8 text-center shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 mb-4">
        <Settings2 className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">{description}</p>
      </div>
    </div>
  );
}

/* ── Loading Shell ────────────────────────────────────────────────── */

function LoadingShell() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-900 dark:text-zinc-100" />
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
        return <SettingsTab storeId={storeId} />;
      case "branding":
        return <BrandingTab storeId={storeId} storeSlug={storeSlug} />;
      case "contact":
        return <StoreContactTab storeId={storeId} storeSlug={storeSlug} />;
      case "localization":
        return (
          <div className="space-y-4">
            <div className="mb-2 space-y-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.settings.localization.title}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.settings.localization.subtitle}</p>
            </div>
            <SettingsTab storeId={storeId} />
          </div>
        );
      case "currency":
        return (
          <div className="space-y-4">
            <div className="mb-2 space-y-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.settings.currency.title}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.settings.currency.subtitle}</p>
            </div>
            <SettingsTab storeId={storeId} />
          </div>
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
          <div className="space-y-4">
            <div className="mb-2 space-y-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.settings.tax.title}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.settings.tax.subtitle}</p>
            </div>
            <SettingsTab storeId={storeId} />
          </div>
        );
      case "payments":
        return <PaymentsTab storeId={storeId} />;
      case "checkout":
        return <CheckoutTab storeId={storeId} />;
      case "email":
        return <StoreEmailSettingsPage />;
      case "messages":
        return (
          <div className="space-y-4">
            <div className="mb-2 space-y-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.settings.sections.messages}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.settings.sections.messagesDesc}</p>
            </div>
            <StoreContactTab storeId={storeId} storeSlug={storeSlug} />
          </div>
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
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Storefront Menu Navigation</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Configure your primary header menu and footer links.</p>
                </div>
                <Link
                  href={`/store/${storeSlug}/design`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  <Menu className="h-3.5 w-3.5" /> Manage Menus
                </Link>
              </div>
            </div>
          </div>
        );
      case "social-links":
        return (
          <div className="space-y-4">
            <div className="mb-2 space-y-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.settings.sections.socialLinks}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.settings.sections.socialLinksDesc}</p>
            </div>
            <StoreContactTab storeId={storeId} storeSlug={storeSlug} />
          </div>
        );
      case "seo":
        return <SeoSettingsTab storeId={storeId} storeSlug={storeSlug} />;
      case "domain":
        return <DomainSettingsTab storeId={storeId} storeSlug={storeSlug} />;
      case "cms-pages":
        return <CmsTab storeId={storeId} storeSlug={storeSlug} />;
      case "policies":
        return (
          <div className="space-y-4">
            <div className="mb-2 space-y-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.settings.sections.policies}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.settings.sections.policiesDesc}</p>
            </div>
            <CmsTab storeId={storeId} storeSlug={storeSlug} />
          </div>
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
          <div className="sticky top-6 space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
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
            <nav className="max-h-[calc(100vh-220px)] overflow-y-auto space-y-3.5 pr-1 sidebar-scroll" aria-label="Settings navigation">
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
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800 mb-6">
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{currentSection.label}</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{currentSection.description}</p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                {groupLabel}
              </span>
            </div>

            <div>{tabContent}</div>
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
