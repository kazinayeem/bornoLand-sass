import type { StoreOrder } from "@/redux/api/store-order-api";
import { ORDER_STATUS_LABELS } from "@/lib/orders/timeline";
import { formatCurrency } from "@/lib/format-currency";

export type OrderReportType = "daily" | "monthly" | "custom" | "filtered";

export type OrderReportOptions = {
  storeName: string;
  storeLogoUrl?: string | null;
  reportType: OrderReportType;
  title: string;
  subtitle?: string;
  dateLabel?: string;
  orders: StoreOrder[];
  currencySettings?: any;
  targetWindow?: Window | null;
};

export type OrderReportMetrics = {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingCount: number;
  processingCount: number;
  deliveredCount: number;
  cancelledCount: number;
  returnedCount: number;
  paidCount: number;
  unpaidCount: number;
};

export type DailyBreakdownRow = {
  date: string;
  displayDate: string;
  ordersCount: number;
  revenue: number;
  deliveredCount: number;
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

export function calculateOrderMetrics(orders: StoreOrder[]): OrderReportMetrics {
  let totalRevenue = 0;
  let pendingCount = 0;
  let processingCount = 0;
  let deliveredCount = 0;
  let cancelledCount = 0;
  let returnedCount = 0;
  let paidCount = 0;
  let unpaidCount = 0;

  for (const order of orders) {
    const total = Number(order.total) || 0;
    totalRevenue += total;

    const status = (order.status || "").toLowerCase();
    if (status === "pending" || status === "order placed") {
      pendingCount++;
    } else if (status === "processing" || status === "confirmed") {
      processingCount++;
    } else if (status === "delivered") {
      deliveredCount++;
    } else if (status === "cancelled") {
      cancelledCount++;
    } else if (status === "returned") {
      returnedCount++;
    }

    const paymentStatus = (order.paymentStatus || "").toLowerCase();
    if (paymentStatus === "paid") {
      paidCount++;
    } else {
      unpaidCount++;
    }
  }

  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    pendingCount,
    processingCount,
    deliveredCount,
    cancelledCount,
    returnedCount,
    paidCount,
    unpaidCount,
  };
}

export function computeDailyBreakdown(
  orders: StoreOrder[],
  money: (val: number) => string
): DailyBreakdownRow[] {
  const map = new Map<string, { count: number; revenue: number; delivered: number }>();

  for (const order of orders) {
    const rawDate = order.createdAt ? order.createdAt.slice(0, 10) : "Unknown";
    const existing = map.get(rawDate) || { count: 0, revenue: 0, delivered: 0 };
    existing.count += 1;
    existing.revenue += Number(order.total) || 0;
    if ((order.status || "").toLowerCase() === "delivered") {
      existing.delivered += 1;
    }
    map.set(rawDate, existing);
  }

  // Sort ascending by date
  const sortedDates = Array.from(map.keys()).sort();

  return sortedDates.map((dateStr) => {
    const data = map.get(dateStr)!;
    let displayDate = dateStr;
    try {
      const d = new Date(dateStr);
      displayDate = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(d);
    } catch {
      // keep fallback
    }

    return {
      date: dateStr,
      displayDate,
      ordersCount: data.count,
      revenue: data.revenue,
      deliveredCount: data.delivered,
    };
  });
}

function formatReportTimestamp(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatOrderDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return dateString || "";
  }
}

