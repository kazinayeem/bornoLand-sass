import { Router } from "express";
import type { Response } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { requireRole } from "../../common/middleware/role.middleware.js";
import {
  getInvoiceById,
  getInvoiceByStoreSlug,
  listStoreInvoices,
  listAllInvoices,
  verifyInvoice,
  updateInvoiceStatus,
} from "./invoice.service.js";
import { generateInvoicePdf } from "./invoice-pdf.service.js";
import { InvoiceModel } from "./invoice.model.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";

export const invoiceRouter: Router = Router();

// ─── Public: Verify invoice by verification code ─────────────────────────────

invoiceRouter.get("/verify/:verificationCode", async (request, response: Response) => {
  const result = await verifyInvoice(request.params.verificationCode as string);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

// ─── Auth required for everything below ──────────────────────────────────────

invoiceRouter.use(requireAuth);

// ─── Get invoice by store slug + invoice id (for dedicated page) ─────────────

invoiceRouter.get("/store/:storeSlug/:id", async (request: AuthRequest, response: Response) => {
  const result = await getInvoiceByStoreSlug(
    request.params.storeSlug as string,
    request.params.id as string,
    request.user!.userId
  );
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

// ─── List invoices for a store ───────────────────────────────────────────────

invoiceRouter.get("/stores/:storeId", async (request: AuthRequest, response: Response) => {
  const result = await listStoreInvoices(request.params.storeId as string, request.user!.userId);
  return sendSuccess(response, result.data);
});

// ─── Get single invoice by id ────────────────────────────────────────────────

invoiceRouter.get("/:id", async (request: AuthRequest, response: Response) => {
  const result = await getInvoiceById(request.params.id as string, request.user!.userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

// ─── Download PDF for an invoice ─────────────────────────────────────────────

invoiceRouter.get("/:id/pdf", async (request: AuthRequest, response: Response) => {
  try {
    const invoiceDoc = await InvoiceModel.findOne({
      _id: request.params.id,
      userId: request.user!.userId,
    })
      .populate("planId", "name slug")
      .populate("storeId", "name slug subdomain")
      .populate("userId", "name email phone")
      .populate("approvedBy", "name email")
      .populate("paymentId")
      .lean();

    if (!invoiceDoc) {
      return sendFailure(response, "Invoice not found", 404);
    }

    const inv = invoiceDoc as Record<string, unknown>;
    const pdfBuffer = await generateInvoicePdf(inv as never);

    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", `attachment; filename="${String(inv.invoiceNumber)}.pdf"`);
    response.setHeader("Content-Length", pdfBuffer.length);
    return response.send(pdfBuffer);
  } catch (error) {
    console.error("[PDF Generation Error]", error);
    return sendFailure(response, "Failed to generate PDF", 500);
  }
});

// ─── Admin routes ────────────────────────────────────────────────────────────

invoiceRouter.get("/", requireRole("super_admin"), async (request: AuthRequest, response: Response) => {
  const status = request.query.status as string | undefined;
  const result = await listAllInvoices(status);
  return sendSuccess(response, result.data);
});

// ─── Admin: Update invoice status ────────────────────────────────────────────

invoiceRouter.patch("/:id/status", requireRole("super_admin"), async (request: AuthRequest, response: Response) => {
  const { status } = request.body as { status: "paid" | "pending" | "rejected" | "refunded" };
  if (!["paid", "pending", "rejected", "refunded"].includes(status)) {
    return sendFailure(response, "Invalid status", 400);
  }
  const result = await updateInvoiceStatus(request.params.id as string, status, request.user!.userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

// ─── Admin: Generate/regenerate PDF ──────────────────────────────────────────

invoiceRouter.post("/:id/regenerate-pdf", requireRole("super_admin"), async (request: AuthRequest, response: Response) => {
  try {
    const invoiceDoc = await InvoiceModel.findById(request.params.id)
      .populate("planId", "name slug")
      .populate("storeId", "name slug subdomain")
      .populate("userId", "name email phone")
      .populate("approvedBy", "name email")
      .populate("paymentId")
      .lean();

    if (!invoiceDoc) return sendFailure(response, "Invoice not found", 404);

    const inv = invoiceDoc as Record<string, unknown>;
    const pdfBuffer = await generateInvoicePdf(inv as never);

    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", `attachment; filename="${String(inv.invoiceNumber)}.pdf"`);
    return response.send(pdfBuffer);
  } catch (error) {
    console.error("[PDF Regeneration Error]", error);
    return sendFailure(response, "Failed to generate PDF", 500);
  }
});
