"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  variant?: "default" | "blue" | "green" | "amber" | "purple";
  prefix?: string;
  suffix?: string;
  delay?: number;
}

const variants = {
  default: "bg-white border-zinc-200",
  blue: "bg-blue-50/50 border-blue-200",
  green: "bg-emerald-50/50 border-emerald-200",
  amber: "bg-amber-50/50 border-amber-200",
  purple: "bg-purple-50/50 border-purple-200"
};

const iconVariants = {
  default: "bg-blue-600 text-white",
  blue: "bg-blue-600 text-white",
  green: "bg-emerald-600 text-white",
  amber: "bg-amber-600 text-white",
  purple: "bg-purple-600 text-white"
};

export function StatCard({ title, value, change, icon: Icon, variant = "default", prefix, suffix, delay = 0 }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        variants[variant]
      )}
    >
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-blue-500/5 to-transparent" />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wide text-zinc-500">{title}</p>
          <div className="flex items-baseline gap-1.5">
            {prefix && <span className="text-sm text-zinc-400">{prefix}</span>}
            <span className="text-3xl font-bold tracking-tight text-zinc-900">{value}</span>
            {suffix && <span className="text-sm text-zinc-400">{suffix}</span>}
          </div>
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 text-sm font-medium", isPositive ? "text-emerald-600" : "text-red-600")}>
              <span>{isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(change)}%</span>
              <span className="font-normal text-zinc-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconVariants[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
