"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { useLandingLocale } from "./landing-locale";
import { Reveal, AnimatedNumber, AnimatedChart } from "./motion-primitives";
import { TrendingUp, ShoppingBag, Users, Sparkles, Layers, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ANALYTICS_CHART_DATA = {
  "7D": [
    { label: "Day 1", value: 12000 },
    { label: "Day 2", value: 18000 },
    { label: "Day 3", value: 14000 },
    { label: "Day 4", value: 24000 },
    { label: "Day 5", value: 32000 },
    { label: "Day 6", value: 38000 },
    { label: "Day 7", value: 42000 },
  ],
  "30D": [
    { label: "Week 1", value: 65000 },
    { label: "Week 2", value: 92000 },
    { label: "Week 3", value: 118000 },
    { label: "Week 4", value: 148000 },
  ],
  "90D": [
    { label: "Month 1", value: 280000 },
    { label: "Month 2", value: 380000 },
    { label: "Month 3", value: 490000 },
  ],
  "1Y": [
    { label: "Q1", value: 820000 },
    { label: "Q2", value: 1140000 },
    { label: "Q3", value: 1480000 },
    { label: "Q4", value: 1980000 },
  ],
};

export function StoryAnalytics() {
  const { locale, t } = useLandingLocale();
  const [period, setPeriod] = useState<"7D" | "30D" | "90D" | "1Y">("30D");

  const STATS = {
    "7D": { gross: 84200, orders: 348, conversion: 4.8, growth: "+14.2%" },
    "30D": { gross: 248500, orders: 1248, conversion: 4.9, growth: "+24.8%" },
    "90D": { gross: 890000, orders: 4120, conversion: 5.1, growth: "+38.4%" },
    "1Y": { gross: 3450000, orders: 16800, conversion: 5.3, growth: "+54.2%" },
  };

  const current = STATS[period];

  return (
    <section id="analytics" className="py-20 sm:py-24 bg-zinc-50/70 border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <Reveal direction="down" delay={50}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {t.analytics.eyebrow}
            </span>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
              {t.analytics.title}
            </h2>
          </Reveal>
          <Reveal direction="up" delay={160}>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
              {t.analytics.description}
            </p>
          </Reveal>

          {/* Time Range Selector */}
          <Reveal direction="up" delay={200}>
            <div className="flex justify-center pt-3">
              <div className="flex items-center gap-1 rounded-xl border border-zinc-200/90 bg-white p-1 shadow-2xs">
                {(["7D", "30D", "90D", "1Y"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      period === p
                        ? "bg-[#003399] text-white shadow-xs"
                        : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                    )}
                  >
                    {t.analytics.periods[p]}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Large Analytics Command Center Dashboard */}
        <Reveal direction="scale" delay={180}>
          <div className="max-w-5xl mx-auto rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-md space-y-6">
            {/* 4 KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500">{t.analytics.kpis.grossSales}</span>
                <p className="text-xl sm:text-2xl font-black text-zinc-950">
                  <AnimatedNumber value={current.gross} prefix="৳" />
                </p>
                <p className="text-[10px] text-[#0A8A00] font-bold">{current.growth} growth</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500">{t.analytics.kpis.orders}</span>
                <p className="text-xl sm:text-2xl font-black text-zinc-950">
                  <AnimatedNumber value={current.orders} />
                </p>
                <p className="text-[10px] text-blue-600 font-bold">+12.8% volume</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500">{t.analytics.kpis.conversion}</span>
                <p className="text-xl sm:text-2xl font-black text-zinc-950">
                  <AnimatedNumber value={current.conversion} decimals={1} suffix="%" />
                </p>
                <p className="text-[10px] text-[#0A8A00] font-bold">+0.8% uplift</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500">{t.analytics.kpis.topCategory}</span>
                <p className="text-xl sm:text-2xl font-black text-zinc-950">
                  {locale === "bn" ? "ফ্যাশন ও পাঞ্জাবি" : "Fashion & Apparel"}
                </p>
                <p className="text-[10px] text-purple-600 font-bold">54% of total sales</p>
              </div>
            </div>

            {/* Dynamic SVG Interactive Chart */}
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/30 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-extrabold text-zinc-950">
                  {locale === "bn" ? "বিক্রয় প্রবৃদ্ধি গ্রাফ" : "Sales Growth Progression Curve"}
                </span>
                <span className="text-[11px] font-bold text-[#003399]">
                  {t.analytics.periods[period]}
                </span>
              </div>
              <AnimatedChart
                data={ANALYTICS_CHART_DATA[period]}
                height={160}
                color="#003399"
                fillOpacity={0.16}
              />
            </div>

            {/* Top Products Breakdown */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 sm:p-5 space-y-3 text-xs">
              <span className="font-extrabold text-zinc-900 block">
                {t.analytics.topProductsTitle} ({t.analytics.periods[period]})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                  <p className="font-bold text-zinc-900">Premium Cotton Panjabi</p>
                  <p className="text-[#0A8A00] font-bold">৳86,400 (46 sold)</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                  <p className="font-bold text-zinc-900">Wireless Earbuds Pro</p>
                  <p className="text-[#0A8A00] font-bold">৳49,980 (20 sold)</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                  <p className="font-bold text-zinc-900">Classic Silk Saree</p>
                  <p className="text-[#0A8A00] font-bold">৳38,500 (10 sold)</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
