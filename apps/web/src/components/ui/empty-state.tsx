"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertCircle, RotateCw, Search, Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300/80 bg-zinc-50/50 px-6 py-14 text-center dark:border-zinc-800 dark:bg-zinc-900/30",
        className
      )}
    >
      <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-2xs ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex items-center gap-2">{action}</div>}
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
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300/80 bg-zinc-50/50 px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/30",
        className
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-400 shadow-2xs ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:ring-zinc-700">
        <Search className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No results found</h3>
      {search && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          No matches found for &quot;{search}&quot;. Try adjusting your keywords or filters.
        </p>
      )}
      {onClear && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="mt-4 text-xs font-medium cursor-pointer"
        >
          Clear filters
        </Button>
      )}
    </motion.div>
  );
}

export function ErrorState({
  title = "Failed to load data",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-rose-200/80 bg-rose-50/50 px-6 py-10 text-center dark:border-rose-950 dark:bg-rose-950/20",
        className
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-rose-950 dark:text-rose-200">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
        {message || "We encountered an issue while loading this section. Please try again."}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 gap-1.5 border-rose-300 bg-white text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-zinc-900 dark:text-rose-300 cursor-pointer"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
}
