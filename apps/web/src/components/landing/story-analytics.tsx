"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";

export function StoryAnalytics() {
  const [period, setPeriod] = useState<"7D" | "30D" | "90D" | "1Y">("30D");

  const periodLabels: Record<string, string> = {
    "7D": "৭ দিন",
    "30D": "৩০ দিন",
    "90D": "৯০ দিন",
    "1Y": "১ বছর",
  };

  const STATS = {
    "7D": { gross: "৳৮৪,২০০", orders: "৩৪৮", conversion: "৪.৮%", growth: "+১৪.২%" },
    "30D": { gross: "৳২,৪৮,৫০০", orders: "১,২৪৮", conversion: "৪.৯%", growth: "+২৪.৮%" },
    "90D": { gross: "৳৮,৯০,০০০", orders: "৪,১২০", conversion: "৫.১%", growth: "+৩৮.৪%" },
    "1Y": { gross: "৳৩৪,৫০,০০০", orders: "১৬,৮০০", conversion: "৫.৩%", growth: "+৫৪.২%" },
  };

  const current = STATS[period];

  return (
    <section id="analytics" className="py-20 sm:py-24 bg-zinc-50/50 border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            অ্যানালিটিক্স ও রিপোর্ট
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            আপনার ব্যবসায় কী হচ্ছে, সবসময় জানুন।
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            আজকের বিক্রি, মোট অর্ডার, নতুন কাস্টমার ও সেরা বিক্রি হওয়া পণ্য এক নজরে বুঝে নিন।
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
                  {periodLabels[p]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Large Analytics Dashboard Card */}
        <div className="max-w-5xl mx-auto rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xl space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-500">মোট বিক্রয় (Gross Sales)</span>
              <p className="text-xl sm:text-2xl font-bold text-zinc-950">{current.gross}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">{current.growth} বৃদ্ধি</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-500">মোট অর্ডার (Orders)</span>
              <p className="text-xl sm:text-2xl font-bold text-zinc-950">{current.orders}</p>
              <p className="text-[10px] text-blue-600 font-semibold">+১২.৮% নতুন ভলিউম</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-500">কনভার্শন রেট</span>
              <p className="text-xl sm:text-2xl font-bold text-zinc-950">{current.conversion}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">+০.৮% আপলিফ্ট</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] font-bold uppercase text-zinc-500">টপ ক্যাটাগরি</span>
              <p className="text-xl sm:text-2xl font-bold text-zinc-950">ফ্যাশন ও পাঞ্জাবি</p>
              <p className="text-[10px] text-purple-600 font-semibold">৫৪% মোট বিক্রির</p>
            </div>
          </div>

          {/* Top Products Breakdown */}
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5 space-y-3 text-xs">
            <span className="font-bold text-zinc-900 block">সেরা বিক্রি হওয়া পণ্যসমূহ ({periodLabels[period]})</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                <p className="font-bold text-zinc-900">Premium Cotton Panjabi</p>
                <p className="text-emerald-600 font-semibold">৳৮৬,৪০০ (৪৬টি বিক্রি)</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                <p className="font-bold text-zinc-900">Wireless Earbuds Pro</p>
                <p className="text-emerald-600 font-semibold">৳৪৯,৯৮০ (২০টি বিক্রি)</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                <p className="font-bold text-zinc-900">Classic Silk Saree</p>
                <p className="text-emerald-600 font-semibold">৳৩৮,৫০- (১০টি বিক্রি)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
