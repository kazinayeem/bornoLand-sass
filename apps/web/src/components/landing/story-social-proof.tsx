"use client";

import { landingContainer } from "./landing-ui";
import { useLandingLocale } from "./landing-locale";
import { Reveal, AnimatedNumber } from "./motion-primitives";
import { Star, Store, ShoppingBag, Award, TrendingUp, CheckCircle2, Quote } from "lucide-react";

export function StorySocialProof() {
  const { t } = useLandingLocale();

  return (
    <section id="testimonials" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <Reveal direction="down" delay={50}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {t.testimonials.eyebrow}
            </span>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
              {t.testimonials.title}
            </h2>
          </Reveal>
          <Reveal direction="up" delay={160}>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
              {t.testimonials.description}
            </p>
          </Reveal>
        </div>

        {/* 4 Trust Metrics Bar */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12">
          <Reveal direction="up" delay={100}>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center space-y-1 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-zinc-950">
                <AnimatedNumber value={500} suffix="+" />
              </p>
              <p className="text-xs text-zinc-500 font-semibold">{t.testimonials.stats.merchantsLabel}</p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={150}>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center space-y-1 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-zinc-950">
                <AnimatedNumber value={150000} suffix="+" />
              </p>
              <p className="text-xs text-zinc-500 font-semibold">{t.testimonials.stats.ordersLabel}</p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={200}>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center space-y-1 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-[#003399]">
                {t.testimonials.stats.gmv}
              </p>
              <p className="text-xs text-zinc-500 font-semibold">{t.testimonials.stats.gmvLabel}</p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={250}>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center space-y-1 shadow-2xs">
              <div className="flex items-center justify-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-amber-400" />
                <span className="text-2xl sm:text-3xl font-black text-zinc-950">4.9</span>
              </div>
              <p className="text-xs text-zinc-500 font-semibold">{t.testimonials.stats.ratingLabel}</p>
            </div>
          </Reveal>
        </div>

        {/* 3 Authentic Merchant Testimonials Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.testimonials.items.map((item, idx) => (
            <Reveal key={idx} direction="up" delay={idx * 100 + 200}>
              <div className="h-full flex flex-col justify-between p-6 rounded-2xl border border-zinc-200/90 bg-zinc-50/50 shadow-2xs hover:shadow-md hover:bg-white hover:border-[#003399]/40 transition-all space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-[#0A8A00] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {item.verified}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-normal italic">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-200/80 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003399] text-white font-black text-xs">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-950 text-xs">{item.name}</p>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {item.role} · <span className="font-semibold text-zinc-800">{item.business}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
