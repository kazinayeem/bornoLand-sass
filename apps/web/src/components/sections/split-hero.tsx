"use client";

import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, type SectionData } from "./section-renderer";
import { ArrowRight, Sparkles } from "lucide-react";

export function SplitHero({ section }: { section: SectionData }) {
  const p = section.props;
  const imgLeft = p.imagePosition === "left";
  const cw = p.contentWidth || "50";
  const textColor = p.textColor || "#0f172a";

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className={`flex flex-col-reverse items-center gap-8 md:gap-12 lg:gap-16 ${imgLeft ? "md:flex-row-reverse" : "md:flex-row"}`}>
          {/* Content Column */}
          <div
            className="flex-1 w-full"
            style={{ flex: `${cw}%` }}
          >
            <div className={`flex flex-col gap-4 sm:gap-5 ${p.textAlignment === "center" ? "items-center text-center mx-auto" : p.textAlignment === "right" ? "items-end text-right ml-auto" : "items-start text-left"}`}>
              {p.kicker && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 shadow-sm">
                  <Sparkles className="h-3 w-3 text-blue-600" />
                  <span>{p.kicker}</span>
                </div>
              )}
              <h1
                className="font-extrabold tracking-tight leading-[1.15]"
                style={{
                  color: textColor,
                  fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                }}
              >
                {p.headline || "Elevate Your Everyday Style"}
              </h1>
              {p.subheadline && (
                <p
                  className="max-w-xl font-normal leading-relaxed text-sm sm:text-base md:text-lg"
                  style={{ color: p.textColor ? `${p.textColor}b3` : "#475569" }}
                >
                  {p.subheadline}
                </p>
              )}
              {(p.buttonText || p.secondaryButtonText) && (
                <div className="mt-2 flex flex-wrap items-center gap-3.5">
                  {p.buttonText && (
                    <Link
                      href={p.buttonLink || "#"}
                      className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-zinc-900/10 transition-all duration-200 hover:scale-[1.02] hover:bg-zinc-800 active:scale-[0.98]"
                    >
                      <span>{p.buttonText}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                  {p.secondaryButtonText && (
                    <Link
                      href={p.secondaryButtonLink || "#"}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-transparent px-6 py-3 text-sm font-semibold text-zinc-700 transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98]"
                    >
                      {p.secondaryButtonText}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Media Column */}
          <div
            className="flex-1 w-full"
            style={{ flex: `${100 - Number(cw)}%` }}
          >
            <div className="relative aspect-[4/3] sm:aspect-[16/11] md:aspect-square w-full overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-100 shadow-xl shadow-zinc-950/5">
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.headline || "Hero visual"}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-400">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-200 flex items-center justify-center text-zinc-400 font-bold">
                    HD
                  </div>
                  <span className="text-xs font-medium">Add Hero Image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

