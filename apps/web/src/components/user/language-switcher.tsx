"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage, type Language } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
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
        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-apple-hairline/80 bg-white/80 px-2.5 text-xs font-semibold text-apple-ink shadow-xs backdrop-blur-md transition-all hover:bg-apple-canvas-parchment hover:text-apple-ink dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
      >
        <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        <span>{language === "bn" ? "বাংলা" : "English"}</span>
        <ChevronDown className={cn("h-3 w-3 text-apple-ink-muted-48 transition-transform dark:text-white/60", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          tabIndex={-1}
          aria-orientation="vertical"
          className="absolute right-0 mt-1.5 z-50 w-36 origin-top-right rounded-2xl border border-apple-hairline/80 bg-white p-1.5 shadow-xl ring-1 ring-black/5 dark:border-white/10 dark:bg-zinc-900"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect("bn")}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
              language === "bn"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                : "text-apple-ink hover:bg-apple-canvas-parchment dark:text-zinc-200 dark:hover:bg-white/5"
            )}
          >
            <span>বাংলা</span>
            {language === "bn" && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect("en")}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
              language === "en"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                : "text-apple-ink hover:bg-apple-canvas-parchment dark:text-zinc-200 dark:hover:bg-white/5"
            )}
          >
            <span>English</span>
            {language === "en" && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
          </button>
        </div>
      )}
    </div>
  );
}
