"use client";

import { landingContainer } from "./landing-ui";
import { Reveal } from "./motion-primitives";
import {
  MessageSquareX,
  PackageX,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Zap,
} from "lucide-react";

export function StoryProblem() {
  const problems = [
    {
      icon: MessageSquareX,
      title: "Scattered Orders & Delayed Fulfillment",
      description: "Orders scattered across WhatsApp, direct messages, and spreadsheets result in missed customer shipments.",
      tag: "NO UNIFIED PIPELINE",
    },
    {
      icon: PackageX,
      title: "Overselling & Inaccurate Stock Counts",
      description: "Physical retail registers and online stores run on separate databases, leading to stockouts and customer friction.",
      tag: "STOCK MISMATCH",
    },
    {
      icon: FileSpreadsheet,
      title: "Manual Bookkeeping & Hidden Margins",
      description: "Reconciling courier remittances, POS cash drawers, and expenses by hand takes days and hides your true net margin.",
      tag: "BLIND DECISION MAKING",
    },
  ];

  return (
    <section id="solutions" className="py-20 sm:py-24 bg-zinc-50/70 border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <Reveal direction="down" delay={40}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              THE PROBLEM & THE SOLUTION
            </span>
          </Reveal>
          <Reveal direction="up" delay={80}>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
              Why Run Your Business Across 7 Disconnected Tools?
            </h2>
          </Reveal>
          <Reveal direction="up" delay={140}>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
              When your storefront, POS registers, inventory sheets, payroll files, and ledger live in separate silos, data breaks and growth stalls.
            </p>
          </Reveal>
        </div>

        {/* Compact Visual Comparison */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Fragmented Chaos */}
          <div className="lg:col-span-6 rounded-2xl border border-rose-200/80 bg-rose-50/25 p-6 sm:p-7 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                <AlertTriangle className="h-4 w-4" />
                <span>Fragmented Chaos (Before BornoLand)</span>
              </div>
              <span className="text-[10px] text-rose-700 font-bold bg-rose-100 px-2.5 py-0.5 rounded-full">
                5+ Disconnected Apps
              </span>
            </div>

            <div className="space-y-3">
              {problems.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <Reveal key={idx} direction="left" delay={idx * 60 + 100}>
                    <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-2xs flex items-start gap-3.5 hover:border-rose-300 transition-all">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-zinc-900 text-xs sm:text-sm">{p.title}</h4>
                          <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                            {p.tag}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          {p.description}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <div className="pt-2 text-[11px] text-rose-600 font-medium">
              Result: High operational friction, overselling, and lost revenue.
            </div>
          </div>

          {/* Right Column: BornoLand Connected Solution */}
          <div className="lg:col-span-6 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white p-6 sm:p-7 space-y-5 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#003399]">
                  <CheckCircle2 className="h-4 w-4 text-[#003399]" />
                  <span>Connected BornoLand (Operating System)</span>
                </div>
                <span className="text-[10px] text-[#0A8A00] bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                  100% Unified Pipeline
                </span>
              </div>

              <div className="rounded-xl bg-white border border-blue-100 p-5 shadow-xs space-y-3.5 text-xs">
                <div className="flex items-center gap-2 text-[#003399] font-bold text-xs">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="uppercase tracking-wider">Synchronous Event Architecture</span>
                </div>
                <p className="text-zinc-600 leading-relaxed text-xs">
                  Every order at web checkout or retail POS instantly updates multi-warehouse inventory, writes double-entry journal entries, adjusts supplier reorder thresholds, and computes real-time gross profit.
                </p>

                {/* 3-Step Live Pipeline Visual */}
                <div className="pt-3 border-t border-zinc-100 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-0.5">
                    <span className="font-bold text-zinc-900 block">1. Sale Trigger</span>
                    <span className="text-zinc-500">POS / Online</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 space-y-0.5">
                    <span className="font-bold text-[#003399] block">2. Real-Time</span>
                    <span className="text-blue-700">Stock & COGS</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-0.5">
                    <span className="font-bold text-[#0A8A00] block">3. Financial Ledger</span>
                    <span className="text-emerald-700">Auto P&L Journal</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-100/80 flex items-center justify-between text-xs font-bold text-[#003399]">
              <span>Save 12+ hours of manual reconciliation every week</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
