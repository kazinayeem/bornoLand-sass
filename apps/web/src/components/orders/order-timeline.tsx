"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildOrderTimeline,
  formatTimelineDate,
  type TimelineEventLike,
} from "@/lib/orders/timeline";

type OrderTimelineProps = {
  status: string;
  paymentStatus?: string;
  timeline?: TimelineEventLike[];
  className?: string;
  accentColor?: string;
  compact?: boolean;
};

export function OrderTimeline({
  status,
  paymentStatus,
  timeline,
  className,
  accentColor = "#0066cc",
  compact = false,
}: OrderTimelineProps) {
  const steps = buildOrderTimeline(timeline, status, paymentStatus);

  return (
    <ol className={cn("space-y-0", className)} aria-label="Order timeline">
      {steps.map((step, index) => {
        const stamp = formatTimelineDate(step.at);
        const isLast = index === steps.length - 1;
        const done = step.state === "done" || step.state === "current";
        const cancelled = step.state === "cancelled";

        return (
          <li key={`${step.key}-${index}`} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast ? (
              <span
                className="absolute left-[11px] top-7 bottom-0 w-px"
                style={{
                  backgroundColor:
                    step.state === "done" || step.state === "current"
                      ? accentColor
                      : cancelled
                        ? "#fca5a5"
                        : "#e0e0e0",
                }}
                aria-hidden
              />
            ) : null}

            <div
              className={cn(
                "relative z-[1] mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                cancelled && "border-red-400 bg-red-50 text-red-600",
                step.state === "done" && "border-transparent text-white",
                step.state === "current" && "border-transparent text-white ring-4 ring-opacity-20",
                step.state === "upcoming" && "border-apple-hairline bg-apple-canvas text-transparent",
              )}
              style={
                step.state === "done" || step.state === "current"
                  ? { backgroundColor: accentColor, borderColor: accentColor, ["--tw-ring-color" as string]: accentColor }
                  : undefined
              }
            >
              {step.state === "upcoming" ? (
                <Circle className="h-2.5 w-2.5 text-apple-ink-muted-48" />
              ) : (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              )}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <p
                  className={cn(
                    "text-[14px] font-semibold",
                    cancelled ? "text-red-600" : "text-apple-ink",
                    step.state === "upcoming" && "text-apple-ink-muted-48",
                  )}
                >
                  {step.label}
                </p>
                {step.state === "current" ? (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    Current
                  </span>
                ) : null}
                {step.state === "upcoming" && index === steps.findIndex((s) => s.state === "upcoming") ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-apple-ink-muted-48">
                    Upcoming
                  </span>
                ) : null}
              </div>

              {stamp ? (
                <p className={cn("mt-0.5 text-[12px] text-apple-ink-muted-48", compact && "text-[11px]")}>
                  {stamp.date}
                  <span className="mx-1.5 text-apple-hairline">·</span>
                  {stamp.time}
                </p>
              ) : step.state === "upcoming" ? (
                <p className="mt-0.5 text-[12px] text-apple-ink-muted-48">Not started</p>
              ) : null}

              {!compact && step.by && step.by !== "system" ? (
                <p className="mt-0.5 text-[11px] text-apple-ink-muted-48">Updated by {step.by}</p>
              ) : null}
              {!compact && step.note ? (
                <p className="mt-1 text-[12px] leading-5 text-apple-ink-muted-80">{step.note}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
