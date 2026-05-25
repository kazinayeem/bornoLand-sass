"use client";

import { useTenant } from "@/providers/tenant-provider";

export function ProductSkeleton() {
  const { theme } = useTenant();
  const { darkMode } = theme;
  const isDark = darkMode;

  return (
    <div className="animate-pulse rounded-2xl border overflow-hidden"
      style={{ borderColor: isDark ? "#27272a" : "#e4e4e7", backgroundColor: isDark ? "#18181b" : "#ffffff" }}>
      <div className="aspect-square" style={{ backgroundColor: isDark ? "#27272a" : "#f4f4f5" }} />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 rounded" style={{ backgroundColor: isDark ? "#27272a" : "#f4f4f5" }} />
        <div className="h-4 w-3/4 rounded" style={{ backgroundColor: isDark ? "#27272a" : "#f4f4f5" }} />
        <div className="h-3 w-1/2 rounded" style={{ backgroundColor: isDark ? "#27272a" : "#f4f4f5" }} />
        <div className="flex items-center justify-between">
          <div className="h-5 w-16 rounded" style={{ backgroundColor: isDark ? "#27272a" : "#f4f4f5" }} />
          <div className="h-3 w-12 rounded" style={{ backgroundColor: isDark ? "#27272a" : "#f4f4f5" }} />
        </div>
        <div className="h-8 w-full rounded-xl" style={{ backgroundColor: isDark ? "#27272a" : "#f4f4f5" }} />
      </div>
    </div>
  );
}
