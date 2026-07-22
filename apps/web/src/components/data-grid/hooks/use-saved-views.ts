"use client";

import { useCallback, useEffect, useState } from "react";
import type { DataGridSavedView } from "../types";

const STORAGE_PREFIX = "bornoland:data-grid:views:";

export function useSavedViews(storageKey?: string) {
  const [views, setViews] = useState<DataGridSavedView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { views: DataGridSavedView[]; activeViewId: string | null };
      setViews(parsed.views ?? []);
      setActiveViewId(parsed.activeViewId ?? null);
    } catch {
      setViews([]);
      setActiveViewId(null);
    }
  }, [storageKey]);

  const persist = useCallback(
    (nextViews: DataGridSavedView[], nextActiveId: string | null) => {
      if (!storageKey || typeof window === "undefined") return;
      localStorage.setItem(
        `${STORAGE_PREFIX}${storageKey}`,
        JSON.stringify({ views: nextViews, activeViewId: nextActiveId }),
      );
    },
    [storageKey],
  );

  const saveView = useCallback(
    (view: DataGridSavedView) => {
      setViews((prev) => {
        const next = [...prev.filter((item) => item.id !== view.id), view];
        persist(next, view.id);
        return next;
      });
      setActiveViewId(view.id);
    },
    [persist],
  );

  const deleteView = useCallback(
    (id: string) => {
      setViews((prev) => {
        const next = prev.filter((item) => item.id !== id);
        const nextActive = activeViewId === id ? null : activeViewId;
        persist(next, nextActive);
        return next;
      });
      if (activeViewId === id) setActiveViewId(null);
    },
    [activeViewId, persist],
  );

  const activeView = views.find((view) => view.id === activeViewId) ?? null;

  return { views, activeView, activeViewId, setActiveViewId, saveView, deleteView };
}
