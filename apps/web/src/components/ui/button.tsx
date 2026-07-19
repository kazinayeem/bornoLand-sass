import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-zinc-100",
  {
    variants: {
      variant: {
        default: "bg-zinc-950 text-white shadow-[0_10px_24px_-16px_rgba(15,23,42,0.65)] hover:-translate-y-px hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white",
        outline: "border border-zinc-200/80 bg-white text-zinc-900 shadow-sm hover:-translate-y-px hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900",
        ghost: "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white",
        secondary: "bg-zinc-100 text-zinc-900 shadow-sm hover:-translate-y-px hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700",
        danger: "bg-red-600 text-white shadow-[0_10px_24px_-16px_rgba(220,38,38,0.7)] hover:-translate-y-px hover:bg-red-700",
        success: "bg-emerald-600 text-white shadow-[0_10px_24px_-16px_rgba(5,150,105,0.7)] hover:-translate-y-px hover:bg-emerald-700",
        link: "text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-6",
        icon: "h-11 w-11"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
