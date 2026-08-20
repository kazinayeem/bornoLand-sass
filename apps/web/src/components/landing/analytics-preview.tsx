"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { LineChart, BarChart3, PieChart, Users, TrendingUp } from "lucide-react";

export function AnalyticsPreview() {
  const [period, setPeriod] = useState<"7D" | "30D" | "90D" | "1Y">("30D");

  const MULTI_PERIOD_DATA = {
    "7D": {
      gross: "৳ 84,200",
      orders: "348",
      customers: "+84",
      conversion: "4.8%",
      bars: [35, 50, 42, 68, 85, 98, 92],
    },
    "30D": {
      gross: "৳ 248,500",
      orders: "1,248",
      customers: "+312",
      conversion: "4.9%",
      bars: [45, 60, 75, 55, 90, 105, 120, 110, 130, 145, 160, 175],
    },
    "90D": {
      gross: "৳ 890,000",
      orders: "4,120",
      customers: "+1,040",
      conversion: "5.1%",
      bars: [60, 80, 110, 140, 165, 190, 220, 250],
    },
    "1Y": {
      gross: "৳ 3,450,000",
      orders: "16,800",
      customers: "+4,800",
      conversion: "5.3%",
      bars: [80, 110, 140, 170, 200, 230, 260, 290, 320, 350, 380, 420],
    },
  };

  const current = MULTI_PERIOD_DATA[period];

  return (
    <section className="py-20 sm:py-28 bg-zinc-50/50 border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            BUSINESS INTELLIGENCE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Understand your business at a glance.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Real-time charts, conversion funnels, and revenue metrics designed for clarity and fast decision making.
          </p>

          {/* Period Toggle */}
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

        {/* Dashboard Grid */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xl space-y-6">
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">GROSS SALES</span>
              <p className="text-xl sm:text-2xl font-extrabold text-zinc-950">{current.gross}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">+18.4% growth</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">ORDERS PROCESSED</span>
              <p className="text-xl sm:text-2xl font-extrabold text-zinc-950">{current.orders}</p>
              <p className="text-[10px] text-blue-600 font-semibold">+12.2% volume</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">NEW CUSTOMERS</span>
              <p className="text-xl sm:text-2xl font-extrabold text-zinc-950">{current.customers}</p>
              <p className="text-[10px] text-purple-600 font-semibold">Active buyers</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">CONVERSION RATE</span>
              <p className="text-xl sm:text-2xl font-extrabold text-zinc-950">{current.conversion}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">High checkout rate</p>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/40 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-900">Order Volume Breakdown ({period})</span>
              <span className="text-[10px] text-zinc-400 font-mono">Steadily climbing</span>
            </div>

            <div className="flex items-end gap-2 sm:gap-3 h-36 pt-4">
              {current.bars.map((val, idx) => {
                const heightPct = Math.min(100, Math.max(15, (val / Math.max(...current.bars)) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full bg-zinc-200/80 rounded-t-md group-hover:bg-blue-600 transition-all relative overflow-hidden" style={{ height: `${heightPct}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
