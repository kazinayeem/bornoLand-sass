import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  className?: string;
  iconClassName?: string;
};

export function StatCard({ label, value, icon: Icon, trend, className, iconClassName }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas p-5 transition-colors duration-200 hover:border-apple-hairline",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-apple-ink-muted-48">{label}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-apple-ink">{value}</p>
          {trend && <p className="mt-1 text-xs leading-5 text-apple-ink-muted-48">{trend}</p>}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-apple-canvas-parchment text-apple-ink-muted-80 transition-colors group-hover:bg-zinc-950 group-hover:text-white",
            iconClassName
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
