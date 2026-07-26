import type { ColumnDef } from "@tanstack/react-table";

type AccessorColumn<T> = ColumnDef<T, unknown> & {
  accessorKey?: string;
  accessorFn?: (row: T, index: number) => unknown;
};

export type ReportSummaryItem = {
  label: string;
  value: string;
};

export type PrintReportOptions = {
  title: string;
  subtitle?: string;
  generatedAt?: string;
  summary?: ReportSummaryItem[];
  headers: string[];
  rows: string[][];
  footerNote?: string;
};

function escapeCsv(value: unknown): string {
  if (value == null) return "";
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readNestedValue(row: unknown, path: string): unknown {
  if (!path || row == null || typeof row !== "object") return undefined;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, row);
}

export function getColumnExportValue<T>(column: ColumnDef<T, unknown>, row: T, index = 0): string {
  const meta = column.meta as { exportable?: boolean; exportValue?: (row: T) => unknown } | undefined;
  if (meta?.exportable === false) return "";
  if (typeof meta?.exportValue === "function") {
    const value = meta.exportValue(row);
    return value == null ? "" : String(value);
  }

  const accessorCol = column as AccessorColumn<T>;
  if (typeof accessorCol.accessorFn === "function") {
    const value = accessorCol.accessorFn(row, index);
    return value == null ? "" : String(value);
  }
  if (typeof accessorCol.accessorKey === "string") {
    const value = readNestedValue(row, accessorCol.accessorKey);
    if (value == null) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }
  return "";
}

export function getExportableColumns<T>(columns: ColumnDef<T, unknown>[]) {
  return columns.filter((col) => {
    if (!col.id || col.id === "select" || col.id === "actions") return false;
    const meta = col.meta as { exportable?: boolean } | undefined;
    return meta?.exportable !== false;
  });
}

export function buildExportTable<T>(rows: T[], columns: ColumnDef<T, unknown>[]) {
  const exportable = getExportableColumns(columns);
  const headers = exportable.map((col) => {
    const meta = col.meta as { label?: string } | undefined;
    return meta?.label ?? (typeof col.header === "string" ? col.header : col.id) ?? "";
  });
  const dataRows = rows.map((row, index) =>
    exportable.map((col) => getColumnExportValue(col, row, index)),
  );
  return { headers, rows: dataRows };
}

export function exportRowsToCsv<T>(
  rows: T[],
  columns: ColumnDef<T, unknown>[],
  filename = "export.csv",
) {
  const { headers, rows: dataRows } = buildExportTable(rows, columns);
  const lines = [
    headers.join(","),
    ...dataRows.map((row) => row.map((cell) => escapeCsv(cell)).join(",")),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Build report HTML for print/export. */
export function buildDataGridReportHtml(options: PrintReportOptions): string {
  const generatedAt =
    options.generatedAt ||
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date());

  const summaryHtml =
    options.summary && options.summary.length > 0
      ? `<div class="summary">${options.summary
          .map(
            (item) =>
              `<div class="summary-card"><div class="summary-label">${escapeHtml(item.label)}</div><div class="summary-value">${escapeHtml(item.value)}</div></div>`,
          )
          .join("")}</div>`
      : "";

  const headRow = options.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const bodyRows =
    options.rows.length > 0
      ? options.rows
          .map(
            (row) =>
              `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
          )
          .join("")
      : `<tr><td colspan="${Math.max(options.headers.length, 1)}" class="empty">No rows to export.</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(options.title)}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #111827;
      font-family: "Inter", "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.35;
      background: #fff;
      padding: 16px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-start;
      border-bottom: 2px solid #111827;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .title { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
    .subtitle { margin: 4px 0 0; color: #6b7280; font-size: 11px; }
    .meta { text-align: right; color: #6b7280; font-size: 10px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 14px;
    }
    .summary-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 8px 10px;
      background: #f9fafb;
    }
    .summary-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #6b7280;
      font-weight: 600;
    }
    .summary-value {
      margin-top: 2px;
      font-size: 14px;
      font-weight: 700;
      color: #111827;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
    }
    th, td {
      border-bottom: 1px solid #e5e7eb;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
      word-break: break-word;
    }
    th {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      background: #f3f4f6;
      font-weight: 700;
    }
    tr:nth-child(even) td { background: #fafafa; }
    td.empty { text-align: center; color: #9ca3af; padding: 24px; }
    .footer {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      color: #6b7280;
      font-size: 10px;
    }
    .loading {
      padding: 48px 16px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; }
      .summary-card, th, tr:nth-child(even) td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">${escapeHtml(options.title)}</h1>
      ${options.subtitle ? `<p class="subtitle">${escapeHtml(options.subtitle)}</p>` : ""}
    </div>
    <div class="meta">
      <div>Generated ${escapeHtml(generatedAt)}</div>
      <div>${options.rows.length} row${options.rows.length === 1 ? "" : "s"}</div>
    </div>
  </div>
  ${summaryHtml}
  <table>
    <thead><tr>${headRow}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <div class="footer">
    <span>${escapeHtml(options.footerNote || "Confidential store report")}</span>
    <span>Powered by Bornoland</span>
  </div>
</body>
</html>`;
}

/**
 * Open a report window synchronously (must be called directly from a click handler
 * before any await, otherwise browsers blank/block the popup).
 */
export function openReportWindow(loadingTitle = "Generating report…"): Window | null {
  // Do NOT pass noopener — that returns null and leaves an empty about:blank tab.
  const printWindow = window.open("about:blank", "_blank");
  if (!printWindow) return null;

  printWindow.document.open();
  printWindow.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(loadingTitle)}</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;color:#6b7280}</style>
</head><body><p>${escapeHtml(loadingTitle)}</p></body></html>`);
  printWindow.document.close();
  return printWindow;
}

function writeReportToWindow(printWindow: Window, html: string) {
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  const triggerPrint = () => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch {
      // ignore print errors (user may have closed the tab)
    }
  };

  // Give the browser a moment to paint before opening the print dialog
  if (printWindow.document.readyState === "complete") {
    setTimeout(triggerPrint, 300);
  } else {
    printWindow.addEventListener("load", () => setTimeout(triggerPrint, 200), { once: true });
    setTimeout(triggerPrint, 500);
  }
}

/**
 * Opens a clean printable report window (not a dump of interactive UI).
 * Pass `targetWindow` from `openReportWindow()` when export is async.
 */
export function printDataGridReport(options: PrintReportOptions, targetWindow?: Window | null) {
  const html = buildDataGridReportHtml(options);

  if (targetWindow && !targetWindow.closed) {
    writeReportToWindow(targetWindow, html);
    return;
  }

  // Prefer blob URL — more reliable than document.write on a fresh tab
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");
  if (!printWindow) {
    URL.revokeObjectURL(url);
    throw new Error("Popup blocked. Allow popups for this site and try again.");
  }

  const cleanup = () => {
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  printWindow.addEventListener(
    "load",
    () => {
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch {
          // ignore
        }
        cleanup();
      }, 250);
    },
    { once: true },
  );
  // Fallback if load already fired
  setTimeout(() => {
    try {
      if (!printWindow.closed) {
        printWindow.focus();
        printWindow.print();
      }
    } catch {
      // ignore
    }
    cleanup();
  }, 800);
}

/** @deprecated Prefer printDataGridReport with structured rows. Kept for compatibility. */
export function printDataGrid(title: string) {
  printDataGridReport({
    title,
    headers: ["Note"],
    rows: [["Interactive table export is unavailable. Use Export PDF/CSV from the toolbar."]],
  });
}
