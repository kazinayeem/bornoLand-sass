"use client";

import { SearchBar } from "@/components/ui/search-bar";
import { cn } from "@/lib/utils";

type DataGridSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isFetching?: boolean;
};

export function DataGridSearch({
  value,
  onChange,
  placeholder = "Search…",
  className,
  isFetching,
}: DataGridSearchProps) {
  return (
    <SearchBar
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn("w-full sm:max-w-sm", isFetching && "opacity-90", className)}
    />
  );
}
