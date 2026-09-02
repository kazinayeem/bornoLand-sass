import { Router } from "express";
import type { Response } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireStoreAccess } from "../../common/middleware/store-permission.middleware.js";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";
import {
  listTemplates,
  getTemplate,
  createTemplate,
  createTemplateFromPage,
  updateTemplate,
  deleteTemplate,
  publishTemplate,
  duplicateTemplate,
  exportTemplate,
  importTemplate,
  seedBuiltInTemplates,
} from "./builder-template.service.js";

export const builderTemplateRouter: Router = Router();

builderTemplateRouter.use(requireAuth);

// ─── List templates ──────────────────────────────────────────────────────────

builderTemplateRouter.get("/stores/:storeId", requireStoreAccess, async (request: AuthRequest, response: Response) => {
  const { category, templateType } = request.query as { category?: string; templateType?: string };
  const result = await listTemplates(request.params.storeId as string, category, templateType);
  return sendSuccess(response, result.data);
});

// ─── Get single ──────────────────────────────────────────────────────────────

builderTemplateRouter.get("/:id", requireStoreAccess, async (request: AuthRequest, response: Response) => {
  const result = await getTemplate(request.params.id as string, request.query.storeId as string);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

// ─── Create ──────────────────────────────────────────────────────────────────

builderTemplateRouter.post("/stores/:storeId", requireStoreAccess, async (request: AuthRequest, response: Response) => {
  const result = await createTemplate(request.params.storeId as string, {
    ...request.body,
    createdBy: request.user!.userId,
  });
  return sendSuccess(response, result.data, "Template created", 201);
});

// ─── Create from page ────────────────────────────────────────────────────────

builderTemplateRouter.post("/from-page/:pageId", requireStoreAccess, async (request: AuthRequest, response: Response) => {
  const { storeId } = request.body as { storeId: string };
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await createTemplateFromPage(storeId, request.params.pageId as string, {
    ...request.body,
    createdBy: request.user!.userId,
  });
  if (result.ok) return sendSuccess(response, result.data, "Template created from page", 201);
  return sendFailure(response, result.message ?? "Failed to create template from page", 400);
});

// ─── Update ──────────────────────────────────────────────────────────────────

builderTemplateRouter.put("/:id", requireStoreAccess, async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await updateTemplate(request.params.id as string, storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Template updated") : sendFailure(response, result.message);
});

// ─── Delete ──────────────────────────────────────────────────────────────────

builderTemplateRouter.delete("/:id", requireStoreAccess, async (request: AuthRequest, response: Response) => {
  const storeId = request.query.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await deleteTemplate(request.params.id as string, storeId);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message);
});

// ─── Publish ─────────────────────────────────────────────────────────────────

builderTemplateRouter.post("/:id/publish", requireStoreAccess, async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await publishTemplate(request.params.id as string, storeId);
  return result.ok ? sendSuccess(response, result.data, "Template published") : sendFailure(response, result.message);
});

// ─── Duplicate ───────────────────────────────────────────────────────────────

builderTemplateRouter.post("/:id/duplicate", requireStoreAccess, async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await duplicateTemplate(request.params.id as string, storeId);
  return result.ok ? sendSuccess(response, result.data, "Template duplicated") : sendFailure(response, result.message);
});

// ─── Export ──────────────────────────────────────────────────────────────────

builderTemplateRouter.get("/:id/export", requireStoreAccess, async (request: AuthRequest, response: Response) => {
  const storeId = request.query.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await exportTemplate(request.params.id as string, storeId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

// ─── Seed built-in templates ─────────────────────────────────────────────────

builderTemplateRouter.post("/stores/:storeId/seed", requireStoreAccess, async (request: AuthRequest, response: Response) => {
  const result = await seedBuiltInTemplates(request.params.storeId as string);
  return sendSuccess(response, result.data, "Built-in templates seeded");
});

// ─── Import ──────────────────────────────────────────────────────────────────

builderTemplateRouter.post("/stores/:storeId/import", requireStoreAccess, async (request: AuthRequest, response: Response) => {
  const result = await importTemplate(request.params.storeId as string, {
    ...request.body,
    createdBy: request.user!.userId,
  });
  return sendSuccess(response, result.data, "Template imported", 201);
});
