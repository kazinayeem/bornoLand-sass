"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  className,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-apple-hairline bg-apple-canvas-parchment/40 px-4 py-10 text-center",
        className,
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-apple-hairline">
        <Icon className="h-4 w-4 text-apple-ink-muted-48" />
      </div>
      <p className="text-[12px] font-semibold text-apple-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-apple-ink-muted-48">{description}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
