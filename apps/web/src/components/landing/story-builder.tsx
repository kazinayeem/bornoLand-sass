"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { landingContainer } from "./landing-ui";
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Send,
  Sliders,
  ShoppingBag,
  Star,
  Check,
  Sun,
  Moon,
  GripVertical,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Tag,
  Zap,
  MousePointer,
} from "lucide-react";

export type SectionId =
  | "hero"
  | "categories"
  | "products"
  | "deals"
  | "testimonials"
  | "footer";

export interface SectionItem {
  id: SectionId;
  name: string;
}

const INITIAL_SECTIONS: SectionItem[] = [
  { id: "hero", name: "হিরো ব্যানার স্লাইডার" },
  { id: "categories", name: "ক্যাটাগরি গ্যালারি" },
  { id: "products", name: "জনপ্রিয় পণ্য (গ্রিড)" },
  { id: "deals", name: "বিশেষ ডিসকাউন্ট অফার" },
  { id: "testimonials", name: "গ্রাহকদের রিভিউ" },
  { id: "footer", name: "ফুটার ও সোশ্যাল লিংক" },
];

const COLOR_SWATCHES = [
  { hex: "#2563EB", name: "Electric Blue" },
  { hex: "#7C3AED", name: "Royal Purple" },
  { hex: "#059669", name: "Emerald Green" },
  { hex: "#E11D48", name: "Rose Crimson" },
  { hex: "#D97706", name: "Amber Sunset" },
];

