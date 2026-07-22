import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type CurrencyCode = string;

type OrderItem = {
  name?: string;
  variantTitle?: string;
  sku?: string;
  quantity?: number;
  price?: number;
  image?: string;
  discount?: number;
  tax?: number;
};

type PopulatedCustomer = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
};

export type OrderInvoicePayload = {
  order: {
    _id?: string;
    invoiceNumber?: string;
    orderNumber?: string;
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentGateway?: string;
    currencyCode?: CurrencyCode;
    subtotal?: number;
    discount?: number;
    shipping?: number;
    deliveryCharge?: number;
    deliveryZone?: string;
    tax?: number;
    total?: number;
    refundAmount?: number;
    notes?: string;
    couponCode?: string;
    paymentVerification?: {
      transactionId?: string;
      status?: string;
      reviewedAt?: Date | string;
      note?: string;
    };
    paidAt?: Date | string;
    referenceNumber?: string;
    shippingAddress?: {
      fullName?: string;
      phone?: string;
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
    items?: OrderItem[];
    timeline?: Array<{ status?: string; createdAt?: Date | string }>;
    customerId?: PopulatedCustomer | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
  store: {
    name?: string;
    shortName?: string;
    slug?: string;
    subdomain?: string;
    logoUrl?: string;
    faviconUrl?: string;
    brandColor?: string;
    theme?: { primaryColor?: string };
    websiteUrl?: string;
  };
  storeContact?: {
    businessName?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    socialLinks?: Record<string, string>;
  } | null;
  storeSettings?: {
    locale?: string;
    timezone?: string;
    currencyCode?: CurrencyCode;
    currencySymbol?: string;
    currencyPosition?: "before" | "after";
    decimalPlaces?: number;
  } | null;
  storeLogoBuffer?: Buffer | null;
  verificationUrl?: string;
};

/* ── Black & White Palette ─────────────────────────────────────────── */

const C = {
  text: "#000000",
  muted: "#6B7280",
  border: "#E5E7EB",
  hairline: "#F3F4F6",
  white: "#FFFFFF",
};

/* ── Fonts ──────────────────────────────────────────────────────────── */

function loadFont(name: string): string | null {
  const fontPath = path.resolve(__dirname, "../../assets/fonts", name);
  return fs.existsSync(fontPath) ? fontPath : null;
}

/* ── Formatting ─────────────────────────────────────────────────────── */

function formatDateTime(value: Date | string | undefined | null, timezone = "UTC"): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try {
    const day = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
    if (!day || !time || day.includes("Invalid") || time.includes("Invalid")) return "";
    return `${day} • ${time}`;
  } catch {
    return "";
  }
}

function formatMoney(
  amount: number,
  settings?: {
    currencyCode?: string;
    currencySymbol?: string;
    currencyPosition?: "before" | "after";
    decimalPlaces?: number;
    locale?: string;
  },
): string {
  const decimals = Number.isFinite(settings?.decimalPlaces) ? Number(settings?.decimalPlaces) : 2;
  const value = Number.isFinite(amount) ? amount : 0;
  const locale = settings?.locale?.startsWith("bn") ? "en-BD" : (settings?.locale || "en-US");
  const formatted = value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  });
  const symbol = (settings?.currencySymbol || settings?.currencyCode || "").trim();
  if (!symbol) return formatted;
  const nbsp = "\u00A0";
  return settings?.currencyPosition === "after"
    ? `${formatted}${nbsp}${symbol}`
    : `${symbol}${nbsp}${formatted}`;
}

