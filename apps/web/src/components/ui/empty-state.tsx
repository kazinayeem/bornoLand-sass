"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-apple-hairline bg-apple-canvas px-6 py-apple-section text-center dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-apple-canvas-parchment text-apple-ink-muted-48 dark:bg-apple-surface-tile-3">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="text-body-strong text-apple-ink dark:text-apple-body-on-dark">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-caption text-apple-ink-muted-48 dark:text-apple-body-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

export function NoResults({
  search,
  onClear,
  className,
}: {
  search?: string;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-apple-hairline bg-apple-canvas px-6 py-apple-section text-center dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-apple-canvas-parchment dark:bg-apple-surface-tile-3">
        <svg
          className="h-7 w-7 text-apple-ink-muted-48"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>
      <h3 className="text-body-strong text-apple-ink dark:text-apple-body-on-dark">No results found</h3>
      {search && (
        <p className="mt-1 text-caption text-apple-ink-muted-48 dark:text-apple-body-muted">
          No results for &quot;{search}&quot;. Try a different search term.
        </p>
      )}
      {onClear && (
        <button
          onClick={onClear}
          className="mt-4 text-caption text-apple-primary transition-colors hover:text-apple-primary-focus"
        >
          Clear search &amp; filters
        </button>
      )}
    </motion.div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-6 py-apple-section text-center dark:border-red-900/50 dark:bg-red-950/20">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
        <svg
          className="h-7 w-7 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h3 className="text-body-strong text-red-900 dark:text-red-400">Something went wrong</h3>
      <p className="mt-1 text-caption text-red-600 dark:text-red-400">
        {message || "Failed to load data. Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-press mt-4 inline-flex items-center gap-1.5 rounded-pill bg-apple-primary px-[22px] py-[11px] text-body text-apple-on-primary transition-colors hover:bg-apple-primary-focus"
        >
          Retry
        </button>
      )}
    </div>
  );
}
