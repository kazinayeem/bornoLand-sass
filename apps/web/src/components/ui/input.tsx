import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 min-h-[44px] w-full rounded-pill border border-black/[0.08] bg-apple-canvas px-5 py-3 text-body text-apple-ink transition-all duration-200 placeholder:text-apple-ink-muted-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-primary-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2 dark:text-apple-body-on-dark dark:placeholder:text-apple-body-muted",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
