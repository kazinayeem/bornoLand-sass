"use client";

import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  label?: string;
};

const sizeMap = {
  xs: "h-3 w-3 border-[1.5px]",
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
};

export function LoadingSpinner({ size = "sm", className, label = "Loading" }: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-apple-primary/25 border-t-apple-primary motion-reduce:animate-none motion-reduce:border-apple-primary",
        sizeMap[size],
        className
      )}
    />
  );
}
