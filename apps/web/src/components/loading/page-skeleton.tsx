import { CardSkeleton, StatsSkeleton, TableSkeleton, ChartSkeleton } from "@/components/ui/skeleton";

/** Admin / dashboard workspace loading only — never use on public storefront routes. */
export function PageLoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] animate-fade-in space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-apple-canvas-parchment" />
        <div className="h-4 w-72 rounded-lg bg-apple-canvas-parchment" />
      </div>
      <StatsSkeleton count={4} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}

export function DashboardPageSkeleton() {
  return <PageLoadingSkeleton />;
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return <CardSkeleton count={count} />;
}

export { StatsSkeleton, TableSkeleton, ChartSkeleton, CardSkeleton };
