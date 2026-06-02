"use client";

import Link from "next/link";
import { SectionWrapper, type SectionData } from "./section-renderer";

export function ImageHero({ section }: { section: SectionData }) {
  const p = section.props;
  return (
    <SectionWrapper section={section} className="min-h-[400px] md:min-h-[560px] flex items-center">
      <div className="mx-auto max-w-2xl px-4 text-center">
        {p.headline && <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl" style={{ color: p.textColor || "#ffffff" }}>{p.headline}</h1>}
        {p.subheadline && <p className="mt-4 text-sm sm:text-base text-white/80">{p.subheadline}</p>}
        {p.buttonText && (
          <Link href={p.buttonLink || "#"} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100">
            {p.buttonText}
          </Link>
        )}
      </div>
    </SectionWrapper>
  );
}
