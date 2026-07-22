"use client";

import { memo } from "react";
import { AlignJustify, Rows3, StretchVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataGridDensity as Density } from "./types";

type DataGridDensityProps = {
  value: Density;
  onChange: (value: Density) => void;
};

const OPTIONS: { value: Density; label: string; icon: typeof Rows3 }[] = [
  { value: "compact", label: "Compact", icon: AlignJustify },
  { value: "default", label: "Default", icon: Rows3 },
  { value: "comfortable", label: "Comfortable", icon: StretchVertical },
];

function DataGridDensityInner({ value, onChange }: DataGridDensityProps) {
  return (
    <div className="inline-flex rounded-lg border border-apple-hairline bg-apple-canvas p-1">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors",
              value === option.value
                ? "bg-apple-canvas-parchment text-apple-ink"
                : "text-apple-ink-muted-48 hover:text-apple-ink",
            )}
            aria-label={option.label}
            title={option.label}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export const DataGridDensity = memo(DataGridDensityInner);
