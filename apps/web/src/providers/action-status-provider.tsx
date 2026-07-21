"use client";

/**
 * @deprecated Import from `@/providers/loading-provider` or `@/hooks/use-loading` instead.
 */
export { LoadingProvider as ActionStatusProvider, ProgressModal } from "@/providers/loading-provider";
export { useActionStatus } from "@/hooks/use-loading";
export { NavigationProgressBar as TopProgressBar } from "@/components/loading/navigation-progress-bar";

export function ActionStatusBar() {
  return null;
}
