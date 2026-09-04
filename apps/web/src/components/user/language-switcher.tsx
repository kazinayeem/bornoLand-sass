"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage, type Language } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={language === "bn" ? "ভাষা পরিবর্তন করুন" : "Switch language"}
        className={cn(
          "inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-2.5 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-white/20",
          compact && "px-2"
        )}
      >
        <Globe className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
        <span>{compact ? (language === "bn" ? "বাং" : "EN") : (language === "bn" ? "বাংলা" : "English")}</span>
        <ChevronDown className={cn("h-3 w-3 text-zinc-400 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          tabIndex={-1}
          aria-orientation="vertical"
          className="absolute right-0 mt-1 z-50 w-32 origin-top-right rounded-xl border border-zinc-200/90 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in-50 zoom-in-95 duration-100"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect("bn")}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-left",
              language === "bn"
                ? "bg-zinc-100 font-semibold text-zinc-950 dark:bg-zinc-800 dark:text-white"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
            )}
          >
            <span>বাংলা</span>
            {language === "bn" && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect("en")}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-left",
              language === "en"
                ? "bg-zinc-100 font-semibold text-zinc-950 dark:bg-zinc-800 dark:text-white"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
            )}
          >
            <span>English</span>
            {language === "en" && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
          </button>
        </div>
      )}
    </div>
  );
}
