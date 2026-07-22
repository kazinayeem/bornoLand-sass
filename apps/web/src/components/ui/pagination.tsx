"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total?: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
};

const pageSizes = [10, 20, 50, 100];

export function Pagination({
  page,
  totalPages,
  onPageChange,
  total,
  pageSize = 20,
  onPageSizeChange,
  pageSizeOptions,
  isLoading,
}: PaginationProps) {
  const [goToValue, setGoToValue] = useState("");

  if (totalPages <= 1 && !total && !onPageSizeChange) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
  }

  const submitGoTo = () => {
    const next = Number(goToValue);
    if (!Number.isFinite(next) || next < 1 || next > totalPages) return;
    onPageChange(next);
    setGoToValue("");
  };

  const btnClass =
    "btn-press flex h-10 min-w-[40px] items-center justify-center rounded-lg border border-apple-hairline text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-apple-surface-tile-3";

  return (
    <div
      className={cn("flex flex-col gap-3 pt-4 lg:flex-row lg:items-center lg:justify-between", isLoading && "opacity-90")}
      aria-busy={isLoading || undefined}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-caption text-apple-ink-muted-48">
        {total !== undefined && (
          <p>
            <span className="font-semibold text-apple-ink dark:text-apple-body-on-dark">{total}</span> total
          </p>
        )}
        <p>
          Page <span className="font-semibold text-apple-ink">{page}</span> of{" "}
          <span className="font-semibold text-apple-ink">{Math.max(totalPages, 1)}</span>
        </p>
        {pageSize && onPageSizeChange && (
          <label className="inline-flex items-center gap-2">
            Rows
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-apple-hairline bg-apple-canvas px-2 py-1.5 text-fine-print text-apple-ink outline-none focus-visible:ring-2 focus-visible:ring-apple-primary-focus dark:bg-apple-surface-tile-2"
            >
              {(pageSizeOptions ?? pageSizes).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="inline-flex items-center gap-2">
          Go to
          <input
            type="number"
            min={1}
            max={totalPages}
            value={goToValue}
            onChange={(e) => setGoToValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitGoTo()}
            className="w-16 rounded-lg border border-apple-hairline bg-apple-canvas px-2 py-1.5 text-fine-print text-apple-ink outline-none focus-visible:ring-2 focus-visible:ring-apple-primary-focus"
            aria-label="Go to page"
          />
          <button type="button" onClick={submitGoTo} className={cn(btnClass, "px-2 text-fine-print")}>
            Go
          </button>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <button type="button" onClick={() => onPageChange(1)} disabled={page <= 1} className={btnClass} aria-label="First page">
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={btnClass} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`e${i}`} className="flex h-8 w-8 items-center justify-center text-fine-print text-apple-ink-muted-48">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  "btn-press flex h-10 min-w-[40px] items-center justify-center rounded-lg px-2 text-caption font-medium transition-colors",
                  p === page
                    ? "bg-apple-primary text-apple-on-primary"
                    : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment dark:hover:bg-apple-surface-tile-3",
                )}
              >
                {p}
              </button>
            ),
          )}
        </div>
        <span className="px-2 text-caption text-apple-ink-muted-48 sm:hidden">{page} / {totalPages}</span>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className={btnClass} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => onPageChange(totalPages)} disabled={page >= totalPages} className={btnClass} aria-label="Last page">
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
