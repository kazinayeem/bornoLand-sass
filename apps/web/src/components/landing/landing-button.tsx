"use client";

import React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const landingButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-blue-600 text-white border border-transparent shadow-[0_4px_12px_rgba(37,99,235,0.18)] hover:bg-blue-700 hover:shadow-[0_6px_16px_rgba(37,99,235,0.24)] hover:-translate-y-0.5 active:bg-blue-800 active:translate-y-0",
        secondary:
          "bg-white text-zinc-900 border border-zinc-300 shadow-2xs hover:bg-slate-50 hover:border-zinc-400 hover:-translate-y-0.5 active:bg-zinc-100 active:translate-y-0",
        dark:
          "bg-[#111111] text-white border border-transparent hover:bg-black hover:-translate-y-0.5 active:bg-zinc-950 active:translate-y-0 shadow-sm",
        ghost:
          "bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 active:bg-zinc-200",
      },
      size: {
        default: "h-11 min-h-[44px] px-5 text-sm rounded-xl",
        hero: "h-12 min-h-[48px] px-7 text-[15px] rounded-xl",
        sm: "h-9 min-h-[36px] px-3.5 text-xs rounded-lg",
        lg: "h-12 min-h-[48px] px-8 text-base rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface LandingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof landingButtonVariants> {
  href?: string;
  external?: boolean;
}

export const LandingButton = React.forwardRef<HTMLButtonElement, LandingButtonProps>(
  ({ className, variant, size, href, external, children, ...props }, ref) => {
    const classes = cn(landingButtonVariants({ variant, size }), className);

    if (href) {
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={classes}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

LandingButton.displayName = "LandingButton";
