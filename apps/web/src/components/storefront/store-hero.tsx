"use client";

import { useEffect, useMemo, useState } from "react";
import { StoreLink as Link } from "./store-link";
import { ChevronLeft, ChevronRight, Play, ShoppingBag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenant } from "@/providers/tenant-provider";
import { getContrastColor } from "@/lib/color-utils";
import type { StorefrontSectionLike } from "./storefront-types";

const heroHeightMap: Record<string, string> = {
  sm: "min-h-[400px]",
  md: "min-h-[560px]",
  lg: "min-h-[700px]",
};

export function StoreHero({ section }: { section?: StorefrontSectionLike }) {
  const { store, theme, sliders } = useTenant();
  const { primaryColor, buttonStyle, font, darkMode } = theme;
  const [showDemo, setShowDemo] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const isDark = darkMode;
  const heroProps: Record<string, string | number | boolean | null | undefined> = section?.props ?? {};

  const bgColor = (heroProps.backgroundColor as string) || "";
  const bgGradient = (heroProps.backgroundGradient as string) || "";
  const heroHeight = heroHeightMap[(heroProps.heroHeight as string) ?? "md"] ?? heroHeightMap.md;
  const overlayOpacity = heroProps.overlayOpacity ? `${heroProps.overlayOpacity}%` : "45%";

  const slides = useMemo(() => {
    if (sliders.length > 0) return sliders;
    const customImage = heroProps.imageUrl as string;
    return [{
      _id: "fallback",
      title: (heroProps.headline as string) ?? `Welcome to ${store.name}`,
      subtitle: (heroProps.subheadline as string) ?? "Discover curated products, fast checkout, and a storefront that feels alive.",
      imageUrl: customImage || `https://placehold.co/1600x900/png?text=${encodeURIComponent(store.name)}`,
      mobileImageUrl: (heroProps.mobileImageUrl as string) || customImage || "",
      buttonText: (heroProps.buttonText as string) ?? "Shop Now",
      buttonLink: (heroProps.buttonLink as string) ?? "/shop",
      sortOrder: 0,
      isActive: true,
      overlayColor: (heroProps.overlayColor as string) ?? "rgba(15, 23, 42, 0.45)",
      textAlignment: (heroProps.textAlignment as string) ?? "left",
    }];
  }, [sliders, heroProps, store.name]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[activeSlide % slides.length];

  const sectionBg = bgGradient
    ? `linear-gradient(135deg, ${bgGradient.split(",").map((s: string) => s.trim()).join(", ")})`
    : bgColor
    ? bgColor
    : isDark
    ? `linear-gradient(135deg, ${theme.secondaryColor} 0%, #020617 100%)`
    : `linear-gradient(135deg, ${primaryColor}08 0%, ${theme.secondaryColor}08 100%)`;

  return (
    <>
      <section className="relative overflow-hidden" style={{ fontFamily: font, background: sectionBg }}>
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="relative overflow-hidden rounded-apple-lg border border-white/10 shadow-product">
            <div className={`relative ${heroHeight}`}>
              {slides.map((slide, index) => {
                const active = index === activeSlide % slides.length;
                return (
                  <motion.div key={slide._id}
                    initial={false}
                    animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 1.02 }}
                    transition={{ duration: 0.6 }}
                    className={`absolute inset-0 ${active ? "pointer-events-auto" : "pointer-events-none"}`}>
                    <picture>
                      <source media="(max-width: 768px)" srcSet={(slide as any).mobileImageUrl || slide.imageUrl} />
                      <img
                        src={slide.imageUrl}
                        alt={slide.title || store.name}
                        loading={active ? "eager" : "lazy"}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </picture>
                    <div className="absolute inset-0" style={{ background: slide.overlayColor, opacity: overlayOpacity }} />
                    <div className={`relative flex ${heroHeight} items-end lg:items-center`}>
                      <div className="mx-auto flex w-full max-w-7xl justify-start px-4 py-10 sm:px-6 lg:px-8">
                        <div className={`max-w-2xl rounded-apple-lg border border-white/15 bg-white/10 p-8 text-white backdrop-blur-md ${
                          (slide.textAlignment as string) === "center" ? "mx-auto text-center" :
                          (slide.textAlignment as string) === "right" ? "ml-auto text-right" : ""
                        }`}>
                          {(heroProps.kicker as string) && (
                            <span className="inline-flex rounded-pill border border-white/20 bg-white/10 px-3 py-1 text-fine-print font-medium uppercase tracking-widest text-white/80 backdrop-blur-sm">
                              {heroProps.kicker as string}
                            </span>
                          )}
                          <h1 className="mt-5 text-hero-display text-white">
                            {slide.title}
                          </h1>
                          <p className="mt-4 max-w-xl text-lead text-white/80">
                            {slide.subtitle}
                          </p>
                          <div className={`mt-7 flex flex-wrap gap-3 ${
                            (slide.textAlignment as string) === "center" ? "justify-center" :
                            (slide.textAlignment as string) === "right" ? "justify-end" : "justify-start"
                          }`}>
                            <Link href={slide.buttonLink}
                              className="btn-press inline-flex items-center gap-2 rounded-pill px-[22px] py-[11px] text-body transition-all hover:opacity-90"
                              style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}>
                              <ShoppingBag className="h-4 w-4" /> {slide.buttonText}
                            </Link>
                            {(heroProps.secondaryButtonText as string) && (
                              <button onClick={() => setShowDemo(true)}
                                className="btn-press inline-flex items-center gap-2 rounded-pill border border-white/20 bg-white/10 px-[22px] py-[11px] text-body text-white/90 backdrop-blur-sm transition-all hover:bg-white/20">
                                <Play className="h-4 w-4" /> {heroProps.secondaryButtonText as string}
                              </button>
                            )}
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
                  className="btn-press absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => setActiveSlide((current) => (current + 1) % slides.length)}
                  className="btn-press absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20">
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative w-full max-w-2xl rounded-apple-lg border border-apple-hairline bg-apple-canvas p-apple-lg shadow-product"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowDemo(false)}
                className="btn-press absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-apple-surface-chip/64 text-apple-ink transition-colors hover:bg-apple-surface-chip">
                <X className="h-4 w-4" />
              </button>
              <h3 className="mb-4 text-body-strong text-apple-ink">How {store.name} Works</h3>
              <div className="aspect-video rounded-apple-sm bg-apple-canvas-parchment flex items-center justify-center">
                <Play className="h-16 w-16 text-apple-ink-muted-48/30" />
              </div>
              <p className="mt-4 text-caption text-apple-ink-muted-48">Browse our collection, add items to cart, and checkout in seconds.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
