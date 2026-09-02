"use client";

import { useState } from "react";
import Link from "next/link";
import { landingContainer } from "./landing-ui";
import { useLandingLocale } from "./landing-locale";
import { Reveal, AnimatedNumber } from "./motion-primitives";
import { Check, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetProfileQuery } from "@/redux/api/profile-api";

export function StoryPricing() {
  const { locale, t } = useLandingLocale();
  const [isYearly, setIsYearly] = useState(false);

  const { data: profileData } = useGetProfileQuery();
  const isAuthenticated = Boolean(profileData?.data?.profile);

  return (
    <section id="pricing" className="py-20 sm:py-24 bg-zinc-50/70 border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <Reveal direction="down" delay={50}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {t.pricing.eyebrow}
            </span>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
              {t.pricing.title}
            </h2>
          </Reveal>
          <Reveal direction="up" delay={160}>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
              {t.pricing.description}
            </p>
          </Reveal>

          {/* Monthly / Yearly Switch */}
          <Reveal direction="up" delay={200}>
            <div className="flex items-center justify-center gap-3 pt-4">
              <div className="flex items-center rounded-full border border-zinc-200 bg-white p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsYearly(false)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                    !isYearly ? "bg-[#003399] text-white shadow-xs" : "text-zinc-600 hover:text-zinc-950"
                  )}
                >
                  {t.pricing.monthly}
                </button>
                <button
                  type="button"
                  onClick={() => setIsYearly(true)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                    isYearly ? "bg-[#003399] text-white shadow-xs" : "text-zinc-600 hover:text-zinc-950"
                  )}
                >
                  <span>{t.pricing.yearly}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#FFDA1A] text-[#111111] text-[9px] font-black">
                    {t.pricing.yearlyDiscount}
                  </span>
                </button>
              </div>
            </div>
          </Reveal>
        </div>

        {/* 4 Plans Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.pricing.plans.map((plan, idx) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <Reveal key={plan.id} direction="up" delay={idx * 80 + 150}>
                <div
                  className={cn(
                    "relative h-full flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 shadow-2xs",
                    plan.popular
                      ? "bg-white border-[#003399] shadow-lg ring-2 ring-[#003399]/15 -translate-y-1"
                      : "bg-white border-zinc-200/90 hover:border-zinc-300 hover:shadow-md"
                  )}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#003399] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-[#FFDA1A]" />
                      {t.pricing.popular}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-zinc-950">{plan.name}</h3>
                      <p className="text-xs text-zinc-500 mt-1 min-h-[36px]">{plan.desc}</p>
                    </div>

                    {/* Price Tag */}
                    <div className="pt-2 border-t border-zinc-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-zinc-950">
                          <AnimatedNumber value={price} prefix="৳" />
                        </span>
                        <span className="text-xs text-zinc-500 font-semibold">{t.pricing.perMonth}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{plan.limits}</p>
                    </div>

                    {/* Feature Bullets */}
                    <div className="pt-4 border-t border-zinc-100 space-y-2.5">
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-zinc-700">
                          <Check className="h-3.5 w-3.5 text-[#0A8A00] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-6">
                    <Link
                      href={isAuthenticated ? "/dashboard" : "/register"}
                      className={cn(
                        "w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs",
                        plan.popular
                          ? "bg-[#003399] text-white hover:bg-[#002B80] shadow-sm"
                          : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                      )}
                    >
                      <span>{isAuthenticated ? t.nav.dashboard : t.pricing.startTrial}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
