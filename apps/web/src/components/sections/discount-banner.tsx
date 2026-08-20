"use client";

import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, type SectionData } from "./section-renderer";
import { ArrowRight, Tag } from "lucide-react";

export function DiscountBanner({ section }: { section: SectionData }) {
  const p = section.props;
  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-10 sm:px-12 sm:py-14 text-center shadow-xl shadow-blue-900/10">
          <div className="relative z-10 mx-auto max-w-2xl">
            {p.discountText && (
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                <Tag className="h-3.5 w-3.5 text-amber-300" />
                <span>{p.discountText}</span>
              </div>
            )}
            {p.headline && (
              <h2
                className="font-extrabold tracking-tight text-white leading-tight"
                style={{
                  color: p.textColor || "#ffffff",
                  fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                }}
              >
                {p.headline}
              </h2>
            )}
            {p.subheadline && (
              <p className="mt-3 text-sm sm:text-base md:text-lg text-white/85 max-w-xl mx-auto leading-relaxed">
                {p.subheadline}
              </p>
            )}
            {p.buttonText && (
              <div className="mt-6 flex justify-center">
                <Link
                  href={p.buttonLink || "#"}
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm sm:text-base font-semibold text-zinc-900 shadow-md transition-all duration-200 hover:scale-105 hover:bg-zinc-50 active:scale-95"
                >
                  <span>{p.buttonText}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

