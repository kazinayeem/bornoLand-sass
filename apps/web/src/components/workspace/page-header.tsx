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
    <div className={cn("flex flex-col gap-4 rounded-[1.75rem] border border-zinc-200/70 bg-white/80 px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_12px_40px_-30px_rgba(15,23,42,0.3)] backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-6", className)}>
      <div className="min-w-0 space-y-2">
        {breadcrumb && <div className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">{breadcrumb}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-6 text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
