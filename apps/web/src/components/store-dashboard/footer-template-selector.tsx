"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Eye,
  Sliders,
  Smartphone,
  Tablet,
  Laptop,
  Layers,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useGetStorePagesQuery,
  useUpdatePageFooterSettingsMutation,
} from "@/redux/api/store-page-api";
import { StorefrontFooterRenderer } from "@/components/storefront/footer/storefront-footer-renderer";

export type FooterTemplateDef = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  recommendedFor: string;
  defaultSettings: Record<string, unknown>;
};

export const FOOTER_TEMPLATES: FooterTemplateDef[] = [
  {
    id: "grocery",
    name: "Grocery / Organic Footer",
    category: "Grocery",
    description: "4 value guarantee badges (100% Pure, Fast Delivery, Easy Returns, Support), hotline, dynamic grocery categories, delivery info, and payment methods.",
    tags: ["Grocery", "Organic", "Natural", "Bangladeshi"],
    recommendedFor: "Grocery & Organic Theme",
    defaultSettings: {
      template: "grocery",
      columns: 4,
      showSocial: true,
      showPaymentIcons: true,
      showNewsletter: true,
      mobileLayout: "accordion",
    },
  },
  {
    id: "tech-electronics",
    name: "Tech / Electronics Footer",
    category: "Electronics",
    description: "Star Tech-inspired dark navy footer with top newsletter subscription strip, helpline 16789, partner brands, PC Builder links, and warranty support.",
    tags: ["Tech", "Computer", "Electronics", "StarTech-style"],
    recommendedFor: "Electronics & Tech Theme",
    defaultSettings: {
      template: "tech-electronics",
      columns: 5,
      showSocial: true,
      showPaymentIcons: true,
      showNewsletter: true,
      mobileLayout: "accordion",
    },
  },
  {
    id: "marketplace",
    name: "Marketplace Footer",
    category: "Marketplace",
    description: "Daraz-style multi-vendor footer with value propositions, Customer Care, About Store, payment methods, and return policy.",
    tags: ["Marketplace", "Daraz", "Multi-vendor", "Promos"],
    recommendedFor: "Multi-category stores",
    defaultSettings: {
      template: "marketplace",
      columns: 5,
      showSocial: true,
      showPaymentIcons: true,
      showNewsletter: false,
      mobileLayout: "accordion",
    },
  },
  {
    id: "minimal-commerce",
    name: "Minimal Commerce Footer",
    category: "Minimal",
    description: "Clean dark footer with curated navigation links, dynamic store categories, customer contact information, and copyright legal bar.",
    tags: ["Minimal", "Clean", "Fashion", "Boutique"],
    recommendedFor: "Fashion & Lifestyle Theme",
    defaultSettings: {
      template: "minimal-commerce",
      columns: 4,
      showSocial: true,
      showPaymentIcons: false,
      showNewsletter: false,
      mobileLayout: "accordion",
    },
  },
  {
    id: "modern-store",
    name: "Modern Store Footer",
    category: "Modern",
    description: "Sleek dark luxury footer featuring a prominent member circle CTA, clean column navigation, and social icons.",
    tags: ["Modern", "General", "Luxury", "All-purpose"],
    recommendedFor: "Modern E-commerce Stores",
    defaultSettings: {
      template: "modern-store",
      columns: 4,
      showSocial: true,
      showPaymentIcons: true,
      showNewsletter: true,
      mobileLayout: "accordion",
    },
  },
];

interface FooterTemplateSelectorProps {
  storeId: string;
  storeSlug: string;
}

