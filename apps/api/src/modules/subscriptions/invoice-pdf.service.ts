import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import type { InvoiceDocument } from "./invoice.model.js";
import { DURATION_LABELS } from "./subscription.constants.js";

/* ── Paths ────────────────────────────────────────────────────────────────── */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function formatDate(date: Date | string | undefined | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency === "BDT" ? "BDT" : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

function resolveBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_STORE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function loadLogoBuffer(): Buffer | null {
  const candidates = [
    path.resolve(__dirname, "../../../../web/public/logo.png"),
    path.resolve(__dirname, "../../../../../apps/web/public/logo.png"),
    path.resolve(process.cwd(), "apps/web/public/logo.png"),
    path.resolve(process.cwd(), "web/public/logo.png"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p);
    } catch { /* continue */ }
  }
  return null;
}

function loadFont(name: string): string | null {
  const fontPath = path.resolve(__dirname, "../../assets/fonts", name);
  try {
    if (fs.existsSync(fontPath)) return fontPath;
  } catch { /* continue */ }
  return null;
}

/* ── Color Palette ────────────────────────────────────────────────────────── */

const C = {
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  primaryLight: "#dbeafe",
  text: "#0f172a",
  textSecondary: "#334155",
  muted: "#64748b",
  light: "#94a3b8",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  bgPage: "#f8fafc",
  bgCard: "#ffffff",
  bgTable: "#f8fafc",
  bgTableAlt: "#f1f5f9",
  success: "#16a34a",
  successLight: "#dcfce7",
  successDark: "#15803d",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
  danger: "#dc2626",
  dangerLight: "#fee2e2",
  neutral: "#64748b",
  neutralLight: "#f1f5f9",
  white: "#ffffff",
};

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: "PAID", color: C.success, bg: C.successLight },
  pending: { label: "PENDING", color: C.warning, bg: C.warningLight },
  rejected: { label: "FAILED", color: C.danger, bg: C.dangerLight },
  refunded: { label: "CANCELLED", color: C.neutral, bg: C.neutralLight },
};

/* ── Drawing Helpers ──────────────────────────────────────────────────────── */

function drawRoundedCard(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number, h: number,
  radius: number = 6,
  fillColor: string = C.bgCard,
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
  x: number, y: number,
  color: string, bg: string,
) {
  doc.save();
  doc.font(font).fontSize(7);
  const w = doc.widthOfString(text) + 14;
  doc.roundedRect(x, y, w, 16, 3).fill(bg);
  doc.fillColor(color).text(text, x + 7, y + 4, { width: w - 14, align: "center" });
  doc.restore();
  return w;
}

function drawInfoRow(
  doc: PDFKit.PDFDocument,
  labelFont: string, valueFont: string,
  label: string, value: string,
  x: number, y: number,
  labelW: number, valueW: number,
  labelSize: number = 7, valueSize: number = 8,
) {
  doc.font(labelFont).fontSize(labelSize).fillColor(C.muted);
  doc.text(label, x, y, { width: labelW });
  doc.font(valueFont).fontSize(valueSize).fillColor(C.text);
  doc.text(value, x + labelW, y, { width: valueW });
}

/* ── PDF Generator ────────────────────────────────────────────────────────── */

