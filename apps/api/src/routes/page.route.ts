import { Router } from "express";
import type { Request, Response } from "express";
import { connectDatabase } from "../config/database.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.middleware.js";
import { requireTenantScope } from "../middleware/tenant.middleware.js";
import { PageModel } from "../models/page.model.js";
import { publishPage } from "../services/publish.service.js";

export const pageRouter = Router();

pageRouter.use(requireAuth);

pageRouter.get("/:tenantId", requireTenantScope, async (request: Request, response: Response) => {
  await connectDatabase();

  const pages = await PageModel.find({ tenantId: request.params.tenantId }).sort({ updatedAt: -1 }).lean();
  return response.json({ pages });
});

pageRouter.post("/:tenantId/:pageId/publish", requireTenantScope, async (request: AuthRequest & Request, response: Response) => {
  await connectDatabase();

  const pageId = String(request.params.pageId);
  const tenantId = String(request.params.tenantId);
  const page = await publishPage(pageId, tenantId, request.user!.userId);
  return response.json({ page });
});