import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { getContrastColor } from "@/lib/color-utils";
import { LoadingSpinner } from "@/components/loading/loading-spinner";
import { LOADING_LABELS, type LoadingLabelKey } from "@/lib/loading/constants";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-body text-[15px] font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003399] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-[#DFDFDF] disabled:text-[#767676] disabled:border-transparent shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#003399] text-white hover:bg-[#002B80] active:bg-[#002266] rounded-[4px] px-5 py-2.5 shadow-[0_1px_2px_rgba(0,51,153,0.1)]",
        primary:
          "bg-[#003399] text-white hover:bg-[#002B80] active:bg-[#002266] rounded-[4px] px-5 py-2.5 shadow-[0_1px_2px_rgba(0,51,153,0.1)]",
        secondary:
          "border-2 border-[#003399] bg-white text-[#003399] hover:bg-[#F5F5F5] active:bg-[#EAEAEA] rounded-[4px] px-5 py-2.5 dark:bg-transparent dark:text-white dark:border-white",
        yellow:
          "bg-[#FFDA1A] text-[#111111] hover:bg-[#f5d000] active:bg-[#e6c400] rounded-[4px] px-5 py-2.5 font-bold shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        cta:
          "bg-[#FFDA1A] text-[#111111] hover:bg-[#f5d000] active:bg-[#e6c400] rounded-[4px] px-5 py-2.5 font-bold shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        outline:
          "border border-[#DFDFDF] bg-white text-[#111111] hover:bg-[#F5F5F5] rounded-[4px] px-5 py-2.5 dark:bg-[#18181b] dark:border-[#27272a] dark:text-white dark:hover:bg-[#27272a]",
        ghost:
          "bg-transparent text-[#111111] hover:bg-[#F5F5F5] rounded-[4px] px-4 py-2 dark:text-white dark:hover:bg-[#18181b]",
        dark:
          "bg-[#111111] text-white hover:bg-[#222222] rounded-[4px] px-5 py-2.5",
        danger:
          "bg-[#CC0008] text-white hover:bg-[#b00007] focus-visible:ring-[#CC0008] rounded-[4px] px-5 py-2.5 shadow-[0_1px_2px_rgba(204,0,8,0.1)]",
        success:
          "bg-[#0A8A00] text-white hover:bg-[#087300] focus-visible:ring-[#0A8A00] rounded-[4px] px-5 py-2.5 shadow-[0_1px_2px_rgba(10,138,0,0.1)]",
        link: "text-[#003399] underline-offset-4 hover:underline bg-transparent p-0 rounded-none h-auto min-h-0 font-semibold",
        hero:
          "bg-[#003399] text-white rounded-[4px] px-7 py-3 text-base font-bold hover:bg-[#002B80] shadow-md",
        pearl:
          "bg-white text-[#111111] rounded-[4px] px-3.5 py-2 text-xs border border-[#DFDFDF] hover:bg-[#F5F5F5] dark:bg-[#18181b] dark:border-[#27272a] dark:text-white",
      },
      size: {
        default: "h-11 min-h-[44px]",
        sm: "h-9 min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-[4px]",
        lg: "h-12 min-h-[48px] px-7 py-3 text-base font-bold rounded-[4px]",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px] rounded-[4px] p-0 flex items-center justify-center",
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
      style,
      themeColor,
      ...props
    },
    ref
  ) => {
    const isCustomColor = Boolean(themeColor);
    const contrastColor = isCustomColor ? getContrastColor(themeColor!) : undefined;

    const dynamicStyle = React.useMemo(() => {
      if (!isCustomColor) return style;

      return {
        ...style,
        backgroundColor: themeColor,
        color: contrastColor,
        borderColor: themeColor,
      };
    }, [style, themeColor, isCustomColor, contrastColor]);

    const resolvedLoadingText = loadingText ?? (loadingKey ? LOADING_LABELS[loadingKey] : undefined);

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        style={dynamicStyle}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <LoadingSpinner size="sm" className="opacity-90" />
            {resolvedLoadingText && <span>{resolvedLoadingText}</span>}
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
