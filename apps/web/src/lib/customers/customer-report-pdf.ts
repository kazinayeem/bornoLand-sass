import type { StoreCustomer } from "@/redux/api/store-customers-api";
import { formatCurrency } from "@/lib/format-currency";

export type CustomerReportOptions = {
  storeName: string;
  storeLogoUrl?: string | null;
  title?: string;
  subtitle?: string;
  customers: StoreCustomer[];
  currencySettings?: any;
  targetWindow?: Window | null;
};

export type CustomerReportMetrics = {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
};

function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function calculateCustomerMetrics(customers: StoreCustomer[]): CustomerReportMetrics {
  let activeCustomers = 0;
  let inactiveCustomers = 0;
  let totalOrders = 0;
  let totalSpent = 0;

  for (const c of customers) {
    if ((c.status || "").toLowerCase() === "active") {
      activeCustomers++;
    } else {
      inactiveCustomers++;
    }
    totalOrders += Number(c.totalOrders) || 0;
    totalSpent += Number(c.totalSpent) || 0;
  }

  const totalCustomers = customers.length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

  return {
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    totalOrders,
    totalSpent,
    averageOrderValue,
  };
}

function formatReportTimestamp(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatCustomerDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString || "—";
  }
}

export function buildCustomerReportHtml(options: CustomerReportOptions): string {
  const {
    storeName,
    storeLogoUrl,
    title = "Customer Directory Report",
    subtitle,
    customers,
    currencySettings,
  } = options;

  const money = (val: number) => formatCurrency(val || 0, currencySettings);
  const metrics = calculateCustomerMetrics(customers);
  const generatedAt = formatReportTimestamp();

  // Logo tag
  let logoHtml = "";
  if (storeLogoUrl) {
    logoHtml = `<img src="${escapeHtml(storeLogoUrl)}" alt="${escapeHtml(
      storeName
    )}" class="store-logo" onerror="this.style.display='none'" />`;
  }

  // Summary KPI cards
  const summaryCardsHtml = `
    <div class="summary-grid summary-grid-5">
      <div class="summary-card">
        <div class="summary-label">Total Customers</div>
        <div class="summary-value">${metrics.totalCustomers}</div>
      </div>
      <div class="summary-card highlight-emerald">
        <div class="summary-label">Active</div>
        <div class="summary-value text-emerald">${metrics.activeCustomers}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Total Orders</div>
        <div class="summary-value text-blue">${metrics.totalOrders}</div>
      </div>
      <div class="summary-card highlight-success">
        <div class="summary-label">Total Spend</div>
        <div class="summary-value text-success">${escapeHtml(money(metrics.totalSpent))}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Average Order Value</div>
        <div class="summary-value">${escapeHtml(money(metrics.averageOrderValue))}</div>
      </div>
    </div>
  `;

  // Customer Table Rows
  let customerRowsHtml = "";
  if (customers.length === 0) {
    customerRowsHtml = `
      <tr>
        <td colspan="7" class="empty-state">No customer records found.</td>
      </tr>
    `;
  } else {
    customerRowsHtml = customers
      .map((c) => {
        const name = c.name || "Guest Customer";
        const email = c.email || "—";
        const phone = c.phone || "—";
        const status = (c.status || "active").toLowerCase();
        const ordersCount = c.totalOrders || 0;
        const completed = c.completedOrders ?? 0;
        const cancelled = c.cancelledOrders ?? 0;
        const totalSpent = money(c.totalSpent || 0);
        const aov = money(c.averageOrderValue || 0);
        const lastOrder = formatCustomerDate(c.lastOrderDate);
        const joined = formatCustomerDate(c.createdAt);

        return `
          <tr>
            <td>
              <div class="customer-name">${escapeHtml(name)}</div>
              <div class="sub-text">${escapeHtml(email)}</div>
            </td>
            <td>
              <span class="phone-text">${escapeHtml(phone)}</span>
            </td>
            <td class="text-center">
              <span class="badge badge-status ${escapeHtml(status)}">${escapeHtml(
          status === "active" ? "Active" : "Inactive"
        )}</span>
            </td>
            <td class="text-center">
              <div class="font-bold">${ordersCount}</div>
              <div class="sub-text">${completed} done &bull; ${cancelled} can.</div>
            </td>
            <td class="text-right font-bold text-success">${escapeHtml(totalSpent)}</td>
            <td class="text-right">${escapeHtml(aov)}</td>
            <td class="text-center">
              <div class="date-text">${escapeHtml(lastOrder)}</div>
              <div class="sub-text">Joined ${escapeHtml(joined)}</div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)} - ${escapeHtml(storeName)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 12mm 14mm 12mm;
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 9px;
        color: #64748b;
      }
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Header & Branding */
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .store-logo {
      height: 44px;
      width: 44px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .store-name {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .report-title-block {
      margin-top: 2px;
    }
    .report-title {
      font-size: 13px;
      font-weight: 600;
      color: #003399;
      margin: 0;
    }
    .report-subtitle {
      font-size: 10px;
      color: #64748b;
      margin: 1px 0 0 0;
    }
    .meta-section {
      text-align: right;
      font-size: 10px;
      color: #64748b;
    }
    .meta-strong {
      font-weight: 600;
      color: #1e293b;
    }

    /* Executive KPI Summaries */
    .summary-grid {
      display: grid;
      gap: 8px;
      margin-bottom: 16px;
    }
    .summary-grid-5 {
      grid-template-columns: repeat(5, 1fr);
    }
    .summary-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      background: #f8fafc;
    }
    .summary-card.highlight-success {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    .summary-card.highlight-emerald {
      background: #ecfdf5;
      border-color: #a7f3d0;
    }
    .summary-label {
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      font-weight: 700;
    }
    .summary-value {
      margin-top: 2px;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }
    .text-emerald { color: #059669; }
    .text-blue { color: #2563eb; }
    .text-success { color: #16a34a; }

    /* Section Headers */
    .section-break {
      margin-bottom: 18px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 8px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .section-subtitle {
      font-size: 9.5px;
      color: #64748b;
    }

    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 10px;
    }
    .data-table thead {
      display: table-header-group;
    }
    .data-table tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .data-table th, .data-table td {
      border-bottom: 1px solid #e2e8f0;
      padding: 6px 6px;
      text-align: left;
      vertical-align: middle;
      word-break: break-word;
    }
    .data-table th {
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #475569;
      background: #f1f5f9;
      font-weight: 700;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1px solid #cbd5e1;
    }
    .data-table tbody tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Cell content utilities */
    .customer-name {
      font-weight: 600;
      color: #0f172a;
    }
    .phone-text {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #334155;
    }
    .sub-text {
      font-size: 8.5px;
      color: #64748b;
      margin-top: 1px;
    }
    .font-bold { font-weight: 700; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 1.5px 5px;
      border-radius: 4px;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .badge-status.active { background: #dcfce7; color: #15803d; }
    .badge-status.inactive { background: #f1f5f9; color: #64748b; }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: #94a3b8;
      font-style: italic;
    }

    /* Footer */
    .report-footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      color: #64748b;
      font-size: 9px;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .summary-card, th, .badge, tr:nth-child(even) td {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <div class="brand-section">
      ${logoHtml}
      <div>
        <h1 class="store-name">${escapeHtml(storeName)}</h1>
        <div class="report-title-block">
          <div class="report-title">${escapeHtml(title)}</div>
          ${subtitle ? `<div class="report-subtitle">${escapeHtml(subtitle)}</div>` : ""}
        </div>
      </div>
    </div>
    <div class="meta-section">
      <div>Generated: <span class="meta-strong">${escapeHtml(generatedAt)}</span></div>
      <div>Records: <span class="meta-strong">${metrics.totalCustomers} customer${
    metrics.totalCustomers === 1 ? "" : "s"
  }</span></div>
    </div>
  </div>

  ${summaryCardsHtml}

  <div class="section-break">
    <div class="section-header">
      <h2 class="section-title">Customer List</h2>
      <span class="section-subtitle">${customers.length} record${
    customers.length === 1 ? "" : "s"
  }</span>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25%;">Customer / Email</th>
          <th style="width: 15%;">Phone</th>
          <th class="text-center" style="width: 10%;">Status</th>
          <th class="text-center" style="width: 14%;">Orders</th>
          <th class="text-right" style="width: 13%;">Total Spent</th>
          <th class="text-right" style="width: 11%;">AOV</th>
          <th class="text-center" style="width: 12%;">Last Order</th>
        </tr>
      </thead>
      <tbody>
        ${customerRowsHtml}
      </tbody>
    </table>
  </div>

  <div class="report-footer">
    <span>Confidential &bull; Customer directory for ${escapeHtml(storeName)}</span>
    <span>Powered by Bornoland E-Commerce</span>
  </div>
</body>
</html>`;
}

/**
 * Triggers the print dialog for a Customer Directory Report, using targetWindow if opened synchronously.
 */
export function printCustomerPdfReport(options: CustomerReportOptions) {
  const html = buildCustomerReportHtml(options);
  const targetWindow = options.targetWindow;

  if (targetWindow && !targetWindow.closed) {
    targetWindow.document.open();
    targetWindow.document.write(html);
    targetWindow.document.close();
    targetWindow.focus();

    const triggerPrint = () => {
      try {
        targetWindow.focus();
        targetWindow.print();
      } catch {
        // ignore
      }
    };

    if (targetWindow.document.readyState === "complete") {
      setTimeout(triggerPrint, 300);
    } else {
      targetWindow.addEventListener("load", () => setTimeout(triggerPrint, 250), { once: true });
      setTimeout(triggerPrint, 600);
    }
    return;
  }

  // Fallback if targetWindow wasn't provided or was closed
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");
  if (!printWindow) {
    URL.revokeObjectURL(url);
    throw new Error("Popup blocked. Please allow popups for this site to print report.");
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
    { once: true }
  );

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
