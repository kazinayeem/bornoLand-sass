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
          "flex h-11 min-h-[44px] w-full rounded-[4px] border border-[#DFDFDF] bg-white px-3.5 py-2.5 text-sm text-[#111111] transition-colors duration-150 placeholder:text-[#767676] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003399] focus-visible:border-transparent disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:text-[#767676] dark:border-[#27272a] dark:bg-[#18181b] dark:text-white dark:placeholder:text-[#767676] dark:focus-visible:ring-[#FFDA1A]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
