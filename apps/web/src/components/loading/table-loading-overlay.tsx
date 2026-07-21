"use client";

import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

type TableLoadingOverlayProps = {
  show?: boolean;
  label?: string;
  className?: string;
};

export function TableLoadingOverlay({
  show = false,
  label = "Loading",
  className,
}: TableLoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-apple-canvas/70 backdrop-blur-[2px] motion-reduce:backdrop-blur-none dark:bg-apple-surface-tile-2/70",
        className
      )}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <LoadingSpinner size="md" label={label} />
    </div>
  );
}
