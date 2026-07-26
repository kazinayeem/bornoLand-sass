"use client";

import {
  ChevronDown,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Filter,
  Printer,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DATE_PRESETS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "./constants";
import type { ReportExportFormat, ReportsFilterState } from "./types";

export function ReportsFilterBar({
  filters,
  onChange,
  onReset,
  onExport,
  className,
}: {
  filters: ReportsFilterState;
  onChange: (next: ReportsFilterState) => void;
  onReset: () => void;
  onExport: (format: ReportExportFormat) => void;
  className?: string;
}) {
  const [exportOpen, setExportOpen] = useState(false);

  const setAdvanced = (key: keyof ReportsFilterState["advanced"], value: string) => {
    onChange({
      ...filters,
      advanced: { ...filters.advanced, [key]: value },
    });
  };

  return (
    <div
      className={cn(
        "sticky top-0 z-30 space-y-2 rounded-xl border border-apple-hairline bg-white/95 p-2.5 backdrop-blur",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-apple-ink-muted-48">
          Period
        </span>
        {DATE_PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange({ ...filters, preset: p.value })}
            className={cn(
              "h-6 rounded-full border px-2 text-[10px] transition-colors",
              filters.preset === p.value
                ? "border-apple-primary bg-apple-primary text-white"
                : "border-apple-hairline text-apple-ink-muted-80 hover:bg-apple-canvas-parchment",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {filters.preset === "custom" ? (
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-[10px] text-apple-ink-muted-80">
            From
            <input
              type="date"
              value={filters.start}
              onChange={(e) => onChange({ ...filters, start: e.target.value })}
              className="h-7 rounded-md border border-apple-hairline bg-apple-canvas px-2 text-[11px] outline-none focus:ring-1 focus:ring-apple-primary-focus"
            />
          </label>
          <label className="flex items-center gap-1.5 text-[10px] text-apple-ink-muted-80">
            To
            <input
              type="date"
              value={filters.end}
              onChange={(e) => onChange({ ...filters, end: e.target.value })}
              className="h-7 rounded-md border border-apple-hairline bg-apple-canvas px-2 text-[11px] outline-none focus:ring-1 focus:ring-apple-primary-focus"
            />
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...filters, showAdvanced: !filters.showAdvanced })}
          className={cn(
            "inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[10px]",
            filters.showAdvanced
              ? "border-apple-primary text-apple-primary"
              : "border-apple-hairline text-apple-ink-muted-80",
          )}
        >
          <Filter className="h-3 w-3" />
          Advanced
          <ChevronDown className={cn("h-3 w-3 transition", filters.showAdvanced && "rotate-180")} />
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-7 items-center gap-1 rounded-md border border-apple-hairline px-2 text-[10px] text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>

        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setExportOpen((v) => !v)}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-apple-hairline bg-apple-canvas px-2 text-[10px] font-medium text-apple-ink hover:bg-apple-canvas-parchment"
          >
            <Download className="h-3 w-3" />
            Export
            <ChevronDown className="h-3 w-3" />
          </button>
          {exportOpen ? (
            <div className="absolute right-0 z-40 mt-1 w-40 overflow-hidden rounded-lg border border-apple-hairline bg-white shadow-sm">
              {(
                [
                  { format: "pdf", label: "PDF", icon: FileText },
                  { format: "excel", label: "Excel", icon: FileSpreadsheet },
                  { format: "csv", label: "CSV", icon: FileSpreadsheet },
                  { format: "print", label: "Print", icon: Printer },
                  { format: "json", label: "JSON", icon: FileJson },
                ] as const
              ).map((item) => (
                <button
                  key={item.format}
                  type="button"
                  onClick={() => {
                    setExportOpen(false);
                    onExport(item.format);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-apple-ink hover:bg-apple-canvas-parchment"
                >
                  <item.icon className="h-3.5 w-3.5 text-apple-ink-muted-48" />
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {filters.showAdvanced ? (
        <div className="grid gap-2 rounded-lg border border-apple-hairline bg-apple-canvas-parchment/40 p-2 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-[10px] text-apple-ink-muted-80">
            Order status
            <select
              value={filters.advanced.orderStatus ?? ""}
              onChange={(e) => setAdvanced("orderStatus", e.target.value)}
              className="h-7 w-full rounded-md border border-apple-hairline bg-white px-2 text-[11px] outline-none"
            >
              {ORDER_STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-[10px] text-apple-ink-muted-80">
            Payment status
            <select
              value={filters.advanced.paymentStatus ?? ""}
              onChange={(e) => setAdvanced("paymentStatus", e.target.value)}
              className="h-7 w-full rounded-md border border-apple-hairline bg-white px-2 text-[11px] outline-none"
            >
              {PAYMENT_STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-[10px] text-apple-ink-muted-80">
            Payment method
            <select
              value={filters.advanced.paymentMethod ?? ""}
              onChange={(e) => setAdvanced("paymentMethod", e.target.value)}
              className="h-7 w-full rounded-md border border-apple-hairline bg-white px-2 text-[11px] outline-none"
            >
              {PAYMENT_METHOD_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-[10px] text-apple-ink-muted-80">
            Courier
            <input
              value={filters.advanced.courier ?? ""}
              onChange={(e) => setAdvanced("courier", e.target.value)}
              placeholder="e.g. Pathao"
              className="h-7 w-full rounded-md border border-apple-hairline bg-white px-2 text-[11px] outline-none"
            />
          </label>
          <label className="space-y-1 text-[10px] text-apple-ink-muted-80 sm:col-span-2">
            Search
            <input
              value={filters.advanced.search ?? ""}
              onChange={(e) => setAdvanced("search", e.target.value)}
              placeholder="Order #, customer, product…"
              className="h-7 w-full rounded-md border border-apple-hairline bg-white px-2 text-[11px] outline-none"
            />
          </label>
          <label className="space-y-1 text-[10px] text-apple-ink-muted-80">
            Min amount
            <input
              type="number"
              value={filters.advanced.minAmount ?? ""}
              onChange={(e) => setAdvanced("minAmount", e.target.value)}
              className="h-7 w-full rounded-md border border-apple-hairline bg-white px-2 text-[11px] outline-none"
            />
          </label>
          <label className="space-y-1 text-[10px] text-apple-ink-muted-80">
            Max amount
            <input
              type="number"
              value={filters.advanced.maxAmount ?? ""}
              onChange={(e) => setAdvanced("maxAmount", e.target.value)}
              className="h-7 w-full rounded-md border border-apple-hairline bg-white px-2 text-[11px] outline-none"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
