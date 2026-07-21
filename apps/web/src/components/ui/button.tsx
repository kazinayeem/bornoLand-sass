import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-body transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-primary-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 btn-press",
  {
    variants: {
      variant: {
        default:
          "bg-apple-primary text-apple-on-primary rounded-pill px-[22px] py-[11px] text-[17px] font-normal leading-[1.47] tracking-[-0.374px] hover:bg-apple-primary-focus",
        outline:
          "border border-apple-primary bg-transparent text-apple-primary rounded-pill px-[22px] py-[11px] text-[17px] font-normal leading-[1.47] tracking-[-0.374px] hover:bg-apple-primary/5",
        secondary:
          "bg-apple-surface-pearl text-apple-ink-muted-80 rounded-md px-[14px] py-2 text-caption border-[3px] border-apple-divider-soft",
        ghost:
          "text-apple-ink hover:bg-apple-canvas-parchment rounded-sm px-[15px] py-2 text-caption dark:text-apple-body-on-dark dark:hover:bg-apple-surface-tile-2",
        dark:
          "bg-apple-ink text-apple-on-dark rounded-sm px-[15px] py-2 text-caption dark:bg-apple-surface-tile-3",
        danger:
          "bg-red-600 text-white rounded-pill px-[22px] py-[11px] text-[17px] font-normal",
        success:
          "bg-emerald-600 text-white rounded-pill px-[22px] py-[11px] text-[17px] font-normal",
        link: "text-apple-primary underline-offset-4 hover:underline bg-transparent p-0 rounded-none",
        hero:
          "bg-apple-primary text-apple-on-primary rounded-pill px-7 py-[14px] text-[18px] font-light leading-none",
        pearl:
          "bg-apple-surface-pearl text-apple-ink-muted-80 rounded-md px-[14px] py-2 text-caption border-[3px] border-apple-divider-soft",
      },
      size: {
        default: "h-11 min-h-[44px]",
        sm: "h-9 min-h-[36px] rounded-sm px-3 text-caption",
        lg: "h-12 min-h-[48px] rounded-pill px-7",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-apple-surface-chip/64 text-apple-ink p-0",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
