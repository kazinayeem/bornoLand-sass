"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { SectionWrapper, type SectionData } from "./section-renderer";

export function FlashSaleHero({ section }: { section: SectionData }) {
  const p = section.props;
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    if (p.showTimer !== "true") return;
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
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [p.endDate, p.showTimer]);

  return (
    <SectionWrapper section={section} className="min-h-[500px] md:min-h-[600px] flex items-center">
      <div className="mx-auto max-w-2xl px-4 text-center">
        {p.discountLabel && (
          <span className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-1.5 text-sm font-bold text-white mb-4">
            <Zap className="h-4 w-4" /> {p.discountLabel}
          </span>
        )}
        <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl" style={{ color: p.textColor || "#ffffff" }}>{p.headline || "Flash Sale!"}</h1>
        {p.subheadline && <p className="mt-4 text-sm sm:text-lg text-white/80">{p.subheadline}</p>}
        {p.showTimer === "true" && (
          <div className="mt-6 flex justify-center gap-3">
            {Object.entries(timeLeft).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-black/30 backdrop-blur-sm px-4 py-3 min-w-[60px] border border-white/10">
                <span className="text-2xl font-bold text-white">{String(v).padStart(2, "0")}</span>
                <p className="text-[10px] uppercase tracking-wider text-white/60">{k}</p>
              </div>
            ))}
          </div>
        )}
        {p.buttonText && (
          <Link href={p.buttonLink || "#"} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white hover:bg-red-600 transition-all">
            {p.buttonText}
          </Link>
        )}
      </div>
    </SectionWrapper>
  );
}
