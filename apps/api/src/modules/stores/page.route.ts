import { Router } from "express";
import type { Request, Response } from "express";
import { connectDatabase } from "../../common/database/connection.js";
import { requireAuth, type AuthRequest } from "../../common/middleware/auth.middleware.js";
import { requireTenantScope } from "../../common/middleware/tenant.middleware.js";
import { StorePageModel } from "../pages/store-page.model.js";
import { publishPage } from "./publish.service.js";

export const pageRouter: Router = Router();

pageRouter.use(requireAuth);

pageRouter.get("/:tenantId", requireTenantScope, async (request: Request, response: Response) => {
  await connectDatabase();

  const pages = await StorePageModel.find({ tenantId: request.params.tenantId, deletedAt: null }).sort({ updatedAt: -1 }).lean();
  return response.json({ pages });
});

pageRouter.post("/:tenantId/:pageId/publish", requireTenantScope, async (request: AuthRequest & Request, response: Response) => {
  await connectDatabase();

  const pageId = String(request.params.pageId);
  const tenantId = String(request.params.tenantId);
  const page = await publishPage(pageId, tenantId, request.user!.userId);
  return response.json({ page });
});