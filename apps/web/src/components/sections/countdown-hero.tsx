"use client";

import { useState, useEffect } from "react";
import { BuilderLink as Link } from "./builder-link";
import { SectionWrapper, type SectionData } from "./section-renderer";

function useCountdown(target: string) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const update = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) return;
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [target]);
  return remaining;
}

export function CountdownHero({ section }: { section: SectionData }) {
  const p = section.props;
  const target = `${p.targetDate || "2026-12-31"}T${p.targetTime || "23:59:00"}`;
  const cd = useCountdown(target);

  return (
    <SectionWrapper section={section} className="min-h-[500px] md:min-h-[600px] flex items-center">
      <div className="mx-auto max-w-2xl px-4 text-center">
        {p.headline && <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{p.headline}</h1>}
        {p.subheadline && <p className="mt-4 text-sm text-white/80">{p.subheadline}</p>}
        <div className="mt-8 flex justify-center gap-4">
          {Object.entries(cd).map(([key, val]) => (
            <div key={key} className="flex flex-col items-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-5 py-4 min-w-[80px]">
              <span className="text-3xl font-bold text-white">{String(val).padStart(2, "0")}</span>
              <span className="text-xs uppercase tracking-wider text-white/60 mt-1">{key}</span>
            </div>
          ))}
        </div>
        {p.buttonText && (
          <Link href={p.buttonLink || "#"} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100">
            {p.buttonText}
          </Link>
        )}
      </div>
    </SectionWrapper>
  );
}