function titleCase(value?: string | null): string {
  if (!value?.trim()) return "";
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function statusLabel(status?: string): string {
  return titleCase(status || "Pending").toUpperCase();
}

function completedAt(order: OrderInvoicePayload["order"]): Date | string | undefined {
  if ((order.status || "").toLowerCase() === "delivered") {
    const delivered = order.timeline?.find((e) => e.status === "delivered")?.createdAt;
    return delivered || order.updatedAt || order.createdAt;
  }
  if ((order.status || "").toLowerCase() === "cancelled") {
    const cancelled = order.timeline?.find((e) => e.status === "cancelled")?.createdAt;
    return cancelled || order.updatedAt;
  }
  return undefined;
}

function paidAt(order: OrderInvoicePayload["order"]): Date | string | undefined {
  if ((order.paymentStatus || "").toLowerCase() !== "paid") return undefined;
  return (
    order.paidAt ||
    order.paymentVerification?.reviewedAt ||
    order.timeline?.find((e) => e.status === "paid" || e.status === "confirmed")?.createdAt ||
    order.updatedAt
  );
}

/* ── Watermark ──────────────────────────────────────────────────────── */

function drawWatermark(doc: PDFKit.PDFDocument, status: string, fonts: Record<string, string>) {
  const labels: Record<string, string> = {
    paid: "PAID",
    pending: "UNPAID",
    partial: "PARTIAL",
    failed: "FAILED",
    refunded: "REFUNDED",
    cancelled: "CANCELLED",
    delivered: "DELIVERED",
  };
  const text = labels[status.toLowerCase()] || "INVOICE";
  doc.save();
  doc.font(fonts.bold).fontSize(72).fillColor("#e5e7eb");
  doc.translate(doc.page.width / 2, doc.page.height / 2);
  doc.rotate(-45);
  doc.text(text, -doc.widthOfString(text) / 2, -20, { align: "center" });
  doc.restore();
}

/* ── Drawing helpers ────────────────────────────────────────────────── */

function drawDivider(doc: PDFKit.PDFDocument, x1: number, x2: number, y: number) {
  doc.save();
  doc.moveTo(x1, y).lineTo(x2, y).lineWidth(0.5).strokeColor(C.border).stroke();
  doc.restore();
}

/* ── Main generator ──────────────────────────────────────────────────── */

export async function generateOrderInvoicePdf(payload: OrderInvoicePayload): Promise<Buffer> {
  const fontRegular = loadFont("Inter-Regular.ttf");
  const fontMedium = loadFont("Inter-Medium.ttf");
  const fontSemiBold = loadFont("Inter-SemiBold.ttf");
  const fontBold = loadFont("Inter-Bold.ttf");

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 42, bottom: 56, left: 42, right: 42 },
    autoFirstPage: true,
    bufferPages: true,
    info: {
      Title: `Invoice ${payload.order.invoiceNumber ?? payload.order.orderNumber ?? ""}`,
      Author: payload.store.name || "Store",
      Subject: `Order ${payload.order.orderNumber ?? ""}`,
      Creator: "BornoLand",
      Keywords: "invoice, order",
    },
  });

  if (fontRegular) doc.registerFont("Inter", fontRegular);
  if (fontMedium) doc.registerFont("Inter-Medium", fontMedium);
  if (fontSemiBold) doc.registerFont("Inter-SemiBold", fontSemiBold);
  if (fontBold) doc.registerFont("Inter-Bold", fontBold);

  const F = {
    regular: fontRegular ? "Inter" : "Helvetica",
    medium: fontMedium ? "Inter-Medium" : "Helvetica",
    semiBold: fontSemiBold ? "Inter-SemiBold" : "Helvetica-Bold",
    bold: fontBold ? "Inter-Bold" : "Helvetica-Bold",
  };

  const chunks: Buffer[] = [];
  return await new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    void (async () => {
      try {
        const order = payload.order;
        const store = payload.store;
        const contact = payload.storeContact ?? null;
        const settings = payload.storeSettings ?? null;
        const timezone = settings?.timezone || "UTC";
        const moneySettings = {
          currencyCode: order.currencyCode || settings?.currencyCode || "USD",
          currencySymbol: settings?.currencySymbol,
          currencyPosition: settings?.currencyPosition,
          decimalPlaces: settings?.decimalPlaces,
          locale: settings?.locale,
        };

        const storeName =
          contact?.businessName?.trim() ||
          store.shortName?.trim() ||
          store.name?.trim() ||
          "Store";
        const storeAddress = [contact?.address, contact?.city, contact?.postalCode, contact?.country]
          .map((v) => v?.trim())
          .filter(Boolean)
          .join(", ");
        const storePhone = contact?.phone?.trim() || "";
        const storeEmail = contact?.email?.trim() || "";
        const storeWebsite = store.websiteUrl?.trim() || "";

        const customer =
          typeof order.customerId === "object" && order.customerId ? order.customerId : null;
        const customerName = customer?.name?.trim() || order.shippingAddress?.fullName?.trim() || "";
        const customerEmail = customer?.email?.trim() || "";
        const customerPhone = customer?.phone?.trim() || order.shippingAddress?.phone?.trim() || "";
        const customerId = customer?._id ? String(customer._id) : "";

        const ship = order.shippingAddress;
        const shippingMethod = order.deliveryZone?.trim() || "";
        const shippingCharge = Number(order.shipping ?? order.deliveryCharge ?? 0);

        const subtotal = Number(order.subtotal ?? 0);
        const discount = Number(order.discount ?? 0);
        const tax = Number(order.tax ?? 0);
        const total = Number(order.total ?? 0);
        const refund = Number(order.refundAmount ?? 0);
        const paymentStatus = (order.paymentStatus || "").toLowerCase();
        const paymentReceived = paymentStatus === "paid" ? Math.max(0, total - refund) : 0;
        const remainingDue = paymentStatus === "paid" ? 0 : Math.max(0, total - refund);

        const invoiceNo = order.invoiceNumber?.trim() || "";
        const orderNo = order.orderNumber?.trim() || "";
        const invoiceDate = formatDateTime(order.createdAt, timezone) || "—";
        const dueDate = invoiceDate;
        const completedDate = formatDateTime(completedAt(order), timezone);
        const paidDate = formatDateTime(paidAt(order), timezone);
        const orderStatusLabel = statusLabel(order.status);
        const paymentStatusLabel = statusLabel(order.paymentStatus);

        const txnId = order.paymentVerification?.transactionId?.trim() || "";
        const gateway = (order.paymentGateway || order.paymentMethod || "").trim();
        const reference =
          order.referenceNumber?.trim() ||
          order.paymentVerification?.note?.trim() ||
          "";
        const couponCode = order.couponCode?.trim() || "";

        const logoBuffer = payload.storeLogoBuffer ?? null;

        /* ── Layout constants ─────────────────────────────────────────────── */
        const LM = 42;
        const RM = doc.page.width - 42;
        const PW = RM - LM;
        let y = 42;
        const bottomLimit = doc.page.height - 70;

        const ensureSpace = (needed: number) => {
          if (y + needed <= bottomLimit) return;
          doc.addPage();
          y = 42;
        };

        /* ── Header: Store Info (left) + Invoice Meta (right) ───────────── */
        const leftColW = PW * 0.55;
        const rightColW = PW * 0.42;
        const rightColX = LM + PW - rightColW;

        // Store logo + name
        if (logoBuffer) {
          doc.image(logoBuffer, LM, y, { width: 36, height: 36 });
          doc.font(F.bold).fontSize(15).fillColor(C.text);
          doc.text(storeName, LM + 44, y + 2, { width: leftColW - 44, lineBreak: false });
        } else {
          doc.font(F.bold).fontSize(15).fillColor(C.text);
          doc.text(storeName, LM, y, { width: leftColW, lineBreak: false });
        }

        // Store contact info
        let infoY = y + (logoBuffer ? 24 : 22);
        const infoSize = 9;
        doc.font(F.regular).fontSize(infoSize).fillColor(C.muted);
        if (storeAddress) {
          doc.text(storeAddress, LM, infoY, { width: leftColW, lineBreak: false });
          infoY += 13;
        }
        const contactLine = [storePhone, storeEmail, storeWebsite].filter(Boolean);
        if (contactLine.length) {
          doc.text(contactLine.join("  ·  "), LM, infoY, { width: leftColW, lineBreak: false });
        }

        // Right side: INVOICE title
        const invoiceTitleY = y + (logoBuffer ? 0 : 0);
        doc.font(F.bold).fontSize(28).fillColor(C.text);
        doc.text("INVOICE", rightColX, invoiceTitleY, { width: rightColW, align: "right", lineBreak: false });

        // Invoice meta
        const metaLines: Array<[string, string]> = [];
        if (invoiceNo) metaLines.push(["Invoice No.", invoiceNo]);
        if (orderNo) metaLines.push(["Order No.", orderNo]);
        metaLines.push(["Invoice Date", invoiceDate]);
        metaLines.push(["Due Date", dueDate]);
        metaLines.push(["Order Status", orderStatusLabel]);
        metaLines.push(["Payment Status", paymentStatusLabel]);

        let metaY = invoiceTitleY + 34;
        doc.font(F.regular).fontSize(8).fillColor(C.muted);
        metaLines.forEach(([label, value]) => {
          drawInfoLineRight(doc, label, value, rightColX, metaY, rightColW, F);
          metaY += 12;
        });

        y = Math.max(infoY + 24, metaY + 8);

        /* ── Divider ────────────────────────────────────────────────────────── */
        drawDivider(doc, LM, RM, y);
        y += 20;

        /* ── Customer / Shipping ──────────────────────────────────────────── */
        ensureSpace(100);
        const halfW = (PW - 16) / 2;

        // Customer
        doc.font(F.semiBold).fontSize(10).fillColor(C.text);
        doc.text("Customer", LM, y, { lineBreak: false });
        let cy = y + 16;
        const customerInfo: Array<[string, string]> = [];
        if (customerName) customerInfo.push(["Name", customerName]);
        if (customerEmail) customerInfo.push(["Email", customerEmail]);
        if (customerPhone) customerInfo.push(["Phone", customerPhone]);
        if (customerId) customerInfo.push(["Customer ID", customerId]);
        doc.font(F.regular).fontSize(9).fillColor(C.muted);
        customerInfo.forEach(([label, value]) => {
          doc.text(`${label}: `, LM, cy, { width: 52, lineBreak: false });
          doc.font(F.medium).fontSize(9).fillColor(C.text);
          doc.text(value, LM + 52, cy, { width: halfW - 52, lineBreak: false });
          doc.font(F.regular).fontSize(9).fillColor(C.muted);
          cy += 14;
        });

        // Shipping
        const shipX = LM + halfW + 16;
        doc.font(F.semiBold).fontSize(10).fillColor(C.text);
        doc.text("Shipping", shipX, y, { lineBreak: false });
        let sy = y + 16;
        const shipInfo: Array<[string, string]> = [];
        if (ship?.fullName) shipInfo.push(["Recipient", ship.fullName]);
        if (ship?.phone) shipInfo.push(["Phone", ship.phone]);
        const addressLine = [ship?.street, ship?.city, ship?.state, ship?.zip, ship?.country]
          .map((v) => v?.trim())
          .filter(Boolean)
          .join(", ");
        if (addressLine) shipInfo.push(["Address", addressLine]);
        if (shippingMethod) shipInfo.push(["Method", shippingMethod]);
        if (shippingCharge > 0 || order.shipping != null || order.deliveryCharge != null) {
          shipInfo.push(["Charge", formatMoney(shippingCharge, moneySettings)]);
        }
        doc.font(F.regular).fontSize(9).fillColor(C.muted);
        shipInfo.forEach(([label, value]) => {
          doc.text(`${label}: `, shipX, sy, { width: 52, lineBreak: false });
          doc.font(F.medium).fontSize(9).fillColor(C.text);
          doc.text(value, shipX + 52, sy, { width: halfW - 52, lineBreak: false });
          doc.font(F.regular).fontSize(9).fillColor(C.muted);
          sy += 14;
        });

        y = Math.max(y + 20 + Math.max(customerInfo.length, shipInfo.length) * 14, cy, sy) + 8;

        /* ── Divider ────────────────────────────────────────────────────────── */
        drawDivider(doc, LM, RM, y);
        y += 16;

        /* ── Items Table ──────────────────────────────────────────────────── */
        ensureSpace(40);

        const cols = [
          { key: "product", label: "Product", width: 120, align: "left" as const },
          { key: "variant", label: "Variant", width: 80, align: "left" as const },
          { key: "sku", label: "SKU", width: 60, align: "left" as const },
          { key: "qty", label: "Qty", width: 30, align: "center" as const },
          { key: "unit", label: "Unit Price", width: 80, align: "right" as const },
          { key: "disc", label: "Discount", width: 72, align: "right" as const },
          { key: "tax", label: "Tax", width: 50, align: "right" as const },
          { key: "total", label: "Total", width: 80, align: "right" as const },
        ];
        const colSum = cols.reduce((sum, c) => sum + c.width, 0);
        const scale = PW / colSum;
        const scaledCols = cols.map((c) => ({ ...c, width: c.width * scale }));

        const drawTableHeader = () => {
          doc.font(F.semiBold).fontSize(8).fillColor(C.muted);
          let hx = LM;
          scaledCols.forEach((col) => {
            doc.text(col.label, hx, y, { width: col.width, align: col.align, lineBreak: false });
            hx += col.width;
          });
          y += 14;
          drawDivider(doc, LM, RM, y);
          y += 4;
        };

        drawTableHeader();

        const items = order.items ?? [];
        if (items.length === 0) {
          doc.font(F.regular).fontSize(9).fillColor(C.muted);
          doc.text("No items on this order.", LM, y, { lineBreak: false });
          y += 18;
        } else {
          for (let i = 0; i < items.length; i += 1) {
            const item = items[i];
            const qty = Number(item.quantity ?? 0);
            const unit = Number(item.price ?? 0);
            const itemDiscount = Number(item.discount ?? 0);
            const itemTax = Number(item.tax ?? 0);
            const lineSubtotal = qty * unit;
            const lineTotal = Math.max(0, lineSubtotal - itemDiscount + itemTax);
            const rowH = 16;

            ensureSpace(rowH + 10);
            if (y + rowH > bottomLimit - 10) {
              doc.addPage();
              y = 42;
              drawTableHeader();
            }

            // Alternating row background (very subtle)
            if (i % 2 === 1) {
              doc.save();
              doc.rect(LM, y, PW, rowH).fill(C.hairline);
              doc.restore();
            }

            let rx = LM;
            const cellContents = [
              item.name?.trim() || "",
              item.variantTitle?.trim() || "",
              item.sku?.trim() || "",
              String(qty || 0),
              formatMoney(unit, moneySettings),
              itemDiscount ? formatMoney(itemDiscount, moneySettings) : "—",
              itemTax ? formatMoney(itemTax, moneySettings) : "—",
              formatMoney(lineTotal, moneySettings),
            ];

            scaledCols.forEach((col, ci) => {
              doc.font(F.regular).fontSize(8).fillColor(C.text);
              doc.text(cellContents[ci] || "—", rx, y + 3, {
                width: col.width - 4,
                align: col.align,
                lineBreak: false,
              });
              rx += col.width;
            });
            y += rowH;
          }
        }

        /* ── Bottom divider after table ─────────────────────────────────────── */
        drawDivider(doc, LM, RM, y + 2);
        y += 10;

        /* ── Notes (left) + Totals (right) ────────────────────────────────── */
        ensureSpace(120);

        // Notes
        const notesW = PW * 0.48;
        const hasNotes = order.notes?.trim();
        const hasPaymentInfo = txnId || gateway || paidDate || reference;

        if (hasNotes) {
          doc.font(F.semiBold).fontSize(9).fillColor(C.text);
          doc.text("Notes", LM, y, { lineBreak: false });
          doc.font(F.regular).fontSize(8).fillColor(C.muted);
          doc.text(order.notes!.trim(), LM, y + 14, { width: notesW, lineBreak: true });
        }

        // Payment info block (below notes)
        if (hasPaymentInfo) {
          const payInfoY = hasNotes ? y + 14 + doc.heightOfString(order.notes!.trim(), { width: notesW }) + 8 : y;
          doc.font(F.semiBold).fontSize(9).fillColor(C.text);
          doc.text("Payment", LM, payInfoY, { lineBreak: false });
          let piy = payInfoY + 14;
          doc.font(F.regular).fontSize(8).fillColor(C.muted);
          if (order.paymentMethod) {
            doc.text("Method: ", LM, piy, { width: 52, lineBreak: false });
            doc.font(F.medium).fontSize(8).fillColor(C.text);
            doc.text(titleCase(order.paymentMethod), LM + 52, piy, { width: notesW - 52, lineBreak: false });
            piy += 12;
            doc.font(F.regular).fontSize(8).fillColor(C.muted);
          }
          if (txnId) {
            doc.text("TX ID: ", LM, piy, { width: 52, lineBreak: false });
            doc.font(F.medium).fontSize(8).fillColor(C.text);
            doc.text(txnId, LM + 52, piy, { width: notesW - 52, lineBreak: false });
            piy += 12;
            doc.font(F.regular).fontSize(8).fillColor(C.muted);
          }
          if (gateway) {
            doc.text("Gateway: ", LM, piy, { width: 52, lineBreak: false });
            doc.font(F.medium).fontSize(8).fillColor(C.text);
            doc.text(titleCase(gateway), LM + 52, piy, { width: notesW - 52, lineBreak: false });
            piy += 12;
            doc.font(F.regular).fontSize(8).fillColor(C.muted);
          }
          if (paidDate) {
            doc.text("Paid: ", LM, piy, { width: 52, lineBreak: false });
            doc.font(F.medium).fontSize(8).fillColor(C.text);
            doc.text(paidDate, LM + 52, piy, { width: notesW - 52, lineBreak: false });
            piy += 12;
            doc.font(F.regular).fontSize(8).fillColor(C.muted);
          }
          if (reference) {
            doc.text("Ref: ", LM, piy, { width: 52, lineBreak: false });
            doc.font(F.medium).fontSize(8).fillColor(C.text);
            doc.text(reference, LM + 52, piy, { width: notesW - 52, lineBreak: false });
          }
        }

        // Totals (right column)
        const totalsX = LM + PW - notesW;
        const summaryRows: Array<{ label: string; value: string; strong?: boolean; muted?: boolean }> = [
          { label: "Subtotal", value: formatMoney(subtotal, moneySettings) },
        ];
        if (discount > 0) {
          summaryRows.push({ label: "Discount", value: `−${formatMoney(discount, moneySettings)}`, muted: true });
        }
        if (couponCode) {
          summaryRows.push({ label: "Coupon", value: couponCode, muted: true });
        }
        summaryRows.push({ label: "Shipping", value: formatMoney(shippingCharge, moneySettings) });
        if (tax > 0) {
          summaryRows.push({ label: "Tax", value: formatMoney(tax, moneySettings) });
        }
        summaryRows.push({ label: "Grand Total", value: formatMoney(total, moneySettings), strong: true });
        if (paymentReceived > 0) {
          summaryRows.push({ label: "Paid", value: formatMoney(paymentReceived, moneySettings), muted: true });
        }
        if (remainingDue > 0) {
          summaryRows.push({ label: "Due", value: formatMoney(remainingDue, moneySettings), strong: true });
        }

        let totalsY = y;
        const totLabelW = notesW * 0.45;
        summaryRows.forEach((row) => {
          if (row.label === "Grand Total" || (row.label === "Due" && remainingDue > 0)) {
            drawDivider(doc, totalsX, RM, totalsY - 1);
            totalsY += 4;
          }
          doc.font(row.strong ? F.semiBold : row.muted ? F.regular : F.regular);
          doc.fontSize(row.strong ? 9 : 8).fillColor(row.strong ? C.text : C.muted);
          doc.text(row.label, totalsX, totalsY, { width: totLabelW, lineBreak: false });

          doc.font(row.strong ? F.semiBold : F.medium);
          doc.fontSize(row.strong ? 9 : 8).fillColor(row.strong ? C.text : C.text);
          doc.text(row.value, totalsX + totLabelW, totalsY, { width: notesW - totLabelW, align: "right", lineBreak: false });
          totalsY += row.strong ? 14 : 12;
        });

        // Advance y past whichever column is taller
        const notesBottom = (hasNotes ? y + 14 + doc.heightOfString(order.notes!.trim(), { width: notesW }) : y) +
          (hasPaymentInfo ? 14 + (() => {
            let count = 0;
            if (order.paymentMethod) count++;
            if (txnId) count++;
            if (gateway) count++;
            if (paidDate) count++;
            if (reference) count++;
            return count * 12;
          })() : 0);
        y = Math.max(totalsY + 4, notesBottom + 4);

        /* ── Divider before footer ─────────────────────────────────────────-- */
        ensureSpace(40);

        /* ── QR (optional) ─────────────────────────────────────────────────── */
        if (payload.verificationUrl?.trim()) {
          ensureSpace(60);
          drawDivider(doc, LM, RM, y);
          y += 10;
          const qrBuffer = await QRCode.toBuffer(payload.verificationUrl, {
            width: 80,
            margin: 1,
            color: { dark: C.text, light: C.white },
            errorCorrectionLevel: "M",
          });
          doc.image(qrBuffer, LM, y, { width: 36, height: 36 });
          doc.font(F.semiBold).fontSize(9).fillColor(C.text);
          doc.text("Verify this invoice", LM + 44, y + 2, { lineBreak: false });
          doc.font(F.regular).fontSize(7).fillColor(C.muted);
          doc.text(payload.verificationUrl, LM + 44, y + 16, {
            width: PW - 56,
            lineBreak: false,
          });
          y += 50;
        }

        /* ── Footer on every page ──────────────────────────────────────────── */
        const pageCount = doc.bufferedPageRange().count;
        for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
          doc.switchToPage(pageIndex);

          // Watermark on every page
          drawWatermark(doc, order.paymentStatus || order.status || "pending", F);

          const footerY = doc.page.height - 48;
          drawDivider(doc, LM, RM, footerY - 6);
          doc.font(F.regular).fontSize(8).fillColor(C.muted);
          const footerText =
            [storeWebsite, storeEmail].filter(Boolean).join("  ·  ") || "Thank you for your business.";
          doc.text(footerText, LM, footerY + 2, { width: PW, align: "center", lineBreak: false });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    })();
  });
}

/* ── Small helpers ──────────────────────────────────────────────────── */

function drawInfoLineRight(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  x: number,
  y: number,
  w: number,
  F: Record<string, string>,
) {
  doc.font(F.regular).fontSize(8).fillColor(C.muted);
  doc.text(label, x, y, { width: w * 0.32, align: "right", lineBreak: false });
  doc.font(F.medium).fontSize(8).fillColor(C.text);
  doc.text(value, x + w * 0.34, y, { width: w * 0.66, align: "right", lineBreak: false });
}
