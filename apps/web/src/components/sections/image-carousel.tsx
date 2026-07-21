"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

type Slide = {
  id: string;
  image?: string;
  mobileImage?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonLink?: string;
  badge?: string;
  imageFit?: string;
  imagePosition?: string;
  textAlignment?: string;
  textColor?: string;
  overlay?: string;
  backgroundOverlay?: string;
  gradientOverlay?: string;
};

function toSlides(raw: unknown): Slide[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const slide = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(slide.id ?? `slide-${index}`),
      image: typeof slide.image === "string" ? slide.image : "",
      mobileImage: typeof slide.mobileImage === "string" ? slide.mobileImage : "",
      alt: typeof slide.alt === "string" ? slide.alt : "",
      title: typeof slide.title === "string" ? slide.title : "",
      subtitle: typeof slide.subtitle === "string" ? slide.subtitle : "",
      description: typeof slide.description === "string" ? slide.description : "",
      buttonText: typeof slide.buttonText === "string" ? slide.buttonText : "",
      buttonUrl: typeof slide.buttonUrl === "string" ? slide.buttonUrl : "",
      buttonLink: typeof slide.buttonLink === "string" ? slide.buttonLink : "",
      badge: typeof slide.badge === "string" ? slide.badge : "",
      imageFit: typeof slide.imageFit === "string" ? slide.imageFit : "cover",
      imagePosition: typeof slide.imagePosition === "string" ? slide.imagePosition : "center",
      textAlignment: typeof slide.textAlignment === "string" ? slide.textAlignment : "left",
      textColor: typeof slide.textColor === "string" ? slide.textColor : "",
      overlay: typeof slide.overlay === "string" ? slide.overlay : "",
      backgroundOverlay: typeof slide.backgroundOverlay === "string" ? slide.backgroundOverlay : "",
      gradientOverlay: typeof slide.gradientOverlay === "string" ? slide.gradientOverlay : "",
    };
  });
}

