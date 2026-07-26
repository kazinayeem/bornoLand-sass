"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function ReportPanel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-apple-hairline bg-white", className)}>
      <div className="flex items-start justify-between gap-3 border-b border-apple-hairline px-3 py-2.5">
        <div className="min-w-0">
          <h3 className="text-[12px] font-semibold text-apple-ink">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-[10px] text-apple-ink-muted-48">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
      </div>
      <div className={cn("p-3", bodyClassName)}>{children}</div>
    </div>
  );
}
