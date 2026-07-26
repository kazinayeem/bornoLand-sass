import { openReportWindow } from "@/components/data-grid";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function escapeCsv(value: string | number) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXml(value: string | number) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportRowsToCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const name = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  downloadBlob(name, blob);
}

export function exportRowsToJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const name = filename.endsWith(".json") ? filename : `${filename}.json`;
  downloadBlob(name, blob);
}

export type ExcelSheet = {
  name: string;
  headers: string[];
  rows: (string | number)[][];
};

/** Excel-compatible SpreadsheetML workbook (.xls). */
export function exportRowsToExcel(filename: string, sheets: ExcelSheet[]) {
  const sheetXml = sheets
    .map((sheet, index) => {
      const safeName = escapeXml(sheet.name.slice(0, 31) || `Sheet${index + 1}`);
      const headerRow = `<Row>${sheet.headers
        .map((h) => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`)
        .join("")}</Row>`;
      const bodyRows = sheet.rows
        .map((row) => {
          const cells = row
            .map((cell) => {
              const isNum = typeof cell === "number" && Number.isFinite(cell);
              return `<Cell><Data ss:Type="${isNum ? "Number" : "String"}">${escapeXml(cell)}</Data></Cell>`;
            })
            .join("");
          return `<Row>${cells}</Row>`;
        })
        .join("");
      return `<Worksheet ss:Name="${safeName}"><Table>${headerRow}${bodyRows}</Table></Worksheet>`;
    })
    .join("");

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
${sheetXml}
</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const name = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  downloadBlob(name, blob);
}

export type PrintReportPdfOptions = {
  title: string;
  storeName?: string;
  subtitle?: string;
  filtersLabel?: string;
  summary?: { label: string; value: string }[];
  headers: string[];
  rows: (string | number)[][];
  generatedBy?: string;
};

function buildReportPdfHtml(options: PrintReportPdfOptions) {
  const generatedAt = new Date().toLocaleString();
  const summaryHtml =
    options.summary && options.summary.length > 0
      ? `<div class="summary">${options.summary
          .map(
            (s) =>
              `<div class="summary-card"><div class="summary-label">${escapeHtml(s.label)}</div><div class="summary-value">${escapeHtml(s.value)}</div></div>`,
          )
          .join("")}</div>`
      : "";

  const headRow = options.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const bodyRows =
    options.rows.length === 0
      ? `<tr><td class="empty" colspan="${Math.max(options.headers.length, 1)}">No rows for this report.</td></tr>`
      : options.rows
          .map(
            (row) =>
              `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell ?? ""))}</td>`).join("")}</tr>`,
          )
          .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(options.title)}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 12mm;
      @bottom-center {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 9px;
        color: #6b7280;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #111827;
      font-family: "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 10px;
      line-height: 1.35;
      background: #fff;
      padding: 12px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-start;
      border-bottom: 2px solid #111827;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .brand { font-size: 11px; font-weight: 600; color: #6b7280; letter-spacing: 0.04em; text-transform: uppercase; }
    .title { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin: 4px 0 0; }
    .subtitle { margin: 4px 0 0; color: #6b7280; font-size: 10px; }
    .filters {
      margin: 0 0 12px;
      padding: 8px 10px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      color: #4b5563;
      font-size: 10px;
    }
    .meta { text-align: right; color: #6b7280; font-size: 9px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 8px;
      margin-bottom: 12px;
    }
    .summary-card {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 8px 10px;
      background: #f9fafb;
    }
    .summary-label {
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #6b7280;
      font-weight: 600;
    }
    .summary-value {
      margin-top: 2px;
      font-size: 13px;
      font-weight: 700;
      color: #111827;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td {
      border-bottom: 1px solid #e5e7eb;
      padding: 5px 7px;
      text-align: left;
      vertical-align: top;
      word-break: break-word;
    }
    th {
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      background: #f3f4f6;
      font-weight: 700;
    }
    tr:nth-child(even) td { background: #fafafa; }
    td.empty { text-align: center; color: #9ca3af; padding: 24px; }
    .footer {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      color: #6b7280;
      font-size: 9px;
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
      <div class="brand">${escapeHtml(options.storeName || "Bornoland Store")}</div>
      <h1 class="title">${escapeHtml(options.title)}</h1>
      ${options.subtitle ? `<p class="subtitle">${escapeHtml(options.subtitle)}</p>` : ""}
    </div>
    <div class="meta">
      <div>Generated ${escapeHtml(generatedAt)}</div>
      ${options.generatedBy ? `<div>By ${escapeHtml(options.generatedBy)}</div>` : ""}
      <div>${options.rows.length} row${options.rows.length === 1 ? "" : "s"}</div>
    </div>
  </div>
  ${options.filtersLabel ? `<div class="filters"><strong>Filters:</strong> ${escapeHtml(options.filtersLabel)}</div>` : ""}
  ${summaryHtml}
  <table>
    <thead><tr>${headRow}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <div class="footer">
    <span>Confidential store report</span>
    <span>Powered by Bornoland</span>
  </div>
</body>
</html>`;
}

export function printReportPdf(options: PrintReportPdfOptions) {
  const html = buildReportPdfHtml(options);
  const win = openReportWindow(options.title || "Report");
  if (win && !win.closed) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    const trigger = () => {
      try {
        win.focus();
        win.print();
      } catch {
        // ignore
      }
    };
    if (win.document.readyState === "complete") {
      setTimeout(trigger, 300);
    } else {
      win.addEventListener("load", () => setTimeout(trigger, 200), { once: true });
      setTimeout(trigger, 500);
    }
    return;
  }

  // Fallback: blob URL if popup was blocked after openReportWindow null
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const fallback = window.open(url, "_blank");
  if (!fallback) {
    URL.revokeObjectURL(url);
    throw new Error("Popup blocked. Allow popups for this site and try again.");
  }
  setTimeout(() => {
    try {
      fallback.focus();
      fallback.print();
    } catch {
      // ignore
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, 400);
}
