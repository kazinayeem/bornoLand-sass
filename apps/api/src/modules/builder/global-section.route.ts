import { Router } from "express";
import type { Response } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";
import {
  listGlobalSections,
  getGlobalSection,
  createGlobalSection,
  updateGlobalSection,
  deleteGlobalSection,
  publishGlobalSection,
  attachGlobalSectionToPage,
  detachGlobalSectionFromPage,
  getPagesUsingGlobalSection,
} from "./global-section.service.js";

export const globalSectionRouter: Router = Router();

globalSectionRouter.use(requireAuth);

// ─── List ────────────────────────────────────────────────────────────────────

globalSectionRouter.get("/stores/:storeId", async (request: AuthRequest, response: Response) => {
  const result = await listGlobalSections(request.params.storeId as string);
  return sendSuccess(response, result.data);
});

// ─── Get single ──────────────────────────────────────────────────────────────

globalSectionRouter.get("/:id", async (request: AuthRequest, response: Response) => {
  const result = await getGlobalSection(request.params.id as string);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

// ─── Create ──────────────────────────────────────────────────────────────────

globalSectionRouter.post("/stores/:storeId", async (request: AuthRequest, response: Response) => {
  const result = await createGlobalSection(request.params.storeId as string, {
    ...request.body,
    authorId: request.user!.userId,
  });
  return sendSuccess(response, result.data, "Global section created", 201);
});

// ─── Update ──────────────────────────────────────────────────────────────────

globalSectionRouter.put("/:id", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await updateGlobalSection(request.params.id as string, storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Global section updated") : sendFailure(response, result.message);
});

// ─── Delete ──────────────────────────────────────────────────────────────────

globalSectionRouter.delete("/:id", async (request: AuthRequest, response: Response) => {
  const storeId = request.query.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await deleteGlobalSection(request.params.id as string, storeId);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message);
});

// ─── Publish ─────────────────────────────────────────────────────────────────

globalSectionRouter.post("/:id/publish", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await publishGlobalSection(request.params.id as string, storeId);
  return result.ok ? sendSuccess(response, result.data, "Global section published") : sendFailure(response, result.message);
});

// ─── Attach to page ──────────────────────────────────────────────────────────

globalSectionRouter.post("/:id/attach", async (request: AuthRequest, response: Response) => {
  const { storeId, pageId } = request.body as { storeId: string; pageId: string };
  if (!storeId || !pageId) return sendFailure(response, "storeId and pageId are required");
  const result = await attachGlobalSectionToPage(pageId, storeId, request.params.id as string);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message);
});

// ─── Detach from page ────────────────────────────────────────────────────────

globalSectionRouter.post("/:id/detach", async (request: AuthRequest, response: Response) => {
  const { storeId, pageId } = request.body as { storeId: string; pageId: string };
  if (!storeId || !pageId) return sendFailure(response, "storeId and pageId are required");
  const result = await detachGlobalSectionFromPage(pageId, storeId, request.params.id as string);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message);
});

// ─── Get pages using this section ────────────────────────────────────────────

globalSectionRouter.get("/:id/pages", async (request: AuthRequest, response: Response) => {
  const storeId = request.query.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await getPagesUsingGlobalSection(request.params.id as string, storeId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});
