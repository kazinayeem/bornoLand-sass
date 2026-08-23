"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Eye,
  Sliders,
  Sparkles,
  Smartphone,
  Tablet,
  Laptop,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Layers,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useGetStorePagesQuery,
  useUpdatePageHeaderSettingsMutation,
} from "@/redux/api/store-page-api";
import { StorefrontHeaderRenderer } from "@/components/storefront/header/storefront-header-renderer";

export type HeaderTemplateDef = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  recommendedFor: string;
  previewThumbnail: string;
  defaultSettings: Record<string, unknown>;
};

export const HEADER_TEMPLATES: HeaderTemplateDef[] = [
  {
    id: "grocery",
    name: "Grocery & Organic Header",
    category: "Grocery",
    description: "Green/natural e-commerce header with announcement topbar, large search, 'All Categories' mega button, and quick outlet links.",
    tags: ["Grocery", "Organic", "Natural", "Bangladeshi"],
    recommendedFor: "Grocery & Organic Theme",
    previewThumbnail: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
    defaultSettings: {
      template: "grocery",
      position: "sticky",
      sticky: true,
      autoHideOnScroll: false,
      shadow: "sm",
      transparent: false,
    },
  },
  {
    id: "tech-mega",
    name: "Computer & Tech Mega Header",
    category: "Electronics",
    description: "Star Tech-inspired dark navy header with top row utilities (Offers, PC Builder) and 2nd row dynamic tech category mega menu.",
    tags: ["Tech", "Computer", "Laptop", "StarTech-style"],
    recommendedFor: "Electronics & Tech Theme",
    previewThumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
    defaultSettings: {
      template: "tech-mega",
      position: "sticky",
      sticky: true,
      autoHideOnScroll: false,
      shadow: "md",
      transparent: false,
    },
  },
  {
    id: "marketplace",
    name: "Marketplace Header",
    category: "Marketplace",
    description: "Daraz-style multi-vendor header featuring prominent search with category button, Flash Sale banner, and large mega menu.",
    tags: ["Marketplace", "Daraz", "Multi-vendor", "Promos"],
    recommendedFor: "Multi-category stores",
    previewThumbnail: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80",
    defaultSettings: {
      template: "marketplace",
      position: "sticky",
      sticky: true,
      autoHideOnScroll: false,
      shadow: "sm",
      transparent: false,
    },
  },
  {
    id: "minimal-fashion",
    name: "Minimal / Fashion Header",
    category: "Fashion",
    description: "Premium editorial typography with generous whitespace, sleek search toggle, minimal cart counter, and transparent header support.",
    tags: ["Fashion", "Minimal", "Apparel", "Luxury"],
    recommendedFor: "Fashion & Lifestyle Theme",
    previewThumbnail: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
    defaultSettings: {
      template: "minimal-fashion",
      position: "sticky",
      sticky: true,
      autoHideOnScroll: false,
      shadow: "none",
      transparent: false,
    },
  },
  {
    id: "modern-general",
    name: "Modern General E-commerce Header",
    category: "General",
    description: "Versatile 2-row commercial header with phone hotline, All Categories dropdown, and subcategory hover menus.",
    tags: ["Modern", "General", "Versatile", "All-purpose"],
    recommendedFor: "Any store type",
    previewThumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
    defaultSettings: {
      template: "modern-general",
      position: "sticky",
      sticky: true,
      autoHideOnScroll: false,
      shadow: "sm",
      transparent: false,
    },
  },
];

interface HeaderTemplateSelectorProps {
  storeId: string;
  storeSlug: string;
}

