import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { getContrastColor } from "@/lib/color-utils";
import { LoadingSpinner } from "@/components/loading/loading-spinner";
import { LOADING_LABELS, type LoadingLabelKey } from "@/lib/loading/constants";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-body transition-all duration-[var(--duration-fast)] ease-[var(--ease-apple)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 btn-press",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground rounded-pill px-[22px] py-[11px] text-[17px] font-normal leading-[1.47] tracking-[-0.374px] hover:bg-primary-hover",
        outline:
          "border border-primary bg-transparent text-primary rounded-pill px-[22px] py-[11px] text-[17px] font-normal leading-[1.47] tracking-[-0.374px] hover:bg-primary/5",
        secondary:
          "bg-secondary text-secondary-foreground rounded-pill px-[22px] py-[11px] text-[17px] font-normal leading-[1.47] tracking-[-0.374px] border-[3px] border-border hover:bg-border/50",
        ghost:
          "text-foreground hover:bg-muted rounded-pill px-[22px] py-[11px] text-[17px] font-normal leading-[1.47] tracking-[-0.374px]",
        dark:
          "bg-apple-ink text-apple-on-dark rounded-pill px-[22px] py-[11px] text-[17px] font-normal leading-[1.47] tracking-[-0.374px] dark:bg-apple-surface-tile-3 dark:text-apple-body-on-dark",
        danger:
          "bg-destructive text-destructive-foreground rounded-pill px-[22px] py-[11px] text-[17px] font-normal hover:bg-destructive-hover focus-visible:ring-destructive",
        success:
          "bg-success text-success-foreground rounded-pill px-[22px] py-[11px] text-[17px] font-normal hover:bg-success-hover focus-visible:ring-success",
        link: "text-primary underline-offset-4 hover:underline bg-transparent p-0 rounded-none h-auto min-h-0",
        hero:
          "bg-primary text-primary-foreground rounded-pill px-7 py-[14px] text-[18px] font-light leading-none hover:bg-primary-hover",
        pearl:
          "bg-secondary text-secondary-foreground rounded-apple-md px-[14px] py-2 text-caption border-[3px] border-border",
      },
      size: {
        default: "h-11 min-h-[44px]",
        sm: "h-9 min-h-[36px] rounded-apple-sm px-3 text-caption",
        lg: "h-12 min-h-[48px] rounded-pill px-7",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px] rounded-full p-0",
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
    const label =
      loadingText ?? (loadingKey ? LOADING_LABELS[loadingKey] : undefined) ?? children;

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
          loading && "cursor-wait"
        )}
        style={resolvedStyle}
        {...props}
      >
        {loading ? (
          <>
            <span className="invisible inline-flex items-center justify-center gap-2">
              {children}
            </span>
            <span className="absolute inset-0 inline-flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              <span>{label}</span>
            </span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
