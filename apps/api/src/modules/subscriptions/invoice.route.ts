import { Router } from "express";
import type { Response } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { requireRole } from "../../common/middleware/role.middleware.js";
import { getInvoiceById, listAllInvoices, listStoreInvoices } from "./invoice.service.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";

export const invoiceRouter: Router = Router();

invoiceRouter.use(requireAuth);

invoiceRouter.get("/stores/:storeId", async (request: AuthRequest, response: Response) => {
  const result = await listStoreInvoices(request.params.storeId as string, request.user!.userId);
  return sendSuccess(response, result.data);
});

invoiceRouter.get("/:id", async (request: AuthRequest, response: Response) => {
  const result = await getInvoiceById(request.params.id as string, request.user!.userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

invoiceRouter.use(requireRole("super_admin"));

invoiceRouter.get("/", async (_request, response: Response) => {
  const result = await listAllInvoices();
  return sendSuccess(response, result.data);
});
