"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Settings2, Sparkles, MapPin, Globe, DollarSign, Truck, Percent,
  CreditCard, ShoppingCart, Mail, FileText, Menu, Share2, Search,
  Globe2, BookOpen, ShieldCheck, FileText as FileTextIcon, HelpCircle,
  Lock, Cpu, ChevronDown, ChevronRight, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsTab } from "@/components/workspace/settings-tab";
import { BrandingTab } from "@/components/workspace/branding-tab";
import { StoreContactTab } from "@/components/cms/store-contact-tab";
import { CheckoutTab } from "@/components/workspace/checkout-tab";
import { PaymentsTab } from "@/components/workspace/payments-tab";
import { ShippingSettingsTab } from "@/components/workspace/shipping-settings-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import StoreEmailSettingsPage from "@/app/(store)/store/[storeSlug]/(shell)/settings/notifications/page";
import { CmsTab } from "@/components/workspace/cms-tab";
import { CmsFaqsEditor } from "@/components/cms/cms-faqs-editor";

/* ── Section definitions ──────────────────────────────────────────── */

type SectionId =
  | "general" | "branding" | "contact"
  | "localization" | "currency"
  | "shipping" | "taxes" | "payments" | "checkout" | "email" | "invoice"
  | "navigation" | "social-links"
  | "seo" | "domain" | "cms-pages"
  | "policies" | "faq"
  | "security" | "advanced";

type Section = {
  id: SectionId;
  label: string;
  icon: typeof Settings2;
  group: string;
};

const SECTIONS: Section[] = [
  // General
  { id: "general", label: "General", icon: Settings2, group: "General" },
  { id: "branding", label: "Branding", icon: Sparkles, group: "General" },
  { id: "contact", label: "Contact", icon: MapPin, group: "General" },

  // Localization
  { id: "localization", label: "Localization", icon: Globe, group: "Localization" },
  { id: "currency", label: "Currency", icon: DollarSign, group: "Localization" },

  // Commerce
  { id: "shipping", label: "Shipping", icon: Truck, group: "Commerce" },
  { id: "taxes", label: "Taxes", icon: Percent, group: "Commerce" },
  { id: "payments", label: "Payments", icon: CreditCard, group: "Commerce" },
  { id: "checkout", label: "Checkout", icon: ShoppingCart, group: "Commerce" },
  { id: "email", label: "Email", icon: Mail, group: "Commerce" },
  { id: "invoice", label: "Invoice", icon: FileText, group: "Commerce" },

  // Content
  { id: "navigation", label: "Navigation", icon: Menu, group: "Content" },
  { id: "social-links", label: "Social Links", icon: Share2, group: "Content" },
  { id: "seo", label: "SEO", icon: Search, group: "Content" },
  { id: "domain", label: "Domain", icon: Globe2, group: "Content" },
  { id: "cms-pages", label: "CMS Pages", icon: BookOpen, group: "Content" },
  { id: "policies", label: "Policies", icon: FileTextIcon, group: "Content" },
  { id: "faq", label: "FAQ", icon: HelpCircle, group: "Content" },

  // System
  { id: "security", label: "Security", icon: Lock, group: "System" },
  { id: "advanced", label: "Advanced", icon: Cpu, group: "System" },
];

const GROUP_ORDER = ["General", "Localization", "Commerce", "Content", "System"];

/* ── Placeholder tab ──────────────────────────────────────────────── */

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <StorePageCard>
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-apple-canvas-parchment">
          <Settings2 className="h-6 w-6 text-apple-ink-muted-48" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-apple-ink">{title}</h3>
          <p className="mt-1 text-sm text-apple-ink-muted-48">{description}</p>
        </div>
      </div>
    </StorePageCard>
  );
}

/* ── Loading state ────────────────────────────────────────────────── */

function LoadingShell() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────── */