export function HeaderTemplateSelector({ storeId, storeSlug }: HeaderTemplateSelectorProps) {
  const router = useRouter();
  const { data: pagesData } = useGetStorePagesQuery(storeId, { skip: !storeId });
  const [updateHeaderSettings, { isLoading: isUpdating }] = useUpdatePageHeaderSettingsMutation();

  const homePage = pagesData?.data?.pages?.find(
    (p) => p.isHomePage || p.slug === "/" || p.slug === "home" || (p as any).pageType === "home"
  );

  const currentHeaderSettings = (homePage?.headerSettings as Record<string, unknown>) || {};
  const activeTemplateId =
    (currentHeaderSettings.template as string) ||
    (currentHeaderSettings.headerTemplate as string) ||
    "grocery";

  const [previewTemplateId, setPreviewTemplateId] = useState<string>(activeTemplateId);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [behaviorSettings, setBehaviorSettings] = useState({
    position: (currentHeaderSettings.position as string) || "sticky",
    sticky: currentHeaderSettings.sticky !== false,
    autoHideOnScroll: currentHeaderSettings.autoHideOnScroll === true,
    transparent: currentHeaderSettings.transparent === true,
    shadow: (currentHeaderSettings.shadow as string) || "sm",
  });

  const handleSelectTemplate = async (templateId: string) => {
    if (!homePage?._id) {
      toast.error("Home page not found");
      return;
    }

    const tpl = HEADER_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    try {
      const { applyHeaderTemplateSelection } = await import("@/lib/storefront/global-navigation");
      const mergedSettings = applyHeaderTemplateSelection(
        {
          ...currentHeaderSettings,
          ...tpl.defaultSettings,
          ...behaviorSettings,
        },
        tpl.id,
      );

      await updateHeaderSettings({
        id: homePage._id,
        storeId,
        headerSettings: mergedSettings,
      }).unwrap();

      setPreviewTemplateId(tpl.id);
      toast.success(`Active header updated to "${tpl.name}"!`);
    } catch {
      toast.error("Failed to update active header");
    }
  };

  const handleSaveBehavior = async () => {
    if (!homePage?._id) return;
    try {
      const { applyHeaderTemplateSelection } = await import("@/lib/storefront/global-navigation");
      const mergedSettings = applyHeaderTemplateSelection(
        {
          ...currentHeaderSettings,
          ...behaviorSettings,
        },
        previewTemplateId,
      );
      await updateHeaderSettings({
        id: homePage._id,
        storeId,
        headerSettings: mergedSettings,
      }).unwrap();
      toast.success("Header behavior settings saved!");
    } catch {
      toast.error("Failed to save header settings");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ── Active Header Hero Banner ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Layers className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Header Template
              </span>
            </div>
            <h3 className="text-base font-bold text-zinc-900">
              {HEADER_TEMPLATES.find((t) => t.id === activeTemplateId)?.name || "Default Header"}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {HEADER_TEMPLATES.find((t) => t.id === activeTemplateId)?.description}
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

      {/* ── Header Template Cards Grid ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
          Available Header Templates (5 Designs)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HEADER_TEMPLATES.map((tpl) => {
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
                      Use This Header
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Live Interactive Header Preview + Behavior Settings ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-zinc-900">
              Live Header Preview ({HEADER_TEMPLATES.find((t) => t.id === previewTemplateId)?.name})
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Simulate header responsiveness with your real store catalog data
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
        <div className="p-4 bg-zinc-100 rounded-2xl flex items-center justify-center overflow-x-auto min-h-[160px]">
          <div
            className={cn(
              "bg-white rounded-xl shadow-md overflow-hidden transition-all",
              previewDevice === "desktop" && "w-full max-w-5xl",
              previewDevice === "tablet" && "w-[768px]",
              previewDevice === "mobile" && "w-[375px]"
            )}
          >
            <StorefrontHeaderRenderer
              headerSettings={{
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
              Position
            </label>
            <select
              value={behaviorSettings.position}
              onChange={(e) =>
                setBehaviorSettings((prev) => ({
                  ...prev,
                  position: e.target.value,
                  sticky: e.target.value === "sticky",
                }))
              }
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-xs font-medium bg-white focus:outline-none focus:border-zinc-900"
            >
              <option value="sticky">Sticky (Default)</option>
              <option value="static">Static (Scrolls away)</option>
              <option value="fixed">Fixed Overlay</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Header Shadow
            </label>
            <select
              value={behaviorSettings.shadow}
              onChange={(e) =>
                setBehaviorSettings((prev) => ({ ...prev, shadow: e.target.value }))
              }
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 text-xs font-medium bg-white focus:outline-none focus:border-zinc-900"
            >
              <option value="none">None</option>
              <option value="sm">Subtle (sm)</option>
              <option value="md">Medium (md)</option>
              <option value="lg">Large (lg)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Auto-Hide on Scroll Down
            </label>
            <button
              type="button"
              onClick={() =>
                setBehaviorSettings((prev) => ({
                  ...prev,
                  autoHideOnScroll: !prev.autoHideOnScroll,
                }))
              }
              className={cn(
                "w-full h-9 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors",
                behaviorSettings.autoHideOnScroll
                  ? "bg-zinc-900 border-zinc-900 text-white"
                  : "bg-white border-zinc-200 text-zinc-700"
              )}
            >
              <span>{behaviorSettings.autoHideOnScroll ? "Enabled" : "Disabled"}</span>
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  behaviorSettings.autoHideOnScroll ? "bg-emerald-400" : "bg-zinc-300"
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
              Save Header Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
