import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { getUploadRoot } from "../media/providers/local-storage.provider.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type CurrencyCode = "USD" | "BDT" | "EUR" | "INR" | "GBP" | string;

type OrderItem = {
  name?: string;
  variantTitle?: string;
  sku?: string;
  quantity?: number;
  price?: number;
};

type OrderTimelineEvent = {
  status?: string;
  note?: string;
  createdAt?: Date | string;
};

type PopulatedCustomer = {
  name?: string;
  email?: string;
  phone?: string;
};

type OrderInvoicePayload = {
  order: {
    invoiceNumber?: string;
    orderNumber?: string;
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    currencyCode?: CurrencyCode;
    subtotal?: number;
    discount?: number;
    shipping?: number;
    deliveryCharge?: number;
    tax?: number;
    total?: number;
    notes?: string;
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
    timeline?: OrderTimelineEvent[];
    customerId?: PopulatedCustomer | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
  store: {
    name?: string;
    shortName?: string;
    logoUrl?: string;
    brandColor?: string;
    theme?: { primaryColor?: string };
  };
  storeContact?: {
    businessName?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
  } | null;
  storeSettings?: {
    locale?: string;
    timezone?: string;
    currencyCode?: CurrencyCode;
    currencySymbol?: string;
    currencyPosition?: "before" | "after";
    decimalPlaces?: number;
  } | null;
  verificationUrl?: string;
};

const C = {
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  bgCard: "#ffffff",
  bgTable: "#f8fafc",
  bgTableAlt: "#f1f5f9",
  white: "#ffffff",
  success: "#16a34a",
  successLight: "#dcfce7",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
  danger: "#dc2626",
  dangerLight: "#fee2e2",
  neutral: "#64748b",
  neutralLight: "#f1f5f9",
};

function formatDateTime(
  value: Date | string | undefined | null,
  locale = "en-US",
  timezone = "UTC",
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(locale, {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  settings?: { locale?: string; currencySymbol?: string; currencyPosition?: "before" | "after"; decimalPlaces?: number },
): string {
  const locale = settings?.locale ?? "en-US";
  const decimals = settings?.decimalPlaces ?? 2;
  const normalized = Number.isFinite(amount) ? amount : 0;
  try {
    if (settings?.currencySymbol) {
      const value = normalized.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return settings.currencyPosition === "after"
        ? `${value} ${settings.currencySymbol}`
        : `${settings.currencySymbol} ${value}`;
    }
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(normalized);
  } catch {
    return `${currency || "USD"} ${normalized.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }
}

function titleCase(value: string | undefined | null): string {
  if (!value) return "—";
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

function lightenHex(hex: string, amount = 0.14): string {
  const normalized = hex.replace("#", "");
  const expanded = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;
  if (!/^[0-9a-f]{6}$/i.test(expanded)) return "#0066cc";
  const num = Number.parseInt(expanded, 16);
  const r = Math.min(255, Math.round(((num >> 16) & 255) + 255 * amount));
  const g = Math.min(255, Math.round(((num >> 8) & 255) + 255 * amount));
  const b = Math.min(255, Math.round((num & 255) + 255 * amount));
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function darkenHex(hex: string, amount = 0.16): string {
  const normalized = hex.replace("#", "");
  const expanded = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;
  if (!/^[0-9a-f]{6}$/i.test(expanded)) return "#0066cc";
  const num = Number.parseInt(expanded, 16);
  const r = Math.max(0, Math.round(((num >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 255) * (1 - amount)));
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function drawRoundedCard(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 6,
  fillColor = C.bgCard,
  strokeColor?: string,
) {
  doc.save();
  if (strokeColor) {
    doc.roundedRect(x, y, w, h, radius).fillAndStroke(fillColor, strokeColor);
  } else {
    doc.roundedRect(x, y, w, h, radius).fill(fillColor);
  }
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
  doc.font(font).fontSize(7);
  const width = doc.widthOfString(text) + 14;
  doc.roundedRect(x, y, width, 16, 3).fill(bg);
  doc.fillColor(color).text(text, x + 7, y + 4, { width: width - 14, align: "center" });
  doc.restore();
  return width;
}

function drawInfoRow(
  doc: PDFKit.PDFDocument,
  labelFont: string,
  valueFont: string,
  label: string,
  value: string,
  x: number,
  y: number,
  labelW: number,
  valueW: number,
  labelSize = 7,
  valueSize = 8,
) {
  doc.font(labelFont).fontSize(labelSize).fillColor(C.muted);
  doc.text(label, x, y, { width: labelW });
  doc.font(valueFont).fontSize(valueSize).fillColor(C.text);
  doc.text(value, x + labelW, y, { width: valueW });
}

function loadFont(name: string): string | null {
  const fontPath = path.resolve(__dirname, "../../assets/fonts", name);
  return fs.existsSync(fontPath) ? fontPath : null;
}

async function loadLogoBuffer(logoUrl: string | undefined | null): Promise<Buffer | null> {
  if (!logoUrl) return null;

  const source = logoUrl.trim();
  if (!source) return null;

  if (/^https?:\/\//i.test(source)) {
    try {
      const response = await fetch(source);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch {
      return null;
    }
  }

  const normalized = source.replace(/^file:\/\//i, "");
  const relativeCandidates = [
    normalized,
    normalized.replace(/^\/+/, ""),
    normalized.replace(/^\/+uploads\/+/i, ""),
    normalized.replace(/^uploads\/+/i, ""),
  ];

  const candidatePaths = new Set<string>();
  for (const candidate of relativeCandidates) {
    if (!candidate) continue;
    candidatePaths.add(candidate);
    candidatePaths.add(path.join(getUploadRoot(), candidate));
    candidatePaths.add(path.resolve(getUploadRoot(), candidate));
  }

  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return fs.readFileSync(candidate);
      }
    } catch {
      // try next candidate
    }
  }

  return null;
}

function formatAddressLine(address?: string, city?: string, country?: string, postalCode?: string): string {
  return [address, city, country, postalCode].map((part) => part?.trim()).filter(Boolean).join(", ");
}

function mapPaymentStatus(status?: string): { label: string; color: string; bg: string } {
  switch ((status ?? "").toLowerCase()) {
    case "paid":
      return { label: "PAID", color: C.success, bg: C.successLight };
    case "partial":
      return { label: "PARTIAL", color: C.warning, bg: C.warningLight };
    case "failed":
      return { label: "FAILED", color: C.danger, bg: C.dangerLight };
    case "refunded":
      return { label: "REFUNDED", color: C.neutral, bg: C.neutralLight };
    default:
      return { label: "PENDING", color: C.warning, bg: C.warningLight };
  }
}

function mapOrderStatus(status?: string): { label: string; color: string; bg: string } {
  switch ((status ?? "").toLowerCase()) {
    case "confirmed":
      return { label: "CONFIRMED", color: C.success, bg: C.successLight };
    case "processing":
    case "packed":
    case "shipped":
    case "out_for_delivery":
      return { label: titleCase(status).toUpperCase(), color: C.warning, bg: C.warningLight };
    case "delivered":
      return { label: "DELIVERED", color: C.success, bg: C.successLight };
    case "cancelled":
    case "refunded":
    case "partial_refund":
      return { label: titleCase(status).toUpperCase(), color: C.danger, bg: C.dangerLight };
    default:
      return { label: "PENDING", color: C.warning, bg: C.warningLight };
  }
}

function generateInvoiceNumber(prefix: string): string {
  const cleanPrefix = (prefix || "INV").trim().replace(/[^A-Za-z0-9_-]/g, "").toUpperCase() || "INV";
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanPrefix}-${ts}-${rand}`;
}

export async function generateOrderInvoicePdf(payload: OrderInvoicePayload): Promise<Buffer> {
  const fontRegular = loadFont("Inter-Regular.ttf");
  const fontMedium = loadFont("Inter-Medium.ttf");
  const fontSemiBold = loadFont("Inter-SemiBold.ttf");
  const fontBold = loadFont("Inter-Bold.ttf");

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 40, bottom: 72, left: 44, right: 44 },
    autoFirstPage: true,
    bufferPages: false,
    info: {
      Title: `Order Invoice ${payload.order.invoiceNumber ?? payload.order.orderNumber ?? ""}`,
      Author: "BornoLand",
      Subject: `Order Invoice ${payload.order.invoiceNumber ?? payload.order.orderNumber ?? ""}`,
      Creator: "BornoLand Order Invoice System",
      Keywords: "invoice, order, bornoland",
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
        const locale = settings?.locale ?? "en-US";
        const timezone = settings?.timezone ?? "UTC";
        const primary = getPrimaryColor(store);
        const primaryDark = darkenHex(primary, 0.14);
        const primaryLight = lightenHex(primary, 0.82);
        const paymentBadge = mapPaymentStatus(order.paymentStatus);
        const orderBadge = mapOrderStatus(order.status);
        const orderNumber = order.orderNumber ?? "—";
        const invoiceNumber = order.invoiceNumber || generateInvoiceNumber("INV");
        const currency = order.currencyCode ?? settings?.currencyCode ?? "USD";
        const currencySettings = {
          locale,
          currencySymbol: settings?.currencySymbol,
          currencyPosition: settings?.currencyPosition,
          decimalPlaces: settings?.decimalPlaces,
        };
        const subtotal = Number(order.subtotal ?? 0);
        const discount = Number(order.discount ?? 0);
        const shipping = Number(order.shipping ?? order.deliveryCharge ?? 0);
        const tax = Number(order.tax ?? 0);
        const total = Number(order.total ?? 0);
        const generatedAt = new Date();
        const storeDisplayName = contact?.businessName?.trim() || store.shortName?.trim() || store.name?.trim() || "Store";
        const storeAddress = formatAddressLine(contact?.address, contact?.city, contact?.country, contact?.postalCode);
        const storePhone = contact?.phone?.trim() || "";
        const storeEmail = contact?.email?.trim() || "";
        const customer = typeof order.customerId === "object" && order.customerId
          ? order.customerId
          : null;
        const customerName = customer?.name?.trim() || order.shippingAddress?.fullName?.trim() || "—";
        const customerEmail = customer?.email?.trim() || "—";
        const customerPhone = customer?.phone?.trim() || order.shippingAddress?.phone?.trim() || "—";
        const shippingLines = [
          order.shippingAddress?.fullName,
          order.shippingAddress?.phone,
          order.shippingAddress?.street,
          [order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(", "),
          [order.shippingAddress?.country, order.shippingAddress?.zip].filter(Boolean).join(" "),
        ].map((line) => line?.trim()).filter(Boolean) as string[];
        const logoBuffer = await loadLogoBuffer(store.logoUrl);
        const headerLogoSize = 42;

        if (!order.invoiceNumber) {
          order.invoiceNumber = invoiceNumber;
          if (typeof (order as { save?: () => Promise<unknown> }).save === "function") {
            await (order as { save: () => Promise<unknown> }).save();
          }
        }

        let y = 40;
        const LM = 44;
        const RM = doc.page.width - 44;
        const PW = RM - LM;
        const bottomLimit = doc.page.height - 90;

        const ensureSpace = (heightNeeded: number, redraw?: () => void) => {
          if (y + heightNeeded <= bottomLimit) return;
          doc.addPage();
          y = 40;
          if (redraw) redraw();
        };

        const drawHeader = () => {
          drawRoundedCard(doc, LM, y, PW, 90, 10, C.bgCard, C.border);
          const logoX = LM + 14;
          const logoY = y + 14;
          if (logoBuffer) {
            doc.image(logoBuffer, logoX, logoY, { width: headerLogoSize, height: headerLogoSize });
          } else {
            doc.save();
            doc.roundedRect(logoX, logoY, headerLogoSize, headerLogoSize, 8).fill(primaryLight).stroke(primary);
            doc.font(F.bold).fontSize(14).fillColor(primaryDark);
            const initials = storeDisplayName
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0] ?? "")
              .join("")
              .toUpperCase()
              .slice(0, 2) || "S";
            doc.text(initials, logoX, logoY + 11, { width: headerLogoSize, align: "center" });
            doc.restore();
          }

          const textX = LM + 70;
          doc.font(F.bold).fontSize(17).fillColor(C.text);
          doc.text(storeDisplayName, textX, y + 14, { width: PW * 0.45 });
          doc.font(F.regular).fontSize(8).fillColor(C.muted);
          if (storeAddress) doc.text(storeAddress, textX, y + 34, { width: PW * 0.44 });
          const contactLines = [storePhone ? `Phone: ${storePhone}` : "", storeEmail ? `Email: ${storeEmail}` : ""].filter(Boolean);
          if (contactLines.length > 0) {
            doc.text(contactLines.join(" | "), textX, y + 48, { width: PW * 0.44 });
          }

          const metaX = LM + PW * 0.58;
          const metaW = PW * 0.38;
          doc.font(F.bold).fontSize(24).fillColor(primary);
          doc.text("INVOICE", metaX, y + 12, { width: metaW, align: "right" });
          drawBadge(doc, F.bold, orderBadge.label, metaX + metaW - 84, y + 42, orderBadge.color, orderBadge.bg);
          doc.font(F.regular).fontSize(8).fillColor(C.muted);
          doc.text(`Invoice #: ${order.invoiceNumber || invoiceNumber}`, metaX, y + 62, { width: metaW, align: "right" });
        };

        drawHeader();
        y += 104;

        const renderSectionTitle = (title: string) => {
          doc.font(F.semiBold).fontSize(8).fillColor(primary);
          doc.text(title.toUpperCase(), LM + 4, y - 2);
        };

        const cardGap = 12;
        const halfCardW = (PW - cardGap) / 2;

        ensureSpace(82);
        renderSectionTitle("Order Details");
        drawRoundedCard(doc, LM, y, halfCardW, 70, 8, C.bgTable, C.border);
        drawRoundedCard(doc, LM + halfCardW + cardGap, y, halfCardW, 70, 8, C.bgTable, C.border);
        drawInfoRow(doc, F.regular, F.medium, "Order No.", orderNumber, LM + 12, y + 10, 64, halfCardW - 76);
        drawInfoRow(doc, F.regular, F.medium, "Invoice No.", order.invoiceNumber || invoiceNumber, LM + 12, y + 24, 64, halfCardW - 76);
        drawInfoRow(doc, F.regular, F.medium, "Generated", formatDateTime(generatedAt, locale, timezone), LM + 12, y + 38, 64, halfCardW - 76);
        drawInfoRow(doc, F.regular, F.medium, "Payment", titleCase(order.paymentMethod), LM + halfCardW + cardGap + 12, y + 10, 56, halfCardW - 68);
        drawInfoRow(doc, F.regular, F.medium, "Payment Status", paymentBadge.label, LM + halfCardW + cardGap + 12, y + 24, 56, halfCardW - 68);
        drawInfoRow(doc, F.regular, F.medium, "Order Status", orderBadge.label, LM + halfCardW + cardGap + 12, y + 38, 56, halfCardW - 68);
        y += 82;

        ensureSpace(92);
        renderSectionTitle("Customer & Shipping");
        drawRoundedCard(doc, LM, y, halfCardW, 82, 8, C.bgTable, C.border);
        drawRoundedCard(doc, LM + halfCardW + cardGap, y, halfCardW, 82, 8, C.bgTable, C.border);
        doc.font(F.semiBold).fontSize(7).fillColor(primary);
        doc.text("CUSTOMER", LM + 12, y + 10);
        doc.font(F.regular).fontSize(8).fillColor(C.text);
        doc.text(customerName, LM + 12, y + 22, { width: halfCardW - 24 });
        doc.font(F.regular).fontSize(7.5).fillColor(C.muted);
        doc.text(customerEmail, LM + 12, y + 36, { width: halfCardW - 24 });
        doc.text(customerPhone, LM + 12, y + 48, { width: halfCardW - 24 });

        doc.font(F.semiBold).fontSize(7).fillColor(primary);
        doc.text("SHIPPING ADDRESS", LM + halfCardW + cardGap + 12, y + 10);
        doc.font(F.regular).fontSize(8).fillColor(C.text);
        shippingLines.slice(0, 4).forEach((line, index) => {
          doc.text(line, LM + halfCardW + cardGap + 12, y + 22 + index * 12, { width: halfCardW - 24 });
        });
        y += 94;

        ensureSpace(92);
        renderSectionTitle("Timeline");
        drawRoundedCard(doc, LM, y, PW, 82, 8, C.bgTable, C.border);
        const timeline = Array.isArray(order.timeline) ? order.timeline.slice(-4) : [];
        if (timeline.length === 0) {
          doc.font(F.regular).fontSize(8).fillColor(C.muted);
          doc.text("No timeline events available.", LM + 12, y + 20);
        } else {
          const availableWidth = PW - 24;
          const itemWidth = Math.max(availableWidth / timeline.length, 120);
          timeline.forEach((event, index) => {
            const startX = LM + 12 + index * itemWidth;
            const badge = mapOrderStatus(event.status);
            drawBadge(doc, F.bold, titleCase(event.status).toUpperCase(), startX, y + 12, badge.color, badge.bg);
            doc.font(F.regular).fontSize(7.2).fillColor(C.muted);
            doc.text(formatDateTime(event.createdAt, locale, timezone), startX, y + 30, { width: itemWidth - 14 });
            if (event.note) {
              doc.font(F.regular).fontSize(6.8).fillColor(C.text);
              doc.text(event.note, startX, y + 42, { width: itemWidth - 14, ellipsis: true });
            }
          });
        }
        y += 94;

        ensureSpace(40);
        renderSectionTitle("Items");
        const tableColumns = [
          { label: "NAME", width: PW * 0.28, align: "left" as const },
          { label: "VARIANT", width: PW * 0.18, align: "left" as const },
          { label: "SKU", width: PW * 0.12, align: "left" as const },
          { label: "QTY", width: PW * 0.08, align: "center" as const },
          { label: "UNIT PRICE", width: PW * 0.17, align: "right" as const },
          { label: "LINE TOTAL", width: PW * 0.17, align: "right" as const },
        ];

        const tableX = LM;
        const tableHeaderHeight = 22;
        const drawTableHeader = () => {
          drawRoundedCard(doc, tableX, y, PW, tableHeaderHeight, 6, primary);
          let colX = tableX + 8;
          doc.font(F.semiBold).fontSize(6.5).fillColor(C.white);
          tableColumns.forEach((col) => {
            doc.text(col.label, colX, y + 7, { width: col.width - 8, align: col.align });
            colX += col.width;
          });
          y += tableHeaderHeight + 4;
        };

        drawTableHeader();
        const items = Array.isArray(order.items) ? order.items : [];
        if (items.length === 0) {
          drawRoundedCard(doc, tableX, y, PW, 20, 4, C.bgTableAlt);
          doc.font(F.regular).fontSize(8).fillColor(C.muted);
          doc.text("No items available.", tableX + 10, y + 6);
          y += 24;
        } else {
          for (const item of items) {
            const itemName = item.name?.trim() || "—";
            const variant = item.variantTitle?.trim() || "—";
            const sku = item.sku?.trim() || "—";
            const qty = Number(item.quantity ?? 0);
            const unitPrice = Number(item.price ?? 0);
            const lineTotal = qty * unitPrice;
            const nameH = doc.heightOfString(itemName, { width: tableColumns[0].width - 14 });
            const variantH = doc.heightOfString(variant, { width: tableColumns[1].width - 14 });
            const rowH = Math.max(22, Math.max(nameH, variantH) + 12);
            ensureSpace(rowH + 8, () => {
              renderSectionTitle("Items");
              drawTableHeader();
            });

            drawRoundedCard(doc, tableX, y, PW, rowH, 4, C.bgTableAlt);
            let colX = tableX + 8;
            doc.font(F.regular).fontSize(8).fillColor(C.text);
            doc.text(itemName, colX, y + 6, { width: tableColumns[0].width - 12, align: "left" });
            colX += tableColumns[0].width;
            doc.text(variant, colX, y + 6, { width: tableColumns[1].width - 12, align: "left" });
            colX += tableColumns[1].width;
            doc.text(sku, colX, y + 6, { width: tableColumns[2].width - 12, align: "left" });
            colX += tableColumns[2].width;
            doc.text(String(qty || 0), colX, y + 6, { width: tableColumns[3].width - 12, align: "center" });
            colX += tableColumns[3].width;
            doc.text(formatCurrency(unitPrice, currency, currencySettings), colX, y + 6, { width: tableColumns[4].width - 12, align: "right" });
            colX += tableColumns[4].width;
            doc.text(formatCurrency(lineTotal, currency, currencySettings), colX, y + 6, { width: tableColumns[5].width - 12, align: "right" });
            y += rowH + 4;
          }
        }

        ensureSpace(108);
        renderSectionTitle("Summary");
        const summaryW = Math.min(230, PW);
        const summaryX = RM - summaryW;
        const summaryRows = [
          ["Subtotal", formatCurrency(subtotal, currency, currencySettings)],
          ...(discount > 0 ? [["Discount", `-${formatCurrency(discount, currency, currencySettings)}`]] : []),
          ["Shipping", formatCurrency(shipping, currency, currencySettings)],
          ["Tax", formatCurrency(tax, currency, currencySettings)],
        ] as Array<[string, string]>;
        const summaryHeight = 18 + summaryRows.length * 14 + 26;
        drawRoundedCard(doc, summaryX, y, summaryW, summaryHeight, 8, C.bgTable, C.border);

        let sy = y + 10;
        for (const [label, value] of summaryRows) {
          doc.font(F.regular).fontSize(8).fillColor(C.muted);
          doc.text(label, summaryX + 12, sy, { width: summaryW - 120 });
          doc.font(F.medium).fontSize(8).fillColor(C.text);
          doc.text(value, summaryX + 12, sy, { width: summaryW - 24, align: "right" });
          sy += 14;
        }
        doc.save();
        doc.moveTo(summaryX + 12, sy + 2).lineTo(summaryX + summaryW - 12, sy + 2).lineWidth(0.5).strokeColor(C.border).stroke();
        doc.restore();
        doc.font(F.bold).fontSize(11).fillColor(primary);
        doc.text("GRAND TOTAL", summaryX + 12, sy + 8, { width: summaryW - 120 });
        doc.text(formatCurrency(total, currency, currencySettings), summaryX + 12, sy + 8, { width: summaryW - 24, align: "right" });
        y += summaryHeight + 12;

        ensureSpace(64);
        renderSectionTitle("Notes");
        drawRoundedCard(doc, LM, y, PW, 54, 8, C.bgTable, C.border);
        doc.font(F.regular).fontSize(8).fillColor(order.notes?.trim() ? C.text : C.muted);
        doc.text(order.notes?.trim() || "No notes provided.", LM + 12, y + 12, { width: PW - 24, height: 28 });
        y += 66;

        if (payload.verificationUrl?.trim()) {
          ensureSpace(96);
          renderSectionTitle("Verification");
          drawRoundedCard(doc, LM, y, PW, 84, 8, C.bgTable, C.border);
          const qrBuffer = await QRCode.toBuffer(payload.verificationUrl, {
            width: 90,
            margin: 1,
            color: { dark: primary, light: C.white },
            errorCorrectionLevel: "M",
          });
          doc.image(qrBuffer, LM + 12, y + 10, { width: 50, height: 50 });
          drawBadge(doc, F.bold, "VERIFY INVOICE", LM + 72, y + 12, primary, primaryLight);
          doc.font(F.regular).fontSize(7.5).fillColor(C.text);
          doc.text(payload.verificationUrl, LM + 72, y + 32, { width: PW - 98, link: payload.verificationUrl });
          doc.font(F.regular).fontSize(6.5).fillColor(C.muted);
          doc.text("Scan the QR code to verify this invoice.", LM + 72, y + 48, { width: PW - 98 });
          y += 96;
        }

        const footerY = doc.page.height - 48;
        doc.save();
        doc.moveTo(LM, footerY - 8).lineTo(RM, footerY - 8).lineWidth(0.5).strokeColor(C.border).stroke();
        doc.restore();
        doc.font(F.regular).fontSize(6.5).fillColor(C.muted);
        doc.text("Powered by BornoLand", LM, footerY, { width: PW, align: "center" });

        doc.end();
      } catch (error) {
        reject(error);
      }
    })();
  });
}
