"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  RefreshCw,
  Eye,
  CheckCircle2,
  Sliders,
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
  Layers,
  Palette,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { useGenerateAiShopMutation } from "@/redux/api/ai-api";
import { useChangeStoreThemeMutation } from "@/redux/api/store-api";
import { revalidateStorefrontAction } from "@/lib/actions/revalidate-storefront";
import { StorefrontFrame } from "@/components/storefront/storefront-frame";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";
import { getThemeById } from "@/themes/registry";
import type { AiGeneratedShopConfig } from "@/types/ai-shop-builder";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AiShopBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeSlug: string;
  storeName?: string;
}

const STORE_TYPES = [
  { id: "grocery", labelEn: "Grocery & Organic", labelBn: "মুদি ও অর্গানিক বাজার", icon: ShoppingBag, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: "electronics", labelEn: "Electronics & Tech", labelBn: "ইলেকট্রনিক্স ও গ্যাজেট", icon: Cpu, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "fashion", labelEn: "Fashion & Apparel", labelBn: "ফ্যাশন ও পোশাক", icon: Shirt, color: "text-rose-600 bg-rose-50 border-rose-200" },
  { id: "beauty", labelEn: "Beauty & Cosmetics", labelBn: "কসমেটিক্স ও বিউটি", icon: Heart, color: "text-pink-600 bg-pink-50 border-pink-200" },
  { id: "restaurant", labelEn: "Food & Restaurant", labelBn: "খাবার ও রেস্টুরেন্ট", icon: Utensils, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "furniture", labelEn: "Home & Furniture", labelBn: "ফার্নিচার ও হোম ডেকর", icon: Home, color: "text-amber-700 bg-amber-50 border-amber-200" },
  { id: "sports", labelEn: "Sports & Fitness", labelBn: "খেলাধুলা ও ফিটনেস", icon: Activity, color: "text-orange-600 bg-orange-50 border-orange-200" },
  { id: "books", labelEn: "Books & Education", labelBn: "বই ও স্টেশনারি", icon: BookOpen, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  { id: "kids", labelEn: "Kids & Baby", labelBn: "বাচ্চাদের পণ্য ও খেলনা", icon: Baby, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { id: "marketplace", labelEn: "General Marketplace", labelBn: "জেনারেল মার্কেটপ্লেস", icon: Store, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
];

const STYLES = [
  { id: "Modern", labelEn: "Modern Clean", labelBn: "মডার্ন ও ক্লিন", descEn: "Balanced typography and clean card grids", descBn: "পরিচ্ছন্ন লেআউট ও আধুনিক কার্ড গ্রিড" },
  { id: "Luxury", labelEn: "Premium Luxury", labelBn: "প্রিমিয়াম লাক্সারি", descEn: "Serif typography and refined noir aesthetics", descBn: "অভিজাত ফন্ট ও লাক্সারি কালার প্যালেট" },
  { id: "Bold", labelEn: "Bold Promotional", labelBn: "বোল্ড ও প্রমোশনাল", descEn: "High-contrast banners and urgent deal timers", descBn: "আকর্ষণীয় অফার ও ডিসকাউন্ট ব্যানার" },
  { id: "Dark", labelEn: "Tech Dark Mode", labelBn: "ডার্ক মোড টেক", descEn: "Sleek obsidian backgrounds with neon accents", descBn: "কালো ব্যাকগ্রাউন্ড ও নিয়ন কালার একসেন্ট" },
  { id: "Minimal", labelEn: "Minimal Aesthetic", labelBn: "মিনিমাল এলিগ্যান্ট", descEn: "Spacious layout focused on product visuals", descBn: "সিম্পল ও দৃষ্টি নন্দন মিনিমাল ডিজাইন" },
];

const PROMPT_SUGGESTIONS = [
  {
    en: "Create a modern grocery store with 30-min express delivery in Dhaka, fresh organic vegetables, combo deals, and COD trust badges.",
    bn: "একটি আধুনিক অর্গানিক গ্রোসারি শপ তৈরি করুন যাতে ৩০ মিনিটে দ্রুত ডেলিভারি, তাজা শাকসবজি, সাপ্তাহিক কম্বো প্যাক ও ক্যাশ অন ডেলিভারির নিশ্চয়তা থাকে।",
  },
  {
    en: "Build a premium dark-mode gadget and electronics shop with smartwatch flash sales, PC components, and official brand warranty badges.",
    bn: "একটি ডার্ক মোড প্রিমিয়াম গ্যাজেট ও ইলেকট্রনিক্স শপ তৈরি করুন যাতে স্মার্টওয়াচ ফ্ল্যাশ সেল, পিসি পার্টস ও ১ বছরের অফিসিয়াল ওয়ারেন্টির সুবিধা থাকে।",
  },
  {
    en: "Make an exclusive luxury fashion boutique with seasonal lookbook hero, new designer saree & panjabi collections, and size exchange guarantee.",
    bn: "একটি অভিজাত লাক্সারি বুটিক ফ্যাশন স্টোর তৈরি করুন যাতে নতুন সিজনাল শাড়ি ও পাঞ্জাবি কালেকশন, মেগা সেল ব্যানার এবং ফ্রি এক্সচেঞ্জ সুবিধা থাকে।",
  },
];

const STAGES = [
  { en: "Analyzing store requirements & market trends…", bn: "স্টোরের প্রয়োজনীয়তা ও মার্কেট ট্রেন্ড বিশ্লেষণ করা হচ্ছে…" },
  { en: "Selecting optimal theme & color palette…", bn: "সেরা থিম ও কালার প্যালেট নির্বাচন করা হচ্ছে…" },
  { en: "Curating high-converting sections from 101 registry…", bn: "১০১টি সেকশন লাইব্রেরি থেকে কার্যকরী সেকশন সাজানো হচ্ছে…" },
  { en: "Generating persuasive marketing copy & headlines…", bn: "আকর্ষণীয় মার্কেটিং কপি ও হেডলাইন তৈরি করা হচ্ছে…" },
  { en: "Configuring responsive grid & design tokens…", bn: "রেসপনসিভ গ্রিড ও ডিজাইন টোকেন কনফিগার করা হচ্ছে…" },
  { en: "Finalizing storefront architecture & live preview…", bn: "স্টোরফ্রন্ট আর্কিটেকচার ও লাইভ প্রিভিউ প্রস্তুত হচ্ছে…" },
];

export function AiShopBuilderModal({
  isOpen,
  onClose,
  storeId,
  storeSlug,
  storeName,
}: AiShopBuilderModalProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedType, setSelectedType] = useState<string>("grocery");
  const [customType, setCustomType] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("Modern");
  const [generationStage, setGenerationStage] = useState<number>(0);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [generatedConfig, setGeneratedConfig] = useState<AiGeneratedShopConfig | null>(null);
  const [applying, setApplying] = useState(false);

  const [generateAiShop, { isLoading: isGenerating }] = useGenerateAiShopMutation();
  const [changeStoreTheme] = useChangeStoreThemeMutation();

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setGenerationStage(0);
    }
  }, [isOpen]);

  // Handle stage animation during step 4
  useEffect(() => {
    if (step === 4 && isGenerating) {
      const interval = setInterval(() => {
        setGenerationStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [step, isGenerating]);

  if (!isOpen) return null;

  const handleStartGeneration = async () => {
    setStep(4);
    setGenerationStage(0);

    try {
      const activeType = customType.trim() ? customType.trim() : selectedType;
      const res = await generateAiShop({
        storeType: activeType,
        description: prompt.trim() || `${activeType} ecommerce store with best sellers and deals`,
        style: selectedStyle,
        language: isBn ? "bn" : "en",
        storeName: storeName || undefined,
      }).unwrap();

      if (res?.data?.config) {
        setGeneratedConfig(res.data.config);
        setStep(5);
      } else {
        toast.error(isBn ? "কনফিগারেশন তৈরি করা যায়নি" : "Failed to generate configuration");
        setStep(2);
      }
    } catch (err: any) {
      console.error("[AI Shop Builder] Generation error:", err);
      toast.error(isBn ? "AI জেনারেশন ব্যর্থ হয়েছে, আবার চেষ্টা করুন" : "AI generation failed. Please try again.");
      setStep(2);
    }
  };

  const handleApplyToStore = async (andOpenBuilder = false) => {
    if (!generatedConfig) return;
    setApplying(true);

    try {
      const themeDef = getThemeById(generatedConfig.themeId);

      await changeStoreTheme({
        id: storeId,
        data: {
          theme: {
            themeId: themeDef.id,
            primaryColor: generatedConfig.tokens.colors.primary,
            secondaryColor: generatedConfig.tokens.colors.secondary,
            font: generatedConfig.tokens.typography.fontFamily,
            darkMode: selectedStyle === "Dark",
          },
          sections: generatedConfig.sections,
        },
      }).unwrap();

      await revalidateStorefrontAction({
        tenantSlug: storeSlug,
        storeId,
        scope: "all",
      });

      toast.success(
        isBn
          ? `🎉 ${generatedConfig.storeName || "স্টোর"} সফলভাবে আপডেট হয়েছে!`
          : `🎉 ${generatedConfig.storeName || "Store"} successfully generated and applied!`
      );

      onClose();

      if (andOpenBuilder) {
        router.push(`/store/${storeSlug}/builder/home`);
      } else {
        router.push(`/store/${storeSlug}/design`);
      }
    } catch (err) {
      console.error("[AI Builder] Apply error:", err);
      toast.error(isBn ? "থিম প্রয়োগ ব্যর্থ হয়েছে" : "Failed to apply AI design to store");
    } finally {
      setApplying(false);
    }
  };

  const resolvedTheme = generatedConfig ? getThemeById(generatedConfig.themeId) : getThemeById("grocery");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl h-[92vh] max-h-[860px] rounded-3xl bg-white border border-zinc-200 shadow-2xl overflow-hidden">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 via-orange-500 to-pink-500 text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {isBn ? "AI শপ বিল্ডার" : "AI Shop Builder"}
                </h2>
                <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  Agent Router AI
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {isBn
                  ? "আপনার স্টোরের বিবরণ দিন — AI সম্পূর্ণ স্টোরফ্রন্ট তৈরি করবে"
                  : "Describe your store in natural language — AI builds a complete storefront"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {step < 4 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 mr-2">
                <span className="font-semibold text-white">{step}</span> / 3
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Modal Body Content ── */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-zinc-50/50">
          {/* STEP 1: STORE TYPE */}
          {step === 1 && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-1.5 mb-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                  Step 1
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">
                  {isBn ? "আপনি কোন ধরনের স্টোর তৈরি করতে চান?" : "What kind of store are you building?"}
                </h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto">
                  {isBn
                    ? "নিচের যেকোনো ক্যাটাগরি বেছে নিন অথবা নিজের মতো ক্যাটাগরি লিখুন"
                    : "Choose a matching industry to help AI pick the best sections and layout"}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {STORE_TYPES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = selectedType === t.id && !customType;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedType(t.id);
                        setCustomType("");
                      }}
                      className={cn(
                        "group relative flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-200",
                        isSelected
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-md scale-102"
                          : "border-zinc-200/90 bg-white hover:border-zinc-300 hover:shadow-xs text-zinc-800"
                      )}
                    >
                      <div
                        className={cn(
                          "w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110",
                          isSelected ? "bg-white/10 text-white" : t.color
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold leading-tight">
                        {isBn ? t.labelBn : t.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                  {isBn ? "অথবা কাস্টম ব্যবসার নাম / ধরন লিখুন:" : "Or type a custom store category:"}
                </label>
                <input
                  type="text"
                  placeholder={isBn ? "যেমন: চামড়ার ব্যাগ ও জুতা, হস্তশিল্প, পারফিউম..." : "e.g. Handmade Crafts, Leather Goods, Perfume Studio..."}
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 focus:border-zinc-900 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 2: DESCRIBE STORE */}
          {step === 2 && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-1.5 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                  Step 2
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">
                  {isBn ? "আপনার স্টোরের বিস্তারিত বিবরণ দিন" : "Describe your dream online store"}
                </h3>
                <p className="text-sm text-zinc-500 max-w-lg mx-auto">
                  {isBn
                    ? "আপনি কী বিক্রি করতে চান, কী কী অফার বা সুবিধা থাকবে ইত্যাদি লিখুন"
                    : "Tell the AI what products you sell, your target customers, key features and offers"}
                </p>
              </div>

              <div className="space-y-3">
                <textarea
                  rows={5}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    isBn
                      ? "যেমন: একটি প্রিমিয়াম ইলেকট্রনিক্স স্টোর তৈরি করুন যাতে ফ্ল্যাশ সেল, টপ ব্র্যান্ড, ওয়ারেন্টি ট্রাস্ট ব্যাজ এবং সারা বাংলাদেশে ক্যাশ অন ডেলিভারির সুবিধা থাকে..."
                      : "e.g. Create a modern organic grocery store for Bangladesh with 30-min express delivery, top selling pantry bundles, customer reviews and cash on delivery guarantee..."
                  }
                  className="w-full p-4 rounded-2xl border border-zinc-300 bg-white text-sm text-zinc-900 leading-relaxed focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 focus:outline-hidden resize-none shadow-xs"
                />

                <div>
                  <p className="text-xs font-semibold text-zinc-500 mb-2">
                    {isBn ? "💡 দ্রুত শুরু করতে যেকোনো প্রম্পটে ক্লিক করুন:" : "💡 Click a sample prompt to use it:"}
                  </p>
                  <div className="space-y-2">
                    {PROMPT_SUGGESTIONS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(isBn ? item.bn : item.en)}
                        className="w-full text-left p-3 rounded-xl border border-zinc-200/80 bg-white hover:border-zinc-300 hover:bg-zinc-50 text-xs text-zinc-700 transition-colors"
                      >
                        {isBn ? item.bn : item.en}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CHOOSE STYLE */}
          {step === 3 && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-1.5 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                  Step 3
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">
                  {isBn ? "ভিজ্যুয়াল ডিজাইন ও স্টাইল নির্বাচন করুন" : "Choose your visual aesthetic & style"}
                </h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto">
                  {isBn
                    ? "আপনার ব্র্যান্ড অনুযায়ী পছন্দসই কালার এবং লেআউট স্টাইল নির্ধারণ করুন"
                    : "Select the design tone that best matches your brand identity"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {STYLES.map((s) => {
                  const isSelected = selectedStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedStyle(s.id)}
                      className={cn(
                        "flex items-start p-4 rounded-2xl border text-left transition-all",
                        isSelected
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-md"
                          : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-800"
                      )}
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-sm font-bold">{isBn ? s.labelBn : s.labelEn}</p>
                        <p className={cn("text-xs mt-1", isSelected ? "text-zinc-300" : "text-zinc-500")}>
                          {isBn ? s.descBn : s.descEn}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                          isSelected ? "border-emerald-400 bg-emerald-400 text-zinc-900" : "border-zinc-300"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: GENERATION IN PROGRESS */}
          {step === 4 && (
            <div className="max-w-md mx-auto text-center py-12 space-y-8">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-linear-to-tr from-amber-400 via-orange-500 to-pink-500 animate-spin blur-md opacity-40" />
                <div className="relative w-full h-full rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-xl">
                  <Sparkles className="w-10 h-10 text-orange-500 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900">
                  {isBn ? "AI আপনার স্টোরফ্রন্ট তৈরি করছে…" : "AI is crafting your storefront…"}
                </h3>
                <p className="text-xs text-zinc-500">
                  {isBn ? "দয়া করে কিছুক্ষণ অপেক্ষা করুন, মাত্র ৩০ সেকেন্ড সময় লাগবে" : "Synthesizing themes, section combinations & copywriting"}
                </p>
              </div>

              <div className="space-y-2.5 text-left bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
                {STAGES.map((stg, i) => {
                  const isDone = i < generationStage;
                  const isCurrent = i === generationStage;
                  return (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 animate-spin text-orange-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-zinc-300 shrink-0" />
                      )}
                      <span
                        className={cn(
                          "transition-colors",
                          isDone ? "text-zinc-800 font-medium" : isCurrent ? "text-zinc-900 font-bold" : "text-zinc-400"
                        )}
                      >
                        {isBn ? stg.bn : stg.en}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: LIVE PREVIEW & ACTIONS */}
          {step === 5 && generatedConfig && (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-zinc-900 truncate max-w-[200px]">
                    {generatedConfig.storeName}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 font-medium text-zinc-600">
                    Theme: {resolvedTheme.name}
                  </span>
                </div>

                {/* Device preview toggles */}
                <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDevicePreview("desktop")}
                    className={cn(
                      "p-1.5 rounded-lg text-xs font-medium transition-colors",
                      devicePreview === "desktop" ? "bg-white shadow-xs text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
                    )}
                    title="Desktop Preview"
                  >
                    <Laptop className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevicePreview("tablet")}
                    className={cn(
                      "p-1.5 rounded-lg text-xs font-medium transition-colors",
                      devicePreview === "tablet" ? "bg-white shadow-xs text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
                    )}
                    title="Tablet Preview"
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevicePreview("mobile")}
                    className={cn(
                      "p-1.5 rounded-lg text-xs font-medium transition-colors",
                      devicePreview === "mobile" ? "bg-white shadow-xs text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
                    )}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Live Storefront Frame Preview */}
              <div className="flex-1 min-h-[380px] bg-zinc-100/90 rounded-2xl border border-zinc-200/80 p-3 overflow-y-auto flex items-start justify-center">
                <div
                  className="bg-white rounded-2xl border border-zinc-200 shadow-lg overflow-hidden transition-all duration-300"
                  style={{
                    width: devicePreview === "mobile" ? 375 : devicePreview === "tablet" ? 768 : "100%",
                    maxWidth: "100%",
                  }}
                >
                  <StorefrontFrame
                    store={{ _id: storeId, name: generatedConfig.storeName, slug: storeSlug } as any}
                    theme={{
                      themeId: resolvedTheme.id,
                      primaryColor: generatedConfig.tokens.colors.primary,
                      secondaryColor: generatedConfig.tokens.colors.secondary,
                      accentColor: generatedConfig.tokens.colors.accent,
                      backgroundColor: generatedConfig.tokens.colors.background,
                      textColor: generatedConfig.tokens.colors.text,
                      font: generatedConfig.tokens.typography.fontFamily,
                      buttonStyle: "rounded-lg",
                      layoutWidth: "1280px",
                      darkMode: selectedStyle === "Dark",
                      navbarStyle: "sticky",
                    } as any}
                    pageSections={generatedConfig.sections}
                    builderMode={false}
                  >
                    <StorefrontCanvas sections={generatedConfig.sections} />
                  </StorefrontFrame>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer Controls ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-white">
          {step > 1 && step < 4 && (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {isBn ? "পূর্ববর্তী" : "Back"}
            </button>
          )}

          {step === 5 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {isBn ? "নতুন প্রম্পটে চেষ্টা করুন" : "Start Over"}
            </button>
          )}

          <div className="flex items-center gap-2.5 ml-auto">
            {step < 3 && (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev + 1) as any)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-black transition-colors shadow-xs"
              >
                {isBn ? "পরবর্তী ধাপ" : "Continue"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleStartGeneration}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-orange-500 to-pink-600 text-white text-xs font-bold hover:opacity-95 transition-opacity shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                {isBn ? "AI শপ তৈরি করুন" : "Generate My Store"}
              </button>
            )}

            {step === 5 && (
              <>
                <button
                  type="button"
                  disabled={applying}
                  onClick={() => handleApplyToStore(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white text-xs font-bold text-zinc-800 hover:bg-zinc-50 transition-colors shadow-2xs"
                >
                  <Sliders className="w-3.5 h-3.5 text-zinc-600" />
                  {isBn ? "বিল্ডারে এডিট করুন" : "Edit in Builder"}
                </button>

                <button
                  type="button"
                  disabled={applying}
                  onClick={() => handleApplyToStore(false)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:opacity-95 transition-opacity shadow-md"
                >
                  {applying ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Check className="w-4 h-4 text-white stroke-3" />
                  )}
                  {isBn ? "স্টোরে চালু করুন" : "Apply to Live Store"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
