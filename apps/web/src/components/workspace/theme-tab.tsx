"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  Loader2,
  Check,
  Eye,
  Sparkles,
  ArrowRight,
  Monitor,
  Smartphone,
  CheckCircle2,
  Layers,
  Wand2,
  RotateCcw,
  ShoppingBag,
  Cpu,
  Shirt,
  Heart,
  Utensils,
  Home,
  Activity,
  BookOpen,
  Baby,
  Store,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useGetStoreQuery, useChangeStoreThemeMutation } from "@/redux/api/store-api";
import { revalidateStorefrontForStore } from "@/lib/revalidate-storefront-client";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { canAccessThemeBuilder } from "@/lib/permissions/entitlements";
import { useAppSelector } from "@/hooks/redux";
import { THEMES, getThemeById } from "@/themes/registry";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/providers/language-provider";
import { AiShopBuilderModal } from "@/components/ai-builder/ai-shop-builder-modal";
import type { ThemeCategory } from "@/themes/types";

type ThemeTabProps = { storeId: string };

const CATEGORY_ICONS: Record<string, typeof ShoppingBag> = {
  grocery: ShoppingBag,
  electronics: Cpu,
  fashion: Shirt,
  beauty: Heart,
  restaurant: Utensils,
  furniture: Home,
  sports: Activity,
  books: BookOpen,
  kids: Baby,
  marketplace: Store,
  general: Store,
};

