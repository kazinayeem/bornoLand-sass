"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { BuilderLink as Link } from "./builder-link";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { SectionWrapper, type SectionData } from "./section-renderer";

export type HeroSlide = {
  id?: string;
  image?: string;
  desktopImage?: string;
  mobileImage?: string;
  tabletImage?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  overlayColor?: string;
  textAlignment?: "left" | "center" | "right";
  textColor?: string;
  isActive?: boolean;
};

function parseSlides(p: Record<string, string>): HeroSlide[] {
  // If JSON array exists in `slides` prop
  if (p.slides) {
    try {
      const parsed = typeof p.slides === "string" ? JSON.parse(p.slides) : p.slides;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any, idx: number) => {
          const img = item.image || item.imageUrl || item.desktopImage || item.desktop_image || "";
          const mobImg = item.mobileImage || item.mobileImageUrl || item.mobile_image || "";
          return {
            id: item.id || `slide-${idx + 1}`,
            image: img,
            desktopImage: img,
            mobileImage: mobImg,
            tabletImage: item.tabletImage || "",
            badge: item.badge ?? item.kicker ?? "",
            title: item.title ?? item.headline ?? "",
            subtitle: item.subtitle ?? item.subheadline ?? item.description ?? "",
            buttonText: item.buttonText ?? item.primaryButtonText ?? "",
            buttonLink: item.buttonLink ?? item.primaryButtonLink ?? "/shop",
            secondaryButtonText: item.secondaryButtonText ?? "",
            secondaryButtonLink: item.secondaryButtonLink ?? "",
            overlayColor: item.overlayColor || p.overlayColor || "rgba(0, 0, 0, 0.45)",
            textAlignment: item.textAlignment || (p.textAlignment as any) || "left",
            textColor: item.textColor || p.textColor || "#ffffff",
            isActive: item.isActive !== false,
          };
        });
      }
    } catch {
      // fallback to flat keys
    }
  }

  // Fallback to legacy flat keys (slide1Image, slide2Image, etc.) or section root imageUrl
  const count = Number(p.slideCount) || 2;
  return Array.from({ length: count }, (_, i) => {
    const idx = i + 1;
    const fallbackImage = i === 0 ? (p.imageUrl || p.image || p.desktopImage || "") : "";
    const img = p[`slide${idx}Image` as keyof typeof p] || p[`slide${idx}DesktopImage` as keyof typeof p] || fallbackImage;
    const mobImg = p[`slide${idx}MobileImage` as keyof typeof p] || "";
    return {
      id: `slide-${idx}`,
      image: img,
      desktopImage: img,
      mobileImage: mobImg,
      tabletImage: "",
      badge: p[`slide${idx}Badge` as keyof typeof p] || (i === 0 ? (p.kicker || p.badge || "Featured Deal") : ""),
      title: p[`slide${idx}Title` as keyof typeof p] || (i === 0 ? (p.headline || p.title || "Special Collection") : `Slide ${idx}`),
      subtitle: p[`slide${idx}Subtitle` as keyof typeof p] || (i === 0 ? (p.subheadline || p.subtitle || "Discover top trending products at exclusive prices.") : "High quality products at best price."),
      buttonText: p[`slide${idx}ButtonText` as keyof typeof p] || (p.buttonText || "Shop Now"),
      buttonLink: p[`slide${idx}ButtonLink` as keyof typeof p] || (p.buttonLink || "/shop"),
      secondaryButtonText: p[`slide${idx}SecondaryButtonText` as keyof typeof p] || p.secondaryButtonText || "",
      secondaryButtonLink: p[`slide${idx}SecondaryButtonLink` as keyof typeof p] || p.secondaryButtonLink || "",
      overlayColor: p.overlayColor || "rgba(0, 0, 0, 0.45)",
      textAlignment: (p.textAlignment as any) || "left",
      textColor: p.textColor || "#ffffff",
      isActive: true,
    };
  });
}

export function SliderHero({ section }: { section: SectionData }) {
  const p = section.props;
  const slides = useMemo(() => parseSlides(p).filter((s) => s.isActive !== false), [p]);
  const slideCount = slides.length || 1;
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const autoplay = p.autoplay !== "false";
  const speed = Number(p.autoplaySpeed) || 5000;

  const nextSlide = useCallback(() => {
    setActive((c) => (c + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setActive((c) => (c - 1 + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (!autoplay || slideCount <= 1 || isHovered) return;
    const timer = setInterval(nextSlide, speed);
    return () => clearInterval(timer);
  }, [autoplay, slideCount, speed, isHovered, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0]?.clientX ?? 0;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  const current = slides[active] ?? slides[0];
  const textAlignClass =
    current?.textAlignment === "center"
      ? "text-center items-center mx-auto"
      : current?.textAlignment === "right"
      ? "text-right items-end ml-auto"
      : "text-left items-start";

  return (
    <SectionWrapper section={section}>
      <div
        className="relative w-full overflow-hidden bg-zinc-950 min-h-[420px] sm:min-h-[520px] lg:min-h-[620px] flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") prevSlide();
          if (e.key === "ArrowRight") nextSlide();
        }}
      >
        {/* Slides Container */}
        {slides.map((slide, i) => {
          const isCurrent = i === active;
          const bgImage = slide.image || slide.desktopImage || slide.mobileImage;

          return (
            <div
              key={slide.id || i}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Responsive Background Images */}
              {bgImage ? (
                <div className="relative h-full w-full">
                  <picture className="block h-full w-full">
                    {slide.mobileImage && (
                      <source media="(max-width: 640px)" srcSet={slide.mobileImage} />
                    )}
                    {slide.tabletImage && (
                      <source media="(max-width: 1024px)" srcSet={slide.tabletImage} />
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bgImage}
                      alt={slide.title || "Hero banner"}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="h-full w-full object-cover object-center"
                    />
                  </picture>
                </div>
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-950" />
              )}

              {/* Dynamic Overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: slide.overlayColor || p.overlayColor || "rgba(0, 0, 0, 0.45)",
                }}
              />
            </div>
          );
        })}

        {/* Hero Content Overlay */}
        <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className={`flex flex-col max-w-2xl ${textAlignClass}`}>
            {current?.badge && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md mb-4 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>{current.badge}</span>
              </div>
            )}

            {current?.title && (
              <h1
                className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance leading-tight"
                style={{ color: current.textColor || "#ffffff" }}
              >
                {current.title}
              </h1>
            )}

            {current?.subtitle && (
              <p
                className="mt-4 text-base sm:text-lg text-white/90 text-balance leading-relaxed max-w-xl"
                style={{ color: current.textColor ? `${current.textColor}ea` : "rgba(255, 255, 255, 0.9)" }}
              >
                {current.subtitle}
              </p>
            )}

            {(current?.buttonText || current?.secondaryButtonText) && (
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {current?.buttonText && (
                  <Link
                    href={current.buttonLink || "/shop"}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-950 shadow-md hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>{current.buttonText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {current?.secondaryButtonText && (
                  <Link
                    href={current.secondaryButtonLink || "/about"}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-black/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all"
                  >
                    <span>{current.secondaryButtonText}</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        {p.showArrows !== "false" && slideCount > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105 active:scale-95 focus:outline-none"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105 active:scale-95 focus:outline-none"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {p.showDots !== "false" && slideCount > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-md">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
