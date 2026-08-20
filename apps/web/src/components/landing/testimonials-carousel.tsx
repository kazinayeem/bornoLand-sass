"use client";

import { useState, useEffect } from "react";
import { landingContainer } from "./landing-ui";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

export function TestimonialsCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const TESTIMONIALS = [
    {
      quote:
        "Bornoland helped us launch our brand in under an afternoon. Having native bKash merchant verification and Steadfast courier sync in one place saved us weeks of custom development.",
      name: "Farhan Kabir",
      role: "Founder & Creative Director",
      store: "Aura Lifestyle BD",
      rating: 5,
    },
    {
      quote:
        "We scaled from 10 to over 300 orders a day without a single server hiccup. The automated PDF invoice generator and live order status stream keep our warehouse running like clockwork.",
      name: "Nusrat Jahan",
      role: "Head of Operations",
      store: "Modest Living Home",
      rating: 5,
    },
    {
      quote:
        "Managing multiple storefronts under a single login is game-changing. We run three distinct niche stores with separate custom domains, inventory, and staff permissions effortlessly.",
      name: "Tanvir Hasan",
      role: "E-Commerce Manager",
      store: "TechGear & Prime Organics",
      rating: 5,
    },
  ];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, TESTIMONIALS.length]);

  return (
    <section className="py-20 sm:py-28 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            MERCHANT STORIES
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Loved by fast-growing brands.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Hear from entrepreneurs scaling their online commerce operations on Bornoland.
          </p>
        </div>

        {/* Carousel Box */}
        <div
          className="max-w-4xl mx-auto rounded-3xl border border-zinc-200/90 bg-white p-8 sm:p-12 shadow-xl relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="space-y-6">
            <div className="flex gap-1 text-amber-400">
              {Array.from({ length: TESTIMONIALS[activeIdx].rating }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400" />
              ))}
            </div>

            <p className="text-lg sm:text-2xl font-medium text-zinc-900 leading-relaxed font-sans italic">
              &ldquo;{TESTIMONIALS[activeIdx].quote}&rdquo;
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-zinc-100">
              <div>
                <p className="text-sm font-bold text-zinc-950">{TESTIMONIALS[activeIdx].name}</p>
                <p className="text-xs text-zinc-500">
                  {TESTIMONIALS[activeIdx].role} · <span className="font-semibold text-zinc-900">{TESTIMONIALS[activeIdx].store}</span>
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
                  }
                  className="h-9 w-9 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-700 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIdx((prev) => (prev + 1) % TESTIMONIALS.length)}
                  className="h-9 w-9 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-700 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
