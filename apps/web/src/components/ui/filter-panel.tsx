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
        className="inline-flex items-center gap-2 rounded-sm border border-apple-hairline bg-apple-canvas px-3.5 py-2 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {hasActiveFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-apple-ink text-[10px] font-bold text-apple-on-primary">
            {Object.values(values).filter((v) => v && v !== "").length}
          </span>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 text-apple-ink-muted-48 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1.5 w-72 rounded-lg border border-apple-hairline bg-apple-canvas p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-apple-ink">Filters</span>
            {hasActiveFilters && (
              <button onClick={onClear} className="text-xs font-medium text-apple-primary hover:text-apple-primary-focus">
                Clear all
              </button>
            )}
          </div>
          <div className="space-y-3">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="mb-1 block text-xs font-medium text-apple-ink-muted-48">{filter.label}</label>
                {filter.type === "select" && (
                  <select
                    value={values[filter.key] || ""}
                    onChange={(e) => onChange(filter.key, e.target.value)}
                    className="h-9 w-full rounded-sm border border-apple-hairline bg-apple-canvas px-3 text-sm text-apple-ink outline-none focus:border-apple-primary"
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
                    className="h-9 w-full rounded-sm border border-apple-hairline bg-apple-canvas px-3 text-sm text-apple-ink outline-none focus:border-apple-primary"
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
                    className="h-9 w-full rounded-sm border border-apple-hairline bg-apple-canvas px-3 text-sm text-apple-ink outline-none focus:border-apple-primary"
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
