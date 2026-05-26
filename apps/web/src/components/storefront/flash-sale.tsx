"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/providers/tenant-provider";
import { ProductCard } from "./product-card";
import { Zap } from "lucide-react";
import type { StorefrontSectionLike } from "./storefront-types";

function useCountdown(target: string) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) return setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return remaining;
}

function TimerBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold tabular-nums sm:text-3xl">{String(value).padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>
    </div>
  );
}

export function FlashSale({ section }: { section?: StorefrontSectionLike }) {
  const { products } = useTenant();
  const props = section?.props ?? {};
  const title = (props.title as string) || "Flash Sale";
  const subtitle = (props.subtitle as string) || "";
  const endDate = (props.endDate as string) || "";
  const bg = (props.backgroundColor as string) || "#fef2f2";
  const textColor = (props.textColor as string) || "#991b1b";
  const accent = (props.accentColor as string) || "#dc2626";
  const remaining = useCountdown(endDate);

  const displayProducts = products.filter((p) => p.status === "active").slice(0, 4);

  return (
    <section className="py-12 sm:py-16" style={{ backgroundColor: bg }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center" style={{ color: textColor }}>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${accent}18`, color: accent }}>
            <Zap className="h-3.5 w-3.5" /> Limited Time
          </div>
          <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm opacity-80">{subtitle}</p>}
        </div>

        {endDate && (
          <div className="mt-6 flex justify-center gap-4" style={{ color: textColor }}>
            <TimerBlock value={remaining.days} label="Days" />
            <TimerBlock value={remaining.hours} label="Hrs" />
            <TimerBlock value={remaining.minutes} label="Min" />
            <TimerBlock value={remaining.seconds} label="Sec" />
          </div>
        )}

        {displayProducts.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {displayProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}
