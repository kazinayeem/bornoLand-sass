import type { DataGridDensity } from "./types";

export const DATA_GRID_PAGE_SIZES = [10, 20, 50, 100] as const;

export const DATA_GRID_DEFAULT_PAGE_SIZE = 20;

export const DATA_GRID_SEARCH_DEBOUNCE_MS = 300;

export const DATA_GRID_VIRTUALIZATION_THRESHOLD = 50;

export const DATA_GRID_DENSITY_ROW_HEIGHT: Record<DataGridDensity, number> = {
  compact: 40,
  default: 52,
  comfortable: 64,
};

export const DATA_GRID_DENSITY_CELL_PADDING: Record<DataGridDensity, string> = {
  compact: "px-3 py-2",
  default: "px-4 py-3",
  comfortable: "px-4 py-4",
};
