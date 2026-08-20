import type { Breakpoint } from "@/lib/builder-types";

const COL_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

function clampColumns(value: string | number | undefined, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(6, Math.max(1, Math.round(n)));
}

/** Responsive grid for builder section ColumnGrid (mobile-first). */
export function sectionColumnGridClass(columns: string | undefined, gap = "16"): { grid: string; gap: string } {
  const n = clampColumns(columns, 4);
  const gapMap: Record<string, string> = {
    "4": "gap-1",
    "8": "gap-2",
    "16": "gap-4",
    "24": "gap-6",
    "32": "gap-8",
  };

  let grid: string;
  if (n <= 1) grid = "grid-cols-1";
  else if (n === 2) grid = "grid-cols-1 sm:grid-cols-2";
  else if (n === 3) grid = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  else if (n === 4) grid = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  else if (n === 5) grid = "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5";
  else grid = "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6";

  return { grid, gap: gapMap[gap] || "gap-4" };
}

export function productGridClass(columns: string, view: "grid" | "list", device?: Breakpoint): string {
  if (view === "list") return "grid-cols-1";
  const n = clampColumns(columns, 4);

  if (device === "mobile") return "grid-cols-2";
  if (device === "tablet") return "grid-cols-2 sm:grid-cols-3";

  if (n <= 1) return "grid-cols-1";
  if (n === 2) return "grid-cols-1 sm:grid-cols-2";
  if (n === 3) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3";
  if (n === 4) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  if (n === 5) return "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5";
  return "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6";
}


/** Footer column layout by device. */
export function footerGridClass(device: Breakpoint, columns: number): string {
  if (device === "mobile") return "grid-cols-1";
  if (device === "tablet") return "grid-cols-2";
  const n = clampColumns(columns, 4);
  return COL_CLASS[n] || "grid-cols-4";
}
