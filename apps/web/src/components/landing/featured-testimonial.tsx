"use client";

import { landingContainer } from "./landing-ui";
import { Star } from "lucide-react";

export function FeaturedTestimonial() {
  const SECONDARY_TESTIMONIALS = [
    {
      quote: "We scaled from 10 to 300 orders a day without a single server hiccup. The automated PDF invoice engine keeps our warehouse running on schedule.",
      name: "Nusrat Jahan",
      role: "Head of Operations",
      store: "Modest Living Home",
    },
    {
      quote: "Managing three distinct niche stores with separate custom apex domains and staff permissions under one login is unbeatable.",
      name: "Tanvir Hasan",
      role: "E-Commerce Manager",
      store: "TechGear & Prime Organics",
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-bold">
            MERCHANT RECOGNITION
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Loved by fast-growing brands.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Real stories from entrepreneurs running thriving e-commerce businesses on Bornoland.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          {/* ONE Large Featured Testimonial Card */}
          <div className="rounded-3xl border border-zinc-200/90 bg-white p-8 sm:p-12 shadow-xl space-y-6">
            <div className="flex gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400" />
              ))}
            </div>

            <p className="text-xl sm:text-2xl font-semibold text-zinc-950 leading-relaxed font-sans">
              &ldquo;Bornoland helped us launch our brand in under an afternoon. Having native bKash merchant verification and Steadfast courier sync in one place saved us weeks of custom development.&rdquo;
            </p>

            <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-zinc-950">Farhan Kabir</p>
                <p className="text-xs text-zinc-500">
                  Founder & Creative Director · <span className="font-semibold text-zinc-900">Aura Lifestyle BD</span>
                </p>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                Verified Merchant
              </span>
            </div>
          </div>

          {/* Secondary Testimonials Underneath (2 Cols) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SECONDARY_TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-zinc-200/80 bg-white shadow-sm space-y-4 flex flex-col justify-between"
              >
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="pt-3 border-t border-zinc-100 text-xs">
                  <p className="font-bold text-zinc-950">{t.name}</p>
                  <p className="text-zinc-500 text-[11px]">{t.role} · {t.store}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
