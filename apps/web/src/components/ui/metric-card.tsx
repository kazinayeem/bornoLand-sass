"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MetricCardProps = {
  title: string;
  value: string | number | React.ReactNode;
  subtitle?: string;
  change?: {
    value: number | string;
    trend?: "up" | "down" | "neutral";
    label?: string;
  };
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "subtle" | "primary" | "warning" | "success" | "danger";
  loading?: boolean;
  className?: string;
  onClick?: () => void;
};

const variantStyles: Record<string, string> = {
  default:
    "bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800 text-zinc-900 dark:text-white",
  subtle:
    "bg-zinc-50/70 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-900 dark:text-white",
  primary:
    "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/40 text-blue-950 dark:text-blue-100",
  warning:
    "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40 text-amber-950 dark:text-amber-100",
  success:
    "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-100",
  danger:
    "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40 text-rose-950 dark:text-rose-100",
};

export const MetricCard = memo(function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  iconClassName,
  badge,
  action,
  footer,
  variant = "default",
  loading = false,
  className,
  onClick,
}: MetricCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-7 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3.5 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
        </div>
      </div>
    );
  }

  const trend = change?.trend ?? (typeof change?.value === "number" ? (change.value > 0 ? "up" : change.value < 0 ? "down" : "neutral") : "neutral");

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border p-5 shadow-2xs transition-all duration-200",
        onClick && "cursor-pointer hover:border-zinc-300 hover:shadow-xs dark:hover:border-zinc-700",
        variantStyles[variant],
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              {title}
            </span>
            {badge}
          </div>
          <div className="flex items-center gap-1.5">
            {action}
            {Icon && (
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition-colors dark:bg-zinc-800 dark:text-zinc-300 group-hover:bg-zinc-200/70 dark:group-hover:bg-zinc-700/70",
                  iconClassName
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <div className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {value}
          </div>

          {change && (
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold",
                trend === "up" &&
                  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
                trend === "down" &&
                  "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
                trend === "neutral" &&
                  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              )}
            >
              {trend === "up" && <TrendingUp className="h-3 w-3" />}
              {trend === "down" && <TrendingDown className="h-3 w-3" />}
              {trend === "neutral" && <Minus className="h-3 w-3" />}
              <span>{change.value}</span>
              {change.label && (
                <span className="font-normal text-zinc-400 dark:text-zinc-500">
                  {change.label}
                </span>
              )}
            </div>
          )}
        </div>

        {subtitle && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        )}
      </div>

      {footer && (
        <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800/80">
          {footer}
        </div>
      )}
    </div>
  );
});