export function FooterTemplateSelector({ storeId, storeSlug }: FooterTemplateSelectorProps) {
  const router = useRouter();
  const { data: pagesData, refetch: refetchPages } = useGetStorePagesQuery(storeId, { skip: !storeId });
  const [updateFooterSettings, { isLoading: isUpdating }] = useUpdatePageFooterSettingsMutation();

  const homePage = pagesData?.data?.pages?.find(
    (p) => p.isHomePage || p.slug === "/" || p.slug === "home" || (p as any).pageType === "home"
  );

  const currentFooterSettings = (homePage?.footerSettings as Record<string, unknown>) || {};
  const activeTemplateId =
    (currentFooterSettings.template as string) ||
    (currentFooterSettings.footerTemplate as string) ||
    "grocery";

  const [previewTemplateId, setPreviewTemplateId] = useState<string>(activeTemplateId);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [behaviorSettings, setBehaviorSettings] = useState({
    showNewsletter: currentFooterSettings.showNewsletter !== false,
    showSocial: currentFooterSettings.showSocial !== false,
    showPaymentIcons: currentFooterSettings.showPaymentIcons !== false,
    mobileLayout: (currentFooterSettings.mobileLayout as string) || "accordion",
    columns: Number(currentFooterSettings.columns) || 4,
  });

  const handleSelectTemplate = async (templateId: string) => {
    if (!homePage?._id) {
      toast.error("Home page not found");
      return;
    }

    const tpl = FOOTER_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    try {
      const mergedSettings = {
        ...currentFooterSettings,
        ...tpl.defaultSettings,
        template: tpl.id,
        footerTemplate: tpl.id,
        ...behaviorSettings,
      };

      await updateFooterSettings({
        id: homePage._id,
        storeId,
        footerSettings: mergedSettings,
      }).unwrap();

      setPreviewTemplateId(tpl.id);
      refetchPages();
      toast.success(`Active footer updated to "${tpl.name}"!`);
    } catch {
      toast.error("Failed to update active footer");
    }
  };

  const handleSaveBehavior = async () => {
    if (!homePage?._id) return;
    try {
      const mergedSettings = {
        ...currentFooterSettings,
        ...behaviorSettings,
        template: previewTemplateId,
        footerTemplate: previewTemplateId,
      };
      await updateFooterSettings({
        id: homePage._id,
        storeId,
        footerSettings: mergedSettings,
      }).unwrap();
      refetchPages();
      toast.success("Footer settings saved!");
    } catch {
      toast.error("Failed to save footer settings");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ── Active Footer Hero Banner ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Layers className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Footer Template
              </span>
            </div>
            <h3 className="text-base font-bold text-zinc-900">
              {FOOTER_TEMPLATES.find((t) => t.id === activeTemplateId)?.name || "Default Footer"}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {FOOTER_TEMPLATES.find((t) => t.id === activeTemplateId)?.description}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => router.push(`/store/${storeSlug}/builder/home`)}
          className="w-full md:w-auto text-xs bg-zinc-900 hover:bg-black text-white"
        >
          <Wand2 className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
          Customize in Builder
        </Button>
      </div>

      {/* ── Footer Template Cards Grid ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
          Available Footer Templates (5 Designs)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FOOTER_TEMPLATES.map((tpl) => {
            const isActive = tpl.id === activeTemplateId;
            const isPreviewing = tpl.id === previewTemplateId;

            return (
              <div
                key={tpl.id}
                className={cn(
                  "group relative rounded-2xl border bg-white p-5 shadow-xs transition-all flex flex-col justify-between",
                  isActive
                    ? "border-zinc-900 ring-2 ring-zinc-900/10 shadow-md"
                    : isPreviewing
                    ? "border-blue-500 shadow-md"
                    : "border-zinc-200 hover:border-zinc-400 hover:shadow-sm"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-zinc-50">
                      {tpl.category}
                    </Badge>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-sm text-zinc-900">{tpl.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tpl.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewTemplateId(tpl.id)}
                    className={cn(
                      "flex-1 text-xs font-semibold",
                      isPreviewing && "bg-zinc-100 text-zinc-900"
                    )}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    {isPreviewing ? "Previewing" : "Preview"}
                  </Button>

                  {isActive ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => router.push(`/store/${storeSlug}/builder/home`)}
                      className="flex-1 text-xs bg-zinc-900 hover:bg-black text-white font-semibold"
                    >
                      <Sliders className="w-3.5 h-3.5 mr-1" />
                      Customize
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleSelectTemplate(tpl.id)}
                      className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      Use This Footer
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Live Interactive Footer Preview + Behavior Settings ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-zinc-900">
              Live Footer Preview ({FOOTER_TEMPLATES.find((t) => t.id === previewTemplateId)?.name})
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Simulate footer responsiveness and accordion behavior with live store data
            </p>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                previewDevice === "desktop" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              <Laptop className="w-3.5 h-3.5" /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("tablet")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                previewDevice === "tablet" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              <Tablet className="w-3.5 h-3.5" /> Tablet
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                previewDevice === "mobile" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              )}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
          </div>
        </div>

        {/* Scaled Preview Frame */}
        <div className="p-4 bg-zinc-100 rounded-2xl flex items-center justify-center overflow-x-auto min-h-[220px]">
          <div
            className={cn(
              "bg-zinc-900 rounded-xl shadow-md overflow-hidden transition-all",
              previewDevice === "desktop" && "w-full max-w-5xl",
              previewDevice === "tablet" && "w-[768px]",
              previewDevice === "mobile" && "w-[375px]"
            )}
          >
            <StorefrontFooterRenderer
              footerSettings={{
                template: previewTemplateId,
                ...behaviorSettings,
              }}
            />
          </div>
        </div>

        {/* Behavior Controls */}
        <div className="pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Columns
            </label>
            <select
              value={behaviorSettings.columns}
              onChange={(e) =>
                setBehaviorSettings((prev) => ({
                  ...prev,
                  columns: Number(e.target.value),
                }))
              }
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-xs font-medium bg-white focus:outline-none focus:border-zinc-900"
            >
              <option value={3}>3 Columns</option>
              <option value={4}>4 Columns</option>
              <option value={5}>5 Columns</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Mobile Behavior
            </label>
            <select
              value={behaviorSettings.mobileLayout}
              onChange={(e) =>
                setBehaviorSettings((prev) => ({ ...prev, mobileLayout: e.target.value }))
              }
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-xs font-medium bg-white focus:outline-none focus:border-zinc-900"
            >
              <option value="accordion">Accordion (Tap to Expand)</option>
              <option value="stacked">Always Stacked</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Newsletter Strip
            </label>
            <button
              type="button"
              onClick={() =>
                setBehaviorSettings((prev) => ({
                  ...prev,
                  showNewsletter: !prev.showNewsletter,
                }))
              }
              className={cn(
                "w-full h-9 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors",
                behaviorSettings.showNewsletter
                  ? "bg-zinc-900 border-zinc-900 text-white"
                  : "bg-white border-zinc-200 text-zinc-700"
              )}
            >
              <span>{behaviorSettings.showNewsletter ? "Enabled" : "Disabled"}</span>
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  behaviorSettings.showNewsletter ? "bg-emerald-400" : "bg-zinc-300"
                )}
              />
            </button>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleSaveBehavior}
              className="w-full h-9 bg-zinc-900 hover:bg-black text-white text-xs font-semibold"
            >
              Save Footer Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
