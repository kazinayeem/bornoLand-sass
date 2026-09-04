"use client";

import { useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { language } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        /* no-op */
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left", className)}>
      <span
        className={cn(
          "inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-2.5 text-xs font-semibold text-zinc-700 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
          compact && "px-2"
        )}
      >
        <Globe className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
        <span>{compact ? "EN" : "English"}</span>
      </span>
    </div>
  );
}
