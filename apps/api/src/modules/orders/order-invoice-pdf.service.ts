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
      senderNumber?: string;
      receiverNumber?: string;
      status?: string;
      reviewedAt?: Date | string;
      note?: string;
    };
    paymentDetails?: {
      senderNumber?: string;
      receiverNumber?: string;
      transactionId?: string;
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
    customerType?: string;
    customerSnapshot?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
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

/* ── Modern Palette ─────────────────────────────────────────────────── */

const C = {
  primary: "#111827",       // Slate 900
  text: "#1F2937",          // Gray 800
  secondary: "#4B5563",     // Gray 600
  muted: "#6B7280",         // Gray 500
  lightMuted: "#9CA3AF",    // Gray 400
  border: "#E5E7EB",        // Gray 200
  hairline: "#F3F4F6",      // Gray 100
  cardBg: "#F9FAFB",        // Gray 50
  white: "#FFFFFF",
  emerald: "#059669",
  emeraldBg: "#ECFDF5",
  emeraldBorder: "#A7F3D0",
  amber: "#D97706",
  amberBg: "#FFFBEB",
  amberBorder: "#FDE68A",
  red: "#DC2626",
  redBg: "#FEF2F2",
  redBorder: "#FECACA",
  watermark: "#F3F4F6",
};

const MARGIN = 36;
const FOOTER_H = 36;

/* ── Fonts ──────────────────────────────────────────────────────────── */

function loadFont(name: string): string | null {
  const fontPath = path.resolve(__dirname, "../../assets/fonts", name);
  return fs.existsSync(fontPath) ? fontPath : null;
}

/* ── Amount in Words ────────────────────────────────────────────────── */

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
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

/* ── Drawing Helpers ────────────────────────────────────────────────── */

function drawDivider(doc: PDFKit.PDFDocument, x1: number, x2: number, y: number, color = C.border) {
  doc.save();
  doc.moveTo(x1, y).lineTo(x2, y).lineWidth(0.5).strokeColor(color).stroke();
  doc.restore();
}

function drawRoundedCard(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 6,
  fillColor = C.cardBg,
  strokeColor = C.border,
) {
  doc.save();
  doc.roundedRect(x, y, w, h, radius).fillAndStroke(fillColor, strokeColor);
  doc.restore();
}

function drawBadge(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  fonts: Record<string, string>,
  type: "paid" | "pending" | "unpaid" | "neutral" = "neutral",
) {
  const config = {
    paid: { bg: C.emeraldBg, border: C.emeraldBorder, text: C.emerald },
    pending: { bg: C.amberBg, border: C.amberBorder, text: C.amber },
    unpaid: { bg: C.redBg, border: C.redBorder, text: C.red },
    neutral: { bg: C.hairline, border: C.border, text: C.secondary },
  }[type];

  doc.font(fonts.bold).fontSize(6.5);
  const textW = doc.widthOfString(text);
  const badgeW = textW + 10;
  const badgeH = 13;

  doc.save();
  doc.roundedRect(x, y, badgeW, badgeH, 3).fillAndStroke(config.bg, config.border);
  doc.fillColor(config.text).text(text, x, y + 2.5, { width: badgeW, align: "center", lineBreak: false });
  doc.restore();

  return badgeW;
}

/* ── Main Generator ──────────────────────────────────────────────────── */

export async function generateOrderInvoicePdf(payload: OrderInvoicePayload): Promise<Buffer> {
  const fontRegular = loadFont("Inter-Regular.ttf");
  const fontMedium = loadFont("Inter-Medium.ttf");
  const fontSemiBold = loadFont("Inter-SemiBold.ttf");
  const fontBold = loadFont("Inter-Bold.ttf");

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: MARGIN, bottom: 18, left: MARGIN, right: MARGIN },
    autoFirstPage: true,
    bufferPages: true,
    info: {
      Title: `Invoice ${payload.order.invoiceNumber ?? payload.order.orderNumber ?? ""}`,
      Author: payload.store.name || "Store",
      Subject: `Order ${payload.order.orderNumber ?? ""}`,
      Creator: "Bornoland",
      Keywords: "invoice, order, receipt",
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
        const snapshot = order.customerSnapshot;
        const customerName = snapshot?.name || customer?.name?.trim() || order.shippingAddress?.fullName?.trim() || "";
        const customerEmail = snapshot?.email || customer?.email?.trim() || "";
        const customerPhone = snapshot?.phone || customer?.phone?.trim() || order.shippingAddress?.phone?.trim() || "";

        const ship = order.shippingAddress;
        const shippingMethod = order.deliveryZone?.trim() || "";
        const shippingCharge = Number(order.shipping ?? order.deliveryCharge ?? 0);

        const subtotal = Number(order.subtotal ?? 0);
        const discount = Number(order.discount ?? 0);
        const tax = Number(order.tax ?? 0);
        const total = Number(order.total ?? 0);
        const refund = Number(order.refundAmount ?? 0);
        const paymentStatus = (order.paymentStatus || "").toLowerCase();
        const isPaid = paymentStatus === "paid";
        const paymentReceived = isPaid ? Math.max(0, total - refund) : 0;
        const remainingDue = isPaid ? 0 : Math.max(0, total - refund);

        const invoiceNo = order.invoiceNumber?.trim() || "";
        const orderNo = order.orderNumber?.trim() || "";
        const orderDate = formatDateOnly(order.createdAt, timezone) || "—";
        const invoiceDate = formatDateOnly(order.createdAt, timezone) || orderDate;
        const paidDate = formatDateTime(paidAt(order), timezone);
        const paymentMethodLabel = titleCase(order.paymentMethod || order.paymentGateway || "") || "Cash on Delivery";

        const txnId =
          order.paymentVerification?.transactionId?.trim() ||
          order.paymentDetails?.transactionId?.trim() ||
          "";
        const senderPhone =
          order.paymentVerification?.senderNumber?.trim() ||
          order.paymentDetails?.senderNumber?.trim() ||
          "";
        const receiverPhone =
          order.paymentVerification?.receiverNumber?.trim() ||
          order.paymentDetails?.receiverNumber?.trim() ||
          "";

        const couponCode = order.couponCode?.trim() || "";

        const logoBuffer = payload.storeLogoBuffer ?? null;

        /* ── Page Boundaries ──────────────────────────────────────────────── */
        const LM = MARGIN;
        const RM = doc.page.width - MARGIN;
        const PW = RM - LM;
        let y = MARGIN;
        const contentBottom = () => doc.page.height - FOOTER_H - 12;

        const ensureSpace = (needed: number, onNewPage?: () => void) => {
          if (y + needed <= contentBottom()) return;
          doc.addPage();
          y = MARGIN;
          if (onNewPage) onNewPage();
        };

        /* ── 1. Header: Store (Left) & Invoice Meta (Right) ──────────────── */
        const headerLeftW = PW * 0.52;
        const headerRightW = PW * 0.44;
        const headerRightX = LM + PW - headerRightW;

        if (logoBuffer) {
          try {
            doc.save();
            doc.roundedRect(LM, y, 36, 36, 6).clip();
            doc.image(logoBuffer, LM, y, { width: 36, height: 36, fit: [36, 36] });
            doc.restore();
            doc.font(F.bold).fontSize(14).fillColor(C.primary);
            doc.text(storeName, LM + 44, y + 2, { width: headerLeftW - 44, lineBreak: false });
          } catch {
            doc.font(F.bold).fontSize(14).fillColor(C.primary);
            doc.text(storeName, LM, y, { width: headerLeftW, lineBreak: false });
          }
        } else {
          doc.font(F.bold).fontSize(14).fillColor(C.primary);
          doc.text(storeName, LM, y, { width: headerLeftW, lineBreak: false });
        }

        let storeInfoY = y + (logoBuffer ? 22 : 18);
        doc.font(F.regular).fontSize(7.5).fillColor(C.secondary);
        if (storeAddress) {
          doc.text(storeAddress, LM, storeInfoY, { width: headerLeftW, lineBreak: false });
          storeInfoY += 11;
        }
        const storeContactBits = [storePhone, storeEmail, storeWebsite].filter(Boolean);
        if (storeContactBits.length) {
          doc.text(storeContactBits.join("  ·  "), LM, storeInfoY, { width: headerLeftW, lineBreak: false });
          storeInfoY += 11;
        }

        // Right side: INVOICE title & primary identifiers
        doc.font(F.bold).fontSize(20).fillColor(C.primary);
        doc.text("INVOICE", headerRightX, y, { width: headerRightW, align: "right", lineBreak: false });

        let metaY = y + 24;
        const drawMetaRow = (label: string, value: string, isStrong = false) => {
          doc.font(F.regular).fontSize(7.5).fillColor(C.muted);
          doc.text(label, headerRightX, metaY, { width: headerRightW * 0.42, align: "right", lineBreak: false });
          doc.font(isStrong ? F.semiBold : F.medium).fontSize(7.5).fillColor(isStrong ? C.primary : C.text);
          doc.text(value, headerRightX + headerRightW * 0.44, metaY, {
            width: headerRightW * 0.56,
            align: "right",
            lineBreak: false,
          });
          metaY += 11;
        };

        if (invoiceNo) drawMetaRow("Invoice Number", invoiceNo, true);
        if (orderNo) drawMetaRow("Order Number", `#${orderNo}`, true);
        drawMetaRow("Invoice Date", invoiceDate);
        drawMetaRow("Order Date", orderDate);

        y = Math.max(storeInfoY, metaY) + 8;
        drawDivider(doc, LM, RM, y);
        y += 10;

        /* ── 2. Bill To & Ship To (2 Columns) ────────────────────────────── */
        const colW = (PW - 12) / 2;
        const shipColX = LM + colW + 12;

        const customerLines: string[] = [];
        if (customerName) customerLines.push(customerName);
        if (customerEmail) customerLines.push(customerEmail);
        if (customerPhone) customerLines.push(customerPhone);

        const shipLines: string[] = [];
        const shipRecipient = ship?.fullName?.trim() || customerName;
        if (shipRecipient) shipLines.push(shipRecipient);
        const shipPhone = ship?.phone?.trim() || customerPhone;
        if (shipPhone) shipLines.push(shipPhone);
        const shipStreet = [ship?.street, ship?.area].map((s) => s?.trim()).filter(Boolean).join(", ");
        if (shipStreet) shipLines.push(shipStreet);
        const shipCityZip = [ship?.city, ship?.state, ship?.zip].map((s) => s?.trim()).filter(Boolean).join(" ");
        if (shipCityZip) shipLines.push(shipCityZip);
        if (ship?.country) shipLines.push(ship.country.trim());

        const billBoxH = Math.max(50, 20 + customerLines.length * 11);
        const shipBoxH = Math.max(50, 20 + shipLines.length * 11);
        const addressRowH = Math.max(billBoxH, shipBoxH);

        // Bill To Box
        drawRoundedCard(doc, LM, y, colW, addressRowH, 5, C.cardBg, C.border);
        doc.font(F.bold).fontSize(7).fillColor(C.muted);
        doc.text("BILL TO", LM + 10, y + 8, { lineBreak: false });
        let cy = y + 20;
        customerLines.forEach((line, idx) => {
          doc.font(idx === 0 ? F.semiBold : F.regular).fontSize(idx === 0 ? 8.5 : 7.5).fillColor(idx === 0 ? C.primary : C.secondary);
          doc.text(line, LM + 10, cy, { width: colW - 20, lineBreak: false });
          cy += 11;
        });

        // Ship To Box
        drawRoundedCard(doc, shipColX, y, colW, addressRowH, 5, C.cardBg, C.border);
        doc.font(F.bold).fontSize(7).fillColor(C.muted);
        doc.text("SHIP TO", shipColX + 10, y + 8, { lineBreak: false });
        let sy = y + 20;
        shipLines.forEach((line, idx) => {
          doc.font(idx === 0 ? F.semiBold : F.regular).fontSize(idx === 0 ? 8.5 : 7.5).fillColor(idx === 0 ? C.primary : C.secondary);
          doc.text(line, shipColX + 10, sy, { width: colW - 20, lineBreak: false });
          sy += 11;
        });

        y += addressRowH + 8;

        /* ── 3. Meta Summary Row (Payment / Statuses) ────────────────────── */
        const metaCardH = 24;
        drawRoundedCard(doc, LM, y, PW, metaCardH, 4, C.cardBg, C.border);

        const segmentW = PW / 4;
        // Segment 1: Payment Method
        doc.font(F.regular).fontSize(6.5).fillColor(C.muted);
        doc.text("PAYMENT METHOD", LM + 8, y + 4, { lineBreak: false });
        doc.font(F.semiBold).fontSize(7.5).fillColor(C.primary);
        doc.text(paymentMethodLabel, LM + 8, y + 13, { width: segmentW - 12, lineBreak: false, ellipsis: true });

        // Segment 2: Payment Status
        doc.font(F.regular).fontSize(6.5).fillColor(C.muted);
        doc.text("PAYMENT STATUS", LM + segmentW + 8, y + 4, { lineBreak: false });
        const pStatusType = isPaid ? "paid" : paymentStatus === "partial" ? "pending" : "unpaid";
        drawBadge(doc, paymentStatus ? titleCase(paymentStatus).toUpperCase() : "PENDING", LM + segmentW + 8, y + 11, F, pStatusType);

        // Segment 3: Currency
        doc.font(F.regular).fontSize(6.5).fillColor(C.muted);
        doc.text("CURRENCY", LM + segmentW * 2 + 8, y + 4, { lineBreak: false });
        doc.font(F.semiBold).fontSize(7.5).fillColor(C.primary);
        doc.text(currencyCode, LM + segmentW * 2 + 8, y + 13, { lineBreak: false });

        // Segment 4: Order Status
        doc.font(F.regular).fontSize(6.5).fillColor(C.muted);
        doc.text("ORDER STATUS", LM + segmentW * 3 + 8, y + 4, { lineBreak: false });
        const oStatus = order.status ? titleCase(order.status).toUpperCase() : "CONFIRMED";
        drawBadge(doc, oStatus, LM + segmentW * 3 + 8, y + 11, F, "neutral");

        y += metaCardH + 10;

        /* ── 4. Product Table ────────────────────────────────────────────── */
        const tableCols = [
          { key: "#", label: "#", width: 20, align: "center" as const },
          { key: "product", label: "PRODUCT", width: 170, align: "left" as const },
          { key: "sku", label: "SKU", width: 64, align: "left" as const },
          { key: "qty", label: "QTY", width: 34, align: "center" as const },
          { key: "unit", label: "UNIT PRICE", width: 66, align: "right" as const },
          { key: "disc", label: "DISCOUNT", width: 56, align: "right" as const },
          { key: "total", label: "TOTAL", width: 66, align: "right" as const },
        ];
        const tableColSum = tableCols.reduce((sum, c) => sum + c.width, 0);
        const colScale = PW / tableColSum;
        const scaledTableCols = tableCols.map((c) => ({ ...c, width: c.width * colScale }));

        const drawTableHeader = () => {
          doc.save();
          doc.rect(LM, y, PW, 16).fill(C.cardBg);
          doc.restore();
          drawDivider(doc, LM, RM, y);
          drawDivider(doc, LM, RM, y + 16);

          doc.font(F.bold).fontSize(6.5).fillColor(C.secondary);
          let hx = LM;
          scaledTableCols.forEach((col) => {
            doc.text(col.label, hx + (col.align === "right" ? 0 : 4), y + 5, {
              width: col.width - 8,
              align: col.align,
              lineBreak: false,
            });
            hx += col.width;
          });
          y += 18;
        };

        drawTableHeader();

        const items = order.items ?? [];
        if (items.length === 0) {
          doc.font(F.regular).fontSize(7.5).fillColor(C.muted);
          doc.text("No items in this order.", LM + 6, y + 4, { lineBreak: false });
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

            const hasVariant = Boolean(item.variantTitle && item.variantTitle.trim() && item.variantTitle.trim() !== item.name?.trim());
            const itemRowH = hasVariant ? 22 : 16;

            ensureSpace(itemRowH + 4, drawTableHeader);

            if (i % 2 === 1) {
              doc.save();
              doc.rect(LM, y, PW, itemRowH).fill(C.cardBg);
              doc.restore();
            }

            let rx = LM;
            // #
            doc.font(F.regular).fontSize(7).fillColor(C.muted);
            doc.text(String(i + 1), rx, y + 4, { width: scaledTableCols[0].width, align: "center", lineBreak: false });
            rx += scaledTableCols[0].width;

            // Product Name & Variant
            doc.font(F.semiBold).fontSize(7.5).fillColor(C.primary);
            doc.text(item.name?.trim() || "Product Item", rx + 4, y + 3, {
              width: scaledTableCols[1].width - 8,
              lineBreak: false,
              ellipsis: true,
            });
            if (hasVariant) {
              doc.font(F.regular).fontSize(6.5).fillColor(C.muted);
              doc.text(item.variantTitle!.trim(), rx + 4, y + 12, {
                width: scaledTableCols[1].width - 8,
                lineBreak: false,
                ellipsis: true,
              });
            }
            rx += scaledTableCols[1].width;

            // SKU
            doc.font(F.regular).fontSize(7).fillColor(C.secondary);
            doc.text(item.sku?.trim() || "—", rx + 4, y + 4, {
              width: scaledTableCols[2].width - 8,
              lineBreak: false,
              ellipsis: true,
            });
            rx += scaledTableCols[2].width;

            // Qty
            doc.font(F.medium).fontSize(7.5).fillColor(C.primary);
            doc.text(String(qty || 0), rx, y + 4, { width: scaledTableCols[3].width, align: "center", lineBreak: false });
            rx += scaledTableCols[3].width;

            // Unit Price
            doc.font(F.regular).fontSize(7.5).fillColor(C.secondary);
            doc.text(formatMoney(unit, moneySettings), rx, y + 4, {
              width: scaledTableCols[4].width - 4,
              align: "right",
              lineBreak: false,
            });
            rx += scaledTableCols[4].width;

            // Discount
            doc.font(F.regular).fontSize(7.5).fillColor(itemDiscount > 0 ? C.emerald : C.muted);
            doc.text(itemDiscount > 0 ? `-${formatMoney(itemDiscount, moneySettings)}` : "—", rx, y + 4, {
              width: scaledTableCols[5].width - 4,
              align: "right",
              lineBreak: false,
            });
            rx += scaledTableCols[5].width;

            // Total
            doc.font(F.bold).fontSize(7.5).fillColor(C.primary);
            doc.text(formatMoney(lineTotal, moneySettings), rx, y + 4, {
              width: scaledTableCols[6].width - 4,
              align: "right",
              lineBreak: false,
            });

            y += itemRowH;
            drawDivider(doc, LM, RM, y, C.hairline);
          }
        }

        drawDivider(doc, LM, RM, y, C.border);
        y += 8;

        /* ── 5. Bottom Summary: Left (Details & QR) + Right (Totals) ──────── */
        ensureSpace(140);

        const leftColWidth = PW * 0.52;
        const rightColWidth = PW * 0.44;
        const rightColStartX = LM + PW - rightColWidth;
        const bottomSectionStartY = y;

        // Right side: Totals summary
        const totalsRows: Array<{ label: string; value: string; isHighlight?: boolean; isDue?: boolean }> = [
          { label: "Subtotal", value: formatMoney(subtotal, moneySettings) },
        ];
        if (discount > 0 || couponCode) {
          totalsRows.push({
            label: couponCode ? `Coupon Discount (${couponCode})` : "Discount",
            value: discount > 0 ? `−${formatMoney(discount, moneySettings)}` : "—",
          });
        }
        totalsRows.push({
          label: shippingMethod ? `Shipping (${shippingMethod})` : "Shipping",
          value: shippingCharge > 0 ? formatMoney(shippingCharge, moneySettings) : "Free",
        });
        if (tax > 0) {
          totalsRows.push({ label: "Tax / VAT", value: formatMoney(tax, moneySettings) });
        }
        totalsRows.push({
          label: "Grand Total",
          value: formatMoney(total, moneySettings),
          isHighlight: true,
        });
        totalsRows.push({
          label: "Paid Amount",
          value: formatMoney(paymentReceived, moneySettings),
        });
        totalsRows.push({
          label: "Due Amount",
          value: formatMoney(remainingDue, moneySettings),
          isDue: remainingDue > 0,
        });

        let currentTotalsY = bottomSectionStartY;
        const totLabelColW = rightColWidth * 0.48;
        const totValColW = rightColWidth * 0.52;

        totalsRows.forEach((row) => {
          if (row.isHighlight) {
            currentTotalsY += 2;
            drawRoundedCard(doc, rightColStartX - 4, currentTotalsY - 2, rightColWidth + 8, 18, 4, C.cardBg, C.border);
            doc.font(F.bold).fontSize(8.5).fillColor(C.primary);
            doc.text(row.label, rightColStartX + 2, currentTotalsY + 2.5, { width: totLabelColW, lineBreak: false });
            doc.text(row.value, rightColStartX + totLabelColW, currentTotalsY + 2.5, {
              width: totValColW - 2,
              align: "right",
              lineBreak: false,
            });
            currentTotalsY += 20;
            return;
          }

          doc.font(F.regular).fontSize(7.5).fillColor(C.muted);
          doc.text(row.label, rightColStartX, currentTotalsY, { width: totLabelColW, lineBreak: false });
          doc.font(row.isDue ? F.bold : F.medium).fontSize(7.5).fillColor(row.isDue ? C.red : C.primary);
          doc.text(row.value, rightColStartX + totLabelColW, currentTotalsY, {
            width: totValColW,
            align: "right",
            lineBreak: false,
          });
          currentTotalsY += 12;
        });

        // Left side: Amount in Words box
        let currentLeftY = bottomSectionStartY;
        const words = amountInWords(total, currencyCode);
        drawRoundedCard(doc, LM, currentLeftY, leftColWidth, 26, 4, C.cardBg, C.border);
        doc.font(F.bold).fontSize(6).fillColor(C.muted);
        doc.text("AMOUNT IN WORDS", LM + 8, currentLeftY + 4, { lineBreak: false });
        doc.font(F.semiBold).fontSize(7).fillColor(C.primary);
        doc.text(words, LM + 8, currentLeftY + 13, { width: leftColWidth - 16, lineBreak: false, ellipsis: true });
        currentLeftY += 32;

        // Left side: Payment Details Box
        const paymentBoxLines: Array<[string, string]> = [
          ["Payment Method", paymentMethodLabel],
          ["Payment Status", paymentStatus ? titleCase(paymentStatus) : "Pending"],
        ];
        if (txnId) paymentBoxLines.push(["Transaction ID (TrxID)", txnId]);
        if (senderPhone) paymentBoxLines.push(["Sender Number", senderPhone]);
        if (receiverPhone) paymentBoxLines.push(["Receiver Number", receiverPhone]);
        if (paidDate) paymentBoxLines.push(["Payment Date", paidDate]);

        const payCardH = 18 + paymentBoxLines.length * 10.5;
        drawRoundedCard(doc, LM, currentLeftY, leftColWidth, payCardH, 4, C.cardBg, C.border);
        doc.font(F.bold).fontSize(6.5).fillColor(C.muted);
        doc.text("PAYMENT DETAILS", LM + 8, currentLeftY + 5, { lineBreak: false });
        let pLineY = currentLeftY + 16;
        paymentBoxLines.forEach(([pLabel, pVal]) => {
          doc.font(F.regular).fontSize(6.5).fillColor(C.muted);
          doc.text(pLabel, LM + 8, pLineY, { width: 88, lineBreak: false });
          doc.font(F.medium).fontSize(6.5).fillColor(C.primary);
          doc.text(pVal, LM + 98, pLineY, { width: leftColWidth - 106, lineBreak: false, ellipsis: true });
          pLineY += 10.5;
        });
        currentLeftY += payCardH + 6;

        // Left side: QR Code Verification
        if (payload.verificationUrl?.trim()) {
          try {
            const qrBuf = await QRCode.toBuffer(payload.verificationUrl, {
              width: 96,
              margin: 0,
              color: { dark: C.primary, light: C.white },
              errorCorrectionLevel: "M",
            });
            const qrCardH = 34;
            drawRoundedCard(doc, LM, currentLeftY, leftColWidth, qrCardH, 4, C.cardBg, C.border);
            doc.image(qrBuf, LM + 6, currentLeftY + 3, { width: 28, height: 28 });
            doc.font(F.bold).fontSize(6.5).fillColor(C.primary);
            doc.text("VERIFY INVOICE", LM + 40, currentLeftY + 5, { lineBreak: false });
            doc.font(F.regular).fontSize(6).fillColor(C.muted);
            doc.text("Scan QR code to verify this official invoice online.", LM + 40, currentLeftY + 13, {
              width: leftColWidth - 46,
              lineBreak: false,
            });
            doc.font(F.regular).fontSize(5.5).fillColor(C.secondary);
            doc.text(payload.verificationUrl, LM + 40, currentLeftY + 21, {
              width: leftColWidth - 46,
              lineBreak: false,
              ellipsis: true,
            });
            currentLeftY += qrCardH + 6;
          } catch {}
        }

        y = Math.max(currentLeftY, currentTotalsY) + 6;

        /* ── 6. Notes & Terms (Separate Sections) ─────────────────────────── */
        const orderNotes = order.notes?.trim();
        const termsText = "Goods once sold are subject to the store's return and refund policies. Keep this invoice for warranty and support.";

        if (orderNotes || termsText) {
          ensureSpace(32);
          const notesColW = (PW - 12) / 2;
          const termsColX = LM + notesColW + 12;

          if (orderNotes) {
            doc.font(F.bold).fontSize(6.5).fillColor(C.muted);
            doc.text("NOTES", LM, y, { lineBreak: false });
            doc.font(F.regular).fontSize(6.5).fillColor(C.secondary);
            doc.text(orderNotes, LM, y + 9, { width: notesColW, height: 18, lineBreak: false, ellipsis: true });
          }

          if (termsText) {
            doc.font(F.bold).fontSize(6.5).fillColor(C.muted);
            doc.text("TERMS & CONDITIONS", termsColX, y, { lineBreak: false });
            doc.font(F.regular).fontSize(6.5).fillColor(C.secondary);
            doc.text(termsText, termsColX, y + 9, { width: notesColW, height: 18, lineBreak: false, ellipsis: true });
          }
        }

        /* ── 7. Footer on Every Page ──────────────────────────────────────── */
        const range = doc.bufferedPageRange();
        const pageCount = range.count;
        for (let i = 0; i < pageCount; i += 1) {
          doc.switchToPage(range.start + i);
          const footerY = doc.page.height - 24;
          drawDivider(doc, LM, RM, footerY - 6);

          doc.font(F.regular).fontSize(6.5).fillColor(C.muted);
          doc.text(`Page ${i + 1} of ${pageCount}`, LM, footerY, { width: PW * 0.25, align: "left", lineBreak: false });
          doc.text("Thank you for your purchase.", LM + PW * 0.25, footerY, {
            width: PW * 0.5,
            align: "center",
            lineBreak: false,
          });
          doc.text("Powered by Bornoland", LM + PW * 0.75, footerY, {
            width: PW * 0.25,
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
