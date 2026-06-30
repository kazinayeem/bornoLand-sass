"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditFilters, AuditTimeline } from "@/components/audit/audit-center";
import type { AuditLogFilters } from "@/redux/api/audit-api";
import { getAuditExportUrl } from "@/redux/api/audit-api";

type Scope = "admin" | "store" | "workspace";

type Props = {
  scope: Scope;
  storeId?: string;
  title: string;
  description: string;
  useQuery: (filters: AuditLogFilters & { storeId?: string }) => {
    data?: { data?: { items: import("@/redux/api/audit-api").AuditLog[]; pagination: { page: number; pages: number; total: number } } };
    isLoading: boolean;
    isFetching: boolean;
  };
};

async function downloadExport(url: string, filename: string) {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("Export failed");
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

function exportRowsToPrintablePdf(items: import("@/redux/api/audit-api").AuditLog[]) {
  const html = `<!DOCTYPE html><html><head><title>Audit Export</title>
    <style>body{font-family:system-ui,sans-serif;padding:24px} table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#f4f4f5}</style></head><body>
    <h1>Audit Logs</h1><table><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>Store</th><th>IP</th></tr></thead><tbody>
    ${items.map((log) => `<tr><td>${new Date(log.createdAt).toLocaleString()}</td><td>${log.actorName}</td><td>${log.action}</td><td>${log.entityName}</td><td>${log.storeName}</td><td>${log.ipAddress}</td></tr>`).join("")}
    </tbody></table></body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.print();
}

export function AuditCenterPanel({ scope, storeId, title, description, useQuery }: Props) {
  const [filters, setFilters] = useState<AuditLogFilters>({ page: 1, limit: 25 });
  const queryFilters = storeId ? { ...filters, storeId } : filters;
  const { data, isLoading, isFetching } = useQuery(queryFilters);
  const items = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;

  const handleExport = async (format: "csv" | "json" | "xlsx" | "pdf") => {
    const exportFilters = { ...filters, storeId };
    if (format === "pdf") {
      exportRowsToPrintablePdf(items);
      return;
    }
    if (format === "xlsx") {
      await downloadExport(getAuditExportUrl(scope, exportFilters, "csv"), "audit-logs.xlsx");
      return;
    }
    await downloadExport(getAuditExportUrl(scope, exportFilters, format), `audit-logs.${format}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => handleExport("csv")}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => handleExport("xlsx")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => handleExport("pdf")}>
            <FileText className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => handleExport("json")}>
            <Download className="mr-2 h-4 w-4" /> JSON
          </Button>
        </div>
      </div>

      <AuditFilters
        filters={filters}
        onChange={setFilters}
        showStoreFilter={scope === "admin"}
        showWorkspaceFilter={scope === "admin"}
      />

      {(isLoading || isFetching) && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Refreshing...
        </div>
      )}

      <AuditTimeline items={items} isLoading={isLoading} />

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-sm">
          <span className="text-zinc-500">{pagination.total} events</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={(filters.page ?? 1) <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={(filters.page ?? 1) >= pagination.pages}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