export default function StoreSettingsHubPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { storeId, store, isLoading } = useStorePage();
  const storeSlug = (params.storeSlug as string) || store?.slug || "";

  const activeSection = (searchParams.get("section") || "general") as SectionId;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const setSection = useCallback(
    (id: SectionId) => {
      router.replace(`/store/${storeSlug}/settings?section=${id}`, { scroll: false });
    },
    [router, storeSlug]
  );

  /* ── Tab content ────────────────────────────────────────────────── */

  const tabContent = useMemo<ReactNode>(() => {
    if (isLoading || !storeId) return <LoadingShell />;
    switch (activeSection) {
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
            <div className="mb-4">
              <h2 className="text-base font-semibold text-apple-ink">Localization</h2>
              <p className="text-sm text-apple-ink-muted-48">Date format, timezone, and language settings.</p>
            </div>
            <SettingsTab storeId={storeId} />
          </StorePageCard>
        );
      case "currency":
        return (
          <StorePageCard>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-apple-ink">Currency</h2>
              <p className="text-sm text-apple-ink-muted-48">Manage store currency and localization.</p>
            </div>
            <SettingsTab storeId={storeId} />
          </StorePageCard>
        );
      case "shipping":
        return <ShippingSettingsTab storeId={storeId} />;
      case "taxes":
        return (
          <StorePageCard>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-apple-ink">Taxes</h2>
              <p className="text-sm text-apple-ink-muted-48">Default tax rate for products.</p>
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
      case "invoice":
        return (
          <PlaceholderTab title="Invoice" description="Invoice configuration coming soon. You can manage invoices from the billing section." />
        );
      case "navigation":
        return (
          <PlaceholderTab title="Navigation" description="Configure header menus, footer menus, and navigation links for your storefront." />
        );
      case "social-links":
        return (
          <PlaceholderTab title="Social Links" description="Manage your store's social media links. You can also edit these from the Contact section." />
        );
      case "seo":
        return (
          <PlaceholderTab title="SEO" description="Meta tags, social preview images, sitemap, robots.txt, and analytics configuration coming soon." />
        );
      case "domain":
        return (
          <PlaceholderTab title="Domain" description="Custom domain configuration coming soon." />
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
            <div className="mb-4">
              <h2 className="text-base font-semibold text-apple-ink">Policies</h2>
              <p className="text-sm text-apple-ink-muted-48">Manage your store policies. Edit each page in <strong>CMS Pages</strong>.</p>
            </div>
            <CmsTab storeId={storeId} storeSlug={storeSlug} />
          </StorePageCard>
        );
      case "faq":
        return <CmsFaqsEditor />;
      case "security":
        return (
          <PlaceholderTab title="Security" description="Password protection, IP allowlist, and security settings coming soon." />
        );
      case "advanced":
        return (
          <PlaceholderTab title="Advanced" description="Developer settings, webhooks, API keys, and advanced configuration coming soon." />
        );
      default:
        return (
          <PlaceholderTab title="Coming Soon" description="This section is under development." />
        );
    }
  }, [activeSection, isLoading, storeId, storeSlug]);

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Sidebar */}
      <aside className={cn("shrink-0", sidebarOpen ? "lg:w-56" : "lg:w-12")}>
        {/* Mobile toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-apple-ink-muted-48 hover:bg-apple-canvas-parchment lg:hidden"
        >
          <Menu className="h-4 w-4" />
          {sidebarOpen ? "Hide menu" : "Show menu"}
        </button>

        <nav className="space-y-5" aria-label="Settings sections">
          {GROUP_ORDER.map((group) => {
            const groupSections = SECTIONS.filter((s) => s.group === group);
            return (
              <div key={group}>
                {sidebarOpen && (
                  <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">
                    {group}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {groupSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <li key={section.id}>
                        <button
                          onClick={() => setSection(section.id)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
                            isActive
                              ? "bg-apple-primary/10 text-apple-primary"
                              : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment hover:text-apple-ink",
                            !sidebarOpen && "justify-center px-2"
                          )}
                          title={sidebarOpen ? undefined : section.label}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {sidebarOpen && <span className="truncate">{section.label}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="min-w-0 flex-1">{tabContent}</div>
    </div>
  );
}
