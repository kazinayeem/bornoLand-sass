import { TableSkeleton } from "@/components/ui/skeleton";

export function TablePageSkeleton({
  rows = 6,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="space-y-6">
      {/* Header action bar skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
        <div className="space-y-1.5">
          <div className="h-7 w-44 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-64 rounded bg-zinc-100 dark:bg-zinc-800/60" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>

      {/* Filter / Search toolbar skeleton */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-apple-hairline bg-apple-canvas animate-pulse">
        <div className="h-9 w-64 rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="h-9 w-28 rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="h-9 w-28 rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
      </div>

      {/* Table grid skeleton */}
      <div className="rounded-xl border border-apple-hairline bg-apple-canvas p-4">
        <TableSkeleton rows={rows} cols={cols} />
      </div>
    </div>
  );
}
