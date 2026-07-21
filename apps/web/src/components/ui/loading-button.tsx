"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";
import { LOADING_LABELS, type LoadingLabelKey } from "@/lib/loading/constants";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size = "sm" | "default" | "lg" | "xl";

type LoadingButtonProps = {
  loading?: boolean;
  loadingText?: string;
  loadingKey?: LoadingLabelKey;
  children: ReactNode;
  icon?: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const variantMap: Record<Variant, ButtonProps["variant"]> = {
  primary: "default",
  secondary: "secondary",
  danger: "danger",
  ghost: "ghost",
  outline: "outline",
};

const sizeMap: Record<Size, ButtonProps["size"]> = {
  sm: "sm",
  default: "default",
  lg: "lg",
  xl: "lg",
};

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      loading = false,
      loadingText,
      loadingKey,
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
    return (
      <Button
        ref={ref}
        type={type}
        variant={variantMap[variant]}
        size={sizeMap[size]}
        loading={loading}
        loadingText={loadingText ?? (loadingKey ? LOADING_LABELS[loadingKey] : undefined)}
        disabled={disabled}
        className={cn(fullWidth && "w-full", className)}
        {...props}
      >
        {!loading && icon ? (
          <>
            <span className="shrink-0">{icon}</span>
            {children}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";
