"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { useLandingLocale } from "./landing-locale";
import { Reveal } from "./motion-primitives";
import {
  Landmark,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Receipt,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StoryAutomation() {
  const { locale, t } = useLandingLocale();
  const [statementView, setStatementView] = useState<"pnl" | "journal">("pnl");

  return (
    <section id="accounting" className="py-20 sm:py-24 bg-zinc-50/70 border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          {/* Left Column: Interactive Financial Statement / Ledger Mockup */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <Reveal direction="scale" delay={150}>
              <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-md space-y-4">
                {/* Statement Header & View Toggle */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#003399] text-white">
                      <Landmark className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-zinc-950">{t.accounting.statementTitle}</p>
                      <p className="text-[10px] text-zinc-500">Auto-Generated • Real-Time COGS</p>
                    </div>
                  </div>

                  <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
                    <button
                      type="button"
                      onClick={() => setStatementView("pnl")}
                      className={cn(
                        "px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer",
                        statementView === "pnl" ? "bg-white text-zinc-950 shadow-2xs" : "text-zinc-500"
                      )}
                    >
                      P&L Statement
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatementView("journal")}
                      className={cn(
                        "px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer",
                        statementView === "journal" ? "bg-white text-zinc-950 shadow-2xs" : "text-zinc-500"
                      )}
                    >
                      Journal Ledger
                    </button>
                  </div>
                </div>

                {/* View 1: P&L Statement */}
                {statementView === "pnl" && (
                  <div className="space-y-3 text-xs animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                      <div className="flex justify-between font-bold text-zinc-900">
                        <span>{t.accounting.grossSales}</span>
                        <span>৳২,৪৮,৫০০</span>
                      </div>
                      <div className="flex justify-between text-zinc-600 pl-3 border-l-2 border-zinc-300">
                        <span>- {t.accounting.costOfGoods}</span>
                        <span className="font-mono">৳১,৩৬,২০০</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-zinc-200 font-extrabold text-[#003399]">
                        <span>= {t.accounting.grossMargin} (45.2%)</span>
                        <span>৳১,১২,৩০০</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                      <div className="flex justify-between text-zinc-600 pl-3 border-l-2 border-zinc-300">
                        <span>- {t.accounting.operatingExpenses} (Rent, Salary, Ads)</span>
                        <span className="font-mono">৳২৮,৫০০</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-zinc-200 text-sm font-black text-[#0A8A00]">
                        <span>= {t.accounting.netProfit}</span>
                        <span className="text-base">৳৮৩,৮০০</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* View 2: Double-Entry Journal Lines */}
                {statementView === "journal" && (
                  <div className="rounded-xl border border-zinc-200 overflow-hidden text-xs animate-in fade-in duration-200">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-100 bg-zinc-50 text-[10px] font-bold uppercase text-zinc-500">
                          <th className="py-2 px-3">Account Code & Title</th>
                          <th className="py-2 px-3 text-right">Debit (Dr)</th>
                          <th className="py-2 px-3 text-right">Credit (Cr)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                        <tr>
                          <td className="py-2.5 px-3">1010 - bKash Merchant Account</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-700">৳৪,৮৫০</td>
                          <td className="py-2.5 px-3 text-right text-zinc-400">—</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 pl-6 text-zinc-600">4010 - Sales Revenue (Online)</td>
                          <td className="py-2.5 px-3 text-right text-zinc-400">—</td>
                          <td className="py-2.5 px-3 text-right font-bold text-blue-700">৳৪,৮৫০</td>
                        </tr>
                        <tr className="bg-zinc-50/50">
                          <td className="py-2.5 px-3">5010 - Cost of Goods Sold (COGS)</td>
                          <td className="py-2.5 px-3 text-right font-bold text-amber-700">৳২,৪০০</td>
                          <td className="py-2.5 px-3 text-right text-zinc-400">—</td>
                        </tr>
                        <tr className="bg-zinc-50/50">
                          <td className="py-2.5 px-3 pl-6 text-zinc-600">1050 - Inventory Asset</td>
                          <td className="py-2.5 px-3 text-right text-zinc-400">—</td>
                          <td className="py-2.5 px-3 text-right font-bold text-amber-700">৳২,৪০০</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Audit-Ready Badge */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-[#0A8A00] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Scale className="h-4 w-4" />
                    {t.accounting.journalEntry}
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    100% Balanced
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Value Copy */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <Reveal direction="down" delay={50}>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {t.accounting.eyebrow}
              </span>
            </Reveal>

            <Reveal direction="up" delay={100}>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
                {t.accounting.title}
              </h2>
            </Reveal>

            <Reveal direction="up" delay={160}>
              <p className="text-base text-zinc-600 leading-relaxed font-normal">
                {t.accounting.description}
              </p>
            </Reveal>

            <Reveal direction="up" delay={220}>
              <div className="space-y-3 pt-2">
                {t.accounting.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#0A8A00] shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal direction="up" delay={280}>
              <div className="pt-3">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-xs hover:bg-[#002B80] transition-all"
                >
                  <span>{t.accounting.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
