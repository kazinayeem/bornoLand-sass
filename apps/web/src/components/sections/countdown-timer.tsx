"use client";

import { useState, useEffect } from "react";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";

export function CountdownTimer({ section }: { section: SectionData }) {
  const p = section.props;
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date(`${p.targetDate || "2026-12-31"}T${p.targetTime || "23:59:00"}`).getTime();
    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update(); const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [p.targetDate, p.targetTime]);

  const size = p.style || "large";
  const textSize = size === "small" ? "text-lg" : size === "medium" ? "text-2xl" : "text-3xl";
  const boxSize = size === "small" ? "p-2 min-w-[50px]" : size === "medium" ? "p-3 min-w-[65px]" : "p-4 min-w-[80px]";

  return (
    <SectionWrapper section={section}>
      <div className="px-4 text-center">
        <SectionTitle title={p.title || "Hurry! Offer Ends In"} subtitle="" textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className="mt-4 flex justify-center gap-3">
          {Object.entries(remaining).map(([key, val]) => (
            <div key={key} className={`${boxSize} rounded-xl border border-zinc-200 bg-white shadow-sm`}>
              <span className={`${textSize} font-bold text-apple-ink`}>{String(val).padStart(2, "0")}</span>
              {p.showLabels !== "false" && <p className="text-[10px] uppercase tracking-wider text-apple-ink-muted-48 mt-0.5">{key}</p>}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
