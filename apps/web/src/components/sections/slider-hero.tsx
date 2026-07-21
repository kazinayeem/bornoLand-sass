"use client";

import { useState, useEffect } from "react";
import { BuilderLink as Link } from "./builder-link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionWrapper, type SectionData } from "./section-renderer";

export function SliderHero({ section }: { section: SectionData }) {
  const p = section.props;
  const slideCount = Number(p.slideCount) || 3;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slideCount <= 1) return;
    const speed = Number(p.autoplaySpeed) || 5000;
    const timer = setInterval(() => setActive((c) => (c + 1) % slideCount), speed);
    return () => clearInterval(timer);
  }, [slideCount, p.autoplaySpeed]);

  const slides = Array.from({ length: slideCount }, (_, i) => ({
    image: p[`slide${i + 1}Image` as keyof typeof p] || "",
    title: p[`slide${i + 1}Title` as keyof typeof p] || `Slide ${i + 1}`,
    buttonText: p[`slide${i + 1}ButtonText` as keyof typeof p] || "Shop",
  }));

  return (
    <SectionWrapper section={section} className="relative min-h-[400px] md:min-h-[560px] flex items-center overflow-hidden">
      {slides.map((slide, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}>
          {slide.image ? (
            <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }} />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
          )}
        </div>
      ))}
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{slides[active]?.title || "Welcome"}</h1>
        {slides[active]?.buttonText && (
          <Link href="#" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-apple-ink">
            {slides[active].buttonText}
          </Link>
        )}
      </div>
      {p.showArrows !== "false" && slideCount > 1 && (
        <>
          <button onClick={() => setActive((c) => (c - 1 + slideCount) % slideCount)}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur-sm hover:bg-black/40">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => setActive((c) => (c + 1) % slideCount)}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur-sm hover:bg-black/40">
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      {p.showDots !== "false" && slideCount > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all ${i === active ? "w-8 bg-white" : "w-2 bg-white/50"}`} />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
