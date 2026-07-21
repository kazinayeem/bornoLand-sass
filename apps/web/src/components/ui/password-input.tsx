"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  className,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 min-h-[44px] w-full rounded-pill border border-black/[0.08] bg-apple-canvas px-5 pr-12 text-body text-apple-ink outline-none transition-all placeholder:text-apple-ink-muted-48 focus-visible:ring-2 focus-visible:ring-apple-primary-focus focus-visible:ring-offset-2 dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2 dark:text-apple-body-on-dark"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
        className="btn-press absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
