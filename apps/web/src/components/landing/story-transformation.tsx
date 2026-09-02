"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { useLandingLocale } from "./landing-locale";
import { Reveal } from "./motion-primitives";
import {
  Globe,
  Boxes,
  ShoppingCart,
  Users,
  LineChart,
  ArrowRight,
  Calculator,
  Landmark,
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StoryTransformation() {
  const { t } = useLandingLocale();
  const [activeDomain, setActiveDomain] = useState<"commerce" | "operations" | "people" | "finance" | "growth">("commerce");

  const domainTabs = [
    { id: "commerce", label: t.transformation.domains.commerce.title, icon: Globe },
    { id: "operations", label: t.transformation.domains.operations.title, icon: Calculator },
    { id: "people", label: t.transformation.domains.people.title, icon: Users },
    { id: "finance", label: t.transformation.domains.finance.title, icon: Landmark },
    { id: "growth", label: t.transformation.domains.growth.title, icon: LineChart },
  ] as const;

  const currentDomain = t.transformation.domains[activeDomain];

  return (
    <section id="platform-architecture" className="py-20 sm:py-24 bg-zinc-50/70 border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <Reveal direction="down" delay={50}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {t.transformation.eyebrow}
            </span>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
              {t.transformation.title}
            </h2>
          </Reveal>
          <Reveal direction="up" delay={160}>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
              {t.transformation.description}
            </p>
          </Reveal>
        </div>

        {/* Central Architecture Interactive Display */}
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Domain Selector Pills */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2">
            {domainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeDomain === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDomain(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs border",
                    isActive
                      ? "bg-[#003399] text-white border-[#003399] shadow-sm scale-[1.02]"
                      : "bg-white text-zinc-700 border-zinc-200/90 hover:bg-zinc-100 hover:text-zinc-950"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Domain Spotlight Card */}
          <Reveal direction="scale" delay={120}>
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-950">
                    {currentDomain.title}
                  </h3>
                  <p className="text-sm text-zinc-600 font-normal">{currentDomain.sub}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#0A8A00] flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0A8A00]" />
                    Central Synchronized
                  </span>
                </div>
              </div>

              {/* 3 Capabilities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentDomain.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-2 hover:border-[#003399]/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#003399]">
                      <CheckCircle2 className="h-4 w-4 text-[#0A8A00]" />
                      <span>{item.label}</span>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Master BOS Data Flow Strip */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/50 via-zinc-50 to-emerald-50/40 border border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-800 font-semibold">
                  <Cpu className="h-4 w-4 text-[#003399]" />
                  <span>Single Transactional Event Pipeline:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-zinc-600">
                  <span className="px-2 py-0.5 rounded bg-white border border-zinc-200 shadow-2xs">Order Event</span>
                  <span>➔</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-zinc-200 shadow-2xs">Real-Time Stock</span>
                  <span>➔</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-zinc-200 shadow-2xs">Double-Entry Journal</span>
                  <span>➔</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-zinc-200 shadow-2xs">P&L Margin</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
