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

type OrderShipment = {
  provider?: string;
  providerName?: string;
  consignmentId?: string;
  trackingNumber?: string;
  status?: string;
  environment?: string;
  estimatedDelivery?: string;
  createdAt?: Date | string;
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
    courier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    shipment?: OrderShipment | null;
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
      area?: string;
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
  watermark: "#F0F0F0",
};

const MARGIN = 36;
const ROW_H = 14;
const FOOTER_H = 40;

/* ── Fonts ──────────────────────────────────────────────────────────── */

function loadFont(name: string): string | null {
  const fontPath = path.resolve(__dirname, "../../assets/fonts", name);
  return fs.existsSync(fontPath) ? fontPath : null;
}

/* ── Amount in words ────────────────────────────────────────────────── */

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const CURRENCY_WORDS: Record<string, string> = {
  BDT: "Taka",
  USD: "Dollars",
  EUR: "Euros",
  GBP: "Pounds",
  INR: "Rupees",
  AED: "Dirhams",
  SAR: "Riyals",
  CAD: "Dollars",
  AUD: "Dollars",
};

function twoDigits(n: number): string {
  if (n < 20) return ONES[n] || "";
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${TENS[t]}${o ? ` ${ONES[o]}` : ""}`.trim();
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h) parts.push(`${ONES[h]} Hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" ");
}

