"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { useLandingLocale } from "./landing-locale";
import { Reveal } from "./motion-primitives";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function StoryFAQ() {
  const { t } = useLandingLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <Reveal direction="down" delay={50}>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {t.faq.eyebrow}
            </span>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
              {t.faq.title}
            </h2>
          </Reveal>
          <Reveal direction="up" delay={160}>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
              {t.faq.description}
            </p>
          </Reveal>
        </div>

        {/* Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3">
          {t.faq.items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Reveal key={idx} direction="up" delay={idx * 60 + 100}>
                <div
                  className={cn(
                    "rounded-2xl border transition-all duration-200 overflow-hidden",
                    isOpen
                      ? "border-[#003399]/40 bg-zinc-50/70 shadow-xs"
                      : "border-zinc-200/80 bg-white hover:border-zinc-300"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    aria-expanded={isOpen}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-zinc-950 leading-snug">
                      {item.q}
                    </span>
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-transform duration-200",
                        isOpen && "rotate-180 bg-[#003399] text-white"
                      )}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-200/50 pt-3 animate-in fade-in duration-200">
                      {item.a}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
