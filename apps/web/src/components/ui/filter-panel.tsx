"use client";

import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterConfig = {
  key: string;
  label: string;
  type: "select" | "date-range" | "boolean";
  options?: FilterOption[];
};

type FilterPanelProps = {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  className?: string;
};

export function FilterPanel({ filters, values, onChange, onClear, className }: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const hasActiveFilters = Object.values(values).some((v) => v && v !== "");

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {hasActiveFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
            {Object.values(values).filter((v) => v && v !== "").length}
          </span>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 text-zinc-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1.5 w-72 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-900">Filters</span>
            {hasActiveFilters && (
              <button onClick={onClear} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                Clear all
              </button>
            )}
          </div>
          <div className="space-y-3">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="mb-1 block text-xs font-medium text-zinc-500">{filter.label}</label>
                {filter.type === "select" && (
                  <select
                    value={values[filter.key] || ""}
                    onChange={(e) => onChange(filter.key, e.target.value)}
                    className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-blue-400"
                  >
                    <option value="">All</option>
                    {filter.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
                {filter.type === "boolean" && (
                  <select
                    value={values[filter.key] || ""}
                    onChange={(e) => onChange(filter.key, e.target.value)}
                    className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-blue-400"
                  >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                )}
                {filter.type === "date-range" && (
                  <input
                    type="date"
                    value={values[filter.key] || ""}
                    onChange={(e) => onChange(filter.key, e.target.value)}
                    className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-blue-400"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
