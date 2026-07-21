"use client";

import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, type SectionData } from "./section-renderer";

const heightMap: Record<string, string> = {
  sm: "min-h-[300px] md:min-h-[400px]",
  md: "min-h-[400px] md:min-h-[560px]",
  lg: "min-h-[500px] md:min-h-[700px]",
  full: "min-h-[60vh] md:min-h-screen",
};

export function HeroBanner({ section }: { section: SectionData }) {
  const p = section.props;
  const height = heightMap[p.heroHeight || "md"] || heightMap.md;
  const align = p.textAlignment === "left" ? "items-start text-left" : p.textAlignment === "right" ? "items-end text-right" : "items-center text-center";
  const contentAlign = p.textAlignment === "left" ? "items-start" : p.textAlignment === "right" ? "items-end" : "items-center";

  return (
    <SectionWrapper section={section} className={height}>
      <div className={`flex ${align} h-full w-full px-4 sm:px-6 lg:px-8`}>
        <div className={`flex w-full max-w-2xl flex-col gap-4 ${contentAlign} ${align}`} style={{ padding: p.paddingY || "48px 0" }}>
          {p.kicker && (
            <span className="inline-flex w-fit rounded-full border border-white/20 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/80 backdrop-blur-sm">
              {p.kicker}
            </span>
          )}
          {p.headline && (
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl xl:text-6xl" style={{ color: p.textColor || "#ffffff" }}>
              {p.headline}
            </h1>
          )}
          {p.subheadline && (
            <p className="max-w-xl text-sm leading-relaxed sm:text-base lg:text-lg" style={{ color: p.textColor ? `${p.textColor}cc` : "rgba(255,255,255,0.8)" }}>
              {p.subheadline}
            </p>
          )}
          {(p.buttonText || p.secondaryButtonText) && (
            <div className={`mt-2 flex flex-wrap gap-3 ${contentAlign}`}>
              {p.buttonText && (
                <Link href={p.buttonLink || "#"}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-apple-ink transition-all hover:bg-apple-canvas-parchment active:scale-95">
                  {p.buttonText}
                </Link>
              )}
              {p.secondaryButtonText && (
                <Link href={p.secondaryButtonLink || "#"}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95">
                  {p.secondaryButtonText}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
