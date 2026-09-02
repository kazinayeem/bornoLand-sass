"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { useLandingLocale } from "./landing-locale";
import { Reveal } from "./motion-primitives";
import {
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  ShoppingBag,
  Eye,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StoryBuilder() {
  const { locale, t } = useLandingLocale();
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeCategory, setActiveCategory] = useState<"all" | "fashion" | "electronics">("all");

  const products = [
    { name: "Premium Cotton Panjabi", price: "৳১,৮৫০", category: "fashion", tag: "Hot" },
    { name: "Wireless Earbuds Pro", price: "৳২,৪৫০", category: "electronics", tag: "New" },
    { name: "Classic Linen Shirt", price: "৳১,২৫০", category: "fashion", tag: "-15%" },
    { name: "Smart Fitness Watch", price: "৳৩,২০০", category: "electronics", tag: "Best" },
  ];

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section id="builder" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          {/* Left Column: Value Copy */}
          <div className="lg:col-span-5 space-y-6">
            <Reveal direction="down" delay={50}>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {t.builder.eyebrow}
              </span>
            </Reveal>

            <Reveal direction="up" delay={100}>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
                {t.builder.title}
              </h2>
            </Reveal>

            <Reveal direction="up" delay={160}>
              <p className="text-base text-zinc-600 leading-relaxed font-normal">
                {t.builder.description}
              </p>
            </Reveal>

            <Reveal direction="up" delay={220}>
              <div className="space-y-3 pt-2">
                {t.builder.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#0A8A00] shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal direction="up" delay={280}>
              <div className="pt-3">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-xs hover:bg-[#002B80] transition-all"
                >
                  <span>{t.builder.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Live Interactive Storefront Canvas Mockup */}
          <div className="lg:col-span-7">
            <Reveal direction="scale" delay={180}>
              <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/60 p-4 sm:p-6 shadow-md space-y-4">
                {/* Top Control Bar: Device Viewport Switcher */}
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
                  <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setDevice("desktop")}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer",
                        device === "desktop"
                          ? "bg-[#003399] text-white shadow-2xs"
                          : "text-zinc-600 hover:text-zinc-950"
                      )}
                    >
                      <Monitor className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{t.builder.desktop}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDevice("tablet")}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer",
                        device === "tablet"
                          ? "bg-[#003399] text-white shadow-2xs"
                          : "text-zinc-600 hover:text-zinc-950"
                      )}
                    >
                      <Tablet className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{t.builder.tablet}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDevice("mobile")}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer",
                        device === "mobile"
                          ? "bg-[#003399] text-white shadow-2xs"
                          : "text-zinc-600 hover:text-zinc-950"
                      )}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{t.builder.mobile}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0A8A00] animate-pulse" />
                      {t.builder.livePreview}
                    </span>
                  </div>
                </div>

                {/* Simulated Canvas with Device Container Width */}
                <div
                  className={cn(
                    "mx-auto transition-all duration-300 rounded-xl border border-zinc-200/90 bg-white overflow-hidden shadow-sm",
                    device === "desktop" && "w-full",
                    device === "tablet" && "w-full sm:w-[480px]",
                    device === "mobile" && "w-full sm:w-[320px]"
                  )}
                >
                  {/* Storefront Simulated Header */}
                  <div className="p-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 text-xs">
                    <span className="font-extrabold text-[#003399]">AURA BOUTIQUE</span>
                    <div className="flex gap-2 text-[10px] text-zinc-500 font-semibold">
                      <span>Home</span>
                      <span>Shop</span>
                      <span>About</span>
                    </div>
                  </div>

                  {/* Storefront Simulated Hero Banner */}
                  <div className="p-5 bg-gradient-to-r from-[#003399] to-indigo-800 text-white space-y-2 text-center">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#FFDA1A]">
                      NEW COLLECTION 2026
                    </span>
                    <h4 className="text-base sm:text-lg font-black leading-tight">
                      {locale === "bn" ? "এক্সক্লুসিভ ফ্যাশন ও ট্রেন্ড" : "Modern Luxury & Apparel"}
                    </h4>
                    <div className="pt-1">
                      <span className="inline-block px-3 py-1 rounded bg-[#FFDA1A] text-[#111111] text-[10px] font-black shadow-xs">
                        {t.builder.shopNow}
                      </span>
                    </div>
                  </div>

                  {/* Category Filter Chips */}
                  <div className="p-3 border-b border-zinc-100 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                    <button
                      type="button"
                      onClick={() => setActiveCategory("all")}
                      className={cn(
                        "px-2.5 py-1 rounded-full font-bold transition-colors",
                        activeCategory === "all" ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600"
                      )}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCategory("fashion")}
                      className={cn(
                        "px-2.5 py-1 rounded-full font-bold transition-colors",
                        activeCategory === "fashion" ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600"
                      )}
                    >
                      Fashion
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCategory("electronics")}
                      className={cn(
                        "px-2.5 py-1 rounded-full font-bold transition-colors",
                        activeCategory === "electronics" ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600"
                      )}
                    >
                      Electronics
                    </button>
                  </div>

                  {/* Storefront Simulated Product Grid */}
                  <div className="p-3 grid grid-cols-2 gap-2 text-xs">
                    {filteredProducts.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-zinc-100 bg-zinc-50/50 space-y-1 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                            {p.tag}
                          </span>
                          <ShoppingBag className="h-3 w-3 text-zinc-400" />
                        </div>
                        <p className="font-bold text-zinc-900 text-[11px] truncate">{p.name}</p>
                        <p className="font-extrabold text-[#003399] text-xs">{p.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