export async function generateInvoicePdf(
  invoice: InvoiceDocument & {
    planId?: { name?: string; slug?: string; priceBDT?: number };
    storeId?: { name?: string; slug?: string; subdomain?: string };
    userId?: { name?: string; email?: string; phone?: string };
    approvedBy?: { name?: string; email?: string };
    paymentId?: {
      paymentMethod?: string;
      senderNumber?: string;
      transactionId?: string;
      createdAt?: Date;
    };
  }
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      /* ── Font Registration ──────────────────────────────────────────────── */
      const fontRegular = loadFont("Inter-Regular.ttf");
      const fontMedium = loadFont("Inter-Medium.ttf");
      const fontSemiBold = loadFont("Inter-SemiBold.ttf");
      const fontBold = loadFont("Inter-Bold.ttf");

      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 40, bottom: 80, left: 48, right: 48 },
        autoFirstPage: true,
        bufferPages: false,
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: "BornoLand",
          Subject: `Invoice ${invoice.invoiceNumber} — BornoLand`,
          Creator: "BornoLand Invoice System",
          Keywords: "invoice, billing, bornoland",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

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

      /* ── Layout Constants ───────────────────────────────────────────────── */
      const LM = 48;
      const RM = doc.page.width - 48;
      const PW = RM - LM;
      let y = 40;

      const logoBuffer = loadLogoBuffer();
      const status = STATUS_STYLE[invoice.status] || STATUS_STYLE.pending;
      const planName = typeof invoice.planId === "object" ? invoice.planId?.name ?? "—" : "—";
      const storeName = typeof invoice.storeId === "object" ? invoice.storeId?.name : "";
      const ownerName = typeof invoice.userId === "object" ? invoice.userId?.name : "";
      const ownerEmail = typeof invoice.userId === "object" ? invoice.userId?.email : "";
      const storeDomain = typeof invoice.storeId === "object"
        ? `${invoice.storeId?.subdomain || invoice.storeId?.slug}.bornoland.com`
        : "";
      const customerId = String(invoice.userId?._id ?? invoice.userId).slice(-8).toUpperCase();
      const gateway = invoice.gateway || "";
      const txId = invoice.transactionId || "";
      const sender = invoice.senderNumber || "";
      const approvedByName = typeof invoice.approvedBy === "object" ? invoice.approvedBy?.name ?? "—" : "—";
      const discount = invoice.discount || 0;
      const baseUrl = resolveBaseUrl();
      const verificationUrl = `${baseUrl}/invoices/verify/${invoice.verificationCode}`;

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 1: HEADER
      // ══════════════════════════════════════════════════════════════════════

      // Left: Logo + Company
      if (logoBuffer) {
        doc.image(logoBuffer, LM, y, { width: 40, height: 40 });
        doc.font(F.bold).fontSize(18).fillColor(C.text);
        doc.text("BornoLand", LM + 48, y + 2);
        doc.font(F.regular).fontSize(8).fillColor(C.muted);
        doc.text("bornoland.com", LM + 48, y + 24, { link: "https://bornoland.com" });
        doc.text("support@bornoland.com", LM + 48, y + 35, { link: "mailto:support@bornoland.com" });
      } else {
        doc.font(F.bold).fontSize(20).fillColor(C.text);
        doc.text("BornoLand", LM, y);
        doc.font(F.regular).fontSize(8).fillColor(C.muted);
        doc.text("bornoland.com", LM, y + 24, { link: "https://bornoland.com" });
        doc.text("support@bornoland.com", LM, y + 35, { link: "mailto:support@bornoland.com" });
      }

      // Right: INVOICE title + status
      doc.font(F.bold).fontSize(28).fillColor(C.primary);
      doc.text("INVOICE", RM - 180, y, { width: 180, align: "right" });

      // Status badge
      const badgeW = drawBadge(doc, F.bold, status.label, RM - doc.widthOfString(status.label) - 21, y + 36, status.color, status.bg);

      // Invoice meta below badge
      const metaX = RM - 180;
      const metaW = 180;
      doc.font(F.regular).fontSize(8).fillColor(C.muted);
      doc.text(invoice.invoiceNumber, metaX, y + 58, { width: metaW, align: "right" });
      doc.text(`Issued: ${formatDate(invoice.issuedAt)}`, metaX, y + 70, { width: metaW, align: "right" });
      if (invoice.paidAt) {
        doc.text(`Paid: ${formatDate(invoice.paidAt)}`, metaX, y + 82, { width: metaW, align: "right" });
      }
      if (invoice.dueDate) {
        doc.text(`Due: ${formatDate(invoice.dueDate)}`, metaX, y + (invoice.paidAt ? 94 : 82), { width: metaW, align: "right" });
      }

      y += invoice.dueDate ? 108 : (invoice.paidAt ? 100 : 90);

      // ── Divider ──────────────────────────────────────────────────────────
      doc.save();
      doc.moveTo(LM, y).lineTo(RM, y).lineWidth(0.5).strokeColor(C.border).stroke();
      doc.restore();
      y += 14;

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 2: FROM / BILL TO (Two Cards)
      // ══════════════════════════════════════════════════════════════════════

      const cardW = PW * 0.47;
      const cardGap = PW * 0.06;
      const cardH = 72;
      const cardY = y;

      // FROM card
      drawRoundedCard(doc, LM, cardY, cardW, cardH, 6, C.bgTable, C.border);
      doc.font(F.semiBold).fontSize(7).fillColor(C.primary);
      doc.text("FROM", LM + 10, cardY + 8);

      let fromY = cardY + 20;
      doc.font(F.regular).fontSize(7.5).fillColor(C.text);
      const fromLines = [
        invoice.companyName || "BornoLand",
        invoice.companyWebsite || "bornoland.com",
        invoice.companyEmail || "support@bornoland.com",
      ].filter(Boolean);
      fromLines.forEach((line, i) => {
        doc.text(line, LM + 10, fromY + i * 10, { width: cardW - 20 });
      });

      // BILL TO card
      const billToX = LM + cardW + cardGap;
      drawRoundedCard(doc, billToX, cardY, cardW, cardH, 6, C.bgTable, C.border);
      doc.font(F.semiBold).fontSize(7).fillColor(C.primary);
      doc.text("BILL TO", billToX + 10, cardY + 8);

      let billToY = cardY + 20;
      doc.font(F.regular).fontSize(7.5).fillColor(C.text);
      const billToLines = [storeName, ownerName, ownerEmail, storeDomain, `ID: ${customerId}`].filter((l): l is string => Boolean(l));
      billToLines.forEach((line, i) => {
        doc.text(line, billToX + 10, billToY + i * 10, { width: cardW - 20 });
      });

      y = cardY + cardH + 12;

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 3: SUBSCRIPTION + PAYMENT (Two Cards)
      // ══════════════════════════════════════════════════════════════════════

      const detailCardH = 64;
      const detailY = y;

      // Subscription card
      drawRoundedCard(doc, LM, detailY, cardW, detailCardH, 6, C.bgTable, C.border);
      doc.font(F.semiBold).fontSize(7).fillColor(C.primary);
      doc.text("SUBSCRIPTION", LM + 10, detailY + 8);

      const subItems: [string, string][] = [
        ["Plan", planName],
        ["Cycle", DURATION_LABELS[invoice.duration as keyof typeof DURATION_LABELS] || invoice.duration || "—"],
        ["Start", formatDate(invoice.billingPeriodStart)],
        ["Renewal", formatDate(invoice.billingPeriodEnd)],
      ];
      subItems.forEach(([label, value], i) => {
        drawInfoRow(doc, F.regular, F.medium, label, value, LM + 10, detailY + 20 + i * 11, 52, cardW - 72, 6.5, 7);
      });

      // Payment card
      drawRoundedCard(doc, billToX, detailY, cardW, detailCardH, 6, C.bgTable, C.border);
      doc.font(F.semiBold).fontSize(7).fillColor(C.primary);
      doc.text("PAYMENT", billToX + 10, detailY + 8);

      const payItems: [string, string][] = [
        ["Status", invoice.status?.toUpperCase() || "—"],
        ["Gateway", gateway.charAt(0).toUpperCase() + gateway.slice(1) || "—"],
        ["Method", sender || "—"],
        ["TX ID", txId || "—"],
      ];
      payItems.forEach(([label, value], i) => {
        drawInfoRow(doc, F.regular, F.medium, label, value, billToX + 10, detailY + 20 + i * 11, 52, cardW - 72, 6.5, 7);
      });

      y = detailY + detailCardH + 12;

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 4: INVOICE TABLE
      // ══════════════════════════════════════════════════════════════════════

      // Table header
      drawRoundedCard(doc, LM, y, PW, 22, 4, C.primary);

      const tCols = [
        { x: LM + 8, w: PW * 0.34, label: "DESCRIPTION", align: "left" as const },
        { x: LM + PW * 0.34, w: PW * 0.08, label: "QTY", align: "center" as const },
        { x: LM + PW * 0.42, w: PW * 0.16, label: "UNIT PRICE", align: "right" as const },
        { x: LM + PW * 0.58, w: PW * 0.16, label: "DISCOUNT", align: "right" as const },
        { x: LM + PW * 0.74, w: PW * 0.16, label: "TAX", align: "right" as const },
        { x: LM + PW * 0.90, w: PW * 0.10, label: "TOTAL", align: "right" as const },
      ];

      doc.font(F.semiBold).fontSize(6).fillColor(C.white);
      for (const col of tCols) {
        doc.text(col.label, col.x, y + 7, { width: col.w, align: col.align });
      }
      y += 26;

      // Table row (alternating background)
      drawRoundedCard(doc, LM, y, PW, 20, 0, C.bgTableAlt);
      doc.font(F.regular).fontSize(8).fillColor(C.text);
      doc.text(planName, tCols[0].x, y + 6, { width: tCols[0].w });
      doc.text("1", tCols[1].x, y + 6, { width: tCols[1].w, align: "center" });
      doc.text(formatCurrency(invoice.subtotal, invoice.currency), tCols[2].x, y + 6, { width: tCols[2].w, align: "right" });
      doc.text(discount > 0 ? `-${formatCurrency(discount, invoice.currency)}` : "—", tCols[3].x, y + 6, { width: tCols[3].w, align: "right" });
      doc.text(invoice.vatAmount > 0 ? formatCurrency(invoice.vatAmount, invoice.currency) : "—", tCols[4].x, y + 6, { width: tCols[4].w, align: "right" });
      doc.text(formatCurrency(invoice.subtotal - discount + (invoice.vatAmount || 0) + (invoice.taxAmount || 0), invoice.currency), tCols[5].x, y + 6, { width: tCols[5].w, align: "right" });

      y += 24;

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 5: TOTALS (Right-aligned card)
      // ══════════════════════════════════════════════════════════════════════

      const sumCardW = PW * 0.42;
      const sumCardX = RM - sumCardW;
      const sumLabelX = sumCardX + 10;
      const sumValX = RM - 10;
      const sumLabelW = sumCardW * 0.55;

      // Calculate card height
      let summaryRows = 1; // Subtotal
      if (discount > 0) summaryRows++;
      if (invoice.vatAmount > 0) summaryRows++;
      if (invoice.taxAmount > 0) summaryRows++;
      summaryRows += 3; // divider + Total + Paid + Remaining
      const sumCardH = summaryRows * 13 + 20;

      drawRoundedCard(doc, sumCardX, y, sumCardW, sumCardH, 6, C.bgTable, C.border);

      let sy = y + 10;

      // Subtotal
      doc.font(F.regular).fontSize(8).fillColor(C.muted);
      doc.text("Subtotal", sumLabelX, sy, { width: sumLabelW });
      doc.font(F.medium).fontSize(8).fillColor(C.text);
      doc.text(formatCurrency(invoice.subtotal, invoice.currency), sumValX, sy, { width: 110, align: "right" });
      sy += 13;

      // Discount
      if (discount > 0) {
        doc.font(F.regular).fontSize(8).fillColor(C.success);
        doc.text("Discount", sumLabelX, sy, { width: sumLabelW });
        doc.font(F.medium).fontSize(8).fillColor(C.success);
        doc.text(`-${formatCurrency(discount, invoice.currency)}`, sumValX, sy, { width: 110, align: "right" });
        sy += 13;
      }

      // VAT
      if (invoice.vatAmount > 0) {
        doc.font(F.regular).fontSize(8).fillColor(C.muted);
        doc.text("VAT", sumLabelX, sy, { width: sumLabelW });
        doc.font(F.medium).fontSize(8).fillColor(C.text);
        doc.text(formatCurrency(invoice.vatAmount, invoice.currency), sumValX, sy, { width: 110, align: "right" });
        sy += 13;
      }

      // Tax
      if (invoice.taxAmount > 0) {
        doc.font(F.regular).fontSize(8).fillColor(C.muted);
        doc.text("Tax", sumLabelX, sy, { width: sumLabelW });
        doc.font(F.medium).fontSize(8).fillColor(C.text);
        doc.text(formatCurrency(invoice.taxAmount, invoice.currency), sumValX, sy, { width: 110, align: "right" });
        sy += 13;
      }

      // Divider
      sy += 2;
      doc.save();
      doc.moveTo(sumLabelX, sy).lineTo(RM - 10, sy).lineWidth(0.5).strokeColor(C.border).stroke();
      doc.restore();
      sy += 6;

      // TOTAL (highlighted)
      doc.font(F.bold).fontSize(11).fillColor(C.primary);
      doc.text("TOTAL", sumLabelX, sy, { width: sumLabelW });
      doc.text(formatCurrency(invoice.total, invoice.currency), sumValX, sy, { width: 110, align: "right" });
      sy += 16;

      // Paid
      if (invoice.paidAt) {
        doc.font(F.regular).fontSize(8).fillColor(C.muted);
        doc.text("Paid", sumLabelX, sy, { width: sumLabelW });
        doc.font(F.medium).fontSize(8).fillColor(C.success);
        doc.text(formatCurrency(invoice.total, invoice.currency), sumValX, sy, { width: 110, align: "right" });
        sy += 13;

        doc.font(F.regular).fontSize(8).fillColor(C.muted);
        doc.text("Remaining", sumLabelX, sy, { width: sumLabelW });
        doc.font(F.bold).fontSize(8).fillColor(C.success);
        doc.text(formatCurrency(0, invoice.currency), sumValX, sy, { width: 110, align: "right" });
      }

      y += sumCardH + 12;

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 6: QR CODE + VERIFICATION
      // ══════════════════════════════════════════════════════════════════════

      const qrSectionH = 60;
      drawRoundedCard(doc, LM, y, PW, qrSectionH, 6, C.bgTable, C.border);

      const qrBuffer = await QRCode.toBuffer(verificationUrl, {
        width: 80,
        margin: 1,
        color: { dark: C.primary, light: C.white },
        errorCorrectionLevel: "M",
      });

      doc.image(qrBuffer, LM + 10, y + 8, { width: 44, height: 44 });

      // Verified badge
      drawBadge(doc, F.semiBold, "VERIFIED BY BORNOLAND", LM + 62, y + 8, C.success, C.successLight);

      doc.font(F.semiBold).fontSize(8).fillColor(C.text);
      doc.text("Verify this invoice", LM + 62, y + 28);

      doc.font(F.regular).fontSize(7).fillColor(C.primary);
      doc.text(verificationUrl, LM + 62, y + 40, { width: PW - 100, link: verificationUrl });

      doc.font(F.regular).fontSize(6).fillColor(C.muted);
      doc.text(`Token: ${invoice.verificationCode?.slice(0, 16) || "—"}`, LM + 62, y + 50);

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 7: FOOTER (absolute position, always at bottom)
      // CRITICAL: Position above bottom margin to prevent blank pages.
      // ══════════════════════════════════════════════════════════════════════

      const footerY = doc.page.height - 72;

      doc.save();
      doc.moveTo(LM, footerY).lineTo(RM, footerY).lineWidth(0.5).strokeColor(C.border).stroke();
      doc.restore();

      doc.font(F.regular).fontSize(6).fillColor(C.muted);

      // Left: Powered by
      doc.text("Powered by BornoLand", LM, footerY + 8);
      doc.text("bornoland.com", LM, footerY + 18, { link: "https://bornoland.com" });

      // Center: Generated date + disclaimer
      doc.text(`Generated: ${formatDate(new Date())}`, LM + PW * 0.3, footerY + 8, { width: PW * 0.4, align: "center" });
      doc.text("This invoice was generated electronically and does not require a signature.", LM + PW * 0.2, footerY + 18, { width: PW * 0.6, align: "center" });

      // Right: Support + Invoice #
      doc.text("support@bornoland.com", RM - 130, footerY + 8, { width: 130, align: "right", link: "mailto:support@bornoland.com" });
      doc.text(invoice.invoiceNumber, RM - 130, footerY + 18, { width: 130, align: "right" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
