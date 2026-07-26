"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bookmark, Play, Save, Trash2 } from "lucide-react";
import { CUSTOM_AGGREGATES, CUSTOM_GROUP_BY, CUSTOM_REPORT_FIELDS } from "../constants";
import type { CustomAggregate, SavedReportTemplate } from "../types";
import { ReportPanel } from "../shared/ReportPanel";
import { ReportDataTable } from "../shared/ReportDataTable";
import { EmptyState } from "../shared/EmptyState";
import { customerName, type ModuleBaseProps } from "./module-types";

function storageKey(storeId: string) {
  return `bornoland.report.templates.${storeId}`;
}

function loadTemplates(storeId: string): SavedReportTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(storeId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedReportTemplate[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTemplates(storeId: string, templates: SavedReportTemplate[]) {
  localStorage.setItem(storageKey(storeId), JSON.stringify(templates));
}

type FlatRow = Record<string, string | number>;

function buildSourceRows(kpis: ModuleBaseProps["kpis"]): FlatRow[] {
  const orders = (kpis?.latestOrders ?? []).map((o) => ({
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus ?? "",
    paymentMethod: o.paymentMethod ?? "",
    total: o.total,
    createdAt: o.createdAt,
    customerName: customerName(o.customerId),
    productName: "",
    unitsSold: 0,
    revenue: o.total,
    category: "",
    courier: "",
    day: o.createdAt ? o.createdAt.slice(0, 10) : "",
  }));

  const products = (kpis?.topProducts ?? []).map((p) => ({
    orderNumber: "",
    status: "",
    paymentStatus: "",
    paymentMethod: "",
    total: p.revenue,
    createdAt: "",
    customerName: "",
    productName: p.name,
    unitsSold: p.totalSold,
    revenue: p.revenue,
    category: "",
    courier: "",
    day: "",
  }));

  const categories = (kpis?.topCategories ?? []).map((c) => ({
    orderNumber: "",
    status: "",
    paymentStatus: "",
    paymentMethod: "",
    total: c.revenue,
    createdAt: "",
    customerName: "",
    productName: "",
    unitsSold: c.units,
    revenue: c.revenue,
    category: String(c._id),
    courier: "",
    day: "",
  }));

  const couriers = (kpis?.courierBreakdown ?? []).map((c) => ({
    orderNumber: "",
    status: "",
    paymentStatus: "",
    paymentMethod: "",
    total: c.total,
    createdAt: "",
    customerName: "",
    productName: "",
    unitsSold: c.count,
    revenue: c.total,
    category: "",
    courier: String(c._id),
    day: "",
  }));

  return [...orders, ...products, ...categories, ...couriers];
}

function aggregateValues(values: number[], agg: CustomAggregate): number {
  if (values.length === 0) return 0;
  switch (agg) {
    case "SUM":
      return values.reduce((a, b) => a + b, 0);
    case "AVG":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "COUNT":
      return values.length;
    case "MIN":
      return Math.min(...values);
    case "MAX":
      return Math.max(...values);
    default:
      return values.length;
  }
}

export function CustomModule({ storeId, kpis, money }: ModuleBaseProps) {
  const [templates, setTemplates] = useState<SavedReportTemplate[]>([]);
  const [name, setName] = useState("My custom report");
  const [fields, setFields] = useState<string[]>(["orderNumber", "status", "total"]);
  const [groupBy, setGroupBy] = useState("none");
  const [aggregate, setAggregate] = useState<CustomAggregate>("SUM");
  const [aggregateField, setAggregateField] = useState("total");
  const [resultRows, setResultRows] = useState<FlatRow[]>([]);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    setTemplates(loadTemplates(storeId));
  }, [storeId]);

  const persist = useCallback(
    (next: SavedReportTemplate[]) => {
      setTemplates(next);
      saveTemplates(storeId, next);
    },
    [storeId],
  );

  const source = useMemo(() => buildSourceRows(kpis), [kpis]);

  const run = () => {
    const selected = fields.length > 0 ? fields : ["orderNumber"];
    if (groupBy === "none") {
      const rows = source.map((row) => {
        const out: FlatRow = {};
        for (const f of selected) {
          const v = row[f];
          out[f] = f === "total" || f === "revenue" ? money(Number(v || 0)) : (v ?? "");
        }
        return out;
      });
      setResultRows(rows);
      setRan(true);
      return;
    }

    const groups = new Map<string, FlatRow[]>();
    for (const row of source) {
      const key = String(row[groupBy] ?? "—");
      const list = groups.get(key) ?? [];
      list.push(row);
      groups.set(key, list);
    }

    const rows: FlatRow[] = [];
    for (const [key, list] of groups) {
      const nums = list.map((r) => Number(r[aggregateField] ?? 0));
      const aggVal = aggregateValues(nums, aggregate);
      const out: FlatRow = { [groupBy]: key, aggregate: `${aggregate}(${aggregateField})` };
      out.result =
        aggregateField === "total" || aggregateField === "revenue" || aggregate === "AVG"
          ? money(aggVal)
          : aggVal;
      out.count = list.length;
      rows.push(out);
    }
    setResultRows(rows);
    setRan(true);
  };

  const saveTemplate = () => {
    const now = new Date().toISOString();
    const tpl: SavedReportTemplate = {
      id: `tpl_${Date.now()}`,
      name: name.trim() || "Untitled",
      createdAt: now,
      updatedAt: now,
      fields,
      groupBy,
      aggregate,
      aggregateField,
    };
    persist([tpl, ...templates].slice(0, 40));
  };

  const loadTemplate = (tpl: SavedReportTemplate) => {
    setName(tpl.name);
    setFields(tpl.fields);
    setGroupBy(tpl.groupBy);
    setAggregate(tpl.aggregate);
    setAggregateField(tpl.aggregateField || "total");
  };

  const removeTemplate = (id: string) => {
    persist(templates.filter((t) => t.id !== id));
  };

  const resultColumns =
    groupBy === "none"
      ? fields.map((f) => ({
          id: f,
          label: CUSTOM_REPORT_FIELDS.find((c) => c.id === f)?.label ?? f,
          align: (f === "total" || f === "revenue" || f === "unitsSold" ? "right" : "left") as
            | "left"
            | "right",
        }))
      : [
          { id: groupBy, label: CUSTOM_GROUP_BY.find((g) => g.value === groupBy)?.label ?? groupBy },
          { id: "aggregate", label: "Aggregate" },
          { id: "result", label: "Result", align: "right" as const },
          { id: "count", label: "Rows", align: "right" as const },
        ];

  return (
    <div className="space-y-3">
      <ReportPanel title="Custom report builder" description="Select fields, group, and aggregate locally">
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="block space-y-1 text-[10px] text-apple-ink-muted-80">
              Template name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 w-full rounded-md border border-apple-hairline bg-white px-2 text-[11px] outline-none"
              />
            </label>

            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-apple-ink-muted-48">
                Fields
              </p>
              <div className="grid max-h-40 grid-cols-2 gap-1 overflow-auto rounded-md border border-apple-hairline p-2">
                {CUSTOM_REPORT_FIELDS.map((f) => (
                  <label key={f.id} className="flex items-center gap-1.5 text-[11px] text-apple-ink">
                    <input
                      type="checkbox"
                      checked={fields.includes(f.id)}
                      onChange={() => {
                        setFields((prev) =>
                          prev.includes(f.id) ? prev.filter((x) => x !== f.id) : [...prev, f.id],
                        );
                      }}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block space-y-1 text-[10px] text-apple-ink-muted-80">
              Group by
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="h-8 w-full rounded-md border border-apple-hairline bg-white px-2 text-[11px]"
              >
                {CUSTOM_GROUP_BY.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1 text-[10px] text-apple-ink-muted-80">
              Aggregate
              <select
                value={aggregate}
                onChange={(e) => setAggregate(e.target.value as CustomAggregate)}
                className="h-8 w-full rounded-md border border-apple-hairline bg-white px-2 text-[11px]"
              >
                {CUSTOM_AGGREGATES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1 text-[10px] text-apple-ink-muted-80">
              Aggregate field
              <select
                value={aggregateField}
                onChange={(e) => setAggregateField(e.target.value)}
                className="h-8 w-full rounded-md border border-apple-hairline bg-white px-2 text-[11px]"
              >
                {CUSTOM_REPORT_FIELDS.filter((f) => f.type === "number").map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={run}
                className="inline-flex h-8 items-center gap-1 rounded-md bg-apple-ink px-3 text-[11px] font-medium text-white"
              >
                <Play className="h-3 w-3" />
                Run
              </button>
              <button
                type="button"
                onClick={saveTemplate}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-apple-hairline px-3 text-[11px] text-apple-ink"
              >
                <Save className="h-3 w-3" />
                Save template
              </button>
            </div>
          </div>
        </div>
      </ReportPanel>

      <div className="grid gap-3 lg:grid-cols-3">
        <ReportPanel title="Saved templates" className="lg:col-span-1">
          {templates.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No saved templates"
              description="Save a builder config to reuse it later."
              className="py-8"
            />
          ) : (
            <ul className="space-y-1.5">
              {templates.map((tpl) => (
                <li
                  key={tpl.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-apple-hairline px-2 py-1.5"
                >
                  <button
                    type="button"
                    onClick={() => loadTemplate(tpl)}
                    className="min-w-0 text-left"
                  >
                    <p className="truncate text-[11px] font-medium text-apple-ink">{tpl.name}</p>
                    <p className="text-[10px] text-apple-ink-muted-48">
                      {tpl.fields.length} fields · {tpl.aggregate}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTemplate(tpl.id)}
                    className="rounded p-1 text-apple-ink-muted-48 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete template"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ReportPanel>

        <ReportPanel title="Results" className="lg:col-span-2">
          {!ran ? (
            <EmptyState
              title="Run a report"
              description="Configure fields and click Run to build a client-side table from dashboard data."
              className="py-10"
            />
          ) : (
            <ReportDataTable
              columns={resultColumns}
              rows={resultRows}
              rowKey={(r, i) => `${String(Object.values(r)[0] ?? "row")}-${i}`}
            />
          )}
        </ReportPanel>
      </div>
    </div>
  );
}
