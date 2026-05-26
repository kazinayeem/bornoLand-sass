"use client";

import { useEffect, useRef, useState } from "react";
import type { StorefrontSectionLike } from "./storefront-types";

type Stat = { label: string; value: string };

function AnimatedCounter({ value, duration = 1500 }: { value: string; duration?: number }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  const numVal = parseInt(value.replace(/[^0-9]/g, ""));
  const suffix = value.replace(/[0-9]/g, "");
  const isNumeric = !isNaN(numVal);

  useEffect(() => {
    if (!isNumeric || counted.current) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(progress * numVal);
            setDisplay(`${current}${suffix}`);
            if (progress < 1) requestAnimationFrame(step);
            else setDisplay(value);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isNumeric, numVal, suffix, duration, value]);

  if (!isNumeric) return <>{value}</>;
  return <span ref={ref}>{display}</span>;
}

export function StatsCounter({ section }: { section?: StorefrontSectionLike }) {
  const props = section?.props ?? {};
  const title = (props.title as string) || "Our Numbers";
  const subtitle = (props.subtitle as string) || "";
  const bg = (props.backgroundColor as string) || "#18181b";
  const textColor = (props.textColor as string) || "#fafafa";
  const accent = (props.accentColor as string) || "#f59e0b";

  const stats: Stat[] = [
    { label: (props.stat1label as string) || "Products", value: (props.stat1value as string) || "10K+" },
    { label: (props.stat2label as string) || "Customers", value: (props.stat2value as string) || "50K+" },
    { label: (props.stat3label as string) || "Reviews", value: (props.stat3value as string) || "25K+" },
    { label: (props.stat4label as string) || "Countries", value: (props.stat4value as string) || "30+" },
  ];

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: bg, color: textColor }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm opacity-60">{subtitle}</p>}
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold tabular-nums sm:text-5xl" style={{ color: accent }}>
                <AnimatedCounter value={stat.value} />
              </div>
              <p className="mt-2 text-sm opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
