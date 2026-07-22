"use client";

import { useEffect, useState } from "react";
import { DATA_GRID_SEARCH_DEBOUNCE_MS } from "../constants";

export function useDebouncedGridSearch(value: string, delayMs = DATA_GRID_SEARCH_DEBOUNCE_MS) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
