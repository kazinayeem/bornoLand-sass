"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  trend,
  trendPositive = true,
  icon: Icon,
  subtitle,
  className,
}: {
  title: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  icon?: LucideIcon;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-zinc-300 transition-all space-y-2",
        className
      )}
    >
      <div className="flex items-center justify-between text-zinc-500 text-xs">
        <span className="font-medium text-zinc-500">{title}</span>
        {Icon && <Icon className="h-4 w-4 text-zinc-400" />}
      </div>

      <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">{value}</p>

      {(trend || subtitle) && (
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-semibold ${
                trendPositive ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && <span className="text-zinc-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
