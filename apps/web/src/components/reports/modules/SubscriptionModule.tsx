"use client";

import { Crown, FileText, HardDrive, Image } from "lucide-react";
import { KpiCard } from "../shared/KpiCard";
import { ReportPanel } from "../shared/ReportPanel";
import { EmptyState } from "../shared/EmptyState";
import type { ModuleBaseProps } from "./module-types";

export function SubscriptionModule({ kpis }: ModuleBaseProps) {
  const storage = kpis?.storageUsage;
  const hasUsage = storage != null || (kpis?.pages ?? 0) > 0 || (kpis?.mediaUsage ?? 0) > 0;

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <KpiCard
          label="Pages"
          value={kpis?.pages ?? 0}
          icon={FileText}
          tone="neutral"
          compact
        />
        <KpiCard
          label="Media files"
          value={kpis?.mediaUsage ?? 0}
          icon={Image}
          tone="info"
          compact
        />
        <KpiCard
          label="Storage used"
          value={storage ? `${storage.percent}%` : "—"}
          icon={HardDrive}
          tone="warning"
          compact
        />
      </div>

      {storage ? (
        <ReportPanel title="Storage quota" description="Plan resource usage">
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] text-apple-ink">
              <span>
                {storage.used.toLocaleString()} / {storage.limit.toLocaleString()} used
              </span>
              <span className="tabular-nums text-apple-ink-muted-80">{storage.percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-apple-canvas-parchment">
              <div
                className="h-full rounded-full bg-apple-ink"
                style={{ width: `${Math.min(100, Math.max(0, storage.percent))}%` }}
              />
            </div>
          </div>
        </ReportPanel>
      ) : null}

      {!hasUsage ? (
        <EmptyState
          icon={Crown}
          title="Subscription performance placeholder"
          description="Detailed plan billing, renewal, and entitlement analytics will show here. Page and media usage above reflect current store resources when available."
          className="py-12"
        />
      ) : (
        <div className="rounded-xl border border-dashed border-apple-hairline px-3 py-3 text-[11px] text-apple-ink-muted-48">
          Full subscription billing analytics (MRR, renewals, add-ons) are planned. Usage KPIs above
          reflect current plan resource consumption.
        </div>
      )}
    </div>
  );
}
