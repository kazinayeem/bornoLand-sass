"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { LineChart, TrendingUp, ShoppingBag, Users, Zap } from "lucide-react";

export function StoryAnalytics() {
  const [period, setPeriod] = useState<"7D" | "30D" | "90D" | "1Y">("30D");

  const STATS = {
    "7D": { gross: "৳ 84,200", orders: "348", conversion: "4.8%", growth: "+14.2%" },
    "30D": { gross: "৳ 248,500", orders: "1,248", conversion: "4.9%", growth: "+24.8%" },
    "90D": { gross: "৳ 890,000", orders: "4,120", conversion: "5.1%", growth: "+38.4%" },
    "1Y": { gross: "৳ 3,450,000", orders: "16,800", conversion: "5.3%", growth: "+54.2%" },
  };

  const current = STATS[period];

  return (
    <section className="py-20 sm:py-24 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-bold">
            BUSINESS INTELLIGENCE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Know what&apos;s happening in your business.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Gain immediate visibility into revenue trends, order velocity, and checkout conversion rates.
          </p>

          {/* Period Selector */}
          <div className="flex justify-center pt-3">
            <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-2xs">
              {(["7D", "30D", "90D", "1Y"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === p
                      ? "bg-zinc-950 text-white shadow-xs font-bold"
                      : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Large Analytics Dashboard Card */}
        <div className="max-w-5xl mx-auto rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xl space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400">GROSS SALES</span>
              <p className="text-xl sm:text-2xl font-bold text-zinc-950">{current.gross}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">{current.growth} growth</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400">ORDERS PROCESSED</span>
              <p className="text-xl sm:text-2xl font-bold text-zinc-950">{current.orders}</p>
              <p className="text-[10px] text-blue-600 font-semibold">+12.8% volume</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400">CHECKOUT CONVERSION</span>
              <p className="text-xl sm:text-2xl font-bold text-zinc-950">{current.conversion}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">+0.8% uplift</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400">TOP CATEGORY</span>
              <p className="text-xl sm:text-2xl font-bold text-zinc-950">Electronics</p>
              <p className="text-[10px] text-purple-600 font-semibold">54% of sales</p>
            </div>
          </div>

          {/* Top Products Breakdown */}
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5 space-y-3 text-xs">
            <span className="font-bold text-zinc-900 block">Top Revenue Drivers ({period})</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                <p className="font-bold text-zinc-900">Nike Air Max 270</p>
                <p className="text-emerald-600 font-semibold">৳ 86,400 (42 sold)</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                <p className="font-bold text-zinc-900">AirPods Pro (2nd Gen)</p>
                <p className="text-emerald-600 font-semibold">৳ 49,980 (20 sold)</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                <p className="font-bold text-zinc-900">Egyptian Cotton Set</p>
                <p className="text-emerald-600 font-semibold">৳ 38,500 (10 sold)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
