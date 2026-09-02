import React from "react";
import type { StoreIdentity, TabularReportData } from "../document-types";
import { DocumentHeader } from "../document-header";
import { DocumentFooter } from "../document-footer";

interface TabularReportDocumentProps {
  store: StoreIdentity;
  data: TabularReportData;
  isLandscape?: boolean;
}

export function TabularReportDocument({
  store,
  data,
  isLandscape = false,
}: TabularReportDocumentProps) {
  return (
    <div className={isLandscape ? "doc-sheet-a4-landscape" : "doc-sheet-a4-portrait"}>
      {/* Header */}
      <DocumentHeader
        store={store}
        title={data.title}
        subtitle={data.subtitle || (data.period ? `Report Period: ${data.period}` : undefined)}
        date={data.generatedAt || new Date()}
      />

      {/* Filter Badges */}
      {data.filters && Object.keys(data.filters).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 text-[11px] text-zinc-600 bg-zinc-50 border border-zinc-200 rounded p-2">
          <span className="font-bold text-zinc-700">Active Filters:</span>
          {Object.entries(data.filters).map(([k, v]) => (
            <span key={k} className="bg-white border border-zinc-200 px-2 py-0.5 rounded">
              <strong>{k}:</strong> {v}
            </span>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      {data.summaryCards && data.summaryCards.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {data.summaryCards.map((card, idx) => (
            <div key={idx} className="border border-zinc-200 rounded-lg p-3 bg-zinc-50/60">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block truncate">
                {card.label}
              </span>
              <span className="text-base font-black text-zinc-900 mt-1 block">
                {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
              </span>
              {card.change && (
                <span className="text-[10px] text-zinc-500 block mt-0.5">{card.change}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tabular Data */}
      <div className="border border-zinc-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-zinc-100 border-b border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-700">
              <th className="py-2.5 px-3 text-left w-10">#</th>
              {data.headers.map((h, idx) => (
                <th key={idx} className="py-2.5 px-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={data.headers.length + 1}
                  className="py-12 text-center text-zinc-400 italic"
                >
                  No records found for the selected filters.
                </td>
              </tr>
            ) : (
              data.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-zinc-50/50">
                  <td className="py-2 px-3 text-zinc-400 font-mono">{rIdx + 1}</td>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2 px-3 text-zinc-800">
                      {typeof cell === "number" ? cell.toLocaleString() : cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {data.totals && (
            <tfoot>
              <tr className="bg-zinc-100 border-t-2 border-zinc-300 font-bold text-xs text-zinc-900">
                <td className="py-2.5 px-3"></td>
                {data.totals.map((t, idx) => (
                  <td key={idx} className="py-2.5 px-3">
                    {typeof t === "number" ? t.toLocaleString() : t}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Footer */}
      <DocumentFooter notes={data.notes} showSignatures={false} />
    </div>
  );
}
