"use client";

import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

type InlineLoadingProps = {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  minHeight?: string;
};

export function InlineLoading({
  label = "Loading…",
  className,
  size = "md",
  minHeight = "min-h-[320px]",
}: InlineLoadingProps) {
  return (
    <div
      className={cn("flex items-center justify-center p-8", minHeight, className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <LoadingSpinner size={size} label={label} />
        <p className="text-caption text-apple-ink-muted-48">{label}</p>
      </div>
    </div>
  );
}
