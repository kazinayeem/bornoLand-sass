"use client";

import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, type SectionData } from "./section-renderer";
import { resolveTextAlignment, resolveTextColor } from "@/lib/resolve-section-visuals";

const heightMap: Record<string, string> = {
  sm: "min-h-[300px] md:min-h-[400px]",
  md: "min-h-[400px] md:min-h-[560px]",
  lg: "min-h-[500px] md:min-h-[700px]",
  full: "min-h-[60vh] md:min-h-screen",
};

export function HeroBanner({ section }: { section: SectionData }) {
  const p = section.props;
  const textColor = resolveTextColor(section, "#ffffff");
  const textAlignment = resolveTextAlignment(section) || p.textAlignment;
  const height = heightMap[p.heroHeight || "md"] || heightMap.md;
  const align = textAlignment === "left" ? "items-start text-left" : textAlignment === "right" ? "items-end text-right" : "items-center text-center";
  const contentAlign = textAlignment === "left" ? "items-start" : textAlignment === "right" ? "items-end" : "items-center";

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
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl xl:text-6xl" style={{ color: textColor }}>
              {p.headline}
            </h1>
          )}
          {p.subheadline && (
            <p className="max-w-xl text-sm leading-relaxed sm:text-base lg:text-lg" style={{ color: textColor ? `${textColor}cc` : "rgba(255,255,255,0.8)" }}>
              {p.subheadline}
            </p>
          )}
          {(p.buttonText || p.secondaryButtonText) && (
            <div className={`mt-2 flex flex-wrap gap-3 ${contentAlign}`}>
              {p.buttonText && (
                <Link href={p.buttonLink || "#"}
                  className="btn-press inline-flex items-center gap-2 rounded-pill bg-white px-5 py-2.5 text-sm font-semibold text-apple-ink transition-all hover:bg-apple-canvas-parchment">
                  {p.buttonText}
                </Link>
              )}
              {p.secondaryButtonText && (
                <Link href={p.secondaryButtonLink || "#"}
                  className="btn-press inline-flex items-center gap-2 rounded-pill border border-white/20 bg-transparent px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10">
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
