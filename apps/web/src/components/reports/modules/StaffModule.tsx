"use client";

import { UserCog, ClipboardList } from "lucide-react";
import { EmptyState } from "../shared/EmptyState";
import { ReportPanel } from "../shared/ReportPanel";
import type { ModuleBaseProps } from "./module-types";

export function StaffModule(_props: ModuleBaseProps) {
  return (
    <div className="space-y-3">
      <ReportPanel
        title="Staff activity"
        description="Track who changed orders, inventory, and settings"
      >
        <EmptyState
          icon={UserCog}
          title="Staff activity coming soon — audit trail integration"
          description="Bornoland will surface staff actions, order edits, and permission events here once the audit trail API is connected to reports."
          className="py-14"
        />
      </ReportPanel>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "Order edits", desc: "Status and payment changes by staff" },
          { title: "Inventory adjustments", desc: "Stock updates with actor attribution" },
          { title: "Login sessions", desc: "Workspace access timeline" },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-dashed border-apple-hairline bg-apple-canvas-parchment/30 p-3"
          >
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-apple-hairline">
              <ClipboardList className="h-3.5 w-3.5 text-apple-ink-muted-48" />
            </div>
            <p className="text-[11px] font-semibold text-apple-ink">{item.title}</p>
            <p className="mt-0.5 text-[10px] text-apple-ink-muted-48">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
