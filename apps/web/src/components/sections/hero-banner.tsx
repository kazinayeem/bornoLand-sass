"use client";

import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, type SectionData } from "./section-renderer";
import { resolveTextAlignment, resolveTextColor } from "@/lib/resolve-section-visuals";
import { useDevice } from "@/lib/device-context";

const heightMap: Record<string, string> = {
  sm: "min-h-[280px] sm:min-h-[360px] md:min-h-[400px]",
  md: "min-h-[360px] sm:min-h-[480px] md:min-h-[560px]",
  lg: "min-h-[420px] sm:min-h-[560px] md:min-h-[700px]",
  full: "min-h-[70vh] md:min-h-screen",
};

export function HeroBanner({ section }: { section: SectionData }) {
  const p = section.props;
  const device = useDevice();
  const textColor = resolveTextColor(section, "#ffffff");
  const textAlignment = resolveTextAlignment(section) || p.textAlignment || "center";
  const height = heightMap[p.heroHeight || "md"] || heightMap.md;
  const align =
    textAlignment === "left"
      ? "items-start text-left"
      : textAlignment === "right"
        ? "items-end text-right"
        : "items-center text-center";
  const contentAlign =
    textAlignment === "left" ? "items-start" : textAlignment === "right" ? "items-end" : "items-center";
  const paddingY = device === "mobile" ? p.mobilePaddingY || p.paddingY || "40px 0" : p.paddingY || "48px 0";

  return (
    <SectionWrapper section={section} className={height}>
      <div className={`flex h-full min-h-[inherit] w-full items-center px-4 sm:px-6 lg:px-8 ${align}`}>
        <div className={`flex w-full max-w-3xl flex-col gap-3 sm:gap-4 ${contentAlign}`} style={{ padding: paddingY }}>
          {p.kicker && (
            <span className="inline-flex w-fit max-w-full rounded-full border border-white/20 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-white/80 backdrop-blur-sm sm:text-xs">
              {p.kicker}
            </span>
          )}
          {p.headline && (
            <h1
              className="max-w-full break-words font-bold leading-tight"
              style={{
                color: textColor,
                fontSize: "clamp(1.75rem, 5vw, 3rem)",
              }}
            >
              {p.headline}
            </h1>
          )}
          {p.subheadline && (
            <p
              className="max-w-xl break-words leading-relaxed"
              style={{
                color: textColor ? `${textColor}cc` : "rgba(255,255,255,0.8)",
                fontSize: "clamp(0.875rem, 2.2vw, 1.125rem)",
              }}
            >
              {p.subheadline}
            </p>
          )}
          {(p.buttonText || p.secondaryButtonText) && (
            <div className={`mt-1 flex w-full flex-wrap gap-3 sm:mt-2 ${contentAlign}`}>
              {p.buttonText && (
                <Link
                  href={p.buttonLink || "#"}
                  className="btn-press inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-white px-5 py-2.5 text-sm font-semibold text-apple-ink transition-all hover:bg-apple-canvas-parchment sm:min-h-[44px] sm:px-6 sm:text-base"
                >
                  {p.buttonText}
                </Link>
              )}
              {p.secondaryButtonText && (
                <Link
                  href={p.secondaryButtonLink || "#"}
                  className="btn-press inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-white/20 bg-transparent px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 sm:min-h-[44px] sm:px-6 sm:text-base"
                >
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
