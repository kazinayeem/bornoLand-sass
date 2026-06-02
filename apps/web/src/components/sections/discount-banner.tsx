"use client";

import Link from "next/link";
import { SectionWrapper, type SectionData } from "./section-renderer";

export function DiscountBanner({ section }: { section: SectionData }) {
  const p = section.props;
  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-2xl px-4 text-center">
        {p.discountText && (
          <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-bold text-white mb-3">{p.discountText}</span>
        )}
        {p.headline && <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl" style={{ color: p.textColor || "#ffffff" }}>{p.headline}</h2>}
        {p.subheadline && <p className="mt-2 text-sm text-white/80">{p.subheadline}</p>}
        {p.buttonText && (
          <Link href={p.buttonLink || "#"} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100">
            {p.buttonText}
          </Link>
        )}
      </div>
    </SectionWrapper>
  );
}
