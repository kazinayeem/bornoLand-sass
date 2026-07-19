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
        "group relative overflow-hidden rounded-[1.5rem] border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_48px_-30px_rgba(15,23,42,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_12px_40px_-24px_rgba(15,23,42,0.32)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-zinc-950">{value}</p>
          {trend && <p className="mt-1 text-xs leading-5 text-zinc-500">{trend}</p>}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-zinc-950 group-hover:text-white",
            iconClassName
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