export function StoryBuilder() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Timeline Step (0 through 7)
  const [step, setStep] = useState<number>(0);

  // Builder States
  const [sections, setSections] = useState<SectionItem[]>(INITIAL_SECTIONS);
  const [selectedSectionId, setSelectedSectionId] = useState<SectionId>("products");
  const [accentColor, setAccentColor] = useState<string>("#2563EB");
  const [brandColorName, setBrandColorName] = useState<string>("Electric Blue");
  const [gridCols, setGridCols] = useState<2 | 4>(4);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isLivePreview, setIsLivePreview] = useState<boolean>(false);
  const [publishStatus, setPublishStatus] = useState<"draft" | "publishing" | "published">("draft");

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Continuous Auto-Play Timeline Sequence (~2.8s per step)
  useEffect(() => {
    if (!mounted || shouldReduceMotion || isHovered) return;

    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 8);
    }, 2800);

    return () => clearInterval(interval);
  }, [mounted, isHovered, shouldReduceMotion]);

  // Synchronize builder state dynamically with current timeline step (when not hovered)
  useEffect(() => {
    if (!mounted || isHovered) return;

    switch (step) {
      case 0: // Overview & Popular Products Selected
        setDevice("desktop");
        setSelectedSectionId("products");
        setAccentColor("#2563EB");
        setBrandColorName("Electric Blue");
        setGridCols(4);
        setIsLivePreview(false);
        setPublishStatus("draft");
        break;

      case 1: // Drag & Drop Flash Deal
        setDevice("desktop");
        setSelectedSectionId("deals");
        setIsLivePreview(false);
        break;

      case 2: // Property & Accent Color Change (Blue -> Purple -> Emerald)
        setSelectedSectionId("products");
        setAccentColor("#7C3AED");
        setBrandColorName("Royal Purple");
        setIsLivePreview(false);
        break;

      case 3: // Grid Layout Reflow (4 Cols -> 2 Cols)
        setSelectedSectionId("products");
        setAccentColor("#059669");
        setBrandColorName("Emerald Green");
        setGridCols(2);
        setIsLivePreview(false);
        break;

      case 4: // Device Responsiveness (Desktop -> Mobile)
        setDevice("mobile");
        setGridCols(4);
        setIsLivePreview(false);
        break;

      case 5: // Live Preview Synchronization
        setIsLivePreview(true);
        break;

      case 6: // Publish Live Flow
        setIsLivePreview(false);
        setPublishStatus("publishing");
        const pubTimer = setTimeout(() => {
          setPublishStatus("published");
        }, 1000);
        return () => clearTimeout(pubTimer);

      case 7: // Reset & Seamless Loop Restart
        setPublishStatus("published");
        break;
    }
  }, [step, mounted, isHovered]);

  const handleReset = () => {
    setStep(0);
    setSections(INITIAL_SECTIONS);
    setSelectedSectionId("products");
    setAccentColor("#2563EB");
    setBrandColorName("Electric Blue");
    setGridCols(4);
    setDevice("desktop");
    setPublishStatus("draft");
    setIsLivePreview(false);
  };

  const activeSection = sections.find((s) => s.id === selectedSectionId);

  // Styling tokens for dark vs light mode
  const isDark = theme === "dark";
  const bgStudio = isDark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900";
  const bgToolbar = isDark ? "bg-zinc-950/95 border-zinc-800 text-zinc-300" : "bg-slate-50 border-zinc-200 text-zinc-700";
  const bgPanel = isDark ? "bg-zinc-950/60 border-zinc-800 text-zinc-200" : "bg-white border-zinc-200 text-zinc-800";
  const bgCanvasArea = isDark ? "bg-zinc-900/90" : "bg-slate-100/90";
  const bgCanvas = isDark ? "bg-zinc-800/95 border-zinc-700/80 text-white" : "bg-white border-zinc-200/90 text-zinc-900 shadow-xl";
  const textMuted = isDark ? "text-zinc-400" : "text-zinc-500";
  const textSubtle = isDark ? "text-zinc-500" : "text-zinc-400";
  const cardBg = isDark ? "bg-zinc-800/90 border-zinc-700/70" : "bg-slate-50 border-zinc-200";

  return (
    <section id="store-builder" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80 overflow-hidden scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            স্টোর বিল্ডার
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            নিজের মতো করে সাজান আপনার অনলাইন দোকান।
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            কোডিং ছাড়াই আপনার ব্র্যান্ডের জন্য সুন্দর, দ্রুত ও পেশাদার অনলাইন স্টোর তৈরি করুন।
          </p>
        </div>

        {/* Large Automated Interactive Studio Frame */}
        <div
          ref={containerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`max-w-6xl mx-auto rounded-3xl border shadow-2xl overflow-hidden transition-colors duration-300 relative ${bgStudio}`}
        >
          {/* Timeline Step Overlay Indicator & Hover Status */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-[10px] text-white backdrop-blur-md shadow-lg">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-zinc-300 font-mono">
              {isHovered ? (
                <span className="text-amber-400">⏸ PAUSED (HOVERING)</span>
              ) : (
                `DEMO TIMELINE · STEP 0${step + 1}/08`
              )}
            </span>
          </div>

          {/* Animated Drag Ghost (Triggers during Step 1) */}
          {mounted && !shouldReduceMotion && step === 1 && !isHovered && (
            <motion.div
              initial={{ x: "18%", y: "45%", opacity: 0, scale: 0.9 }}
              animate={{
                x: ["18%", "45%", "48%"],
                y: ["45%", "35%", "40%"],
                opacity: [0, 1, 0.95],
                scale: [0.95, 1.04, 1],
              }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
              className="pointer-events-none absolute z-40 p-3 rounded-xl border border-blue-500/80 bg-blue-600/90 text-white text-[11px] font-bold shadow-2xl backdrop-blur-sm flex items-center gap-2"
            >
              <MousePointer className="h-4 w-4 animate-bounce" />
              <span>⚡ Flash Deal of Day (Dragging...)</span>
            </motion.div>
          )}

          {/* Top Toolbar */}
          <div className={`flex flex-wrap items-center justify-between border-b px-4 py-3 text-xs gap-3 ${bgToolbar}`}>
            {/* Window Dots & Header */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <span className="font-semibold text-[11px] flex items-center gap-1.5">
                <span>Visual Storefront Studio</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200 text-zinc-600"}`}>
                  AUTO-DEMO
                </span>
              </span>
            </div>

            {/* Viewport Toggles (Desktop / Tablet / Mobile) */}
            <div className="flex items-center gap-1 rounded-xl bg-zinc-800/10 p-1 border border-zinc-500/20">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                  device === "desktop"
                    ? "bg-blue-600 text-white shadow-xs"
                    : `${textMuted} hover:text-blue-500`
                }`}
              >
                <Monitor className="h-3 w-3" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice("tablet")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                  device === "tablet"
                    ? "bg-blue-600 text-white shadow-xs"
                    : `${textMuted} hover:text-blue-500`
                }`}
              >
                <Tablet className="h-3 w-3" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                  device === "mobile"
                    ? "bg-blue-600 text-white shadow-xs"
                    : `${textMuted} hover:text-blue-500`
                }`}
              >
                <Smartphone className="h-3 w-3" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Actions: Theme Toggle, Live Preview, Reset & Publish */}
            <div className="flex items-center gap-2">
              {/* Theme Selector */}
              <button
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                title="Toggle Studio Theme (Light/Dark Mode)"
                className={`p-1.5 rounded-lg border transition-colors ${
                  isDark ? "border-zinc-700 bg-zinc-800 text-amber-400 hover:bg-zinc-700" : "border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>

              {/* Live Preview Button */}
              <button
                type="button"
                onClick={() => setIsLivePreview(!isLivePreview)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all ${
                  isLivePreview
                    ? "bg-amber-500 text-white border-amber-600"
                    : isDark
                    ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:text-white"
                    : "bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200"
                }`}
              >
                {isLivePreview ? (
                  <>
                    <ArrowLeft className="h-3 w-3" /> Exit Preview
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 text-blue-500" /> Live Preview
                  </>
                )}
              </button>

              {/* Reset Demo Button */}
              <button
                type="button"
                onClick={handleReset}
                title="Reset Builder Demo"
                className={`p-1.5 rounded-lg border transition-colors ${
                  isDark ? "border-zinc-800 text-zinc-500 hover:text-zinc-300" : "border-zinc-200 text-zinc-400 hover:text-zinc-700"
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              {/* Status Pill */}
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 hidden md:inline-block ${
                  publishStatus === "published"
                    ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 animate-pulse"
                    : publishStatus === "publishing"
                    ? "bg-amber-500/20 text-amber-500 border border-amber-500/40"
                    : isDark
                    ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    : "bg-zinc-100 text-zinc-600 border border-zinc-300"
                }`}
              >
                {publishStatus === "published"
                  ? "✓ LIVE STOREFRONT"
                  : publishStatus === "publishing"
                  ? "PUBLISHING..."
                  : "DRAFT MODE"}
              </span>

              {/* Publish Button */}
              <button
                type="button"
                onClick={() => setPublishStatus("publishing")}
                style={{
                  backgroundColor: publishStatus === "published" ? "#10B981" : accentColor,
                  boxShadow: `0 4px 14px ${accentColor}40`,
                }}
                className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold text-white shadow-xs flex items-center gap-1.5 transition-all duration-300 hover:brightness-110 active:scale-95"
              >
                {publishStatus === "publishing" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : publishStatus === "published" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                {publishStatus === "published" ? "Published!" : publishStatus === "publishing" ? "Publishing..." : "Publish Live"}
              </button>
            </div>
          </div>

          {/* Studio Workspace Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[490px]">
            {/* Left Panel: Page Sections Tree */}
            {!isLivePreview && (
              <div className={`hidden md:block md:col-span-3 border-r p-4 space-y-4 text-xs ${bgPanel}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${textSubtle}`}>
                    PAGE SECTIONS
                  </span>
                  <span className="text-[9px] text-blue-500 font-mono font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">
                    DRAG & DROP
                  </span>
                </div>

                <div className="space-y-2">
                  {sections.map((s) => {
                    const isSelected = selectedSectionId === s.id;
                    return (
                      <motion.div
                        key={s.id}
                        onClick={() => setSelectedSectionId(s.id)}
                        animate={{
                          scale: isSelected ? 1.02 : 1,
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-[11px] cursor-pointer transition-all ${
                          isSelected
                            ? isDark
                              ? "bg-zinc-800/90 shadow-md border-blue-500"
                              : "bg-blue-50/80 shadow-xs border-blue-500"
                            : isDark
                            ? "bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800/80"
                            : "bg-slate-50 hover:bg-slate-100 border-zinc-200"
                        }`}
                        style={{
                          borderColor: isSelected ? accentColor : undefined,
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <GripVertical className={`h-3.5 w-3.5 ${isSelected ? "text-blue-500" : textSubtle}`} />
                          <span className={isSelected ? "font-bold text-current" : textMuted}>
                            {s.name}
                          </span>
                        </span>

                        {isSelected && (
                          <span
                            className="h-2 w-2 rounded-full shadow-xs animate-ping"
                            style={{ backgroundColor: accentColor }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Active Section Info */}
                <div className={`pt-3 border-t text-[10px] space-y-1 ${isDark ? "border-zinc-800/80" : "border-zinc-200"}`}>
                  <p className={`font-bold uppercase text-[9px] ${textSubtle}`}>ACTIVE SECTION</p>
                  <p className="font-semibold text-blue-500 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {activeSection ? activeSection.name : "None"}
                  </p>
                </div>
              </div>
            )}

            {/* Center Canvas: Live Storefront Preview */}
            <div
              className={`${
                isLivePreview ? "md:col-span-12" : "md:col-span-6"
              } p-4 sm:p-6 flex flex-col justify-center items-center overflow-hidden transition-all duration-300 ${bgCanvasArea}`}
            >
              <motion.div
                layout
                animate={{
                  maxWidth:
                    device === "mobile"
                      ? 320
                      : device === "tablet"
                      ? 440
                      : isLivePreview
                      ? 720
                      : 560,
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full rounded-2xl border p-4 sm:p-5 space-y-3.5 transition-colors duration-300 relative ${bgCanvas}`}
              >
                {/* Real-time Sync Badge for Step 5 */}
                {step === 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1.5 shadow-lg z-20"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Real-Time Canvas Synchronized
                  </motion.div>
                )}

                {/* Drop Indicator for Step 1 */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-2 border-2 border-dashed border-blue-500 rounded-xl bg-blue-500/10 text-center text-[10px] font-extrabold text-blue-500 uppercase tracking-wider"
                  >
                    ──────────── DROP SECTION HERE ────────────
                  </motion.div>
                )}

                {/* Storefront Mini Header */}
                <div className={`flex items-center justify-between border-b pb-2.5 text-[11px] ${isDark ? "border-zinc-700/60 text-zinc-300" : "border-zinc-200 text-zinc-700"}`}>
                  <div className="flex items-center gap-2 font-bold">
                    <div
                      className="h-5 w-5 rounded-md flex items-center justify-center text-[10px] text-white font-black shadow-xs transition-colors duration-300"
                      style={{ backgroundColor: accentColor }}
                    >
                      B
                    </div>
                    <span className="tracking-tight font-extrabold text-xs">TechGear Store</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                    <span className="hover:text-blue-500 cursor-pointer">Shop</span>
                    <span className="hover:text-blue-500 cursor-pointer">Deals</span>
                    <div className="relative">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span
                        className="absolute -top-1 -right-1 h-3 w-3 rounded-full text-[8px] font-bold text-white flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: accentColor }}
                      >
                        2
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rendered Dynamic Sections */}
                <div className="space-y-3">
                  {sections.map((section) => {
                    const isSelected = !isLivePreview && selectedSectionId === section.id;

                    // 1. Hero Banner Component
                    if (section.id === "hero") {
                      return (
                        <motion.div
                          key="hero"
                          layout
                          onClick={() => !isLivePreview && setSelectedSectionId("hero")}
                          animate={{
                            borderColor: isSelected ? accentColor : "transparent",
                          }}
                          className={`rounded-xl border p-4 relative overflow-hidden cursor-pointer transition-all duration-300 ${
                            isDark
                              ? "bg-gradient-to-r from-zinc-800 to-zinc-900 border-zinc-700/60"
                              : "bg-gradient-to-r from-slate-900 to-zinc-800 text-white"
                          } ${isSelected ? "ring-2 ring-blue-500/40 shadow-lg" : ""}`}
                        >
                          {isSelected && (
                            <span
                              className="absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-extrabold text-white uppercase tracking-wider shadow-xs transition-colors duration-300"
                              style={{ backgroundColor: accentColor }}
                            >
                              SELECTED
                            </span>
                          )}
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                            <Tag className="h-3 w-3" /> EID SPECIAL SALE 2026
                          </p>
                          <h4 className="text-sm sm:text-base font-extrabold text-white mt-1">
                            Up to 50% Off Premium Gadgets
                          </h4>
                          <div className="mt-3 flex items-center gap-2">
                            <span
                              className="px-3 py-1 rounded-lg text-[10px] font-bold text-white shadow-xs inline-block transition-colors duration-300"
                              style={{ backgroundColor: accentColor }}
                            >
                              Shop Now →
                            </span>
                            <span className="text-[10px] text-zinc-300">Free delivery nationwide</span>
                          </div>
                        </motion.div>
                      );
                    }

                    // 2. Category Carousels
                    if (section.id === "categories") {
                      return (
                        <motion.div
                          key="categories"
                          layout
                          onClick={() => !isLivePreview && setSelectedSectionId("categories")}
                          animate={{
                            borderColor: isSelected ? accentColor : "transparent",
                          }}
                          className={`rounded-xl border p-3 space-y-2 cursor-pointer transition-all duration-300 ${cardBg} ${
                            isSelected ? "ring-2 ring-blue-500/40 shadow-lg" : ""
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px]">
                            <span className={`font-bold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                              Top Categories
                            </span>
                            <span className="text-blue-500 hover:underline">Explore All</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 text-center text-[9px] font-bold">
                            {["Smartphones", "Audio", "Laptops", "Watches"].map((cat, i) => (
                              <div
                                key={cat}
                                className={`p-2 rounded-lg border transition-colors ${
                                  isDark ? "bg-zinc-800/80 border-zinc-700/60 text-zinc-300" : "bg-white border-zinc-200 text-zinc-700"
                                }`}
                              >
                                {i === 0 ? "📱" : i === 1 ? "🎧" : i === 2 ? "💻" : "⌚"}
                                <p className="mt-0.5 truncate">{cat}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    }

                    // 3. Popular Products Grid
                    if (section.id === "products") {
                      const effectiveCols = device === "mobile" ? 1 : gridCols === 2 ? 2 : 4;
                      return (
                        <motion.div
                          key="products"
                          layout
                          onClick={() => !isLivePreview && setSelectedSectionId("products")}
                          animate={{
                            borderColor: isSelected ? accentColor : "transparent",
                          }}
                          className={`rounded-xl border p-3.5 space-y-2.5 relative cursor-pointer transition-all duration-300 ${cardBg} ${
                            isSelected ? "ring-2 ring-blue-500/40 shadow-lg" : ""
                          }`}
                        >
                          {isSelected && (
                            <span
                              className="absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-extrabold text-white uppercase tracking-wider shadow-xs transition-colors duration-300"
                              style={{ backgroundColor: accentColor }}
                            >
                              SELECTED ({gridCols} COLS)
                            </span>
                          )}

                          <div className="flex justify-between items-center text-xs">
                            <span className={`font-bold text-[11px] ${isDark ? "text-zinc-200" : "text-zinc-900"}`}>
                              Popular Products
                            </span>
                            <span className="text-[10px] font-semibold text-blue-500">View All →</span>
                          </div>

                          {/* Dynamic Grid Layout */}
                          <motion.div
                            layout
                            className={`grid gap-2 transition-all duration-300 ${
                              effectiveCols === 1
                                ? "grid-cols-1"
                                : effectiveCols === 2
                                ? "grid-cols-2"
                                : "grid-cols-2 sm:grid-cols-4"
                            }`}
                          >
                            {[
                              { title: "Nike Air Max 270", price: "৳ 13,387", emoji: "👟" },
                              { title: "AirPods Pro 2", price: "৳ 24,990", emoji: "🎧" },
                              { title: "Apple Watch S9", price: "৳ 42,500", emoji: "⌚" },
                              { title: "Anker PowerBank", price: "৳ 4,200", emoji: "🔋" },
                            ]
                              .slice(0, effectiveCols === 4 ? 4 : 2)
                              .map((p, idx) => (
                                <motion.div
                                  key={idx}
                                  layout
                                  className={`p-2.5 rounded-lg border space-y-1.5 text-xs ${
                                    isDark ? "bg-zinc-900/90 border-zinc-700/80" : "bg-white border-zinc-200"
                                  }`}
                                >
                                  <div className={`h-12 rounded-md flex items-center justify-center text-[10px] font-medium ${isDark ? "bg-zinc-800 text-zinc-300" : "bg-slate-100 text-zinc-700"}`}>
                                    {p.emoji} <span className="ml-1 truncate font-semibold">{p.title}</span>
                                  </div>
                                  <div className="flex items-center justify-between pt-0.5">
                                    <span className={`font-extrabold text-[10px] ${isDark ? "text-white" : "text-zinc-900"}`}>
                                      {p.price}
                                    </span>
                                    <span
                                      className="px-2 py-0.5 rounded text-[9px] font-bold text-white shadow-xs transition-colors duration-300"
                                      style={{ backgroundColor: accentColor }}
                                    >
                                      Add +
                                    </span>
                                  </div>
                                </motion.div>
                              ))}
                          </motion.div>
                        </motion.div>
                      );
                    }

                    // 4. Flash Deals
                    if (section.id === "deals") {
                      return (
                        <motion.div
                          key="deals"
                          layout
                          onClick={() => !isLivePreview && setSelectedSectionId("deals")}
                          animate={{
                            borderColor: isSelected ? accentColor : "transparent",
                          }}
                          className={`rounded-xl border p-3 cursor-pointer transition-all duration-300 ${
                            isDark ? "bg-amber-950/30 border-amber-700/40 text-amber-200" : "bg-amber-50 border-amber-200 text-amber-900"
                          } ${isSelected ? "ring-2 ring-amber-500/50 shadow-lg" : ""}`}
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-extrabold flex items-center gap-1 text-amber-500">
                              <Zap className="h-3 w-3 fill-amber-500" /> FLASH DEAL OF THE DAY
                            </span>
                            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600">
                              Ends 04h 12m
                            </span>
                          </div>
                          <p className="text-[11px] font-bold mt-1">Baseus GaN 65W Fast Charger - 30% OFF</p>
                        </motion.div>
                      );
                    }

                    // 5. Testimonials
                    if (section.id === "testimonials") {
                      return (
                        <motion.div
                          key="testimonials"
                          layout
                          onClick={() => !isLivePreview && setSelectedSectionId("testimonials")}
                          animate={{
                            borderColor: isSelected ? accentColor : "transparent",
                          }}
                          className={`rounded-xl border p-3 space-y-1.5 cursor-pointer transition-all duration-300 ${cardBg} ${
                            isSelected ? "ring-2 ring-blue-500/40 shadow-lg" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold flex items-center gap-0.5 text-amber-400">
                              <Star className="h-3 w-3 fill-amber-400" />
                              <Star className="h-3 w-3 fill-amber-400" />
                              <Star className="h-3 w-3 fill-amber-400" />
                              <Star className="h-3 w-3 fill-amber-400" />
                              <Star className="h-3 w-3 fill-amber-400" />
                            </span>
                            <span className={`text-[9px] ${textSubtle}`}>Verified Customer</span>
                          </div>
                          <p className={`text-[10px] italic ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                            &quot;Delivered in 24 hours to Chittagong! Authentic product.&quot;
                          </p>
                        </motion.div>
                      );
                    }

                    // 6. Footer
                    if (section.id === "footer") {
                      return (
                        <motion.div
                          key="footer"
                          layout
                          onClick={() => !isLivePreview && setSelectedSectionId("footer")}
                          animate={{
                            borderColor: isSelected ? accentColor : "transparent",
                          }}
                          className={`rounded-xl border p-3 text-[10px] text-center space-y-1 cursor-pointer transition-all duration-300 ${
                            isDark ? "bg-zinc-900 border-zinc-800 text-zinc-500" : "bg-slate-100 border-zinc-200 text-zinc-500"
                          } ${isSelected ? "ring-2 ring-blue-500/40 shadow-lg" : ""}`}
                        >
                          <p className="font-bold">© 2026 TechGear Store · Powered by Bornosland</p>
                          <p className="text-[9px]">bKash · Nagad · Cash on Delivery Accepted</p>
                        </motion.div>
                      );
                    }

                    return null;
                  })}
                </div>
              </motion.div>
            </div>

            {/* Right Panel: Properties Inspector */}
            {!isLivePreview && (
              <div className={`hidden md:block md:col-span-3 border-l p-4 space-y-5 text-xs ${bgPanel}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${textSubtle}`}>
                    PROPERTIES INSPECTOR
                  </span>
                  <Sliders className="h-3.5 w-3.5 text-blue-500" />
                </div>

                {/* Active Section Info */}
                <div className={`p-2.5 rounded-xl border space-y-1 ${isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-slate-50 border-zinc-200"}`}>
                  <p className={`text-[9px] font-bold uppercase ${textSubtle}`}>SELECTED COMPONENT</p>
                  <p className="font-extrabold text-blue-500 text-[11px]">
                    {activeSection ? activeSection.name : "Select a section"}
                  </p>
                </div>

                {/* Property 1: Accent Color Selector */}
                <div className="space-y-2">
                  <label className={`block text-[11px] font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                    Brand Accent Color
                  </label>
                  <div className={`flex items-center gap-2.5 p-2 rounded-xl border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-slate-50 border-zinc-200"}`}>
                    <div
                      className="h-5 w-5 rounded-full border border-white/20 shadow-xs transition-colors duration-300"
                      style={{ backgroundColor: accentColor }}
                    />
                    <div className="text-[11px]">
                      <p className="font-bold text-current">{brandColorName}</p>
                      <p className={`font-mono text-[10px] ${textSubtle}`}>{accentColor}</p>
                    </div>
                  </div>

                  {/* Multi-Color Swatches */}
                  <div className="flex gap-2 pt-1">
                    {COLOR_SWATCHES.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          setAccentColor(c.hex);
                          setBrandColorName(c.name);
                        }}
                        style={{ backgroundColor: c.hex }}
                        className={`h-6 w-6 rounded-full border-2 transition-all ${
                          accentColor === c.hex
                            ? "border-white scale-110 shadow-md ring-2 ring-blue-500/50"
                            : "border-transparent opacity-75 hover:opacity-100"
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Property 2: Grid Layout */}
                <div className="space-y-2">
                  <label className={`block text-[11px] font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                    Grid Layout Style
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setGridCols(4)}
                      className={`p-2 rounded-lg border text-center font-bold transition-all ${
                        gridCols === 4
                          ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                          : isDark
                          ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                          : "bg-slate-50 border-zinc-200 text-zinc-600 hover:bg-slate-100"
                      }`}
                    >
                      4 Columns
                    </button>
                    <button
                      type="button"
                      onClick={() => setGridCols(2)}
                      className={`p-2 rounded-lg border text-center font-bold transition-all ${
                        gridCols === 2
                          ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                          : isDark
                          ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                          : "bg-slate-50 border-zinc-200 text-zinc-600 hover:bg-slate-100"
                      }`}
                    >
                      2 Columns
                    </button>
                  </div>
                </div>

                {/* Property 3: Typography */}
                <div className="space-y-2">
                  <label className={`block text-[11px] font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                    Typography Hierarchy
                  </label>
                  <div className={`p-2.5 rounded-xl border space-y-1 text-[11px] ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-slate-50 border-zinc-200"}`}>
                    <p className="font-bold text-current">Inter Display / Tight</p>
                    <p className={`text-[10px] ${textSubtle}`}>Auto-scaled headings & responsive body</p>
                  </div>
                </div>

                {/* Live Sync Status */}
                <div className={`pt-3 border-t ${isDark ? "border-zinc-800/80" : "border-zinc-200"}`}>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-semibold">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Real-Time Canvas Synchronized</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
