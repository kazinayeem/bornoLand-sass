"use client";

import Link from "next/link";
import { Calculator, Play } from "lucide-react";

interface SidebarPosWidgetProps {
  basePath: string;
  isBn: boolean;
  onNavigate?: () => void;
}

export function SidebarPosWidget({
  basePath,
  isBn,
  onNavigate,
}: SidebarPosWidgetProps) {
  return (
    <div className="mx-1 mb-1.5 p-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-900 dark:border dark:border-zinc-800 shadow-2xs">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Calculator className="h-3.5 w-3.5 text-indigo-400" strokeWidth={1.75} />
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-300">
            {isBn ? "পিওএস টার্মিনাল" : "Quick POS"}
          </span>
        </div>
        <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isBn ? "লাইভ" : "Ready"}</span>
        </span>
      </div>

      <Link
        href={`${basePath}/pos`}
        onClick={onNavigate}
        className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-2xs"
      >
        <Play className="h-3 w-3 fill-white" />
        <span>{isBn ? "কাউন্টার খুলুন" : "Open POS"}</span>
      </Link>
    </div>
  );
}