export function buildOrderReportHtml(options: OrderReportOptions): string {
  const {
    storeName,
    storeLogoUrl,
    reportType,
    title,
    subtitle,
    dateLabel,
    orders,
    currencySettings,
  } = options;

  const money = (val: number) => formatCurrency(val || 0, currencySettings);
  const metrics = calculateOrderMetrics(orders);
  const generatedAt = formatReportTimestamp();

  // Logo tag
  let logoHtml = "";
  if (storeLogoUrl) {
    logoHtml = `<img src="${escapeHtml(storeLogoUrl)}" alt="${escapeHtml(
      storeName
    )}" class="store-logo" onerror="this.style.display='none'" />`;
  }

  // Executive KPI summary cards
  let summaryCardsHtml = "";
  if (reportType === "monthly") {
    summaryCardsHtml = `
      <div class="summary-grid summary-grid-4">
        <div class="summary-card">
          <div class="summary-label">Total Orders</div>
          <div class="summary-value">${metrics.totalOrders}</div>
        </div>
        <div class="summary-card highlight-success">
          <div class="summary-label">Total Revenue</div>
          <div class="summary-value">${escapeHtml(money(metrics.totalRevenue))}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Average Order Value</div>
          <div class="summary-value">${escapeHtml(money(metrics.averageOrderValue))}</div>
        </div>
        <div class="summary-card highlight-emerald">
          <div class="summary-label">Delivered</div>
          <div class="summary-value">${metrics.deliveredCount}</div>
        </div>
      </div>
      <div class="summary-grid summary-grid-4 sub-kpis">
        <div class="summary-card">
          <div class="summary-label">Pending / Unconfirmed</div>
          <div class="summary-value text-amber">${metrics.pendingCount}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Processing / Shipped</div>
          <div class="summary-value text-blue">${metrics.processingCount}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Cancelled</div>
          <div class="summary-value text-rose">${metrics.cancelledCount}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Paid Orders</div>
          <div class="summary-value text-emerald">${metrics.paidCount}</div>
        </div>
      </div>
    `;
  } else {
    // Daily or Custom or Filtered report
    summaryCardsHtml = `
      <div class="summary-grid summary-grid-5">
        <div class="summary-card">
          <div class="summary-label">Orders</div>
          <div class="summary-value">${metrics.totalOrders}</div>
        </div>
        <div class="summary-card highlight-success">
          <div class="summary-label">Revenue</div>
          <div class="summary-value">${escapeHtml(money(metrics.totalRevenue))}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Pending</div>
          <div class="summary-value text-amber">${metrics.pendingCount}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Processing</div>
          <div class="summary-value text-blue">${metrics.processingCount}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Delivered</div>
          <div class="summary-value text-emerald">${metrics.deliveredCount}</div>
        </div>
      </div>
    `;
  }

  // Monthly daily breakdown section
  let dailyBreakdownHtml = "";
  if (reportType === "monthly" && orders.length > 0) {
    const dailyBreakdown = computeDailyBreakdown(orders, money);
    const breakdownRows = dailyBreakdown
      .map(
        (row) => `
        <tr>
          <td><strong>${escapeHtml(row.displayDate)}</strong></td>
          <td class="text-center">${row.ordersCount}</td>
          <td class="text-right font-bold text-success">${escapeHtml(money(row.revenue))}</td>
          <td class="text-center">${row.deliveredCount}</td>
        </tr>
      `
      )
      .join("");

    dailyBreakdownHtml = `
      <div class="section-break">
        <div class="section-header">
          <h2 class="section-title">Daily Sales Breakdown</h2>
          <span class="section-subtitle">${dailyBreakdown.length} active sales day${
      dailyBreakdown.length === 1 ? "" : "s"
    }</span>
        </div>
        <table class="data-table breakdown-table">
          <thead>
            <tr>
              <th style="width: 35%;">Date</th>
              <th class="text-center" style="width: 20%;">Orders</th>
              <th class="text-right" style="width: 25%;">Revenue</th>
              <th class="text-center" style="width: 20%;">Delivered</th>
            </tr>
          </thead>
          <tbody>
            ${breakdownRows}
          </tbody>
        </table>
      </div>
    `;
  }

  // Order Details Rows
  let orderRowsHtml = "";
  if (orders.length === 0) {
    orderRowsHtml = `
      <tr>
        <td colspan="6" class="empty-state">No order records found for this period.</td>
      </tr>
    `;
  } else {
    orderRowsHtml = orders
      .map((order) => {
        const orderNum = order.orderNumber || order._id.slice(-6);
        const orderDate = formatOrderDate(order.createdAt);
        const customerName =
          order.customerId?.name || order.shippingAddress?.fullName || "Guest Customer";
        const customerPhone = order.customerId?.phone || order.shippingAddress?.phone || "";
        const city = order.shippingAddress?.city || "";
        const itemCount = order.items?.length || 0;
        const totalFormatted = money(order.total || 0);
        const statusLabel = ORDER_STATUS_LABELS[order.status] ?? order.status;
        const payment = order.paymentStatus || "unpaid";
        const method = order.paymentMethod || "COD";

        return `
          <tr>
            <td>
              <div class="order-id">#${escapeHtml(orderNum)}</div>
              <div class="sub-text">${escapeHtml(orderDate)}</div>
            </td>
            <td>
              <div class="customer-name">${escapeHtml(customerName)}</div>
              <div class="sub-text">${escapeHtml(customerPhone)}${
          city ? ` &bull; ${escapeHtml(city)}` : ""
        }</div>
            </td>
            <td class="text-center">${itemCount} item${itemCount === 1 ? "" : "s"}</td>
            <td class="text-right font-bold">${escapeHtml(totalFormatted)}</td>
            <td class="text-center">
              <span class="badge badge-payment ${escapeHtml(payment)}">${escapeHtml(payment)}</span>
              <div class="sub-text">${escapeHtml(method)}</div>
            </td>
            <td class="text-center">
              <span class="badge badge-status ${escapeHtml(order.status)}">${escapeHtml(
          statusLabel
        )}</span>
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
      margin-bottom: 14px;
    }
    .summary-grid-4 {
      grid-template-columns: repeat(4, 1fr);
    }
    .summary-grid-5 {
      grid-template-columns: repeat(5, 1fr);
    }
    .sub-kpis {
      margin-top: -6px;
      margin-bottom: 18px;
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
    .text-amber { color: #d97706; }
    .text-blue { color: #2563eb; }
    .text-rose { color: #e11d48; }

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
    
    .breakdown-table {
      margin-bottom: 16px;
    }
    .breakdown-table th, .breakdown-table td {
      padding: 5px 8px;
    }

    /* Cell content utilities */
    .order-id {
      font-weight: 700;
      color: #0f172a;
    }
    .customer-name {
      font-weight: 600;
      color: #1e293b;
    }
    .sub-text {
      font-size: 8.5px;
      color: #64748b;
      margin-top: 1px;
    }
    .font-bold { font-weight: 700; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-success { color: #059669; }

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
    .badge-payment.paid { background: #dcfce7; color: #15803d; }
    .badge-payment.pending, .badge-payment.unpaid { background: #fef3c7; color: #b45309; }
    .badge-payment.failed { background: #fee2e2; color: #b91c1c; }
    .badge-status.delivered { background: #dcfce7; color: #15803d; }
    .badge-status.processing, .badge-status.shipped { background: #dbeafe; color: #1d4ed8; }
    .badge-status.cancelled { background: #fee2e2; color: #b91c1c; }
    .badge-status.pending { background: #fef3c7; color: #b45309; }

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
      ${dateLabel ? `<div>Date Range: <span class="meta-strong">${escapeHtml(dateLabel)}</span></div>` : ""}
      <div>Records: <span class="meta-strong">${metrics.totalOrders} order${metrics.totalOrders === 1 ? "" : "s"}</span></div>
    </div>
  </div>

  ${summaryCardsHtml}

  ${dailyBreakdownHtml}

  <div class="section-break">
    <div class="section-header">
      <h2 class="section-title">Order Records</h2>
      <span class="section-subtitle">${orders.length} record${orders.length === 1 ? "" : "s"}</span>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 17%;">Order # / Date</th>
          <th style="width: 25%;">Customer / Phone</th>
          <th class="text-center" style="width: 11%;">Items</th>
          <th class="text-right" style="width: 14%;">Total</th>
          <th class="text-center" style="width: 15%;">Payment</th>
          <th class="text-center" style="width: 18%;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${orderRowsHtml}
      </tbody>
    </table>
  </div>

  <div class="report-footer">
    <span>Confidential &bull; Generated for ${escapeHtml(storeName)}</span>
    <span>Powered by Bornoland E-Commerce</span>
  </div>
</body>
</html>`;
}

/**
 * Triggers the print dialog for an Order PDF Report, using targetWindow if opened synchronously.
 */
export function printOrderPdfReport(options: OrderReportOptions) {
  const html = buildOrderReportHtml(options);
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
    throw new Error("Popup blocked. Please allow popups for this site to print orders.");
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
