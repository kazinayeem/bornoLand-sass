"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_STYLES: Record<Tone, { icon: string; bg: string }> = {
  neutral: { icon: "text-apple-ink-muted-80", bg: "bg-apple-canvas-parchment" },
  success: { icon: "text-emerald-600", bg: "bg-emerald-50" },
  warning: { icon: "text-amber-600", bg: "bg-amber-50" },
  danger: { icon: "text-red-600", bg: "bg-red-50" },
  info: { icon: "text-blue-600", bg: "bg-blue-50" },
};

function Sparkline({ values, tone }: { values: number[]; tone: Tone }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 64;
  const h = 20;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * h;
      return `${x},${y}`;
    })
    .join(" ");
  const stroke =
    tone === "danger" ? "#dc2626" : tone === "warning" ? "#d97706" : tone === "info" ? "#2563eb" : "#16a34a";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0 opacity-80" aria-hidden>
      <polyline fill="none" stroke={stroke} strokeWidth="1.5" points={points} />
    </svg>
  );
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  changePct,
  sparkline,
  tone = "neutral",
  delay = 0,
  compact = false,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  changePct?: number | null;
  sparkline?: number[];
  tone?: Tone;
  delay?: number;
  compact?: boolean;
}) {
  const styles = TONE_STYLES[tone];
  const change =
    changePct == null || Number.isNaN(changePct)
      ? null
      : {
          text: `${changePct > 0 ? "+" : ""}${changePct.toFixed(1)}%`,
          up: changePct >= 0,
        };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className={cn(
        "rounded-xl border border-apple-hairline bg-white",
        compact ? "p-2.5" : "p-3",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", styles.bg)}>
          <Icon className={cn("h-3.5 w-3.5", styles.icon)} />
        </div>
        {sparkline && sparkline.length > 1 ? <Sparkline values={sparkline} tone={tone} /> : null}
      </div>
      <p className={cn("mt-2 font-semibold tabular-nums text-apple-ink", compact ? "text-sm" : "text-base")}>
        {value}
      </p>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wide text-apple-ink-muted-48">{label}</p>
        {change ? (
          <span
            className={cn(
              "text-[10px] font-medium tabular-nums",
              change.up ? "text-emerald-600" : "text-red-600",
            )}
          >
            {change.text}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
