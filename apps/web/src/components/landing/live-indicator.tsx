"use client";

import { cn } from "@/lib/utils";

export function LiveIndicator({
  label = "Live",
  sublabel,
  className,
}: {
  label?: string;
  sublabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800 backdrop-blur-xs",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
      </span>
      <span>{label}</span>
      {sublabel && <span className="text-emerald-600/80 font-normal">· {sublabel}</span>}
    </div>
  );
}
