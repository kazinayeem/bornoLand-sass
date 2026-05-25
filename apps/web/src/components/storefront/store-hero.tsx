"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, ShoppingBag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenant } from "@/providers/tenant-provider";
import type { StorefrontSectionLike } from "./storefront-types";

export function StoreHero({ section }: { section?: StorefrontSectionLike }) {
  const { store, theme, sliders } = useTenant();
  const { primaryColor, secondaryColor, buttonStyle, font, darkMode } = theme;
  const [showDemo, setShowDemo] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const isDark = darkMode;
  const heroProps: Record<string, string | number | boolean | null | undefined> = section?.props ?? {};
  const slides = useMemo(() => sliders.length > 0 ? sliders : [{
    _id: "fallback",
    title: heroProps.headline ?? `Welcome to ${store.name}`,
    subtitle: heroProps.subheadline ?? "Discover curated products, fast checkout, and a storefront that feels alive.",
    imageUrl: `https://placehold.co/1600x900/png?text=${encodeURIComponent(store.name)}`,
    buttonText: heroProps.buttonText ?? "Shop Now",
    buttonLink: "/shop",
    sortOrder: 0,
    isActive: true,
    overlayColor: "rgba(15, 23, 42, 0.45)",
    textAlignment: "left" as const
  }], [sliders, store.name]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[activeSlide % slides.length];

  return (
    <>
      <section className="relative overflow-hidden" style={{ fontFamily: font }}>
        <div className="absolute inset-0" style={{ background: isDark ? `linear-gradient(135deg, ${secondaryColor} 0%, #020617 100%)` : `linear-gradient(135deg, ${primaryColor}08 0%, ${secondaryColor}08 100%)` }} />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
            <div className="relative min-h-[560px]">
              {slides.map((slide, index) => {
                const active = index === activeSlide % slides.length;
                return (
                  <motion.div key={slide._id}
                    initial={false}
                    animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 1.02 }}
                    transition={{ duration: 0.6 }}
                    className={`absolute inset-0 ${active ? "pointer-events-auto" : "pointer-events-none"}`}>
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.imageUrl})` }} />
                    <div className="absolute inset-0" style={{ background: slide.overlayColor }} />
                    <div className="relative flex min-h-[560px] items-end lg:items-center">
                      <div className="mx-auto flex w-full max-w-7xl justify-start px-4 py-10 sm:px-6 lg:px-8">
                        <div className={`max-w-2xl rounded-[1.75rem] border border-white/15 bg-white/10 p-8 text-white backdrop-blur-md ${slide.textAlignment === "center" ? "mx-auto text-center" : slide.textAlignment === "right" ? "ml-auto text-right" : ""}`}>
                          <span className="inline-flex rounded-full border border-white/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white/80">
                            {heroProps.kicker ?? `Welcome to ${store.name}`}
                          </span>
                          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                            {slide.title}
                          </h1>
                          <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                            {slide.subtitle}
                          </p>
                          <div className={`mt-7 flex flex-wrap gap-3 ${slide.textAlignment === "center" ? "justify-center" : slide.textAlignment === "right" ? "justify-end" : "justify-start"}`}>
                            <Link href={slide.buttonLink}
                              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.01] active:scale-95"
                              style={{ borderRadius: buttonStyle, backgroundColor: primaryColor }}>
                              <ShoppingBag className="h-4 w-4" /> {slide.buttonText}
                            </Link>
                            <button onClick={() => setShowDemo(true)}
                              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white/90 transition-all hover:bg-white/10 active:scale-95"
                              style={{ borderRadius: buttonStyle, border: "1px solid rgba(255,255,255,0.2)" }}>
                              <Play className="h-4 w-4" /> Watch Demo
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {slides.length > 1 && (
              <>
                <button onClick={() => setActiveSlide((current) => (current - 1 + slides.length) % slides.length)}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/20 p-3 text-white backdrop-blur-md transition hover:bg-black/30">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => setActiveSlide((current) => (current + 1) % slides.length)}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/20 p-3 text-white backdrop-blur-md transition hover:bg-black/30">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                  {slides.map((slide, index) => (
                    <button key={slide._id} onClick={() => setActiveSlide(index)}
                      className={`h-2 rounded-full transition-all ${index === activeSlide % slides.length ? "w-8 bg-white" : "w-2 bg-white/40"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showDemo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowDemo(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowDemo(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </button>
              <h3 className="mb-4 text-lg font-bold text-zinc-900">How {store.name} Works</h3>
              <div className="aspect-video rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                <Play className="h-16 w-16 text-zinc-300" />
              </div>
              <p className="mt-4 text-sm text-zinc-500">Browse our collection, add items to cart, and checkout in seconds.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
