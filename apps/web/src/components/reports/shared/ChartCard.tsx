"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { ReportPanel } from "./ReportPanel";
import { EmptyState } from "./EmptyState";
import { BarChart3 } from "lucide-react";

export function ChartCard({
  title,
  description,
  children,
  empty,
  emptyTitle = "No chart data",
  emptyDescription = "Nothing to plot for the selected filters.",
  className,
  height = 240,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  height?: number;
  actions?: ReactNode;
}) {
  return (
    <ReportPanel title={title} description={description} actions={actions} className={className}>
      {empty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} icon={BarChart3} className="py-8" />
      ) : (
        <div className={cn("w-full")} style={{ height }}>
          {children}
        </div>
      )}
    </ReportPanel>
  );
}