export function ImageCarousel({ section }: { section: SectionData }) {
  const p = section.props;
  const slides = useMemo(() => {
    const parsed = toSlides((section.style as { slides?: unknown } | undefined)?.slides);
    return parsed.length > 0 ? parsed : [{
      id: "default-slide",
      image: "",
      title: p.title || "Image Carousel",
      subtitle: p.subtitle || "Add slides in the builder",
      description: "",
      buttonText: "Shop Now",
      buttonUrl: "/shop",
      badge: "",
      imageFit: "cover",
      imagePosition: "center",
      textAlignment: "left",
      textColor: "",
      overlay: "",
      backgroundOverlay: "",
      gradientOverlay: "",
    }];
  }, [section.style, p.subtitle, p.title]);

  const autoplay = p.autoplay !== "false" && slides.length > 1;
  const autoplaySpeed = Math.max(1200, Number(p.autoplaySpeed) || 5000);
  const infiniteLoop = p.infiniteLoop !== "false";
  const pauseOnHover = p.pauseOnHover !== "false";
  const touchSwipe = p.touchSwipe !== "false";
  const mouseDrag = p.mouseDrag !== "false";
  const keyboardNavigation = p.keyboardNavigation !== "false";
  const arrowNavigation = p.arrowNavigation !== "false";
  const dotNavigation = p.dotNavigation !== "false";
  const transition = p.transition === "fade" ? "fade" : "slide";
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Pointer coordinates are transient interaction state. Keeping them in refs
  // prevents a full carousel (and its images) from re-rendering for every pixel
  // of a drag gesture.
  const dragStartRef = useRef<number | null>(null);
  const dragDeltaRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoplay || paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        if (current === slides.length - 1) return infiniteLoop ? 0 : current;
        return current + 1;
      });
    }, autoplaySpeed);
    return () => window.clearInterval(timer);
  }, [autoplay, autoplaySpeed, infiniteLoop, paused, slides.length]);

  useEffect(() => {
    setActive((current) => Math.min(current, Math.max(slides.length - 1, 0)));
  }, [slides.length]);

  useEffect(() => {
    if (!keyboardNavigation) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActive((current) => (current === 0 ? (infiniteLoop ? slides.length - 1 : 0) : current - 1));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActive((current) => (current >= slides.length - 1 ? (infiniteLoop ? 0 : current) : current + 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [infiniteLoop, keyboardNavigation, slides.length]);

  const goTo = (index: number) => {
    if (index < 0) {
      setActive(infiniteLoop ? slides.length - 1 : 0);
      return;
    }
    if (index >= slides.length) {
      setActive(infiniteLoop ? 0 : slides.length - 1);
      return;
    }
    setActive(index);
  };

  const handlePointerDown = (clientX: number) => {
    if (!(touchSwipe || mouseDrag)) return;
    dragStartRef.current = clientX;
    dragDeltaRef.current = 0;
  };

  const handlePointerMove = (clientX: number) => {
    if (dragStartRef.current == null) return;
    dragDeltaRef.current = clientX - dragStartRef.current;
  };

  const handlePointerUp = () => {
    if (dragStartRef.current == null) return;
    const threshold = 50;
    if (dragDeltaRef.current > threshold) goTo(active - 1);
    if (dragDeltaRef.current < -threshold) goTo(active + 1);
    dragStartRef.current = null;
    dragDeltaRef.current = 0;
  };

  const current = slides[active];
  const carouselWidth = p.contentWidth === "full" ? "w-full" : "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
  const heightClass = "carousel-fixed-height";
  const fixedHeight = useMemo(() => ({
    desktop: p.desktopHeight || "560px",
    tablet: p.tabletHeight || "420px",
    mobile: p.mobileHeight || "320px",
  }), [p.desktopHeight, p.mobileHeight, p.tabletHeight]);

  return (
    <SectionWrapper section={section} className={cn("overflow-hidden", heightClass)}>
      <div
        ref={containerRef}
        tabIndex={0}
        className={cn("relative h-full outline-none", carouselWidth)}
        onMouseEnter={() => pauseOnHover && setPaused(true)}
        onMouseLeave={() => pauseOnHover && setPaused(false)}
        onTouchStart={(e) => handlePointerDown(e.touches[0]?.clientX ?? 0)}
        onTouchMove={(e) => handlePointerMove(e.touches[0]?.clientX ?? 0)}
        onTouchEnd={handlePointerUp}
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onMouseUp={handlePointerUp}
      >
        <div className="relative h-full overflow-hidden rounded-[inherit]">
          <div
            className={cn(
              "flex h-full transition-transform duration-700 ease-out",
              transition === "fade" ? "relative" : "",
            )}
            style={
              transition === "fade"
                ? undefined
                : { transform: `translateX(${-active * 100}%)` }
            }
          >
            {slides.map((slide, index) => {
              const isActive = index === active;
              return (
                <div
                  key={slide.id}
                  className={cn(
                    "relative h-full w-full flex-none",
                    transition === "fade" ? "absolute inset-0" : "",
                    transition === "fade" && isActive ? "opacity-100" : transition === "fade" ? "opacity-0 pointer-events-none" : "",
                  )}
                  style={transition === "fade" ? { transition: "opacity 700ms ease" } : undefined}
                >
                  <div className="absolute inset-0">
                    <SmartImage
                      src={slide.mobileImage || slide.image}
                      alt={slide.alt || slide.title || p.title || "Slide"}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover"
                      style={{
                        objectFit: slide.imageFit === "contain" ? "contain" : "cover",
                        objectPosition: slide.imagePosition || "center",
                      }}
                    />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        slide.gradientOverlay ||
                        slide.backgroundOverlay ||
                        slide.overlay ||
                        "linear-gradient(180deg, rgba(15,23,42,0.24), rgba(15,23,42,0.72))",
                    }}
                  />
                  <div className={cn("relative z-10 flex h-full items-end", slide.textAlignment === "center" ? "justify-center text-center" : slide.textAlignment === "right" ? "justify-end text-right" : "justify-start text-left")}>
                    <div className={cn("max-w-2xl p-6 sm:p-10 lg:p-16", slide.textAlignment === "center" ? "mx-auto" : "")}>
                      {slide.badge && (
                        <div className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/90 backdrop-blur-sm">
                          {slide.badge}
                        </div>
                      )}
                      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                        {slide.title || current?.title || p.title || "Image Carousel"}
                      </h2>
                      {(slide.subtitle || p.subtitle) && (
                        <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
                          {slide.subtitle || p.subtitle}
                        </p>
                      )}
                      {slide.description && (
                        <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">
                          {slide.description}
                        </p>
                      )}
                      {slide.buttonText && (
                        <Link
                        href={slide.buttonUrl || slide.buttonLink || "#"}
                          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-apple-ink shadow-lg shadow-black/15 transition-transform hover:-translate-y-0.5"
                        >
                          {slide.buttonText}
                          <Maximize2 className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {arrowNavigation && slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md transition hover:bg-black/35"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md transition hover:bg-black/35"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {dotNavigation && slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/15 px-3 py-2 backdrop-blur-md">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === active ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80",
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @media (min-width: 1024px) {
          .carousel-fixed-height {
            min-height: ${fixedHeight.desktop};
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .carousel-fixed-height {
            min-height: ${fixedHeight.tablet};
          }
        }
        @media (max-width: 767px) {
          .carousel-fixed-height {
            min-height: ${fixedHeight.mobile};
          }
        }
      `}</style>
    </SectionWrapper>
  );
}
