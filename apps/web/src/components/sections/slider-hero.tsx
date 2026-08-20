"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { BuilderLink as Link } from "./builder-link";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { SectionWrapper, type SectionData } from "./section-renderer";
import { SmartImage } from "@/components/ui/smart-image";

export type HeroSlide = {
  id?: string;
  image?: string;
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
        return parsed.map((item: any, idx: number) => ({
          id: item.id || `slide-${idx}`,
          image: item.image || item.imageUrl || "",
          mobileImage: item.mobileImage || item.mobileImageUrl || "",
          tabletImage: item.tabletImage || "",
          badge: item.badge || item.kicker || "",
          title: item.title || item.headline || `Slide ${idx + 1}`,
          subtitle: item.subtitle || item.subheadline || "",
          buttonText: item.buttonText || "",
          buttonLink: item.buttonLink || item.buttonUrl || "/shop",
          secondaryButtonText: item.secondaryButtonText || "",
          secondaryButtonLink: item.secondaryButtonLink || "",
          overlayColor: item.overlayColor || p.overlayColor || "rgba(0, 0, 0, 0.45)",
          textAlignment: item.textAlignment || (p.textAlignment as any) || "left",
          textColor: item.textColor || p.textColor || "#ffffff",
          isActive: item.isActive !== false,
        }));
      }
    } catch {
      // fallback to flat keys
    }
  }

  // Fallback to legacy flat keys (slide1Image, slide2Image, etc.)
  const count = Number(p.slideCount) || 3;
  return Array.from({ length: count }, (_, i) => {
    const idx = i + 1;
    return {
      id: `slide-${idx}`,
      image: p[`slide${idx}Image` as keyof typeof p] || "",
      mobileImage: p[`slide${idx}MobileImage` as keyof typeof p] || "",
      badge: p[`slide${idx}Badge` as keyof typeof p] || (i === 0 ? "Featured Deal" : ""),
      title: p[`slide${idx}Title` as keyof typeof p] || (i === 0 ? (p.headline || "Special Collection") : `Slide ${idx}`),
      subtitle: p[`slide${idx}Subtitle` as keyof typeof p] || (p.subheadline || "Discover top trending products at exclusive prices."),
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
          return (
            <div
              key={slide.id || i}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Responsive Background Images */}
              {slide.image ? (
                <div className="relative h-full w-full">
                  <picture>
                    {slide.mobileImage && (
                      <source media="(max-width: 640px)" srcSet={slide.mobileImage} />
                    )}
                    {slide.tabletImage && (
                      <source media="(max-width: 1024px)" srcSet={slide.tabletImage} />
                    )}
                    <SmartImage
                      src={slide.image}
                      alt={slide.title || "Hero banner"}
                      fill
                      priority={i === 0}
                      className="object-cover object-center"
                    />
                  </picture>
                </div>
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-950" />
              )}

              {/* Dynamic Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: slide.overlayColor || "rgba(0, 0, 0, 0.45)",
                }}
              />
            </div>
          );
        })}

        {/* Hero Content Overlay */}
        <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className={`flex flex-col max-w-2xl ${textAlignClass}`}>
            {current?.badge && (
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>{current.badge}</span>
              </div>
            )}

            {current?.title && (
              <h1
                className="font-extrabold tracking-tight text-white leading-tight"
                style={{
                  color: current.textColor || "#ffffff",
                  fontSize: "clamp(2rem, 5vw, 3.75rem)",
                }}
              >
                {current.title}
              </h1>
            )}

            {current?.subtitle && (
              <p
                className="mt-4 text-sm sm:text-base md:text-lg text-white/85 leading-relaxed max-w-xl"
                style={{ color: current.textColor ? `${current.textColor}dd` : "#e2e8f0" }}
              >
                {current.subtitle}
              </p>
            )}

            {/* Action Buttons */}
            {(current?.buttonText || current?.secondaryButtonText) && (
              <div
                className={`mt-8 flex flex-wrap gap-3.5 ${
                  current.textAlignment === "center"
                    ? "justify-center"
                    : current.textAlignment === "right"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {current.buttonText && (
                  <Link
                    href={current.buttonLink || "/shop"}
                    className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm sm:text-base font-semibold text-zinc-900 shadow-md transition-all duration-200 hover:scale-105 hover:bg-zinc-50 active:scale-95"
                  >
                    <span>{current.buttonText}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
                {current.secondaryButtonText && (
                  <Link
                    href={current.secondaryButtonLink || "/about"}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 active:scale-95"
                  >
                    {current.secondaryButtonText}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Prev / Next Arrows */}
        {p.showArrows !== "false" && slideCount > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-4 sm:left-6 top-1/2 z-30 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md border border-white/10 transition-all hover:bg-black/60 hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-4 sm:right-6 top-1/2 z-30 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md border border-white/10 transition-all hover:bg-black/60 hover:scale-105 active:scale-95"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {p.showDots !== "false" && slideCount > 1 && (
          <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3.5 py-1.5 backdrop-blur-md border border-white/10">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active ? "w-7 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

