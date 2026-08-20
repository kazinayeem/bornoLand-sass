import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { getContrastColor } from "@/lib/color-utils";
import { LoadingSpinner } from "@/components/loading/loading-spinner";
import { LOADING_LABELS, type LoadingLabelKey } from "@/lib/loading/constants";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-body text-sm font-medium transition-all duration-[var(--duration-fast)] ease-[var(--ease-apple)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 btn-press shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-apple-ink text-apple-on-primary rounded-pill px-5 py-2.5 hover:bg-apple-ink/90 active:scale-[0.98] shadow-sm",
        outline:
          "border border-apple-hairline bg-apple-canvas text-apple-ink rounded-pill px-5 py-2.5 hover:bg-apple-canvas-parchment hover:border-zinc-300 active:scale-[0.98]",
        secondary:
          "border border-apple-hairline bg-apple-canvas text-apple-ink rounded-pill px-5 py-2.5 hover:bg-apple-canvas-parchment hover:border-zinc-300 active:scale-[0.98]",
        ghost:
          "bg-transparent text-apple-ink rounded-pill px-4 py-2 hover:bg-apple-canvas-parchment active:scale-[0.98]",
        dark:
          "bg-apple-ink text-apple-on-dark rounded-pill px-5 py-2.5 hover:bg-apple-ink/90 active:scale-[0.98]",
        danger:
          "bg-destructive text-destructive-foreground rounded-pill px-5 py-2.5 hover:bg-destructive-hover focus-visible:ring-destructive active:scale-[0.98] shadow-sm",
        success:
          "bg-success text-success-foreground rounded-pill px-5 py-2.5 hover:bg-success-hover focus-visible:ring-success active:scale-[0.98] shadow-sm",
        link: "text-primary underline-offset-4 hover:underline bg-transparent p-0 rounded-none h-auto min-h-0",
        hero:
          "bg-apple-ink text-apple-on-primary rounded-pill px-7 py-3 text.base font-medium hover:bg-apple-ink/90 active:scale-[0.98] shadow-md",
        pearl:
          "bg-apple-canvas text-apple-ink rounded-apple-md px-3.5 py-2 text-caption border border-apple-hairline hover:bg-apple-canvas-parchment",
      },
      size: {
        default: "h-11 min-h-[44px]",
        sm: "h-9 min-h-[36px] rounded-apple-pill px-3.5 text-caption",
        lg: "h-12 min-h-[48px] rounded-pill px-7 text-base",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px] rounded-full p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  loadingKey?: LoadingLabelKey;
  themeColor?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      loadingText,
      loadingKey,
      disabled,
      children,
      type = "button",
      themeColor,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Resolve loading display text safely
    const fallbackText = typeof children === "string" ? children : undefined;
    const resolvedLoadingText =
      loadingText ?? (loadingKey ? LOADING_LABELS[loadingKey] : undefined) ?? fallbackText ?? "Loading…";

    const resolvedStyle: React.CSSProperties | undefined = themeColor
      ? {
        ...style,
        backgroundColor: themeColor,
        color: style?.color ?? getContrastColor(themeColor),
      }
      : style;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          buttonVariants({ variant, size, className }),
          loading && "cursor-wait opacity-80"
        )}
        style={resolvedStyle}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" className="shrink-0" />
            <span>{resolvedLoadingText}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

