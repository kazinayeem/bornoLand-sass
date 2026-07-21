"use client";

import { useLoadingContext } from "@/providers/loading-provider";

/** Unified loading hook for navigation, actions, and CRUD feedback. */
export function useLoading() {
  return useLoadingContext();
}

/** @deprecated Use useLoading — kept for backward compatibility. */
export function useActionStatus() {
  const ctx = useLoadingContext();
  return {
    startAction: ctx.startAction,
    finishAction: ctx.finishAction,
    updateProgress: ctx.updateActionProgress,
    activeActions: ctx.actions,
    isActionRunning: ctx.isActionRunning,
    topProgress: ctx.navigationProgress,
    setTopProgress: () => {},
    startTopProgress: ctx.startNavigation,
    finishTopProgress: ctx.completeNavigation,
  };
}
