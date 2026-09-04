"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, X, Check, Loader2 } from "lucide-react";
import { normalizeSearch } from "@/lib/bangladesh-locations";

export type LocationOption = {
  id: string;
  name: string;
  nameBn?: string;
  subtitle?: string;
};

export type LocationSelectProps = {
  label: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options: LocationOption[];
  value: string;
  onChange: (value: string, option?: LocationOption) => void;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  error?: string;
  className?: string;
};

export function LocationSelect({
  label,
  placeholder = "Select location...",
  searchPlaceholder = "Search in English or Bangla...",
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  loading = false,
  error,
  className = "",
}: LocationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Selected Option
  const selectedOption = useMemo(() => {
    if (!value) return undefined;
    const norm = normalizeSearch(value);
    return options.find(
      (opt) =>
        normalizeSearch(opt.id) === norm ||
        normalizeSearch(opt.name) === norm ||
        (opt.nameBn && normalizeSearch(opt.nameBn) === norm)
    );
  }, [value, options]);

  // Filtered Options with bilingual search
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = normalizeSearch(searchQuery);
    return options.filter((opt) => {
      const matchName = normalizeSearch(opt.name).includes(q);
      const matchBn = opt.nameBn ? normalizeSearch(opt.nameBn).includes(q) : false;
      const matchId = normalizeSearch(opt.id).includes(q);
      return matchName || matchBn || matchId;
    });
  }, [options, searchQuery]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        const item = filteredOptions[highlightedIndex];
        onChange(item.id, item);
        setIsOpen(false);
      }
    }
  };

  const handleSelect = (item: LocationOption) => {
    onChange(item.id, item);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div className="relative">
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`flex w-full items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm transition-all focus:outline-none focus:ring-2 dark:bg-zinc-900 ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
              : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 dark:border-zinc-800 dark:focus:border-zinc-100"
          } ${disabled ? "cursor-not-allowed bg-zinc-50 text-zinc-400 dark:bg-zinc-800/40 dark:text-zinc-600" : "hover:border-zinc-300 text-zinc-900 dark:text-zinc-100"}`}
        >
          <span className="truncate">
            {loading ? (
              <span className="flex items-center gap-2 text-zinc-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
                Loading options...
              </span>
            ) : selectedOption ? (
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {selectedOption.name}
                {selectedOption.nameBn ? (
                  <span className="ml-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                    ({selectedOption.nameBn})
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">{placeholder}</span>
            )}
          </span>

          <span className="ml-2 flex items-center gap-1 shrink-0 text-zinc-400">
            {selectedOption && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                onClick={handleClear}
                className="rounded p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600"
                title="Clear selection"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        {/* Dropdown Popover */}
        {isOpen && (
          <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[240px] rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl animate-in fade-in-0 zoom-in-95 dark:border-zinc-800 dark:bg-zinc-900">
            {/* Search Input */}
            <div className="relative mb-2 px-1">
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-100 dark:focus:border-zinc-200"
              />
            </div>

            {/* Options List */}
            <div
              ref={listRef}
              role="listbox"
              className="max-h-56 overflow-y-auto overflow-x-hidden space-y-0.5 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800"
            >
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400">
                  No locations found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredOptions.map((item, idx) => {
                  const isSelected = selectedOption?.id === item.id;
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-zinc-900 text-white font-semibold dark:bg-white dark:text-zinc-900"
                          : isHighlighted
                          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-100"
                          : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      <div className="flex flex-col truncate pr-2">
                        <span className="truncate">
                          {item.name}
                          {item.nameBn ? (
                            <span
                              className={`ml-1.5 ${
                                isSelected
                                  ? "text-zinc-300 dark:text-zinc-600"
                                  : "text-zinc-400 dark:text-zinc-500"
                              }`}
                            >
                              ({item.nameBn})
                            </span>
                          ) : null}
                        </span>
                        {item.subtitle && (
                          <span
                            className={`text-[10px] ${
                              isSelected ? "text-zinc-300" : "text-zinc-400"
                            }`}
                          >
                            {item.subtitle}
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <Check className="h-3.5 w-3.5 shrink-0 text-white dark:text-zinc-900" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
    </div>
  );
}
