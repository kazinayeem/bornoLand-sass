"use client";

import { useState } from "react";
import { REVENUE_DATA } from "./landing-tokens";
import { TrendingUp, ShoppingBag, Users, Zap } from "lucide-react";

export function RevenueChart() {
  const [period, setPeriod] = useState<"Today" | "7D" | "30D" | "90D">("Today");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = REVENUE_DATA[period];
  const maxVal = Math.max(...data.map((d) => d.revenue));
  const activePoint = hoveredIdx !== null ? data[hoveredIdx] : data[data.length - 1];

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-7 shadow-xl shadow-zinc-200/50 space-y-6 font-sans">
      {/* Top 4 Stat Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 border-b border-zinc-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-medium">Revenue</span>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-zinc-950">৳ 1,24,800</p>
          <p className="text-[10px] text-emerald-600 font-semibold">+18.4% vs last period</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-medium">Orders</span>
            <ShoppingBag className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-zinc-950">1,248</p>
          <p className="text-[10px] text-blue-600 font-semibold">+12.8% volume</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-medium">Customers</span>
            <Users className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-zinc-950">2,540</p>
          <p className="text-[10px] text-purple-600 font-semibold">+9.2% growth</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-medium">Conversion</span>
            <Zap className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-zinc-950">4.9%</p>
          <p className="text-[10px] text-emerald-600 font-semibold">+0.8% checkout</p>
        </div>
      </div>

      {/* Chart Controls & Active Tooltip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            SELECTED {period.toUpperCase()} VALUE
          </span>
          <p className="font-bold text-zinc-900 text-sm">
            ৳ {activePoint.revenue.toLocaleString()} · {activePoint.orders} Orders ({activePoint.name})
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50/80 p-1">
          {(["Today", "7D", "30D", "90D"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPeriod(p);
                setHoveredIdx(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                period === p
                  ? "bg-white text-zinc-950 shadow-2xs font-bold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SVG Chart Area */}
      <div className="relative h-44 w-full pt-4">
        {/* SVG Chart */}
        <svg className="h-full w-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="0" x2="600" y2="0" stroke="#F4F4F5" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="40" x2="600" y2="40" stroke="#F4F4F5" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="80" x2="600" y2="80" stroke="#F4F4F5" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="120" x2="600" y2="120" stroke="#E4E4E7" strokeWidth="1" />

          {/* Area Fill */}
          <path
            d={`M 0 120 ${data
              .map((d, i) => {
                const x = (i / (data.length - 1)) * 600;
                const y = 120 - (d.revenue / maxVal) * 100;
                return `L ${x} ${y}`;
              })
              .join(" ")} L 600 120 Z`}
            fill="url(#chartGradient)"
          />

          {/* Stroke Line */}
          <path
            d={`M 0 ${120 - (data[0].revenue / maxVal) * 100} ${data
              .map((d, i) => {
                const x = (i / (data.length - 1)) * 600;
                const y = 120 - (d.revenue / maxVal) * 100;
                return `L ${x} ${y}`;
              })
              .join(" ")}`}
            fill="none"
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 600;
            const y = 120 - (d.revenue / maxVal) * 100;
            const isHovered = hoveredIdx === i;
            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 3.5}
                  fill="#FFFFFF"
                  stroke="#2563EB"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="flex justify-between pt-2 text-[10px] text-zinc-400 font-mono">
          {data.map((d, i) => (
            <span key={i}>{d.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
