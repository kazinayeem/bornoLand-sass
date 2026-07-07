"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size = "sm" | "default" | "lg" | "xl";

type LoadingButtonProps = {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2",
  secondary:
    "border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-300",
  outline:
    "border-2 border-zinc-200 bg-transparent text-zinc-700 hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 rounded-lg px-3 text-xs gap-1.5",
  default: "h-10 rounded-xl px-4 text-sm gap-2",
  lg: "h-12 rounded-xl px-5 text-sm gap-2",
  xl: "h-14 rounded-2xl px-6 text-base gap-2.5",
};

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      loading = false,
      loadingText,
      children,
      icon,
      variant = "primary",
      size = "default",
      fullWidth = false,
      className,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          loading && "cursor-wait",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            {loadingText || children}
          </>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";
