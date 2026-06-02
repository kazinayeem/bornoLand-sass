"use client";

import Link from "next/link";
import { SectionWrapper, type SectionData } from "./section-renderer";

export function SplitHero({ section }: { section: SectionData }) {
  const p = section.props;
  const imgLeft = p.imagePosition === "left";
  const cw = p.contentWidth || "50";

  return (
    <SectionWrapper section={section}>
      <div className="flex flex-col-reverse md:flex-row items-center min-h-[400px] md:min-h-[500px]">
        <div className={`flex-1 px-6 py-12 md:py-16 ${imgLeft ? "md:order-1" : "md:order-2"}`}
          style={{ flex: `${cw}%` }}>
          <div className={`max-w-lg mx-auto ${p.textAlignment === "center" ? "text-center" : p.textAlignment === "right" ? "text-right ml-auto" : ""}`}>
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl" style={{ color: p.textColor || "#18181b" }}>
              {p.headline || "Split Hero Title"}
            </h1>
            {p.subheadline && (
              <p className="mt-4 text-sm sm:text-base" style={{ color: p.textColor ? `${p.textColor}cc` : "#52525b" }}>
                {p.subheadline}
              </p>
            )}
            {p.buttonText && (
              <Link href={p.buttonLink || "#"}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-all">
                {p.buttonText}
              </Link>
            )}
          </div>
        </div>
        <div className={`flex-1 min-h-[300px] md:min-h-[500px] bg-cover bg-center ${imgLeft ? "md:order-2" : "md:order-1"}`}
          style={{ flex: `${100 - Number(cw)}%`, backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : undefined, backgroundColor: p.imageUrl ? undefined : "#f4f4f5" }}>
          {!p.imageUrl && (
            <div className="flex h-full items-center justify-center text-zinc-300 text-sm">Image</div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
