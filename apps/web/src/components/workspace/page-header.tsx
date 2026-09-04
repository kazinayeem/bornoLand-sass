import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-xl border border-zinc-200/90 bg-white px-5 py-5 shadow-2xs backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-6 dark:border-zinc-800 dark:bg-zinc-900", className)}>
      <div className="min-w-0 space-y-1.5">
        {breadcrumb && <div className="text-xs font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">{breadcrumb}</div>}
        <h1 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl dark:text-white">{title}</h1>
        {description && <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