export function ThemeTab({ storeId }: ThemeTabProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const { store: storeContext } = useStorePage();
  const user = useAppSelector((s) => s.user.profile);

  const { data, isLoading } = useGetStoreQuery(storeId);
  const [changeTheme] = useChangeStoreThemeMutation();
  const store = data?.data?.store;

  const [activeThemeId, setActiveThemeId] = useState<string>("grocery");
  const [previewThemeId, setPreviewThemeId] = useState<string>("grocery");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [aiBuilderOpen, setAiBuilderOpen] = useState(false);

  useEffect(() => {
    if (store?.theme) {
      const current = (store.theme.themeId as string) || "grocery";
      setActiveThemeId(current);
      setPreviewThemeId(current);
    }
  }, [store]);

  const permission = canAccessThemeBuilder(user?.role, store?.plan);
  const activeDef = getThemeById(activeThemeId);
  const previewDef = getThemeById(previewThemeId);

  const categoriesList = useMemo(() => [
    { id: "all", label: isBn ? "সকল থিম" : "All Themes" },
    { id: "grocery", label: isBn ? "গ্রোসারি ও অর্গানিক" : "Grocery & Organic" },
    { id: "electronics", label: isBn ? "ইলেকট্রনিক্স ও গ্যাজেট" : "Electronics & Tech" },
    { id: "fashion", label: isBn ? "ফ্যাশন ও লাইফস্টাইল" : "Fashion & Lifestyle" },
    { id: "beauty", label: isBn ? "বিউটি ও স্কিনকেয়ার" : "Beauty & Personal Care" },
    { id: "restaurant", label: isBn ? "রেস্তোরাঁ ও ফুড" : "Restaurant & Food" },
    { id: "furniture", label: isBn ? "হোম ও ফার্নিচার" : "Home & Furniture" },
    { id: "sports", label: isBn ? "স্পোর্টস ও ফিটনেস" : "Sports & Fitness" },
    { id: "books", label: isBn ? "বই ও শিক্ষা" : "Books & Education" },
    { id: "kids", label: isBn ? "কিডস ও বেবি" : "Kids & Baby" },
    { id: "marketplace", label: isBn ? "মার্কেটপ্লেস" : "Marketplace" },
  ], [isBn]);

  const filteredThemes = useMemo(() => {
    if (selectedCategory === "all") return THEMES;
    return THEMES.filter((t) => t.category === selectedCategory || (selectedCategory === "marketplace" && t.category === "general"));
  }, [selectedCategory]);

  const handleOpenBuilder = () => {
    if (!permission.allowed) {
      toast.error(permission.reason || (isBn ? "আপনার প্ল্যানে থিম বিল্ডার সুবিধা অন্তর্ভুক্ত নেই" : "Theme Builder is not enabled on your plan"));
      return;
    }
    const slug = storeContext?.slug || store?.slug;
    if (slug) {
      router.push(`/store/${slug}/builder`);
    } else {
      toast.error(isBn ? "স্টোরের তথ্য পাওয়া যায়নি" : "Store slug not found");
    }
  };

  const handleViewLiveStore = () => {
    const slug = storeContext?.slug || store?.slug;
    if (slug) {
      window.open(`/store/${slug}`, "_blank");
    }
  };

  const handleApplyTheme = async (themeIdToApply: string) => {
    setSaving(true);
    const targetTheme = getThemeById(themeIdToApply);
    try {
      await changeTheme({
        id: storeId,
        data: {
          theme: {
            themeId: targetTheme.id,
            primaryColor: targetTheme.tokens.colors.primary,
            secondaryColor: targetTheme.tokens.colors.secondary,
            font: targetTheme.tokens.typography.fontFamily,
            darkMode: false,
          },
          sections: targetTheme.defaultSections,
        },
      }).unwrap();

      setActiveThemeId(targetTheme.id);
      setPreviewThemeId(targetTheme.id);

      if (storeContext) {
        await revalidateStorefrontForStore(storeContext, { scope: "all" });
      }
      toast.success(isBn ? `সফলভাবে ${targetTheme.name} থিম চালু করা হয়েছে!` : `Theme updated to ${targetTheme.name}!`);
    } catch {
      toast.error(isBn ? "থিম পরিবর্তন ব্যর্থ হয়েছে" : "Failed to update theme");
    } finally {
      setSaving(false);
    }
  };

  const handleResetTheme = async () => {
    setSaving(true);
    setResetDialogOpen(false);
    const targetTheme = getThemeById(activeThemeId);
    try {
      await changeTheme({
        id: storeId,
        data: {
          theme: {
            themeId: targetTheme.id,
            primaryColor: targetTheme.tokens.colors.primary,
            secondaryColor: targetTheme.tokens.colors.secondary,
            font: targetTheme.tokens.typography.fontFamily,
            darkMode: false,
          },
          sections: targetTheme.defaultSections,
        },
      }).unwrap();

      if (storeContext) {
        await revalidateStorefrontForStore(storeContext, { scope: "all" });
      }
      toast.success(isBn ? "থিম কনফিগারেশন সফলভাবে রিসেট করা হয়েছে।" : "Theme configuration has been reset to defaults.");
    } catch {
      toast.error(isBn ? "থিম রিসেট ব্যর্থ হয়েছে" : "Failed to reset theme");
    } finally {
      setSaving(false);
    }
  };

  const ActiveIcon = CATEGORY_ICONS[activeDef.category] || Store;
  const PreviewIcon = CATEGORY_ICONS[previewDef.category] || Store;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900">
              {isBn ? "স্টোর থিম ও ডিজাইন আর্কিটেকচার" : "Store Themes & Design Architecture"}
            </h2>
            <Badge variant="outline" className="text-xs bg-zinc-50 border-zinc-200">
              {THEMES.length} {isBn ? "টি রেডি থিম" : "Ready Themes"}
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {isBn
              ? "আপনার ব্যবসার জন্য সেরা ইকমার্স থিম নির্বাচন করুন। থিম পরিবর্তন করলেও আপনার পণ্য, ক্যাটাগরি, অর্ডার ও গ্রাহকদের ডেটা সম্পূর্ণ সুরক্ষিত থাকবে।"
              : "Choose an architecture tailored for your business. Switching themes safely preserves all products, categories, orders, and customer data."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleViewLiveStore}
            className="text-zinc-600 hover:text-zinc-900 border-zinc-200 text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            {isBn ? "লাইভ স্টোর দেখুন" : "Visit Storefront"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setResetDialogOpen(true)}
            className="text-zinc-600 hover:text-zinc-900 border-zinc-200 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            {isBn ? "ডিফল্ট রিসেট" : "Reset Defaults"}
          </Button>

          <Button
            type="button"
            onClick={() => setAiBuilderOpen(true)}
            className="bg-linear-to-r from-orange-500 via-pink-500 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
            {isBn ? "AI শপ বিল্ডার" : "AI Shop Builder"}
          </Button>

          <Button
            type="button"
            onClick={handleOpenBuilder}
            className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            {isBn ? "ভিজুয়াল বিল্ডারে কাস্টমাইজ" : "Customize in Builder"}
          </Button>
        </div>
      </div>

      {/* ── AI Shop Builder Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-zinc-900 via-purple-950 to-zinc-900 p-6 text-white shadow-xl border border-purple-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="relative z-10 space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 px-2.5 py-0.5 text-[10px] font-bold text-purple-300">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {isBn ? "নতুন ফিচার: AI চালিত স্টোরফ্রন্ট জেনারেটর" : "NEW: AI-Powered Storefront Generator"}
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {isBn ? "প্রম্পট লিখেই সম্পূর্ণ স্টোরফ্রন্ট তৈরি করুন ৩০ সেকেন্ডে" : "Generate a Complete Storefront in 30 Seconds with AI"}
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {isBn
              ? "আপনার ব্যবসার ধরন এবং পণ্যের বর্ণনা দিন — Agent Router AI স্বয়ংক্রিয়ভাবে উপযুক্ত থিম, সেকশন বিন্যাস ও কপিরাইটিং তৈরি করে দেবে।"
              : "Describe your store in plain text — Agent Router AI automatically selects the theme, composes sections from our 101-library, and writes high-converting copy."}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setAiBuilderOpen(true)}
          className="relative z-10 px-5 py-2.5 bg-linear-to-r from-amber-400 via-orange-500 to-pink-500 hover:opacity-95 text-white text-xs font-bold shadow-lg rounded-xl shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          {isBn ? "AI শপ তৈরি শুরু করুন" : "Launch AI Shop Builder"}
        </Button>
      </div>

      {/* ── Active Theme Banner ── */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="h-13 w-13 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: activeDef.tokens.colors.primary }}
          >
            <ActiveIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isBn ? "বর্তমান সক্রিয় থিম" : "Active Storefront Theme"}
              </span>
              <Badge variant="outline" className="text-[10px] bg-zinc-50 border-zinc-200">
                v{activeDef.version}
              </Badge>
            </div>
            <h3 className="text-base font-bold text-zinc-900">{activeDef.name}</h3>
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{activeDef.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-600">
            <span
              className="h-3 w-3 rounded-full border border-black/10 shadow-xs"
              style={{ backgroundColor: activeDef.tokens.colors.primary }}
            />
            <span
              className="h-3 w-3 rounded-full border border-black/10 shadow-xs"
              style={{ backgroundColor: activeDef.tokens.colors.secondary }}
            />
            <span className="font-mono text-[11px] text-zinc-500 ml-1">
              {activeDef.tokens.typography.fontFamily.split(",")[0].replace(/'/g, "")}
            </span>
          </div>

          <Button
            type="button"
            onClick={handleOpenBuilder}
            className="w-full md:w-auto text-xs bg-zinc-900 hover:bg-black font-semibold text-white"
          >
            {isBn ? "কাস্টমাইজ করুন" : "Customize"}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* ── Category Filters ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categoriesList.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Theme Grid & Live Preview Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Theme Selector Cards */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              {isBn ? "উপলব্ধ থিমসমূহ" : "Available Themes"} ({filteredThemes.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 max-h-[720px] overflow-y-auto pr-1">
            {filteredThemes.map((theme) => {
              const isActive = activeThemeId === theme.id;
              const isPreviewed = previewThemeId === theme.id;
              const ThemeIcon = CATEGORY_ICONS[theme.category] || Store;

              return (
                <div
                  key={theme.id}
                  onClick={() => setPreviewThemeId(theme.id)}
                  className={`group relative rounded-2xl border p-4 transition-all cursor-pointer ${
                    isPreviewed
                      ? "border-zinc-900 bg-white shadow-md ring-2 ring-zinc-900/10"
                      : "border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="relative h-24 w-32 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/80">
                      <SmartImage
                        src={theme.previewImage}
                        alt={theme.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <ThemeIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <h4 className="font-bold text-sm text-zinc-900 truncate">
                            {theme.name}
                          </h4>
                        </div>
                        {isActive && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] shrink-0 font-medium">
                            {isBn ? "সক্রিয়" : "Active"}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                        {theme.description}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        <span
                          className="h-3 w-3 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.tokens.colors.primary }}
                          title="Primary Color"
                        />
                        <span
                          className="h-3 w-3 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.tokens.colors.secondary }}
                          title="Secondary Color"
                        />
                        <span className="text-[11px] font-semibold text-zinc-500 ml-1 uppercase tracking-wider">
                          {theme.category}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          • {theme.defaultSections.length} {isBn ? "সেকশন" : "Sections"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions inside card */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-zinc-400 font-mono">
                      v{theme.version}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewThemeId(theme.id);
                        }}
                        className="h-7 text-xs text-zinc-600 hover:text-zinc-900"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        {isBn ? "প্রিভিউ" : "Preview"}
                      </Button>

                      {!isActive ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={saving}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyTheme(theme.id);
                          }}
                          className="h-7 text-xs bg-zinc-900 hover:bg-black text-white font-medium shadow-xs"
                        >
                          {saving && previewThemeId === theme.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : (
                            <Check className="w-3.5 h-3.5 mr-1" />
                          )}
                          {isBn ? "থিমটি চালু করুন" : "Use This Theme"}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBuilder();
                          }}
                          className="h-7 text-xs text-zinc-700 font-medium"
                        >
                          <Wand2 className="w-3 h-3 mr-1" />
                          {isBn ? "কাস্টমাইজ" : "Customize"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Theme Preview Canvas */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 truncate">
              {isBn ? "থিম লাইভ প্রিভিউ" : "Theme Preview"}:{" "}
              <span className="text-zinc-900">{previewDef.name}</span>
            </h3>

            {/* Viewport Toggles */}
            <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setPreviewViewport("desktop")}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  previewViewport === "desktop"
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
                aria-label="Desktop Preview"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewViewport("mobile")}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  previewViewport === "mobile"
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
                aria-label="Mobile Preview"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Preview Container */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-100/80 p-4 flex items-center justify-center min-h-[560px]">
            <div
              className={`bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden transition-all duration-300 ${
                previewViewport === "mobile"
                  ? "w-[340px] h-[540px]"
                  : "w-full h-[540px]"
              }`}
            >
              {/* Browser Shell Mock */}
              <div className="h-8 bg-zinc-100 border-b border-zinc-200 px-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[200px]">
                  https://{store?.slug || "mystore"}.bornoland.com
                </span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">
                  {previewViewport}
                </span>
              </div>

              {/* Theme Preview Content */}
              <div className="relative h-[calc(100%-32px)] overflow-y-auto bg-zinc-50 p-4 space-y-4">
                {/* Header Mock */}
                <div
                  className="rounded-xl p-3 flex items-center justify-between text-xs text-white shadow-xs"
                  style={{ backgroundColor: previewDef.tokens.colors.primary }}
                >
                  <div className="flex items-center gap-2">
                    <PreviewIcon className="w-4 h-4" />
                    <span className="font-bold">{store?.name || previewDef.name}</span>
                  </div>
                  <span className="text-[11px] opacity-90">
                    {previewDef.header.showAnnouncement ? (isBn ? "ফ্রি ডেলিভারি সারা দেশে" : "Free Delivery") : ""}
                  </span>
                </div>

                {/* Hero Showcase */}
                <div className="relative h-44 w-full rounded-2xl overflow-hidden shadow-sm border border-zinc-200/60">
                  <SmartImage
                    src={previewDef.previewImage}
                    alt={previewDef.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      {previewDef.category.toUpperCase()} THEME
                    </span>
                    <h4 className="text-base font-bold leading-tight">{previewDef.name}</h4>
                    <p className="text-xs text-zinc-200 line-clamp-1 mt-0.5">{previewDef.description}</p>
                  </div>
                </div>

                {/* Color & Typography Specs */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-zinc-200 bg-white p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                      {isBn ? "কালার প্যালেট" : "Color System"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-4 w-4 rounded-md border border-black/10"
                        style={{ backgroundColor: previewDef.tokens.colors.primary }}
                        title="Primary"
                      />
                      <span
                        className="h-4 w-4 rounded-md border border-black/10"
                        style={{ backgroundColor: previewDef.tokens.colors.secondary }}
                        title="Secondary"
                      />
                      <span
                        className="h-4 w-4 rounded-md border border-black/10"
                        style={{ backgroundColor: previewDef.tokens.colors.accent }}
                        title="Accent"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-white p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                      {isBn ? "টাইপোগ্রাফি" : "Typography"}
                    </span>
                    <span className="text-xs font-semibold text-zinc-700 truncate block">
                      {previewDef.tokens.typography.fontFamily.split(",")[0].replace(/'/g, "")}
                    </span>
                  </div>
                </div>

                {/* Default Sections Summary */}
                <div className="rounded-xl border border-zinc-200 bg-white p-3 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    {isBn ? "হোমপেজ সেকশনসমূহ" : "Homepage Sections"} ({previewDef.defaultSections.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {previewDef.defaultSections.map((sec) => (
                      <span
                        key={sec.id}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-[11px] font-medium text-zinc-700"
                      >
                        {sec.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-2 flex items-center justify-between border-t border-zinc-200">
                  <span className="text-xs font-semibold text-zinc-700">
                    {activeThemeId === previewDef.id
                      ? (isBn ? "বর্তমানে সক্রিয় আছে" : "Currently active")
                      : (isBn ? "চালু করতে প্রস্তুত" : "Ready to apply")}
                  </span>
                  {activeThemeId !== previewDef.id ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={saving}
                      onClick={() => handleApplyTheme(previewDef.id)}
                      className="bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-xs"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                      {isBn ? `সক্রিয় করুন: ${previewDef.name}` : `Apply ${previewDef.name}`}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleOpenBuilder}
                      className="text-xs font-semibold"
                    >
                      <Wand2 className="w-3.5 h-3.5 mr-1" />
                      {isBn ? "বিল্ডারে সাজান" : "Open Builder"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reset Theme Dialog ── */}
      {resetDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900">
                  {isBn ? "থিম কনফিগারেশন রিসেট করবেন?" : "Reset Theme Configuration?"}
                </h3>
                <p className="text-xs text-zinc-500">
                  {isBn ? "ডিফল্ট সেটিংস ও লেআউটে ফিরিয়ে নেওয়া হবে" : "Restore theme settings to factory defaults"}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              {isBn ? (
                <>
                  এটি <strong>{activeDef.name}</strong> থিমের ভিজ্যুয়াল স্টাইল এবং হোমপেজ সেকশন লেআউট ডিফল্ট অবস্থায় ফিরিয়ে দেবে।
                  <br /><br />
                  <span className="font-bold text-zinc-800">আপনার পণ্য, ক্যাটাগরি, অর্ডার, কুপন এবং গ্রাহকের ডেটাতে কোনো পরিবর্তন হবে না।</span>
                </>
              ) : (
                <>
                  This will reset the visual styling and homepage section composition for <strong>{activeDef.name}</strong>.
                  <br /><br />
                  <span className="font-bold text-zinc-800">Your products, categories, orders, customers, and inventory will NOT be affected.</span>
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResetDialogOpen(false)}
                className="text-xs"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={saving}
                onClick={handleResetTheme}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                {isBn ? "রিসেট নিশ্চিত করুন" : "Reset Theme"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Shop Builder Modal ── */}
      <AiShopBuilderModal
        isOpen={aiBuilderOpen}
        onClose={() => setAiBuilderOpen(false)}
        storeId={storeId}
        storeSlug={store?.slug || storeContext?.slug || ""}
        storeName={store?.name}
      />
    </div>
  );
}
