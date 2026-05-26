"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { StorefrontSectionLike } from "./storefront-types";

function useCountdown(target: string) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) return setRemaining((p) => ({ ...p, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }));
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return remaining;
}

export function CountdownCampaign({ section }: { section?: StorefrontSectionLike }) {
  const props = section?.props ?? {};
  const title = (props.title as string) || "Big Sale Coming";
  const subtitle = (props.subtitle as string) || "";
  const targetDate = (props.targetDate as string) || "";
  const message = (props.message as string) || "Sale ends in:";
  const buttonText = (props.buttonText as string) || "";
  const buttonLink = (props.buttonLink as string) || "#";
  const bg = (props.backgroundColor as string) || "#0f172a";
  const textColor = (props.textColor as string) || "#f8fafc";
  const accent = (props.accentColor as string) || "#f59e0b";
  const remaining = useCountdown(targetDate);

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: bg, color: textColor }}>
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${accent}20`, color: accent }}>
          <Clock className="h-3.5 w-3.5" /> {message}
        </div>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl">{title}</h2>
        {subtitle && <p className="mt-2 text-base opacity-80">{subtitle}</p>}

        {targetDate && !remaining.expired && (
          <div className="mt-8 flex justify-center gap-4 sm:gap-6">
            {[
              { value: remaining.days, label: "Days" },
              { value: remaining.hours, label: "Hours" },
              { value: remaining.minutes, label: "Minutes" },
              { value: remaining.seconds, label: "Seconds" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:px-6 sm:py-4">
                <span className="text-3xl font-bold tabular-nums sm:text-4xl">{String(value).padStart(2, "0")}</span>
                <span className="mt-1 text-[10px] uppercase tracking-widest opacity-60">{label}</span>
              </div>
            ))}
          </div>
        )}

        {remaining.expired && (
          <p className="mt-6 text-lg font-semibold" style={{ color: accent }}>The sale has ended!</p>
        )}

        {buttonText && (
          <div className="mt-8">
            <Link href={buttonLink}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition hover:opacity-90"
              style={{ backgroundColor: accent, color: "#fff" }}>
              {buttonText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
