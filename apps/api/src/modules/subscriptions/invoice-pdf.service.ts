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
    // Fallback for unsupported currencies
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

/* ── Colors ───────────────────────────────────────────────────────────────── */

const C = {
  primary: "#0f172a",
  text: "#1e293b",
  muted: "#64748b",
  light: "#94a3b8",
  border: "#e2e8f0",
  bgLight: "#f8fafc",
  bgTable: "#f1f5f9",
  accent: "#2563eb",
  success: "#16a34a",
  successBg: "#dcfce7",
  warning: "#f59e0b",
  warningBg: "#fef3c7",
  danger: "#dc2626",
  dangerBg: "#fee2e2",
  neutral: "#64748b",
  neutralBg: "#f1f5f9",
  white: "#ffffff",
};

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: "PAID", color: C.success, bg: C.successBg },
  pending: { label: "PENDING", color: C.warning, bg: C.warningBg },
  rejected: { label: "FAILED", color: C.danger, bg: C.dangerBg },
  refunded: { label: "CANCELLED", color: C.neutral, bg: C.neutralBg },
};

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
      // ── Register embedded fonts ──────────────────────────────────────────
      const fontRegular = loadFont("Inter-Regular.ttf");
      const fontMedium = loadFont("Inter-Medium.ttf");
      const fontSemiBold = loadFont("Inter-SemiBold.ttf");
      const fontBold = loadFont("Inter-Bold.ttf");

      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 36, bottom: 36, left: 44, right: 44 },
        autoFirstPage: true,
        bufferPages: false,
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: "BornoLand",
          Subject: `Invoice ${invoice.invoiceNumber}`,
          Creator: "BornoLand Invoice System",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Register fonts
      if (fontRegular) doc.registerFont("Inter", fontRegular);
      if (fontMedium) doc.registerFont("Inter-Medium", fontMedium);
      if (fontSemiBold) doc.registerFont("Inter-SemiBold", fontSemiBold);
      if (fontBold) doc.registerFont("Inter-Bold", fontBold);

      // Font helpers — fall back to Helvetica variants if Inter not found
      const F = {
        regular: fontRegular ? "Inter" : "Helvetica",
        medium: fontMedium ? "Inter-Medium" : "Helvetica",
        semiBold: fontSemiBold ? "Inter-SemiBold" : "Helvetica-Bold",
        bold: fontBold ? "Inter-Bold" : "Helvetica-Bold",
      };

      const LM = 44;  // left margin
      const RM = doc.page.width - 44; // right margin
      const PW = RM - LM; // printable width

      let y = 36;

      // ── Load logo ────────────────────────────────────────────────────────
      const logoBuffer = loadLogoBuffer();

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 1: HEADER
      // ══════════════════════════════════════════════════════════════════════

      // Logo + Company info (left)
      if (logoBuffer) {
        doc.image(logoBuffer, LM, y, { width: 36, height: 36 });
        doc.font(F.bold).fontSize(16).fillColor(C.primary);
        doc.text("BornoLand", LM + 44, y + 1);
        doc.font(F.regular).fontSize(7.5).fillColor(C.muted);
        doc.text("bornoland.com", LM + 44, y + 21);
        doc.text("support@bornoland.com", LM + 44, y + 31);
      } else {
        doc.font(F.bold).fontSize(18).fillColor(C.primary);
        doc.text("BornoLand", LM, y);
        doc.font(F.regular).fontSize(8).fillColor(C.muted);
        doc.text("bornoland.com", LM, y + 22);
        doc.text("support@bornoland.com", LM, y + 32);
      }

      // INVOICE title + status badge (right)
      doc.font(F.bold).fontSize(22).fillColor(C.primary);
      doc.text("INVOICE", RM - 160, y + 2, { width: 160, align: "right" });

      const status = STATUS_STYLE[invoice.status] || STATUS_STYLE.pending;
      const badgeText = status.label;
      doc.font(F.bold).fontSize(7);
      const badgeW = doc.widthOfString(badgeText) + 14;
      const badgeX = RM - badgeW;
      const badgeY = y + 32;
      doc.save();
      doc.roundedRect(badgeX, badgeY, badgeW, 16, 3).fill(status.bg);
      doc.fillColor(status.color).text(badgeText, badgeX + 7, badgeY + 4, { width: badgeW - 14, align: "center" });
      doc.restore();

      y += 56;

      // ── Divider ──────────────────────────────────────────────────────────
      doc.save();
      doc.moveTo(LM, y).lineTo(RM, y).lineWidth(0.75).strokeColor(C.border).stroke();
      doc.restore();
      y += 14;

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 2: INVOICE INFO (3 columns)
      // ══════════════════════════════════════════════════════════════════════

      const infoCol1 = LM;
      const infoCol2 = LM + PW * 0.36;
      const infoCol3 = LM + PW * 0.68;
      const infoW = PW * 0.32;

      const infoData = [
        [
          { label: "INVOICE NUMBER", value: invoice.invoiceNumber },
          { label: "ISSUE DATE", value: formatDate(invoice.issuedAt) },
          { label: "DUE DATE", value: formatDate(invoice.dueDate) },
        ],
        [
          { label: "PAYMENT DATE", value: formatDate(invoice.paidAt) },
          { label: "CURRENCY", value: invoice.currency || "BDT" },
          { label: "BILLING CYCLE", value: DURATION_LABELS[invoice.duration as keyof typeof DURATION_LABELS] || invoice.duration || "—" },
        ],
      ];

      for (const row of infoData) {
        for (let i = 0; i < row.length; i++) {
          const cell = row[i];
          const cx = i === 0 ? infoCol1 : i === 1 ? infoCol2 : infoCol3;
          doc.font(F.semiBold).fontSize(6.5).fillColor(C.muted);
          doc.text(cell.label, cx, y, { width: infoW });
          doc.font(F.regular).fontSize(8.5).fillColor(C.primary);
          doc.text(cell.value, cx, y + 10, { width: infoW });
        }
        y += 26;
      }

      y += 2;

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 3: FROM / BILL TO
      // ══════════════════════════════════════════════════════════════════════

      doc.save();
      doc.moveTo(LM, y).lineTo(RM, y).lineWidth(0.5).strokeColor(C.border).stroke();
      doc.restore();
      y += 12;

      const fromX = LM;
      const billToX = LM + PW * 0.52;
      const halfW = PW * 0.46;

      // FROM
      doc.font(F.semiBold).fontSize(6.5).fillColor(C.muted);
      doc.text("FROM", fromX, y);
      y += 10;

      const companyLines = [
        invoice.companyName || "BornoLand",
        invoice.companyWebsite || "bornoland.com",
        invoice.companyEmail || "support@bornoland.com",
        invoice.companyAddress,
        invoice.companyPhone,
      ].filter(Boolean) as string[];

      doc.font(F.regular).fontSize(8).fillColor(C.text);
      companyLines.forEach((line, i) => {
        doc.text(line, fromX, y + i * 11, { width: halfW });
      });

      // BILL TO
      const storeName = typeof invoice.storeId === "object" ? invoice.storeId?.name : "";
      const ownerName = typeof invoice.userId === "object" ? invoice.userId?.name : "";
      const ownerEmail = typeof invoice.userId === "object" ? invoice.userId?.email : "";
      const storeDomain = typeof invoice.storeId === "object"
        ? `${invoice.storeId?.subdomain || invoice.storeId?.slug}.bornoland.com`
        : "";
      const customerId = String(invoice.userId?._id ?? invoice.userId).slice(-8).toUpperCase();

      doc.font(F.semiBold).fontSize(6.5).fillColor(C.muted);
      doc.text("BILL TO", billToX, y);

      const billToY = y + 10;
      const billToLines = [storeName, ownerName, ownerEmail, storeDomain, `Customer ID: ${customerId}`].filter(Boolean) as string[];

      doc.font(F.regular).fontSize(8).fillColor(C.text);
      billToLines.forEach((line, i) => {
        doc.text(line, billToX, billToY + i * 11, { width: halfW });
      });

      y += Math.max(companyLines.length, billToLines.length) * 11 + 16;

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 4: SUBSCRIPTION + PAYMENT DETAILS
      // ══════════════════════════════════════════════════════════════════════

      doc.save();
      doc.moveTo(LM, y).lineTo(RM, y).lineWidth(0.5).strokeColor(C.border).stroke();
      doc.restore();
      y += 12;

      const planName = typeof invoice.planId === "object" ? invoice.planId?.name ?? "—" : "—";
      const subLeftX = LM;
      const subRightX = LM + PW * 0.52;
      const detailLabelW = 90;
      const detailValueW = PW * 0.4;

      // Subscription Details (left)
      doc.font(F.semiBold).fontSize(6.5).fillColor(C.muted);
      doc.text("SUBSCRIPTION DETAILS", subLeftX, y);

      const subItems: [string, string][] = [
        ["Plan", planName],
        ["Duration", DURATION_LABELS[invoice.duration as keyof typeof DURATION_LABELS] || invoice.duration || "—"],
        ["Start", formatDate(invoice.billingPeriodStart)],
        ["End", formatDate(invoice.billingPeriodEnd)],
      ];

      let subY = y + 10;
      for (const [label, value] of subItems) {
        doc.font(F.regular).fontSize(7.5).fillColor(C.muted);
        doc.text(label, subLeftX, subY, { width: detailLabelW });
        doc.font(F.medium).fontSize(8).fillColor(C.text);
        doc.text(value, subLeftX + detailLabelW, subY, { width: detailValueW });
        subY += 12;
      }

      // Payment Details (right)
      doc.font(F.semiBold).fontSize(6.5).fillColor(C.muted);
      doc.text("PAYMENT DETAILS", subRightX, y);

      const gateway = invoice.gateway || "";
      const txId = invoice.transactionId || "";
      const sender = invoice.senderNumber || "";
      const approvedByName = typeof invoice.approvedBy === "object" ? invoice.approvedBy?.name ?? "—" : "—";

      const payItems: [string, string][] = [
        ["Method", gateway.charAt(0).toUpperCase() + gateway.slice(1) || "—"],
        ["Sender", sender || "—"],
        ["Transaction ID", txId || "—"],
        ["Approved By", approvedByName],
      ];

      let payY = y + 10;
      for (const [label, value] of payItems) {
        doc.font(F.regular).fontSize(7.5).fillColor(C.muted);
        doc.text(label, subRightX, payY, { width: detailLabelW });
        doc.font(F.medium).fontSize(8).fillColor(C.text);
        doc.text(value, subRightX + detailLabelW, payY, { width: detailValueW });
        payY += 12;
      }

      y = Math.max(subY, payY) + 10;

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 5: INVOICE TABLE
      // ══════════════════════════════════════════════════════════════════════

      doc.save();
      doc.moveTo(LM, y).lineTo(RM, y).lineWidth(0.5).strokeColor(C.border).stroke();
      doc.restore();
      y += 8;

      // Table header
      doc.save();
      doc.roundedRect(LM, y, PW, 20, 2).fill(C.bgTable);
      doc.restore();

      const tCols = [
        { x: LM + 6, w: PW * 0.36, label: "DESCRIPTION", align: "left" as const },
        { x: LM + PW * 0.36, w: PW * 0.10, label: "QTY", align: "center" as const },
        { x: LM + PW * 0.46, w: PW * 0.18, label: "UNIT PRICE", align: "right" as const },
        { x: LM + PW * 0.64, w: PW * 0.17, label: "DISCOUNT", align: "right" as const },
        { x: LM + PW * 0.81, w: PW * 0.17, label: "AMOUNT", align: "right" as const },
      ];

      doc.font(F.semiBold).fontSize(6).fillColor(C.muted);
      for (const col of tCols) {
        doc.text(col.label, col.x, y + 6, { width: col.w, align: col.align });
      }
      y += 24;

      // Table row
      const discount = invoice.discount || 0;
      doc.font(F.regular).fontSize(8).fillColor(C.text);
      doc.text(planName, tCols[0].x, y, { width: tCols[0].w });
      doc.text("1", tCols[1].x, y, { width: tCols[1].w, align: "center" });
      doc.text(formatCurrency(invoice.subtotal, invoice.currency), tCols[2].x, y, { width: tCols[2].w, align: "right" });
      doc.text(discount > 0 ? `-${formatCurrency(discount, invoice.currency)}` : "—", tCols[3].x, y, { width: tCols[3].w, align: "right" });
      doc.text(formatCurrency(invoice.subtotal - discount, invoice.currency), tCols[4].x, y, { width: tCols[4].w, align: "right" });

      y += 18;
      doc.save();
      doc.moveTo(LM, y).lineTo(RM, y).lineWidth(0.5).strokeColor(C.border).stroke();
      doc.restore();
      y += 10;

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 6: TOTALS
      // ══════════════════════════════════════════════════════════════════════

      const sumX = RM - 200;
      const sumValX = RM - 6;
      const sumLabelW = 110;

      const totals: Array<{ label: string; value: string; color?: string; bold?: boolean }> = [
        { label: "Subtotal", value: formatCurrency(invoice.subtotal, invoice.currency) },
      ];
      if (discount > 0) {
        totals.push({ label: "Discount", value: `-${formatCurrency(discount, invoice.currency)}`, color: C.success });
      }
      if (invoice.vatAmount > 0) {
        totals.push({ label: "VAT", value: formatCurrency(invoice.vatAmount, invoice.currency) });
      }
      if (invoice.taxAmount > 0) {
        totals.push({ label: "Tax", value: formatCurrency(invoice.taxAmount, invoice.currency) });
      }

      for (const row of totals) {
        doc.font(F.regular).fontSize(8).fillColor(row.color || C.muted);
        doc.text(row.label, sumX, y, { width: sumLabelW });
        doc.font(F.medium).fontSize(8).fillColor(row.color || C.text);
        doc.text(row.value, sumValX, y, { width: 110, align: "right" });
        y += 13;
      }

      // Divider
      y += 3;
      doc.save();
      doc.moveTo(sumX, y).lineTo(RM, y).lineWidth(1).strokeColor(C.primary).stroke();
      doc.restore();
      y += 8;

      // TOTAL
      doc.font(F.bold).fontSize(10).fillColor(C.primary);
      doc.text("TOTAL", sumX, y, { width: sumLabelW });
      doc.text(formatCurrency(invoice.total, invoice.currency), sumValX, y, { width: 110, align: "right" });
      y += 16;

      // Paid / Remaining
      if (invoice.paidAt) {
        doc.font(F.regular).fontSize(8).fillColor(C.muted);
        doc.text("Paid", sumX, y, { width: sumLabelW });
        doc.font(F.medium).fontSize(8).fillColor(C.success);
        doc.text(formatCurrency(invoice.total, invoice.currency), sumValX, y, { width: 110, align: "right" });
        y += 12;
        doc.font(F.regular).fontSize(8).fillColor(C.muted);
        doc.text("Remaining", sumX, y, { width: sumLabelW });
        doc.font(F.bold).fontSize(8).fillColor(C.success);
        doc.text(formatCurrency(0, invoice.currency), sumValX, y, { width: 110, align: "right" });
      }

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 7: QR CODE
      // ══════════════════════════════════════════════════════════════════════

      y += 20;
      const baseUrl = resolveBaseUrl();
      const verificationUrl = `${baseUrl}/invoices/verify/${invoice.verificationCode}`;

      const qrBuffer = await QRCode.toBuffer(verificationUrl, {
        width: 100,
        margin: 1,
        color: { dark: C.primary, light: C.white },
        errorCorrectionLevel: "M",
      });

      doc.image(qrBuffer, LM, y, { width: 56, height: 56 });

      doc.font(F.semiBold).fontSize(7.5).fillColor(C.primary);
      doc.text("Verify this invoice", LM + 64, y + 4);
      doc.font(F.regular).fontSize(7).fillColor(C.accent);
      doc.text(verificationUrl, LM + 64, y + 16, { width: PW - 100, link: verificationUrl });
      doc.font(F.regular).fontSize(6.5).fillColor(C.muted);
      doc.text("Scan the QR code or click the link to verify.", LM + 64, y + 28, { width: PW - 100 });

      // ══════════════════════════════════════════════════════════════════════
      // SECTION 8: FOOTER (absolute position, always at bottom)
      // ══════════════════════════════════════════════════════════════════════

      const footerY = doc.page.height - 36;

      doc.save();
      doc.moveTo(LM, footerY).lineTo(RM, footerY).lineWidth(0.5).strokeColor(C.border).stroke();
      doc.restore();

      doc.font(F.regular).fontSize(6.5).fillColor(C.muted);

      // Left: Powered by
      doc.text("Powered by BornoLand", LM, footerY + 8);
      doc.text("bornoland.com", LM, footerY + 18);

      // Center: Generated date
      doc.text(`Generated: ${formatDate(new Date())}`, LM + PW * 0.35, footerY + 8, { width: PW * 0.3, align: "center" });

      // Right: Support + Invoice #
      doc.text("support@bornoland.com", RM - 130, footerY + 8, { width: 130, align: "right" });
      doc.text(invoice.invoiceNumber, RM - 130, footerY + 18, { width: 130, align: "right" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