/** Convert a whole-number amount into English words, e.g. "Six Thousand … Taka Only". */
export function amountInWords(n: number, currencyCode?: string): string {
  const whole = Math.floor(Math.abs(Number.isFinite(n) ? n : 0));
  const currency =
    CURRENCY_WORDS[(currencyCode || "").toUpperCase()] ||
    (currencyCode?.trim() ? currencyCode.trim().toUpperCase() : "Only");

  if (whole === 0) {
    return currencyCode ? `Zero ${currency} Only` : "Zero Only";
  }

  const crore = Math.floor(whole / 1_00_00_000);
  const lakh = Math.floor((whole % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((whole % 1_00_000) / 1000);
  const hundred = whole % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));

  const words = parts.join(" ").replace(/\s+/g, " ").trim();
  if (currencyCode) return `${words} ${currency} Only`;
  return `${words} Only`;
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

function formatDateOnly(value: Date | string | undefined | null, timezone = "UTC"): string {
  if (!value) return "";
  // Plain date strings like "2026-07-26" or free-text ETAs — show as-is if not a parseable date
  if (typeof value === "string" && !/^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isNaN(Date.parse(value))) {
    return value.trim();
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value.trim() : "";
  }
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return typeof value === "string" ? value.trim() : "";
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
  const locale = settings?.locale?.startsWith("bn") ? "en-BD" : settings?.locale || "en-US";
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
  doc.opacity(0.35);
  doc.font(fonts.bold).fontSize(64).fillColor(C.watermark);
  doc.translate(doc.page.width / 2, doc.page.height / 2);
  doc.rotate(-45);
  doc.text(text, -doc.widthOfString(text) / 2, -18, { align: "center", lineBreak: false });
  doc.restore();
}

/* ── Drawing helpers ────────────────────────────────────────────────── */

function drawDivider(doc: PDFKit.PDFDocument, x1: number, x2: number, y: number) {
  doc.save();
  doc.moveTo(x1, y).lineTo(x2, y).lineWidth(0.5).strokeColor(C.border).stroke();
  doc.restore();
}

function drawInfoLineRight(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  x: number,
  y: number,
  w: number,
  F: Record<string, string>,
) {
  const labelW = w * 0.42;
  const valueW = w * 0.56;
  doc.font(F.regular).fontSize(7.5).fillColor(C.muted);
  doc.text(label, x, y, { width: labelW, align: "right", lineBreak: false });
  doc.font(F.medium).fontSize(7.5).fillColor(C.text);
  doc.text(value, x + labelW + 4, y, { width: valueW - 4, align: "right", lineBreak: false });
}

function drawLabelValue(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  x: number,
  y: number,
  w: number,
  F: Record<string, string>,
  labelW = 48,
) {
  doc.font(F.regular).fontSize(7.5).fillColor(C.muted);
  doc.text(`${label}: `, x, y, { width: labelW, lineBreak: false });
  doc.font(F.medium).fontSize(7.5).fillColor(C.text);
  doc.text(value, x + labelW, y, { width: Math.max(20, w - labelW), lineBreak: false });
}

/* ── Main generator ──────────────────────────────────────────────────── */

export async function generateOrderInvoicePdf(payload: OrderInvoicePayload): Promise<Buffer> {
  const fontRegular = loadFont("Inter-Regular.ttf");
  const fontMedium = loadFont("Inter-Medium.ttf");
  const fontSemiBold = loadFont("Inter-SemiBold.ttf");
  const fontBold = loadFont("Inter-Bold.ttf");

  const doc = new PDFDocument({
    size: "A4",
    // Tiny bottom margin so PDFKit does not auto-insert a blank page near the footer.
    margins: { top: MARGIN, bottom: 18, left: MARGIN, right: MARGIN },
    autoFirstPage: true,
    bufferPages: true,
    info: {
      Title: `Invoice ${payload.order.invoiceNumber ?? payload.order.orderNumber ?? ""}`,
      Author: payload.store.name || "Store",
      Subject: `Order ${payload.order.orderNumber ?? ""}`,
      Creator: "Bornoland",
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
        const currencyCode = moneySettings.currencyCode;

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
        const orderDate = formatDateOnly(order.createdAt, timezone) || "—";
        const invoiceDate = formatDateTime(order.createdAt, timezone) || orderDate;
        const paidDate = formatDateTime(paidAt(order), timezone);
        const paymentMethodLabel = titleCase(order.paymentMethod || order.paymentGateway || "") || "—";

        const txnId = order.paymentVerification?.transactionId?.trim() || "";
        const gateway = (order.paymentGateway || "").trim();
        const reference =
          order.referenceNumber?.trim() || order.paymentVerification?.note?.trim() || "";
        const couponCode = order.couponCode?.trim() || "";

        const shipment = order.shipment ?? null;
        const courierName =
          shipment?.providerName?.trim() ||
          shipment?.provider?.trim() ||
          order.courier?.trim() ||
          "";
        const trackingNo =
          shipment?.trackingNumber?.trim() || order.trackingNumber?.trim() || "";
        const consignmentId = shipment?.consignmentId?.trim() || "";
        const shipmentStatus = shipment?.status?.trim() || "";
        const shipmentEnv = shipment?.environment?.trim() || "";
        const estimatedDelivery =
          shipment?.estimatedDelivery?.trim() || order.estimatedDelivery?.trim() || "";
        const shipmentCreated = formatDateTime(shipment?.createdAt, timezone);
        const hasShipmentInfo = Boolean(
          courierName || trackingNo || consignmentId || shipmentStatus || estimatedDelivery,
        );

        const logoBuffer = payload.storeLogoBuffer ?? null;

        /* ── Layout constants ─────────────────────────────────────────────── */
        const LM = MARGIN;
        const RM = doc.page.width - MARGIN;
        const PW = RM - LM;
        let y = MARGIN;
        const contentBottom = () => doc.page.height - FOOTER_H - 8;

        /** Paginate only for the items table when a row truly overflows. */
        const ensureTableSpace = (needed: number, redrawHeader: () => void) => {
          if (y + needed <= contentBottom()) return;
          doc.addPage();
          y = MARGIN;
          redrawHeader();
        };

        /* ── Header: Store (left) + INVOICE meta (right) ─────────────────── */
        const leftColW = PW * 0.52;
        const rightColW = PW * 0.44;
        const rightColX = LM + PW - rightColW;

        if (logoBuffer) {
          try {
            doc.image(logoBuffer, LM, y, { width: 32, height: 32, fit: [32, 32] });
            doc.font(F.bold).fontSize(13).fillColor(C.text);
            doc.text(storeName, LM + 40, y + 1, { width: leftColW - 40, lineBreak: false });
          } catch {
            doc.font(F.bold).fontSize(13).fillColor(C.text);
            doc.text(storeName, LM, y, { width: leftColW, lineBreak: false });
          }
        } else {
          doc.font(F.bold).fontSize(13).fillColor(C.text);
          doc.text(storeName, LM, y, { width: leftColW, lineBreak: false });
        }

        let infoY = y + (logoBuffer ? 20 : 18);
        doc.font(F.regular).fontSize(7.5).fillColor(C.muted);
        if (storeAddress) {
          doc.text(storeAddress, LM, infoY, { width: leftColW, lineBreak: false });
          infoY += 11;
        }
        if (storePhone) {
          doc.text(storePhone, LM, infoY, { width: leftColW, lineBreak: false });
          infoY += 11;
        }
        const contactBits = [storeEmail, storeWebsite].filter(Boolean);
        if (contactBits.length) {
          doc.text(contactBits.join("  ·  "), LM, infoY, { width: leftColW, lineBreak: false });
          infoY += 11;
        }

        doc.font(F.bold).fontSize(22).fillColor(C.text);
        doc.text("INVOICE", rightColX, y, { width: rightColW, align: "right", lineBreak: false });

        const metaLines: Array<[string, string]> = [];
        if (invoiceNo) metaLines.push(["Invoice No", invoiceNo]);
        if (orderNo) metaLines.push(["Order No", orderNo]);
        metaLines.push(["Order Date", orderDate]);
        metaLines.push(["Invoice Date", invoiceDate]);
        metaLines.push(["Payment Method", paymentMethodLabel]);
        metaLines.push(["Currency", currencyCode]);

        let metaY = y + 26;
        metaLines.forEach(([label, value]) => {
          drawInfoLineRight(doc, label, value, rightColX, metaY, rightColW, F);
          metaY += 11;
        });

        y = Math.max(infoY, metaY) + 8;
        drawDivider(doc, LM, RM, y);
        y += 10;

        /* ── Customer | Shipping Address ─────────────────────────────────── */
        const halfW = (PW - 12) / 2;
        const shipX = LM + halfW + 12;

        doc.font(F.semiBold).fontSize(8).fillColor(C.text);
        doc.text("Customer", LM, y, { lineBreak: false });
        doc.text("Shipping Address", shipX, y, { lineBreak: false });
        y += 12;

        const customerLines: Array<[string, string]> = [];
        if (customerName) customerLines.push(["Name", customerName]);
        if (customerEmail) customerLines.push(["Email", customerEmail]);
        if (customerPhone) customerLines.push(["Phone", customerPhone]);

        const shipLines: Array<[string, string]> = [];
        if (ship?.fullName) shipLines.push(["Name", ship.fullName]);
        if (ship?.phone) shipLines.push(["Phone", ship.phone]);
        const streetLine = [ship?.street, ship?.area].map((v) => v?.trim()).filter(Boolean).join(", ");
        if (streetLine) shipLines.push(["Address", streetLine]);
        if (ship?.city) shipLines.push(["City", ship.city]);
        if (ship?.zip) shipLines.push(["Post Code", ship.zip]);
        if (ship?.country && ship.country.toLowerCase() !== "bangladesh") {
          shipLines.push(["Country", ship.country]);
        }
        if (shippingMethod) shipLines.push(["Method", shippingMethod]);

        const blockStart = y;
        let cy = y;
        customerLines.forEach(([label, value]) => {
          drawLabelValue(doc, label, value, LM, cy, halfW, F);
          cy += 11;
        });
        if (!customerLines.length) {
          doc.font(F.regular).fontSize(7.5).fillColor(C.muted);
          doc.text("—", LM, cy, { lineBreak: false });
          cy += 11;
        }

        let sy = blockStart;
        shipLines.forEach(([label, value]) => {
          drawLabelValue(doc, label, value, shipX, sy, halfW, F);
          sy += 11;
        });
        if (!shipLines.length) {
          doc.font(F.regular).fontSize(7.5).fillColor(C.muted);
          doc.text("—", shipX, sy, { lineBreak: false });
          sy += 11;
        }

        y = Math.max(cy, sy) + 6;

        /* ── Courier / Shipment (when available) ─────────────────────────── */
        if (hasShipmentInfo) {
          drawDivider(doc, LM, RM, y);
          y += 8;
          doc.font(F.semiBold).fontSize(8).fillColor(C.text);
          doc.text("Shipment", LM, y, { lineBreak: false });
          y += 11;

          const shipMeta: Array<[string, string]> = [];
          if (courierName) shipMeta.push(["Courier", courierName]);
          if (consignmentId) shipMeta.push(["Consignment", consignmentId]);
          if (trackingNo) shipMeta.push(["Tracking", trackingNo]);
          if (shipmentStatus) shipMeta.push(["Status", titleCase(shipmentStatus)]);
          if (estimatedDelivery) {
            shipMeta.push(["Est. Delivery", formatDateOnly(estimatedDelivery, timezone) || estimatedDelivery]);
          }
          if (shipmentEnv && shipmentEnv !== "production") {
            shipMeta.push(["Environment", titleCase(shipmentEnv)]);
          }
          if (shipmentCreated) shipMeta.push(["Created", shipmentCreated]);

          const colW = (PW - 8) / 2;
          let leftY = y;
          let rightY = y;
          shipMeta.forEach(([label, value], idx) => {
            if (idx % 2 === 0) {
              drawLabelValue(doc, label, value, LM, leftY, colW, F, 62);
              leftY += 11;
            } else {
              drawLabelValue(doc, label, value, LM + colW + 8, rightY, colW, F, 62);
              rightY += 11;
            }
          });
          y = Math.max(leftY, rightY) + 4;
        }

        drawDivider(doc, LM, RM, y);
        y += 8;

        /* ── Items Table ─────────────────────────────────────────────────── */
        const cols = [
          { key: "#", label: "#", width: 18, align: "center" as const },
          { key: "product", label: "Product", width: 118, align: "left" as const },
          { key: "variant", label: "Variant", width: 70, align: "left" as const },
          { key: "sku", label: "SKU", width: 54, align: "left" as const },
          { key: "qty", label: "Qty", width: 28, align: "center" as const },
          { key: "unit", label: "Unit Price", width: 62, align: "right" as const },
          { key: "disc", label: "Discount", width: 54, align: "right" as const },
          { key: "total", label: "Total", width: 62, align: "right" as const },
        ];
        const colSum = cols.reduce((sum, c) => sum + c.width, 0);
        const scale = PW / colSum;
        const scaledCols = cols.map((c) => ({ ...c, width: c.width * scale }));

        const drawTableHeader = () => {
          doc.font(F.semiBold).fontSize(7).fillColor(C.muted);
          let hx = LM;
          scaledCols.forEach((col) => {
            doc.text(col.label, hx, y, { width: col.width, align: col.align, lineBreak: false });
            hx += col.width;
          });
          y += 11;
          drawDivider(doc, LM, RM, y);
          y += 3;
        };

        drawTableHeader();

        const items = order.items ?? [];
        if (items.length === 0) {
          doc.font(F.regular).fontSize(7.5).fillColor(C.muted);
          doc.text("No items on this order.", LM, y, { lineBreak: false });
          y += 14;
        } else {
          for (let i = 0; i < items.length; i += 1) {
            const item = items[i];
            const qty = Number(item.quantity ?? 0);
            const unit = Number(item.price ?? 0);
            const itemDiscount = Number(item.discount ?? 0);
            const itemTax = Number(item.tax ?? 0);
            const lineSubtotal = qty * unit;
            const lineTotal = Math.max(0, lineSubtotal - itemDiscount + itemTax);

            ensureTableSpace(ROW_H + 2, drawTableHeader);

            if (i % 2 === 1) {
              doc.save();
              doc.rect(LM, y, PW, ROW_H).fill(C.hairline);
              doc.restore();
            }

            const cellContents = [
              String(i + 1),
              item.name?.trim() || "—",
              item.variantTitle?.trim() || "—",
              item.sku?.trim() || "—",
              String(qty || 0),
              formatMoney(unit, moneySettings),
              itemDiscount ? formatMoney(itemDiscount, moneySettings) : "—",
              formatMoney(lineTotal, moneySettings),
            ];

            let rx = LM;
            scaledCols.forEach((col, ci) => {
              doc.font(F.regular).fontSize(7).fillColor(C.text);
              doc.text(cellContents[ci] || "—", rx + 1, y + 3, {
                width: col.width - 3,
                align: col.align,
                lineBreak: false,
                ellipsis: true,
              });
              rx += col.width;
            });
            y += ROW_H;
          }
        }

        drawDivider(doc, LM, RM, y + 1);
        y += 8;

        /* ── Bottom: Amount/Payment/QR (left) + Totals (right) ───────────── */
        // Prefer compact layout over a new nearly-empty page.
        const leftW = PW * 0.52;
        const rightW = PW * 0.42;
        const totalsX = LM + PW - rightW;
        const bottomStart = y;
        const remaining = contentBottom() - y;
        const compact = remaining < 130;
        const qrSize = compact ? 28 : 30;
        const lineGap = compact ? 9 : 10;
        const sectionGap = compact ? 6 : 8;

        // Right: totals first (fixed height) so we know space for left column
        const summaryRows: Array<{ label: string; value: string; strong?: boolean }> = [
          { label: "Subtotal", value: formatMoney(subtotal, moneySettings) },
        ];
        if (discount > 0 || couponCode) {
          summaryRows.push({
            label: couponCode ? `Discount (${couponCode})` : "Discount",
            value: discount > 0 ? `−${formatMoney(discount, moneySettings)}` : "—",
          });
        }
        summaryRows.push({ label: "Shipping", value: formatMoney(shippingCharge, moneySettings) });
        if (tax > 0) {
          summaryRows.push({ label: "Tax", value: formatMoney(tax, moneySettings) });
        }
        summaryRows.push({ label: "Grand Total", value: formatMoney(total, moneySettings), strong: true });
        summaryRows.push({
          label: "Paid",
          value: formatMoney(paymentReceived, moneySettings),
        });
        summaryRows.push({
          label: "Due",
          value: formatMoney(remainingDue, moneySettings),
          strong: remainingDue > 0,
        });

        let totalsY = bottomStart;
        const totLabelW = rightW * 0.48;
        summaryRows.forEach((row) => {
          if (row.label === "Grand Total") {
            drawDivider(doc, totalsX, RM, totalsY);
            totalsY += 3;
          }
          doc.font(row.strong ? F.semiBold : F.regular);
          doc.fontSize(row.strong ? 8 : 7.5).fillColor(row.strong ? C.text : C.muted);
          doc.text(row.label, totalsX, totalsY, { width: totLabelW, lineBreak: false });
          doc.font(row.strong ? F.semiBold : F.medium);
          doc.fontSize(row.strong ? 8 : 7.5).fillColor(C.text);
          doc.text(row.value, totalsX + totLabelW, totalsY, {
            width: rightW - totLabelW,
            align: "right",
            lineBreak: false,
          });
          totalsY += row.strong ? 12 : lineGap;
        });

        // Left: amount in words (single line — never overflow onto a new page)
        let leftY = bottomStart;
        const words = amountInWords(total, currencyCode);
        doc.font(F.semiBold).fontSize(7.5).fillColor(C.text);
        doc.text("Amount in Words", LM, leftY, { lineBreak: false });
        leftY += 10;
        doc.font(F.regular).fontSize(7).fillColor(C.muted);
        doc.text(words, LM, leftY, {
          width: leftW,
          height: compact ? 12 : 16,
          lineBreak: false,
          ellipsis: true,
        });
        leftY += (compact ? 12 : 16) + sectionGap;

        // Payment details
        doc.font(F.semiBold).fontSize(7.5).fillColor(C.text);
        doc.text("Payment Details", LM, leftY, { lineBreak: false });
        leftY += 10;
        const payLines: Array<[string, string]> = [];
        if (paymentMethodLabel && paymentMethodLabel !== "—") {
          payLines.push(["Method", paymentMethodLabel]);
        }
        if (gateway && titleCase(gateway) !== paymentMethodLabel) {
          payLines.push(["Gateway", titleCase(gateway)]);
        }
        if (txnId) payLines.push(["TX ID", txnId]);
        if (paidDate) payLines.push(["Paid At", paidDate]);
        if (reference) payLines.push(["Reference", reference]);
        if (!payLines.length) {
          payLines.push(["Status", titleCase(order.paymentStatus || "pending") || "Pending"]);
        }
        payLines.forEach(([label, value]) => {
          drawLabelValue(doc, label, value, LM, leftY, leftW, F, 52);
          leftY += lineGap;
        });
        leftY += sectionGap - 2;

        // QR verify (inline, small)
        if (payload.verificationUrl?.trim()) {
          try {
            const qrBuffer = await QRCode.toBuffer(payload.verificationUrl, {
              width: 96,
              margin: 0,
              color: { dark: C.text, light: C.white },
              errorCorrectionLevel: "M",
            });
            const qrFit = leftY + qrSize <= contentBottom();
            if (qrFit) {
              doc.image(qrBuffer, LM, leftY, { width: qrSize, height: qrSize });
              doc.font(F.semiBold).fontSize(7).fillColor(C.text);
              doc.text("Scan to verify", LM + qrSize + 6, leftY + 2, {
                width: leftW - qrSize - 8,
                lineBreak: false,
              });
              doc.font(F.regular).fontSize(6).fillColor(C.muted);
              doc.text(payload.verificationUrl, LM + qrSize + 6, leftY + 12, {
                width: leftW - qrSize - 8,
                lineBreak: false,
                ellipsis: true,
              });
              leftY += qrSize + 4;
            }
          } catch {
            // QR generation failure should not break invoice
          }
        }

        y = Math.max(leftY, totalsY) + 6;

        /* ── Notes | Terms ───────────────────────────────────────────────── */
        const notesText =
          order.notes?.trim() ||
          "Thank you for your order. Please retain this invoice for your records.";
        const termsText =
          "Goods once sold are subject to the store's return policy. Payment disputes must be raised within 7 days.";

        // Shrink notes/terms into remaining space rather than adding a blank page
        const notesHalf = (PW - 10) / 2;
        if (y + 22 <= contentBottom()) {
          doc.font(F.semiBold).fontSize(7.5).fillColor(C.text);
          doc.text("Notes", LM, y, { lineBreak: false });
          doc.text("Terms & Conditions", LM + notesHalf + 10, y, { lineBreak: false });
          y += 10;
          doc.font(F.regular).fontSize(6.5).fillColor(C.muted);
          doc.text(notesText, LM, y, {
            width: notesHalf,
            height: 14,
            lineBreak: false,
            ellipsis: true,
          });
          doc.text(termsText, LM + notesHalf + 10, y, {
            width: notesHalf,
            height: 14,
            lineBreak: false,
            ellipsis: true,
          });
        }

        /* ── Footer on every page ────────────────────────────────────────── */
        const range = doc.bufferedPageRange();
        const pageCount = range.count;
        for (let i = 0; i < pageCount; i += 1) {
          doc.switchToPage(range.start + i);
          drawWatermark(doc, order.paymentStatus || order.status || "pending", F);

          const footerY = doc.page.height - 28;
          drawDivider(doc, LM, RM, footerY - 8);
          doc.font(F.regular).fontSize(7).fillColor(C.muted);
          const pageLabel = `Page ${i + 1} of ${pageCount}`;
          doc.text(pageLabel, LM, footerY, { width: PW * 0.28, align: "left", lineBreak: false });
          doc.text("Thank you for your purchase", LM + PW * 0.28, footerY, {
            width: PW * 0.44,
            align: "center",
            lineBreak: false,
          });
          doc.text("Powered by Bornoland", LM + PW * 0.72, footerY, {
            width: PW * 0.28,
            align: "right",
            lineBreak: false,
          });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    })();
  });
}
