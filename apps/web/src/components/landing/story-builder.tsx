"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
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
  { id: "hero", name: "Hero Banner Slider" },
  { id: "categories", name: "Category Carousels" },
  { id: "products", name: "Popular Products (Grid)" },
  { id: "deals", name: "Flash Deal of Day" },
  { id: "testimonials", name: "Customer Testimonials" },
  { id: "footer", name: "Footer & Social Links" },
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

  // Builder Interactive State
  const [sections, setSections] = useState<SectionItem[]>(INITIAL_SECTIONS);
  const [selectedSectionId, setSelectedSectionId] = useState<SectionId>("products");
  const [accentColor, setAccentColor] = useState<string>("#2563EB");
  const [brandColorName, setBrandColorName] = useState<string>("Electric Blue");
  const [gridCols, setGridCols] = useState<2 | 4>(4);
  const [cardStyle, setCardStyle] = useState<"default" | "compact" | "minimal">("default");
  const [typography, setTypography] = useState<"inter" | "tight">("inter");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isLivePreview, setIsLivePreview] = useState<boolean>(false);
  const [publishStatus, setPublishStatus] = useState<"draft" | "publishing" | "published">("draft");

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePublish = () => {
    if (publishStatus === "publishing") return;
    setPublishStatus("publishing");
    setTimeout(() => {
      setPublishStatus("published");
    }, 1200);
  };

  const handleReset = () => {
    setSections(INITIAL_SECTIONS);
    setSelectedSectionId("products");
    setAccentColor("#2563EB");
    setBrandColorName("Electric Blue");
    setGridCols(4);
    setCardStyle("default");
    setTypography("inter");
    setDevice("desktop");
    setPublishStatus("draft");
    setIsLivePreview(false);
  };

  const activeSection = sections.find((s) => s.id === selectedSectionId);

  // Styling helper tokens for dark vs light builder UI
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
    <section className="py-20 sm:py-24 bg-white border-b border-zinc-200/80 overflow-hidden">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            STEP 01 · BUILD
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Build a store that feels like yours.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Try the real interactive studio below: Drag sections to reorder, tweak brand colors & layouts, test mobile responsiveness, and preview live.
          </p>
        </div>

        {/* Large Interactive Studio Frame */}
        <div
          ref={containerRef}
          className={`max-w-6xl mx-auto rounded-3xl border shadow-2xl overflow-hidden transition-colors duration-300 relative ${bgStudio}`}
        >
          {/* Top Toolbar */}
          <div className={`flex flex-wrap items-center justify-between border-b px-4 py-3 text-xs gap-3 ${bgToolbar}`}>
            {/* Window Dots & Info */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <span className="font-semibold text-[11px] flex items-center gap-1.5">
                <span>Visual Storefront Studio</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200 text-zinc-600"}`}>
                  INTERACTIVE
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

              {/* Live Preview Toggle */}
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

              {/* Reset State Button */}
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
                    ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
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
                onClick={handlePublish}
                disabled={publishStatus === "publishing"}
                style={{
                  backgroundColor: publishStatus === "published" ? "#10B981" : accentColor,
                  boxShadow: `0 4px 14px ${accentColor}40`,
                }}
                className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold text-white shadow-xs flex items-center gap-1.5 transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-75"
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
            {/* Left Panel: Draggable Page Sections */}
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

                {mounted && (
                  <Reorder.Group
                    axis="y"
                    values={sections}
                    onReorder={setSections}
                    className="space-y-2"
                  >
                    {sections.map((s) => {
                      const isSelected = selectedSectionId === s.id;
                      return (
                        <Reorder.Item
                          key={s.id}
                          value={s}
                          onClick={() => setSelectedSectionId(s.id)}
                          whileDrag={{
                            scale: 1.03,
                            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                            zIndex: 50,
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-[11px] cursor-grab active:cursor-grabbing transition-all select-none ${
                            isSelected
                              ? isDark
                                ? "bg-zinc-800/90 shadow-md"
                                : "bg-blue-50/80 shadow-xs"
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
                              className="h-2 w-2 rounded-full shadow-xs"
                              style={{ backgroundColor: accentColor }}
                            />
                          )}
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                )}

                {/* Helper hint */}
                <div className={`pt-3 border-t text-[10px] space-y-1 ${isDark ? "border-zinc-800/80" : "border-zinc-200"}`}>
                  <p className={`font-bold uppercase text-[9px] ${textSubtle}`}>ACTIVE SELECTION</p>
                  <p className="font-semibold text-blue-500 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {activeSection ? activeSection.name : "None"}
                  </p>
                </div>
              </div>
            )}

            {/* Center Canvas: Storefront Canvas */}
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
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full rounded-2xl border p-4 sm:p-5 space-y-3.5 transition-colors duration-300 ${bgCanvas}`}
              >
                {/* Storefront Mini Header */}
                <div className={`flex items-center justify-between border-b pb-2.5 text-[11px] ${isDark ? "border-zinc-700/60 text-zinc-300" : "border-zinc-200 text-zinc-700"}`}>
                  <div className="flex items-center gap-2 font-bold">
                    <div
                      className="h-5 w-5 rounded-md flex items-center justify-center text-[10px] text-white font-black shadow-xs"
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
                        className="absolute -top-1 -right-1 h-3 w-3 rounded-full text-[8px] font-bold text-white flex items-center justify-center"
                        style={{ backgroundColor: accentColor }}
                      >
                        2
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rendered Dynamic Sections in active `sections` order */}
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
                              className="absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-extrabold text-white uppercase tracking-wider shadow-xs"
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
                              className="px-3 py-1 rounded-lg text-[10px] font-bold text-white shadow-xs inline-block transition-transform duration-200 hover:scale-105"
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
                              className="absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-extrabold text-white uppercase tracking-wider shadow-xs"
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

                    // 6. Footer & Social Links
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

                {/* Section Title Indicator */}
                <div className={`p-2.5 rounded-xl border space-y-1 ${isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-slate-50 border-zinc-200"}`}>
                  <p className={`text-[9px] font-bold uppercase ${textSubtle}`}>SELECTED COMPONENT</p>
                  <p className="font-extrabold text-blue-500 text-[11px]">
                    {activeSection ? activeSection.name : "Select a section"}
                  </p>
                </div>

                {/* Property 1: Brand Accent Color Selector */}
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

                {/* Property 2: Popular Products Grid Controls */}
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

                {/* Property 3: Card Density Style */}
                <div className="space-y-2">
                  <label className={`block text-[11px] font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                    Card Layout Density
                  </label>
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    {(["default", "compact", "minimal"] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setCardStyle(style)}
                        className={`p-1.5 rounded-lg border capitalize text-center font-semibold transition-all ${
                          cardStyle === style
                            ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                            : isDark
                            ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                            : "bg-slate-50 border-zinc-200 text-zinc-600"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property 4: Typography Hierarchy */}
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
