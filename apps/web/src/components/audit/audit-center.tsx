"use client";

import { useMemo, useState } from "react";
import type { AuditLog, AuditLogFilters } from "@/redux/api/audit-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";

const MODULES = ["auth", "users", "stores", "products", "orders", "customers", "coupons", "cms", "builder", "media", "subscription", "payments", "platform"];
const STATUSES = ["success", "failure"];

type Props = {
  filters: AuditLogFilters;
  onChange: (filters: AuditLogFilters) => void;
  showWorkspaceFilter?: boolean;
  showStoreFilter?: boolean;
};

export function AuditFilters({ filters, onChange, showWorkspaceFilter, showStoreFilter }: Props) {
  const [open, setOpen] = useState(false);

  const activeCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (["page", "limit"].includes(key)) return false;
      return value !== undefined && value !== "";
    }).length;
  }, [filters]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-ink-muted-48" />
          <Input
            className="pl-9"
            placeholder="Search user, store, product, order, IP, action..."
            value={filters.search ?? ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
        <Button type="button" variant="outline" onClick={() => setOpen((v) => !v)}>
          <Filter className="mr-2 h-4 w-4" />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
        {activeCount > 0 && (
          <Button type="button" variant="ghost" onClick={() => onChange({ page: 1, limit: filters.limit ?? 25 })}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {open && (
        <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-apple-canvas-parchment/80 p-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="text-apple-ink-muted-48">From</span>
            <Input type="date" value={filters.from?.slice(0, 10) ?? ""} onChange={(e) => onChange({ ...filters, from: e.target.value, page: 1 })} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-apple-ink-muted-48">To</span>
            <Input type="date" value={filters.to?.slice(0, 10) ?? ""} onChange={(e) => onChange({ ...filters, to: e.target.value, page: 1 })} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-apple-ink-muted-48">Module</span>
            <select
              className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm"
              value={filters.module ?? ""}
              onChange={(e) => onChange({ ...filters, module: e.target.value || undefined, page: 1 })}
            >
              <option value="">All modules</option>
              {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-apple-ink-muted-48">Status</span>
            <select
              className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm"
              value={filters.status ?? ""}
              onChange={(e) => onChange({ ...filters, status: e.target.value || undefined, page: 1 })}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-apple-ink-muted-48">Action</span>
            <Input value={filters.action ?? ""} onChange={(e) => onChange({ ...filters, action: e.target.value || undefined, page: 1 })} placeholder="e.g. product_updated" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-apple-ink-muted-48">IP Address</span>
            <Input value={filters.ipAddress ?? ""} onChange={(e) => onChange({ ...filters, ipAddress: e.target.value || undefined, page: 1 })} />
          </label>
          {showStoreFilter && (
            <label className="space-y-1 text-sm">
              <span className="text-apple-ink-muted-48">Store ID</span>
              <Input value={filters.storeId ?? ""} onChange={(e) => onChange({ ...filters, storeId: e.target.value || undefined, page: 1 })} />
            </label>
          )}
          {showWorkspaceFilter && (
            <label className="space-y-1 text-sm">
              <span className="text-apple-ink-muted-48">Workspace ID</span>
              <Input value={filters.tenantId ?? ""} onChange={(e) => onChange({ ...filters, tenantId: e.target.value || undefined, page: 1 })} />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

function formatAction(action: string) {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function AuditTimeline({ items, isLoading }: { items: AuditLog[]; isLoading?: boolean }) {
  if (isLoading) {
    return <div className="py-12 text-center text-sm text-apple-ink-muted-48">Loading activity...</div>;
  }

  if (items.length === 0) {
    return <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center text-sm text-apple-ink-muted-48">No activity found for the selected filters.</div>;
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute bottom-0 left-[18px] top-0 w-px bg-zinc-200" />
      {items.map((log) => (
        <div key={log.id} className="relative flex gap-4 pb-8 pl-10">
          <div className="absolute left-3 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-600 shadow" />
          <div className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-apple-ink-muted-48">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="mt-1 text-sm font-semibold text-apple-ink">
                  {log.actorName || "System"}
                  <span className="font-normal text-apple-ink-muted-48"> · {formatAction(log.action)}</span>
                </p>
                {log.entityName && <p className="text-sm text-apple-ink-muted-80">{log.entityName}</p>}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${log.status === "failure" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                {log.status}
              </span>
            </div>

            {log.changes?.length > 0 && (
              <div className="mt-3 space-y-1 rounded-xl bg-apple-canvas-parchment p-3 text-sm">
                {log.changes.slice(0, 4).map((change) => (
                  <p key={`${log.id}-${change.field}`} className="text-apple-ink-muted-80">
                    <span className="font-medium text-zinc-800">{change.field}</span>
                    {" "}
                    <span className="text-apple-ink-muted-48">{formatValue(change.oldValue)}</span>
                    {" → "}
                    <span className="text-apple-ink">{formatValue(change.newValue)}</span>
                  </p>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-apple-ink-muted-48">
              {log.storeName && <span>{log.storeName}</span>}
              {log.workspaceName && <span>· {log.workspaceName}</span>}
              {log.module && <span>· {log.module}</span>}
              {log.ipAddress && <span>· {log.ipAddress}</span>}
              {log.browser && <span>· {log.browser}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
