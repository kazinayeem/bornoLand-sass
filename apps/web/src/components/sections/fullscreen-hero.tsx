"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SectionWrapper, type SectionData } from "./section-renderer";

export function FullscreenHero({ section }: { section: SectionData }) {
  const p = section.props;
  return (
    <SectionWrapper section={section} className="min-h-screen flex items-center">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl" style={{ color: p.textColor || "#ffffff" }}>{p.headline || "Bold Statement"}</h1>
        {p.subheadline && <p className="mt-4 text-sm sm:text-lg text-white/80">{p.subheadline}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {p.buttonText && (
            <Link href={p.buttonLink || "#"} className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100">
              {p.buttonText}
            </Link>
          )}
          {p.secondaryButtonText && (
            <Link href={p.secondaryButtonLink || "#"} className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10">
              {p.secondaryButtonText}
            </Link>
          )}
        </div>
        {p.showScrollIndicator !== "false" && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6 text-white/60" />
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
