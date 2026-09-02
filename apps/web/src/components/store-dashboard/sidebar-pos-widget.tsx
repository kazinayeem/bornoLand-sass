"use client";

import Link from "next/link";
import { Calculator, Play, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="mx-2 mb-2 p-2.5 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md border border-indigo-700/40">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
            <Calculator className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
            {isBn ? "পিওএস টার্মিনাল" : "Retail POS"}
          </span>
        </div>
        <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isBn ? "সক্রিয়" : "Online"}</span>
        </span>
      </div>

      <p className="text-[11px] text-zinc-300 mb-2.5 leading-snug">
        {isBn
          ? "কাউন্টার বিক্রয় ও দ্রুত ক্যাশ চেকআউট টার্মিনাল।"
          : "Instant counter checkout & receipt printer."}
      </p>

      <Link
        href={`${basePath}/pos`}
        onClick={onNavigate}
        className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs transition-colors shadow-xs"
      >
        <Play className="h-3.5 w-3.5 fill-white" />
        <span>{isBn ? "টার্মিনাল খুলুন" : "Open POS Terminal"}</span>
      </Link>
    </div>
  );
}
