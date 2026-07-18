"use client";

import { useState, useEffect } from "react";
import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, type SectionData } from "./section-renderer";

export function DealOfDay({ section }: { section: SectionData }) {
  const p = section.props;
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const target = new Date(p.endDate || "2026-12-31").getTime();
    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update(); const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [p.endDate]);

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="flex-1">
            <div className="aspect-square max-w-sm mx-auto rounded-2xl bg-zinc-100 overflow-hidden">
              {p.productImage ? (
                <img src={p.productImage} alt={p.productName || "Product"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-300">Product Image</div>
              )}
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: p.textColor || "#18181b" }}>{p.title || "Deal of the Day"}</h2>
            {p.productName && <p className="mt-2 text-lg font-semibold text-zinc-600">{p.productName}</p>}
            <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
              {p.price && <span className="text-3xl font-bold text-red-600">{p.price}</span>}
              {p.originalPrice && <span className="text-lg text-zinc-400 line-through">{p.originalPrice}</span>}
            </div>
            <div className="mt-4 flex justify-center md:justify-start gap-2">
              {Object.entries(timeLeft).map(([k, v]) => (
                <div key={k} className="rounded-lg bg-zinc-100 px-3 py-2 min-w-[50px] text-center">
                  <span className="text-lg font-bold text-zinc-900">{String(v).padStart(2, "0")}</span>
                  <p className="text-[10px] uppercase text-zinc-500">{k}</p>
                </div>
              ))}
            </div>
            {p.buttonText && (
              <Link href={p.buttonLink || "#"} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700">
                {p.buttonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
