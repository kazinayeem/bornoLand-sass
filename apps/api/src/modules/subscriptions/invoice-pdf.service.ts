import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import type { InvoiceDocument } from "./invoice.model.js";
import { DURATION_LABELS } from "./subscription.constants.js";

function formatDate(date: Date | string | undefined | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number, currency: string): string {
  const sym = currency === "BDT" ? "৳" : currency === "USD" ? "$" : currency + " ";
  return `${sym}${amount.toLocaleString("en-BD")}`;
}

export async function generateInvoicePdf(
  invoice: InvoiceDocument & {
    planId?: { name?: string; slug?: string };
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
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: invoice.companyName || "BornoLand",
          Subject: "Invoice",
          Keywords: "invoice, billing, subscription",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width - 100;
      const leftMargin = 50;
      const rightMargin = doc.page.width - 50;
      let top = 50;

      // ── Colors ──────────────────────────────────────────────────────────────
      const PRIMARY = "#18181b";
      const MUTED = "#71717a";
      const BORDER = "#e4e4e7";
      const LIGHT_BG = "#f4f4f5";
      const SUCCESS = "#059669";
      const ACCENT = "#2563eb";

      // ── Header: Logo + Invoice Title ────────────────────────────────────────
      doc.fontSize(24).font("Helvetica-Bold").fillColor(PRIMARY).text("INVOICE", leftMargin, top, { continued: false });

      doc.fontSize(10).font("Helvetica").fillColor(MUTED);
      const statusColors: Record<string, string> = { paid: SUCCESS, pending: "#d97706", rejected: "#dc2626", refunded: "#7c3aed" };
      const statusColor = statusColors[invoice.status] ?? MUTED;

      doc.fontSize(10).font("Helvetica-Bold").fillColor(statusColor);
      doc.text(invoice.status.toUpperCase(), { align: "right" });

      // Horizontal line
      top = 80;
      doc.moveTo(leftMargin, top).lineTo(rightMargin, top).strokeColor(BORDER).lineWidth(1).stroke();

      // ── Invoice Number + Dates ──────────────────────────────────────────────
      top += 20;
      doc.fontSize(10).font("Helvetica-Bold").fillColor(PRIMARY).text("Invoice Number", leftMargin, top);
      doc.font("Helvetica").fillColor(MUTED).text(invoice.invoiceNumber, leftMargin + 120, top);

      doc.font("Helvetica-Bold").fillColor(PRIMARY).text("Invoice Date", rightMargin - 200, top);
      doc.font("Helvetica").fillColor(MUTED).text(formatDate(invoice.issuedAt), rightMargin - 80, top, { width: 80, align: "right" });

      top += 18;
      doc.font("Helvetica-Bold").fillColor(PRIMARY).text("Due Date", leftMargin, top);
      doc.font("Helvetica").fillColor(MUTED).text(formatDate(invoice.dueDate), leftMargin + 120, top);

      doc.font("Helvetica-Bold").fillColor(PRIMARY).text("Payment Date", rightMargin - 200, top);
      doc.font("Helvetica").fillColor(MUTED).text(formatDate(invoice.paidAt), rightMargin - 80, top, { width: 80, align: "right" });

      // ── Company Info ────────────────────────────────────────────────────────
      top += 40;
      doc.moveTo(leftMargin, top).lineTo(rightMargin, top).strokeColor(BORDER).lineWidth(1).stroke();
      top += 16;

      doc.fontSize(11).font("Helvetica-Bold").fillColor(PRIMARY).text("From", leftMargin, top);
      doc.fontSize(9).font("Helvetica").fillColor(PRIMARY);
      const companyLines = [
        invoice.companyName,
        invoice.companyAddress,
        invoice.companyPhone,
        invoice.companyEmail,
        invoice.companyWebsite,
      ].filter(Boolean);
      companyLines.forEach((line, i) => {
        doc.text(line!, leftMargin, top + 16 + i * 13, { width: pageWidth / 2 - 20 });
      });

      // ── Bill To ─────────────────────────────────────────────────────────────
      const billToX = leftMargin + pageWidth / 2 + 10;
      const storeName = typeof invoice.storeId === "object" ? invoice.storeId?.name : "";
      const ownerName = typeof invoice.userId === "object" ? invoice.userId?.name : "";
      const ownerEmail = typeof invoice.userId === "object" ? invoice.userId?.email : "";
      const ownerPhone = typeof invoice.userId === "object" ? invoice.userId?.phone : "";
      const storeDomain = typeof invoice.storeId === "object"
        ? invoice.storeId?.subdomain || invoice.storeId?.slug
        : "";

      doc.fontSize(11).font("Helvetica-Bold").fillColor(PRIMARY).text("Bill To", billToX, top);
      doc.fontSize(9).font("Helvetica").fillColor(PRIMARY);
      const billToLines = [
        storeName,
        ownerName,
        ownerEmail,
        ownerPhone,
        storeDomain,
        `Customer ID: ${String(invoice.userId?._id ?? invoice.userId).slice(-8).toUpperCase()}`,
      ].filter(Boolean);
      billToLines.forEach((line, i) => {
        doc.text(line!, billToX, top + 16 + i * 13, { width: pageWidth / 2 - 20 });
      });

      // ── Subscription Details ────────────────────────────────────────────────
      top += 16 + Math.max(companyLines.length, billToLines.length) * 13 + 20;
      doc.moveTo(leftMargin, top).lineTo(rightMargin, top).strokeColor(BORDER).lineWidth(1).stroke();
      top += 16;

      doc.fontSize(11).font("Helvetica-Bold").fillColor(PRIMARY).text("Subscription", leftMargin, top);

      const planName = typeof invoice.planId === "object" ? invoice.planId?.name ?? "—" : "—";
      const durationLabel = DURATION_LABELS[invoice.duration as keyof typeof DURATION_LABELS] ?? invoice.duration ?? "—";
      const subDetails = [
        ["Plan", planName],
        ["Billing Cycle", durationLabel],
        ["Start Date", formatDate(invoice.billingPeriodStart)],
        ["End Date", formatDate(invoice.billingPeriodEnd)],
        ["Renewal Date", formatDate(invoice.billingPeriodEnd)],
      ];

      const subTableX = leftMargin + 120;
      subDetails.forEach(([label, value], i) => {
        const y = top + 14 + i * 15;
        doc.fontSize(9).font("Helvetica-Bold").fillColor(MUTED).text(label, leftMargin, y);
        doc.font("Helvetica").fillColor(PRIMARY).text(value, subTableX, y);
      });

      // ── Payment Details ─────────────────────────────────────────────────────
      const payX = leftMargin + pageWidth / 2 + 10;
      doc.fontSize(11).font("Helvetica-Bold").fillColor(PRIMARY).text("Payment Details", payX, top);

      const gateway = invoice.gateway || "";
      const transactionId = invoice.transactionId || "";
      const senderNumber = invoice.senderNumber || "";
      const approvedByName = typeof invoice.approvedBy === "object" ? invoice.approvedBy?.name ?? "—" : "—";

      const payDetails = [
        ["Gateway", gateway.charAt(0).toUpperCase() + gateway.slice(1) || "—"],
        ["Sender Number", senderNumber],
        ["Transaction ID", transactionId],
        ["Approved By", approvedByName],
        ["Approval Date", formatDate(invoice.approvedAt)],
      ];

      payDetails.forEach(([label, value], i) => {
        const y = top + 14 + i * 15;
        doc.fontSize(9).font("Helvetica-Bold").fillColor(MUTED).text(label, payX, y);
        doc.font("Helvetica").fillColor(PRIMARY).text(value, payX + 100, y, { width: pageWidth / 2 - 110 });
      });

      // ── Invoice Items ───────────────────────────────────────────────────────
      const itemsTop = top + 14 + Math.max(subDetails.length, payDetails.length) * 15 + 20;
      top = itemsTop;
      doc.moveTo(leftMargin, top).lineTo(rightMargin, top).strokeColor(BORDER).lineWidth(1).stroke();
      top += 16;

      // Table header
      const cols = [
        { x: leftMargin, w: pageWidth * 0.45, label: "Description" },
        { x: leftMargin + pageWidth * 0.45, w: pageWidth * 0.13, label: "Qty", align: "center" as const },
        { x: leftMargin + pageWidth * 0.58, w: pageWidth * 0.14, label: "Unit Price", align: "right" as const },
        { x: leftMargin + pageWidth * 0.72, w: pageWidth * 0.13, label: "Amount", align: "right" as const },
      ];

      doc.fontSize(8).font("Helvetica-Bold").fillColor(MUTED);
      cols.forEach((col) => {
        doc.text(col.label, col.x, top, { width: col.w, align: col.align ?? "left" });
      });

      top += 14;
      doc.moveTo(leftMargin, top).lineTo(rightMargin, top).strokeColor(BORDER).lineWidth(0.5).stroke();
      top += 10;

      // Table row
      doc.fontSize(9).font("Helvetica").fillColor(PRIMARY);
      doc.text(planName, cols[0].x, top, { width: cols[0].w });
      doc.text("1", cols[1].x, top, { width: cols[1].w, align: "center" });
      doc.text(formatCurrency(invoice.subtotal, invoice.currency), cols[2].x, top, { width: cols[2].w, align: "right" });
      doc.text(formatCurrency(invoice.subtotal, invoice.currency), cols[3].x, top, { width: cols[3].w, align: "right" });

      // ── Summary ─────────────────────────────────────────────────────────────
      top += 30;
      const summaryX = rightMargin - 200;
      const summaryCol1X = summaryX;
      const summaryCol2X = rightMargin - 60;
      const summaryW = 60;

      const summaryLines = [
        { label: "Subtotal", value: invoice.subtotal },
      ];
      if (invoice.discount > 0) {
        summaryLines.push({ label: "Discount", value: -invoice.discount });
      }
      if (invoice.vatAmount > 0) {
        summaryLines.push({ label: "VAT", value: invoice.vatAmount });
      }
      if (invoice.taxAmount > 0) {
        summaryLines.push({ label: "Tax", value: invoice.taxAmount });
      }

      summaryLines.forEach((line, i) => {
        const y = top + i * 16;
        doc.fontSize(9).font("Helvetica").fillColor(MUTED).text(line.label, summaryCol1X, y);
        doc.font("Helvetica").fillColor(PRIMARY).text(
          formatCurrency(Math.abs(line.value), invoice.currency),
          summaryCol2X, y,
          { width: summaryW, align: "right" }
        );
      });

      top += summaryLines.length * 16 + 4;
      doc.moveTo(summaryX, top).lineTo(rightMargin, top).strokeColor(BORDER).lineWidth(0.5).stroke();
      top += 8;

      doc.fontSize(11).font("Helvetica-Bold").fillColor(PRIMARY);
      doc.text("Grand Total", summaryCol1X, top);
      doc.text(formatCurrency(invoice.total, invoice.currency), summaryCol2X, top, { width: summaryW, align: "right" });

      if (invoice.paidAt) {
        top += 16;
        doc.fontSize(9).font("Helvetica").fillColor(MUTED);
        doc.text("Paid", summaryCol1X, top);
        doc.font("Helvetica").fillColor(SUCCESS);
        doc.text(formatCurrency(invoice.total, invoice.currency), summaryCol2X, top, { width: summaryW, align: "right" });

        top += 16;
        doc.font("Helvetica").fillColor(MUTED);
        doc.text("Remaining", summaryCol1X, top);
        doc.font("Helvetica-Bold").fillColor(SUCCESS);
        doc.text(formatCurrency(0, invoice.currency), summaryCol2X, top, { width: summaryW, align: "right" });
      }

      // ── QR Code ─────────────────────────────────────────────────────────────
      const qrTop = doc.y + 30;
      const verificationUrl = `https://bornoland.com/invoices/verify/${invoice.verificationCode}`;
      const qrBuffer = await QRCode.toBuffer(verificationUrl, {
        width: 100,
        margin: 1,
        color: { dark: "#18181b", light: "#ffffff" },
      });

      doc.image(qrBuffer, leftMargin, qrTop, { width: 80, height: 80 });

      doc.fontSize(8).font("Helvetica-Bold").fillColor(PRIMARY);
      doc.text("Verify this invoice", leftMargin + 90, qrTop + 8);
      doc.font("Helvetica").fillColor(ACCENT);
      doc.text(verificationUrl, leftMargin + 90, qrTop + 22, { width: pageWidth - 140, link: verificationUrl });
      doc.font("Helvetica").fillColor(MUTED);
      doc.text("Scan the QR code or visit the URL above to verify this invoice.", leftMargin + 90, qrTop + 38, { width: pageWidth - 140 });

      // ── Footer ──────────────────────────────────────────────────────────────
      const footerTop = doc.page.height - 60;
      doc.moveTo(leftMargin, footerTop).lineTo(rightMargin, footerTop).strokeColor(BORDER).lineWidth(1).stroke();

      doc.fontSize(8).font("Helvetica-Bold").fillColor(PRIMARY);
      doc.text(`Thank you for choosing ${invoice.companyName || "BornoLand"}.`, leftMargin, footerTop + 10);

      doc.font("Helvetica").fillColor(MUTED);
      doc.text(
        `Support: ${invoice.companyEmail || "support@bornoland.com"}  |  ${invoice.companyWebsite || "bornoland.com"}`,
        leftMargin,
        footerTop + 24,
        { width: pageWidth }
      );

      doc.text(
        `Invoice ${invoice.invoiceNumber} — Generated on ${formatDate(new Date())}`,
        leftMargin,
        footerTop + 38,
        { width: pageWidth }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
