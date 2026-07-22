"use client";

import { memo } from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataGridFilterDefinition } from "./types";

type DataGridFiltersProps = {
  definitions: DataGridFilterDefinition[];
  values: Record<string, string | string[] | boolean | undefined>;
  onChange: (patch: Record<string, string | string[] | boolean | undefined>) => void;
  onReset: () => void;
};

function DataGridFiltersInner({ definitions, values, onChange, onReset }: DataGridFiltersProps) {
  const activeCount = Object.values(values).filter((value) => {
    if (value === undefined || value === "" || value === false) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }).length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {definitions.map((filter) => {
        if (filter.type === "select") {
          return (
            <label key={filter.id} className="inline-flex items-center gap-2 text-xs font-medium text-apple-ink-muted-80">
              <span className="hidden sm:inline">{filter.label}</span>
              <select
                value={String(values[filter.id] ?? "")}
                onChange={(e) => onChange({ [filter.id]: e.target.value || undefined })}
                className="h-10 rounded-lg border border-apple-hairline bg-apple-canvas px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-apple-primary-focus"
              >
                <option value="">{filter.placeholder ?? `All ${filter.label}`}</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          );
        }

        if (filter.type === "text") {
          return (
            <input
              key={filter.id}
              value={String(values[filter.id] ?? "")}
              onChange={(e) => onChange({ [filter.id]: e.target.value || undefined })}
              placeholder={filter.placeholder ?? filter.label}
              className="h-10 rounded-lg border border-apple-hairline bg-apple-canvas px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-apple-primary-focus"
            />
          );
        }

        return null;
      })}

      {activeCount > 0 ? (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-pill border border-apple-hairline px-3 py-2 text-xs font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
        >
          <X className="h-3.5 w-3.5" />
          Reset filters
          <span className="rounded-full bg-apple-canvas-parchment px-1.5 py-0.5 text-[10px]">{activeCount}</span>
        </button>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-apple-ink-muted-48">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </span>
      )}
    </div>
  );
}

export const DataGridFilters = memo(DataGridFiltersInner);
