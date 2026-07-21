"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
  debounceMs = 300,
}: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (local !== value) onChange(local);
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [local, value, onChange, debounceMs]);

  const handleClear = useCallback(() => {
    setLocal("");
    onChange("");
  }, [onChange]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-apple-ink-muted-48" />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="h-11 min-h-[44px] w-full rounded-pill border border-black/[0.08] bg-apple-canvas pl-11 pr-9 text-body text-apple-ink outline-none transition-all placeholder:text-apple-ink-muted-48 focus-visible:ring-2 focus-visible:ring-apple-primary-focus focus-visible:ring-offset-2 dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2 dark:text-apple-body-on-dark"
      />
      {local && (
        <button
          onClick={handleClear}
          className="btn-press absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
