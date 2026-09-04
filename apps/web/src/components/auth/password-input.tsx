"use client";

import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          {...props}
          type={visible ? "text" : "password"}
          className={cn(
            "flex h-11 w-full rounded-xl border border-[#dfe3e8] dark:border-zinc-800 bg-white dark:bg-zinc-900/90 px-3.5 pr-11 text-sm text-[#181c20] dark:text-zinc-100 placeholder:text-[#727785] transition-all focus:border-[#1664d9] focus:outline-none focus:ring-2 focus:ring-[#1664d9]/15 disabled:cursor-not-allowed disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50 disabled:text-zinc-400",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/15",
            className
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#727785] hover:text-[#181c20] dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer rounded focus:outline-none"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
