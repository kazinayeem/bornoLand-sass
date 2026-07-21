"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total?: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
};

const pageSizes = [10, 20, 50, 100];

export function Pagination({
  page,
  totalPages,
  onPageChange,
  total,
  pageSize = 20,
  onPageSizeChange,
}: PaginationProps) {
  if (totalPages <= 1 && !total) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
      {total !== undefined && (
        <p className="text-caption text-apple-ink-muted-48">
          <span className="font-semibold text-apple-ink dark:text-apple-body-on-dark">{total}</span> total
          {pageSize && onPageSizeChange && (
            <>
              {" — "}
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="inline-flex rounded-sm border border-apple-hairline bg-apple-canvas px-2 py-1 text-fine-print font-normal text-apple-ink outline-none focus-visible:ring-2 focus-visible:ring-apple-primary-focus dark:bg-apple-surface-tile-2 dark:text-apple-body-on-dark"
              >
                {pageSizes.map((s) => (
                  <option key={s} value={s}>
                    {s} / page
                  </option>
                ))}
              </select>
            </>
          )}
        </p>
      )}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-press flex h-11 w-11 items-center justify-center rounded-full text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-apple-surface-tile-3"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`e${i}`}
              className="flex h-8 w-8 items-center justify-center text-fine-print text-apple-ink-muted-48"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "btn-press flex h-11 min-w-[44px] items-center justify-center rounded-full px-2 text-caption font-normal transition-colors",
                p === page
                  ? "bg-apple-primary text-apple-on-primary"
                  : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment dark:text-apple-body-muted dark:hover:bg-apple-surface-tile-3"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-press flex h-11 w-11 items-center justify-center rounded-full text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-apple-surface-tile-3"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
