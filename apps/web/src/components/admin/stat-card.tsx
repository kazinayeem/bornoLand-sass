"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

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

const iconVariants = {
  default: "bg-primary text-primary-foreground",
  blue: "bg-primary text-primary-foreground",
  green: "bg-emerald-600 text-white",
  amber: "bg-amber-600 text-white",
  purple: "bg-violet-600 text-white"
};

export function StatCard({ title, value, change, icon: Icon, variant = "default", prefix, suffix, delay = 0 }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              {prefix && <span className="text-sm font-medium text-muted-foreground">{prefix}</span>}
              <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{value}</span>
              {suffix && <span className="text-sm font-medium text-muted-foreground">{suffix}</span>}
            </div>
            {change !== undefined && (
              <div className={cn("flex items-center gap-1 text-xs font-semibold", isPositive ? "text-emerald-600" : "text-destructive")}>
                <span>{isPositive ? "↑" : "↓"}</span>
                <span>{Math.abs(change)}%</span>
                <span className="font-normal text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl shadow-sm", iconVariants[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
