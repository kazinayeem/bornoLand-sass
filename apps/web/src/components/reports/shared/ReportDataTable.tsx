"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Columns3,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportTableColumn } from "../types";
import { EmptyState } from "./EmptyState";

type Row = Record<string, string | number | null | undefined>;

function compareValues(a: string | number | null | undefined, b: string | number | null | undefined) {
  const av = a ?? "";
  const bv = b ?? "";
  if (typeof av === "number" && typeof bv === "number") return av - bv;
  return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
}

export function ReportDataTable({
  columns,
  rows,
  rowKey,
  pageSize = 10,
  searchable = true,
  onExportSelected,
  emptyTitle = "No rows",
  emptyDescription = "No data matches the current filters.",
  className,
}: {
  columns: ReportTableColumn[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string;
  pageSize?: number;
  searchable?: boolean;
  onExportSelected?: (selectedRows: Row[]) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}) {
  const [search, setSearch] = useState("");
  const [sortId, setSortId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [showCols, setShowCols] = useState(false);

  const visibleCols = columns.filter((c) => c.visible !== false && !hidden.has(c.id));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cols = columns.filter((c) => c.visible !== false && !hidden.has(c.id));
    let next = rows;
    if (q) {
      next = rows.filter((row) =>
        cols.some((col) => String(row[col.id] ?? "").toLowerCase().includes(q)),
      );
    }
    if (sortId) {
      next = [...next].sort((a, b) => {
        const cmp = compareValues(a[sortId], b[sortId]);
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return next;
  }, [rows, search, sortId, sortDir, columns, hidden]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const toggleSort = (id: string) => {
    if (sortId === id) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortId(id);
      setSortDir("asc");
    }
  };

  const allPageSelected =
    pageRows.length > 0 && pageRows.every((row, i) => selected.has(rowKey(row, safePage * pageSize + i)));

  const toggleAllPage = () => {
    const next = new Set(selected);
    if (allPageSelected) {
      pageRows.forEach((row, i) => next.delete(rowKey(row, safePage * pageSize + i)));
    } else {
      pageRows.forEach((row, i) => next.add(rowKey(row, safePage * pageSize + i)));
    }
    setSelected(next);
  };

  const selectedRows = filtered.filter((row, i) => selected.has(rowKey(row, i)));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {searchable ? (
          <div className="relative min-w-[160px] flex-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-apple-ink-muted-48" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search table…"
              className="h-7 w-full rounded-md border border-apple-hairline bg-apple-canvas pl-7 pr-2 text-[11px] text-apple-ink outline-none focus:ring-1 focus:ring-apple-primary-focus"
            />
          </div>
        ) : null}

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCols((v) => !v)}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-apple-hairline px-2 text-[10px] text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
          >
            <Columns3 className="h-3 w-3" />
            Columns
          </button>
          {showCols ? (
            <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-apple-hairline bg-white p-2 shadow-sm">
              {columns.map((col) => (
                <label key={col.id} className="flex items-center gap-2 py-1 text-[10px] text-apple-ink">
                  <input
                    type="checkbox"
                    checked={!hidden.has(col.id)}
                    onChange={() => {
                      setHidden((prev) => {
                        const next = new Set(prev);
                        if (next.has(col.id)) next.delete(col.id);
                        else next.add(col.id);
                        return next;
                      });
                    }}
                  />
                  {col.label}
                </label>
              ))}
            </div>
          ) : null}
        </div>

        {onExportSelected && selected.size > 0 ? (
          <button
            type="button"
            onClick={() => onExportSelected(selectedRows)}
            className="h-7 rounded-md border border-apple-hairline px-2 text-[10px] font-medium text-apple-ink hover:bg-apple-canvas-parchment"
          >
            Export selected ({selected.size})
          </button>
        ) : null}

        <span className="ml-auto text-[10px] text-apple-ink-muted-48">
          {filtered.length} row{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} className="py-8" />
      ) : (
        <>
          <div className="overflow-auto rounded-lg border border-apple-hairline">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-apple-canvas-parchment">
                <tr>
                  <th className="w-8 border-b border-apple-hairline px-2 py-1.5">
                    <input type="checkbox" checked={allPageSelected} onChange={toggleAllPage} aria-label="Select page" />
                  </th>
                  {visibleCols.map((col) => (
                    <th
                      key={col.id}
                      className={cn(
                        "border-b border-apple-hairline px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-apple-ink-muted-80",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                      )}
                    >
                      {col.sortable === false ? (
                        col.label
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleSort(col.id)}
                          className="inline-flex items-center gap-1 hover:text-apple-ink"
                        >
                          {col.label}
                          {sortId === col.id ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="h-2.5 w-2.5" />
                            ) : (
                              <ArrowDown className="h-2.5 w-2.5" />
                            )
                          ) : (
                            <ArrowUpDown className="h-2.5 w-2.5 opacity-40" />
                          )}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, i) => {
                  const key = rowKey(row, safePage * pageSize + i);
                  return (
                    <tr key={key} className="hover:bg-apple-canvas-parchment/50">
                      <td className="border-b border-apple-divider-soft px-2 py-1.5">
                        <input
                          type="checkbox"
                          checked={selected.has(key)}
                          onChange={() => {
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (next.has(key)) next.delete(key);
                              else next.add(key);
                              return next;
                            });
                          }}
                          aria-label="Select row"
                        />
                      </td>
                      {visibleCols.map((col) => (
                        <td
                          key={col.id}
                          className={cn(
                            "border-b border-apple-divider-soft px-2 py-1.5 text-[11px] text-apple-ink",
                            col.align === "right" && "text-right tabular-nums",
                            col.align === "center" && "text-center",
                          )}
                        >
                          {row[col.id] == null || row[col.id] === "" ? "—" : String(row[col.id])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] text-apple-ink-muted-48">
              Page {safePage + 1} of {pageCount}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={safePage <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="h-6 rounded border border-apple-hairline px-2 text-[10px] disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                className="h-6 rounded border border-apple-hairline px-2 text-[10px] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
