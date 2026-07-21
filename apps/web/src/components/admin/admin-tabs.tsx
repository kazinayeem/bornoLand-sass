"use client";

import { cn } from "@/lib/utils";

export type AdminTab = {
  id: string;
  label: string;
  count?: number;
};

export function AdminTabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: AdminTab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-apple-canvas-parchment/80 p-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
            active === tab.id
              ? "bg-white text-apple-ink shadow-sm"
              : "text-apple-ink-muted-48 hover:text-zinc-800"
          )}
        >
          {tab.label}
          {typeof tab.count === "number" ? (
            <span className="ml-1.5 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-apple-ink-muted-80">
              {tab.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
