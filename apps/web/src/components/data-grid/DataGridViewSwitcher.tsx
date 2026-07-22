"use client";

import { memo } from "react";
import { LayoutGrid, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataGridViewMode } from "./types";

type DataGridViewSwitcherProps = {
  value: DataGridViewMode;
  onChange: (value: DataGridViewMode) => void;
};

function DataGridViewSwitcherInner({ value, onChange }: DataGridViewSwitcherProps) {
  return (
    <div className="inline-flex rounded-lg border border-apple-hairline bg-apple-canvas p-1">
      {([
        { value: "table", label: "Table", icon: Table2 },
        { value: "card", label: "Cards", icon: LayoutGrid },
      ] as const).map((option) => {
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
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export const DataGridViewSwitcher = memo(DataGridViewSwitcherInner);
