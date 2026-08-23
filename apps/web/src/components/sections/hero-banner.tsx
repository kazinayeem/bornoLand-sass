"use client";

import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, type SectionData } from "./section-renderer";
import { resolveTextAlignment, resolveTextColor } from "@/lib/resolve-section-visuals";
import { useDevice } from "@/lib/device-context";
import { ArrowRight, Sparkles } from "lucide-react";

const heightMap: Record<string, string> = {
  sm: "min-h-[320px] sm:min-h-[400px] md:min-h-[460px]",
  md: "min-h-[420px] sm:min-h-[540px] md:min-h-[640px]",
  lg: "min-h-[520px] sm:min-h-[680px] md:min-h-[780px]",
  full: "min-h-[85vh] md:min-h-screen",
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
  const paddingY = device === "mobile" ? p.mobilePaddingY || p.paddingY || "48px 0" : p.paddingY || "72px 0";

  return (
    <SectionWrapper section={section} className={`w-full max-w-full min-w-0 ${height}`}>
      <div className={`flex h-full min-h-[inherit] w-full max-w-full min-w-0 items-center justify-center px-4 sm:px-6 lg:px-8 ${align}`}>
        <div className={`flex w-full max-w-4xl min-w-0 flex-col gap-4 sm:gap-6 ${contentAlign}`} style={{ padding: paddingY }}>
          {p.kicker && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md shadow-sm">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>{p.kicker}</span>
            </div>
          )}
          {p.headline && (
            <h1
              className="max-w-3xl break-words font-extrabold tracking-tight leading-[1.1]"
              style={{
                color: textColor,
                fontSize: "clamp(2.25rem, 5.5vw, 4rem)",
              }}
            >
              {p.headline}
            </h1>
          )}
          {p.subheadline && (
            <p
              className="max-w-2xl break-words font-normal leading-relaxed text-sm sm:text-base md:text-lg"
              style={{
                color: textColor ? `${textColor}d9` : "rgba(255,255,255,0.85)",
              }}
            >
              {p.subheadline}
            </p>
          )}
          {(p.buttonText || p.secondaryButtonText) && (
            <div className={`mt-2 flex w-full flex-wrap items-center gap-3 sm:gap-4 ${contentAlign}`}>
              {p.buttonText && (
                <Link
                  href={p.buttonLink || "#"}
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm sm:text-base font-semibold text-zinc-900 shadow-lg shadow-black/10 transition-all duration-200 hover:scale-[1.02] hover:bg-zinc-100 hover:shadow-xl active:scale-[0.98]"
                >
                  <span>{p.buttonText}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
              {p.secondaryButtonText && (
                <Link
                  href={p.secondaryButtonLink || "#"}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 active:scale-[0.98]"
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

