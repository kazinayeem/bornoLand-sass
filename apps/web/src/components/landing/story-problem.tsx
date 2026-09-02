"use client";

import { landingContainer } from "./landing-ui";
import { useLandingLocale } from "./landing-locale";
import { Reveal } from "./motion-primitives";
import {
  MessageSquareX,
  PackageX,
  UserX,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  Boxes,
  Landmark,
  ShieldCheck,
} from "lucide-react";

export function StoryProblem() {
  const { t } = useLandingLocale();

  const iconMap = [MessageSquareX, PackageX, UserX];

  return (
    <section id="problem" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <Reveal direction="down" delay={50}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              {t.problem.eyebrow}
            </span>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
              {t.problem.title}
            </h2>
          </Reveal>
          <Reveal direction="up" delay={160}>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
              {t.problem.description}
            </p>
          </Reveal>
        </div>

        {/* Visual Storytelling Comparison */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: 3 Painful Problems */}
          <div className="lg:col-span-6 rounded-2xl border border-rose-200/80 bg-rose-50/20 p-6 sm:p-7 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                <AlertCircle className="h-4 w-4" />
                <span>{t.problem.beforeTitle}</span>
              </div>
              <span className="text-[10px] text-rose-600 font-bold bg-rose-100 px-2 py-0.5 rounded-full">
                {t.problem.beforeBadge}
              </span>
            </div>

            <div className="space-y-3">
              {t.problem.problems.map((p, idx) => {
                const Icon = iconMap[idx] || AlertCircle;
                return (
                  <Reveal key={idx} direction="left" delay={idx * 80 + 100}>
                    <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-2xs flex items-start gap-3.5 transition-all hover:border-rose-300">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-zinc-900 text-sm">{p.title}</h4>
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                            {p.tag}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                          {p.description}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          {/* Right: BornoLand Unified BOS Solution */}
          <div className="lg:col-span-6 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white p-6 sm:p-7 space-y-5 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#003399]">
                  <CheckCircle2 className="h-4 w-4 text-[#003399]" />
                  <span>{t.problem.afterTitle}</span>
                </div>
                <span className="text-[10px] text-[#0A8A00] bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  {t.problem.afterBadge}
                </span>
              </div>

              <div className="rounded-xl bg-white border border-blue-100 p-5 shadow-xs space-y-3.5 text-xs">
                <div className="flex items-center gap-2 text-[#003399] font-bold text-xs">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="uppercase tracking-wider">{t.problem.afterHeading}</span>
                </div>
                <p className="text-zinc-600 leading-relaxed text-xs">
                  {t.problem.afterDescription}
                </p>

                {/* Animated Data Pipeline Flow */}
                <div className="pt-2 border-t border-zinc-100 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded bg-zinc-50 border border-zinc-200/80">
                    <span className="font-bold text-zinc-900 block">1. Checkout</span>
                    <span className="text-zinc-500">POS / Web</span>
                  </div>
                  <div className="p-2 rounded bg-blue-50 border border-blue-200">
                    <span className="font-bold text-[#003399] block">2. Real-Time</span>
                    <span className="text-blue-700">Stock & COGS</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                    <span className="font-bold text-[#0A8A00] block">3. P&L Ledger</span>
                    <span className="text-emerald-700">Auto Journal</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-100/80 flex items-center justify-between text-xs font-bold text-[#003399]">
              <span>{t.problem.savedHours}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
