import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { loadImageBufferForPdf } from "../stores/store-branding-logo.js";

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
  /** Pre-resolved Appearance → Branding logo (PNG buffer). Never use product images. */
  storeLogoBuffer?: Buffer | null;
  verificationUrl?: string;
};

const C = {
  text: "#1d1d1f",
  muted: "#6e6e73",
  border: "#e5e5ea",
  borderLight: "#f5f5f7",
  bg: "#ffffff",
  bgSoft: "#f5f5f7",
  white: "#ffffff",
  success: "#248a3d",
  successLight: "#e4f6e8",
  warning: "#b25e09",
  warningLight: "#fff1de",
  danger: "#d70015",
  dangerLight: "#ffe5e8",
  neutral: "#6e6e73",
  neutralLight: "#f0f0f2",
};

function loadFont(name: string): string | null {
  const fontPath = path.resolve(__dirname, "../../assets/fonts", name);
  return fs.existsSync(fontPath) ? fontPath : null;
}

function formatDateTime(
  value: Date | string | undefined | null,
  timezone = "UTC",
): string {
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
  // Non-breaking space keeps currency + amount on one line in PDF
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

function getPrimaryColor(store: OrderInvoicePayload["store"]): string {
  const candidate = store.brandColor || store.theme?.primaryColor || "#0066cc";
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(candidate) ? candidate : "#0066cc";
}

function lightenHex(hex: string, amount = 0.86): string {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3 ? normalized.split("").map((c) => c + c).join("") : normalized;
  if (!/^[0-9a-f]{6}$/i.test(expanded)) return "#e8f1fb";
  const num = Number.parseInt(expanded, 16);
  const mix = (channel: number) => Math.min(255, Math.round(channel + (255 - channel) * amount));
  const r = mix((num >> 16) & 255);
  const g = mix((num >> 8) & 255);
  const b = mix(num & 255);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function drawCard(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 8,
) {
  doc.save();
  doc.roundedRect(x, y, w, h, radius).fillAndStroke(C.bg, C.border);
  doc.restore();
}

function drawBadge(
  doc: PDFKit.PDFDocument,
  font: string,
  text: string,
  x: number,
  y: number,
  color: string,
  bg: string,
) {
  doc.save();
  doc.font(font).fontSize(7.5);
  const width = Math.min(doc.widthOfString(text) + 16, 160);
  doc.roundedRect(x, y, width, 18, 9).fill(bg);
  doc.fillColor(color).text(text, x + 8, y + 4.5, {
    width: width - 16,
    align: "center",
    lineBreak: false,
  });
  doc.restore();
  return width;
}

function fitText(
  doc: PDFKit.PDFDocument,
  text: string,
  font: string,
  size: number,
  maxWidth: number,
): string {
  const value = (text || "").trim();
  if (!value) return "";
  doc.font(font).fontSize(size);
  if (doc.widthOfString(value) <= maxWidth) return value;
  let truncated = value;
  while (truncated.length > 1 && doc.widthOfString(`${truncated}…`) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

function drawLabelValue(
  doc: PDFKit.PDFDocument,
  fonts: { regular: string; medium: string },
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
) {
  if (!value) return 0;
  doc.font(fonts.regular).fontSize(7).fillColor(C.muted);
  doc.text(label, x, y, { width, lineBreak: false });
  doc.font(fonts.medium).fontSize(9).fillColor(C.text);
  const fitted = fitText(doc, value, fonts.medium, 9, width);
  doc.text(fitted, x, y + 11, { width, lineBreak: false });
  return 28;
}

function statusStyle(status?: string): { label: string; color: string; bg: string } {
  switch ((status ?? "").toLowerCase()) {
    case "paid":
    case "delivered":
    case "confirmed":
      return { label: titleCase(status).toUpperCase(), color: C.success, bg: C.successLight };
    case "cancelled":
    case "refunded":
    case "failed":
    case "partial_refund":
      return { label: titleCase(status).toUpperCase(), color: C.danger, bg: C.dangerLight };
    case "partial":
    case "processing":
    case "packed":
    case "shipped":
    case "out_for_delivery":
      return { label: titleCase(status).toUpperCase(), color: C.warning, bg: C.warningLight };
    default:
      return { label: titleCase(status || "Pending").toUpperCase(), color: C.warning, bg: C.warningLight };
  }
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

export async function generateOrderInvoicePdf(payload: OrderInvoicePayload): Promise<Buffer> {
  const fontRegular = loadFont("Inter-Regular.ttf");
  const fontMedium = loadFont("Inter-Medium.ttf");
  const fontSemiBold = loadFont("Inter-SemiBold.ttf");
  const fontBold = loadFont("Inter-Bold.ttf");

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 36, bottom: 56, left: 40, right: 40 },
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
        const primary = getPrimaryColor(store);
        const primaryLight = lightenHex(primary);
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
        const paymentReceived =
          paymentStatus === "paid" ? Math.max(0, total - refund) : 0;
        const remainingDue =
          paymentStatus === "paid" ? 0 : Math.max(0, total - refund);

        const invoiceNo = order.invoiceNumber?.trim() || "";
        const orderNo = order.orderNumber?.trim() || "";
        const orderBadge = statusStyle(order.status);
        const paymentBadge = statusStyle(order.paymentStatus);
        const completedDate = formatDateTime(completedAt(order), timezone);
        const paidDate = formatDateTime(paidAt(order), timezone);
        const generatedDate = formatDateTime(new Date(), timezone);

        const txnId = order.paymentVerification?.transactionId?.trim() || "";
        const gateway = (order.paymentGateway || order.paymentMethod || "").trim();
        const reference =
          order.referenceNumber?.trim() ||
          order.paymentVerification?.note?.trim() ||
          "";

        // Branding logo is resolved upstream from Appearance → Branding only.
        const logoBuffer = payload.storeLogoBuffer ?? null;
        const itemImages = await Promise.all(
          (order.items ?? []).map((item) => loadImageBufferForPdf(item.image)),
        );

        const LM = 40;
        const RM = doc.page.width - 40;
        const PW = RM - LM;
        let y = 36;
        const bottomLimit = doc.page.height - 70;

        const ensureSpace = (needed: number) => {
          if (y + needed <= bottomLimit) return;
          doc.addPage();
          y = 36;
        };

        // ── Header ──────────────────────────────────────────────────────────
        drawCard(doc, LM, y, PW, 96, 10);
        const logoSize = 48;
        const logoX = LM + 18;
        const logoY = y + 24;
        if (logoBuffer) {
          doc.image(logoBuffer, logoX, logoY, {
            fit: [logoSize, logoSize],
            align: "center",
            valign: "center",
          });
        } else {
          doc.save();
          doc.roundedRect(logoX, logoY, logoSize, logoSize, 10).fill(primaryLight);
          doc.font(F.bold).fontSize(16).fillColor(primary);
          const initials =
            storeName
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0] ?? "")
              .join("")
              .toUpperCase() || "S";
          doc.text(initials, logoX, logoY + 15, { width: logoSize, align: "center", lineBreak: false });
          doc.restore();
        }

        const headerTextX = LM + 80;
        const headerTextW = PW * 0.42;
        doc.font(F.bold).fontSize(16).fillColor(C.text);
        doc.text(fitText(doc, storeName, F.bold, 16, headerTextW), headerTextX, y + 18, {
          width: headerTextW,
          lineBreak: false,
        });
        doc.font(F.regular).fontSize(8).fillColor(C.muted);
        let headerMetaY = y + 40;
        if (storeAddress) {
          doc.text(fitText(doc, storeAddress, F.regular, 8, headerTextW), headerTextX, headerMetaY, {
            width: headerTextW,
            lineBreak: false,
          });
          headerMetaY += 12;
        }
        const contactBits = [storePhone, storeEmail, storeWebsite].filter(Boolean);
        if (contactBits.length) {
          doc.text(fitText(doc, contactBits.join("  ·  "), F.regular, 8, headerTextW), headerTextX, headerMetaY, {
            width: headerTextW,
            lineBreak: false,
          });
        }

        const metaX = LM + PW * 0.58;
        const metaW = PW * 0.38;
        doc.font(F.bold).fontSize(22).fillColor(primary);
        doc.text("INVOICE", metaX, y + 16, { width: metaW, align: "right", lineBreak: false });
        drawBadge(doc, F.semiBold, orderBadge.label, metaX + metaW - 88, y + 44, orderBadge.color, orderBadge.bg);
        doc.font(F.regular).fontSize(8).fillColor(C.muted);
        if (invoiceNo) {
          doc.text(`Invoice  ${invoiceNo}`, metaX, y + 68, {
            width: metaW,
            align: "right",
            lineBreak: false,
          });
        }
        y += 112;

        // ── Status strip ────────────────────────────────────────────────────
        ensureSpace(54);
        drawCard(doc, LM, y, PW, 48, 8);
        drawLabelValue(doc, F, "Order status", titleCase(order.status), LM + 16, y + 10, 110);
        drawBadge(doc, F.semiBold, orderBadge.label, LM + 140, y + 15, orderBadge.color, orderBadge.bg);
        if (completedDate) {
          drawLabelValue(doc, F, "Completed", completedDate, LM + 250, y + 10, 160);
        }
        if (generatedDate) {
          drawLabelValue(doc, F, "Generated", generatedDate, LM + 420, y + 10, 130);
        }
        y += 64;

        // ── Meta cards: order / payment ─────────────────────────────────────
        ensureSpace(100);
        const gap = 12;
        const half = (PW - gap) / 2;
        drawCard(doc, LM, y, half, 92, 8);
        drawCard(doc, LM + half + gap, y, half, 92, 8);

        doc.font(F.semiBold).fontSize(8).fillColor(primary);
        doc.text("ORDER", LM + 14, y + 12, { lineBreak: false });
        let leftY = y + 28;
        if (orderNo) {
          doc.font(F.regular).fontSize(7).fillColor(C.muted).text("Order number", LM + 14, leftY, { lineBreak: false });
          doc.font(F.medium).fontSize(9).fillColor(C.text).text(orderNo, LM + 14, leftY + 11, {
            width: half - 28,
            lineBreak: false,
          });
          leftY += 28;
        }
        if (invoiceNo) {
          doc.font(F.regular).fontSize(7).fillColor(C.muted).text("Invoice number", LM + 14, leftY, { lineBreak: false });
          doc.font(F.medium).fontSize(9).fillColor(C.text).text(invoiceNo, LM + 14, leftY + 11, {
            width: half - 28,
            lineBreak: false,
          });
        }

        const payX = LM + half + gap;
        doc.font(F.semiBold).fontSize(8).fillColor(primary);
        doc.text("PAYMENT", payX + 14, y + 12, { lineBreak: false });
        const payRows: Array<[string, string]> = [];
        if (order.paymentMethod) payRows.push(["Method", titleCase(order.paymentMethod)]);
        if (order.paymentStatus) payRows.push(["Status", titleCase(order.paymentStatus)]);
        if (txnId) payRows.push(["Transaction ID", txnId]);
        if (gateway) payRows.push(["Gateway", titleCase(gateway)]);
        if (paidDate) payRows.push(["Paid at", paidDate]);
        if (reference) payRows.push(["Reference", reference]);
        payRows.slice(0, 4).forEach(([label, value], index) => {
          const rowY = y + 28 + index * 14;
          doc.font(F.regular).fontSize(7).fillColor(C.muted);
          doc.text(label, payX + 14, rowY, { width: 78, lineBreak: false });
          doc.font(F.medium).fontSize(8).fillColor(C.text);
          doc.text(fitText(doc, value, F.medium, 8, half - 110), payX + 94, rowY, {
            width: half - 110,
            lineBreak: false,
          });
        });
        if (order.paymentStatus) {
          drawBadge(
            doc,
            F.semiBold,
            paymentBadge.label,
            payX + half - 90,
            y + 10,
            paymentBadge.color,
            paymentBadge.bg,
          );
        }
        y += 108;

        // ── Customer / Shipping ─────────────────────────────────────────────
        ensureSpace(120);
        drawCard(doc, LM, y, half, 112, 8);
        drawCard(doc, LM + half + gap, y, half, 112, 8);

        doc.font(F.semiBold).fontSize(8).fillColor(primary);
        doc.text("CUSTOMER", LM + 14, y + 12, { lineBreak: false });
        const customerRows: Array<[string, string]> = [];
        if (customerName) customerRows.push(["Name", customerName]);
        if (customerEmail) customerRows.push(["Email", customerEmail]);
        if (customerPhone) customerRows.push(["Phone", customerPhone]);
        if (customerId) customerRows.push(["Customer ID", customerId]);
        customerRows.forEach(([label, value], index) => {
          const rowY = y + 30 + index * 16;
          doc.font(F.regular).fontSize(7).fillColor(C.muted);
          doc.text(label, LM + 14, rowY, { width: 72, lineBreak: false });
          doc.font(F.medium).fontSize(8.5).fillColor(C.text);
          doc.text(fitText(doc, value, F.medium, 8.5, half - 100), LM + 88, rowY, {
            width: half - 100,
            lineBreak: false,
          });
        });

        const shipX = LM + half + gap;
        doc.font(F.semiBold).fontSize(8).fillColor(primary);
        doc.text("SHIPPING", shipX + 14, y + 12, { lineBreak: false });
        const shipRows: Array<[string, string]> = [];
        if (ship?.fullName) shipRows.push(["Recipient", ship.fullName]);
        if (ship?.phone) shipRows.push(["Phone", ship.phone]);
        const addressLine = [ship?.street, ship?.city, ship?.state, ship?.zip, ship?.country]
          .map((v) => v?.trim())
          .filter(Boolean)
          .join(", ");
        if (addressLine) shipRows.push(["Address", addressLine]);
        if (shippingMethod) shipRows.push(["Method", shippingMethod]);
        if (shippingCharge > 0 || order.shipping != null || order.deliveryCharge != null) {
          shipRows.push(["Charge", formatMoney(shippingCharge, moneySettings)]);
        }
        shipRows.slice(0, 5).forEach(([label, value], index) => {
          const rowY = y + 30 + index * 14;
          doc.font(F.regular).fontSize(7).fillColor(C.muted);
          doc.text(label, shipX + 14, rowY, { width: 58, lineBreak: false });
          doc.font(F.medium).fontSize(8).fillColor(C.text);
          doc.text(fitText(doc, value, F.medium, 8, half - 90), shipX + 74, rowY, {
            width: half - 90,
            lineBreak: false,
          });
        });
        y += 128;

        // ── Items table ─────────────────────────────────────────────────────
        ensureSpace(40);
        doc.font(F.semiBold).fontSize(8).fillColor(primary);
        doc.text("ITEMS", LM + 2, y, { lineBreak: false });
        y += 14;

        const cols = [
          { key: "img", label: "", width: 28 },
          { key: "product", label: "Product", width: 98 },
          { key: "variant", label: "Variant", width: 58 },
          { key: "sku", label: "SKU", width: 42 },
          { key: "qty", label: "Qty", width: 26 },
          { key: "unit", label: "Unit", width: 52 },
          { key: "disc", label: "Disc.", width: 42 },
          { key: "tax", label: "Tax", width: 42 },
          { key: "sub", label: "Subtotal", width: 54 },
          { key: "total", label: "Total", width: 53 },
        ];
        const colSum = cols.reduce((sum, col) => sum + col.width, 0);
        const scale = PW / colSum;
        const scaled = cols.map((col) => ({ ...col, width: col.width * scale }));

        const drawTableHeader = () => {
          doc.save();
          doc.roundedRect(LM, y, PW, 22, 6).fill(primary);
          doc.restore();
          let x = LM + 6;
          doc.font(F.semiBold).fontSize(7).fillColor(C.white);
          scaled.forEach((col) => {
            if (col.label) {
              doc.text(col.label, x, y + 7, {
                width: col.width - 6,
                align: col.key === "qty" || col.key === "img" ? "center" : ["unit", "disc", "tax", "sub", "total"].includes(col.key) ? "right" : "left",
                lineBreak: false,
              });
            }
            x += col.width;
          });
          y += 26;
        };

        drawTableHeader();
        const items = order.items ?? [];
        if (items.length === 0) {
          drawCard(doc, LM, y, PW, 28, 6);
          doc.font(F.regular).fontSize(8).fillColor(C.muted);
          doc.text("No items on this order.", LM + 12, y + 9, { lineBreak: false });
          y += 40;
        } else {
          for (let i = 0; i < items.length; i += 1) {
            const item = items[i];
            const qty = Number(item.quantity ?? 0);
            const unit = Number(item.price ?? 0);
            const itemDiscount = Number(item.discount ?? 0);
            const itemTax = Number(item.tax ?? 0);
            const lineSubtotal = qty * unit;
            const lineTotal = Math.max(0, lineSubtotal - itemDiscount + itemTax);
            const rowH = 36;
            ensureSpace(rowH + 8);
            if (y + rowH > bottomLimit - 8) {
              doc.addPage();
              y = 36;
              drawTableHeader();
            }

            doc.save();
            doc.roundedRect(LM, y, PW, rowH, 4).fill(i % 2 === 0 ? C.bgSoft : C.bg);
            doc.restore();

            let x = LM + 6;
            const textY = y + 13;
            const img = itemImages[i];
            if (img) {
              try {
                doc.image(img, x, y + 6, { fit: [22, 22], align: "center", valign: "center" });
              } catch {
                // ignore bad image
              }
            }
            x += scaled[0].width;

            const cells: Array<{ text: string; align: "left" | "right" | "center"; money?: boolean }> = [
              { text: item.name?.trim() || "", align: "left" },
              { text: item.variantTitle?.trim() || "", align: "left" },
              { text: item.sku?.trim() || "", align: "left" },
              { text: String(qty || 0), align: "center" },
              { text: formatMoney(unit, moneySettings), align: "right", money: true },
              { text: itemDiscount ? formatMoney(itemDiscount, moneySettings) : "—", align: "right", money: true },
              { text: itemTax ? formatMoney(itemTax, moneySettings) : "—", align: "right", money: true },
              { text: formatMoney(lineSubtotal, moneySettings), align: "right", money: true },
              { text: formatMoney(lineTotal, moneySettings), align: "right", money: true },
            ];

            cells.forEach((cell, cellIndex) => {
              const col = scaled[cellIndex + 1];
              doc.font(cell.money ? F.medium : F.regular).fontSize(7.5).fillColor(C.text);
              const text = fitText(doc, cell.text || "—", cell.money ? F.medium : F.regular, 7.5, col.width - 6);
              doc.text(text, x, textY, {
                width: col.width - 6,
                align: cell.align,
                lineBreak: false,
              });
              x += col.width;
            });
            y += rowH + 3;
          }
        }

        // ── Summary ─────────────────────────────────────────────────────────
        ensureSpace(150);
        const summaryW = 220;
        const summaryX = RM - summaryW;
        const summaryRows: Array<[string, string, boolean?]> = [
          ["Subtotal", formatMoney(subtotal, moneySettings)],
        ];
        if (discount > 0) summaryRows.push(["Discount", `−${formatMoney(discount, moneySettings)}`]);
        if (order.couponCode?.trim()) summaryRows.push(["Coupon", order.couponCode.trim()]);
        summaryRows.push(["Shipping", formatMoney(shippingCharge, moneySettings)]);
        if (tax > 0) summaryRows.push(["Tax", formatMoney(tax, moneySettings)]);
        summaryRows.push(["Grand total", formatMoney(total, moneySettings), true]);
        if (paymentReceived > 0) summaryRows.push(["Payment received", formatMoney(paymentReceived, moneySettings)]);
        if (remainingDue > 0) summaryRows.push(["Remaining due", formatMoney(remainingDue, moneySettings)]);

        const summaryH = 18 + summaryRows.length * 18 + 8;
        drawCard(doc, summaryX, y, summaryW, summaryH, 8);
        let sy = y + 12;
        summaryRows.forEach(([label, value, strong]) => {
          doc.font(strong ? F.bold : F.regular).fontSize(strong ? 10 : 8).fillColor(strong ? primary : C.muted);
          doc.text(label, summaryX + 14, sy, { width: 90, lineBreak: false });
          doc.font(strong ? F.bold : F.medium).fontSize(strong ? 10 : 8).fillColor(strong ? primary : C.text);
          doc.text(value, summaryX + 14, sy, { width: summaryW - 28, align: "right", lineBreak: false });
          sy += strong ? 22 : 17;
        });

        if (order.notes?.trim()) {
          const notesW = PW - summaryW - 16;
          drawCard(doc, LM, y, notesW, summaryH, 8);
          doc.font(F.semiBold).fontSize(8).fillColor(primary);
          doc.text("NOTES", LM + 14, y + 12, { lineBreak: false });
          doc.font(F.regular).fontSize(8).fillColor(C.text);
          doc.text(order.notes.trim(), LM + 14, y + 28, {
            width: notesW - 28,
            height: summaryH - 40,
            ellipsis: true,
          });
        }
        y += summaryH + 16;

        // ── QR (optional) ───────────────────────────────────────────────────
        if (payload.verificationUrl?.trim()) {
          ensureSpace(78);
          drawCard(doc, LM, y, PW, 70, 8);
          const qrBuffer = await QRCode.toBuffer(payload.verificationUrl, {
            width: 96,
            margin: 1,
            color: { dark: primary, light: "#ffffff" },
            errorCorrectionLevel: "M",
          });
          doc.image(qrBuffer, LM + 14, y + 10, { width: 50, height: 50 });
          doc.font(F.semiBold).fontSize(8).fillColor(primary);
          doc.text("Verify invoice", LM + 78, y + 18, { lineBreak: false });
          doc.font(F.regular).fontSize(7.5).fillColor(C.muted);
          doc.text(fitText(doc, payload.verificationUrl, F.regular, 7.5, PW - 110), LM + 78, y + 34, {
            width: PW - 110,
            lineBreak: false,
            link: payload.verificationUrl,
          });
          y += 86;
        }

        // ── Footer on every page ────────────────────────────────────────────
        const pageCount = doc.bufferedPageRange().count;
        for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
          doc.switchToPage(pageIndex);
          const footerY = doc.page.height - 48;
          doc.save();
          doc.moveTo(LM, footerY - 10).lineTo(RM, footerY - 10).lineWidth(0.6).strokeColor(C.border).stroke();
          doc.restore();
          doc.font(F.medium).fontSize(8).fillColor(C.text);
          doc.text(`Thank you for shopping with ${storeName}.`, LM, footerY - 2, {
            width: PW,
            align: "center",
            lineBreak: false,
          });
          const helpBits = ["Need help?", storeEmail, storePhone, storeWebsite].filter(Boolean);
          doc.font(F.regular).fontSize(7).fillColor(C.muted);
          doc.text(helpBits.join("  ·  "), LM, footerY + 12, {
            width: PW,
            align: "center",
            lineBreak: false,
          });
          doc.font(F.regular).fontSize(6.5).fillColor(C.muted);
          doc.text("Powered by BornoLand", LM, footerY + 26, {
            width: PW,
            align: "center",
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
