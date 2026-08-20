"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { LineChart, TrendingUp, ShoppingCart, Users, Zap, ArrowUpRight } from "lucide-react";

export function DarkAnalyticsShowcase() {
  const [period, setPeriod] = useState<"7D" | "30D" | "90D" | "1Y">("30D");

  const STATS_MAP = {
    "7D": {
      gross: "৳ 84,200",
      growth: "+14.2%",
      orders: "348",
      customers: "184",
      conversion: "4.7%",
      bars: [35, 52, 48, 65, 82, 94, 88],
    },
    "30D": {
      gross: "৳ 248,500",
      growth: "+24.8%",
      orders: "1,248",
      customers: "540",
      conversion: "4.9%",
      bars: [42, 58, 64, 52, 78, 92, 110, 105, 125, 140, 155, 170],
    },
    "90D": {
      gross: "৳ 890,000",
      growth: "+38.4%",
      orders: "4,120",
      customers: "1,680",
      conversion: "5.1%",
      bars: [55, 75, 95, 120, 150, 180, 210, 240],
    },
    "1Y": {
      gross: "৳ 3,450,000",
      growth: "+54.2%",
      orders: "16,800",
      customers: "6,400",
      conversion: "5.3%",
      bars: [70, 95, 125, 155, 185, 215, 245, 275, 305, 335, 365, 400],
    },
  };

  const current = STATS_MAP[period];

  return (
    <section className="py-20 sm:py-24 bg-zinc-950 text-white border-b border-zinc-800">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 font-bold">
            BUSINESS INTELLIGENCE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Understand your business at a glance.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            Real-time charts, conversion funnels, and revenue metrics designed for clarity and fast decision making.
          </p>

          {/* Period Selector */}
          <div className="flex justify-center pt-3">
            <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/90 p-1">
              {(["7D", "30D", "90D", "1Y"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === p
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Big Dashboard Frame */}
        <div className="max-w-5xl mx-auto rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Top 4 Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400">GROSS REVENUE</span>
              <p className="text-xl sm:text-2xl font-bold text-white">{current.gross}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">{current.growth} vs last period</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400">ORDERS PROCESSED</span>
              <p className="text-xl sm:text-2xl font-bold text-white">{current.orders}</p>
              <p className="text-[10px] text-blue-400 font-semibold">100% fulfillment sync</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400">ACTIVE CUSTOMERS</span>
              <p className="text-xl sm:text-2xl font-bold text-white">{current.customers}</p>
              <p className="text-[10px] text-purple-400 font-semibold">34.6% repeat rate</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-400">CHECKOUT CONVERSION</span>
              <p className="text-xl sm:text-2xl font-bold text-white">{current.conversion}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">+0.8% with 1-step checkout</p>
            </div>
          </div>

          {/* Bar Chart & Top Products Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
            {/* Volume Chart (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 p-5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">Order Volume Distribution ({period})</span>
                <span className="text-[10px] text-zinc-500 font-mono">Real-time telemetry</span>
              </div>

              <div className="flex items-end gap-2 sm:gap-3 h-40 pt-4">
                {current.bars.map((val, idx) => {
                  const heightPct = Math.min(100, Math.max(15, (val / Math.max(...current.bars)) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <div
                        className="w-full bg-blue-500/30 rounded-t-md group-hover:bg-blue-500 transition-all relative overflow-hidden"
                        style={{ height: `${heightPct}%` }}
                      >
                        <div className="absolute inset-0 bg-blue-400/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Products (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 p-5 space-y-3 text-xs">
              <span className="font-bold text-white block">Top Revenue Products</span>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-300 font-medium">Nike Air Max 270</span>
                  <span className="font-bold text-white">৳ 86,400</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-300 font-medium">AirPods Pro (2nd Gen)</span>
                  <span className="font-bold text-white">৳ 49,980</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-300 font-medium">Egyptian Cotton Set</span>
                  <span className="font-bold text-white">৳ 38,500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
