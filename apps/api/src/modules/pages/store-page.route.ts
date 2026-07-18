import { Router } from "express";
import type { Response } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";
import {
  listStorePages,
  getStorePage,
  getStorePageBySlug,
  getDeletedStorePage,
  listDeletedStorePages,
  createStorePage,
  updateStorePage,
  softDeleteStorePage,
  restoreSoftDeletedPage,
  duplicateStorePage,
  scheduleStorePage,
  archiveStorePage,
  restoreStorePage,
  saveStorePageDraft,
  renameStorePage,
  reorderStorePages,
  searchStorePages,
  listPagesByType,
  getPageByType,
  listSystemPages,
  updatePageHeaderSections,
  updatePageFooterSections,
  updatePageHeaderSettings,
  updatePageFooterSettings,
  listPageVersions,
  getPageVersion,
  restorePageVersion,
  listPageHistory,
  generatePreviewToken,
  getPageByPreviewToken,
  exportPageSections,
  importPageSections,
} from "./store-page.service.js";
import { publishPage, unpublishPage } from "./publish.service.js";

export const storePageRouter: Router = Router();

storePageRouter.use(requireAuth);

// ─── List pages (with tree) ──────────────────────────────────────────────────

storePageRouter.get("/stores/:storeId", async (request: AuthRequest, response: Response) => {
  const result = await listStorePages(request.params.storeId as string);
  return sendSuccess(response, result.data);
});

// ─── Search pages ────────────────────────────────────────────────────────────

storePageRouter.get("/stores/:storeId/search", async (request: AuthRequest, response: Response) => {
  const query = request.query.q as string;
  if (!query) return sendFailure(response, "Search query required");
  const result = await searchStorePages(request.params.storeId as string, query);
  return sendSuccess(response, result.data);
});

// ─── Get page by slug ────────────────────────────────────────────────────────

storePageRouter.get("/stores/:storeId/slug/:slug", async (request: AuthRequest, response: Response) => {
  const result = await getStorePageBySlug(request.params.storeId as string, `/${request.params.slug}`);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

// ─── Create page ─────────────────────────────────────────────────────────────

storePageRouter.post("/stores/:storeId", async (request: AuthRequest, response: Response) => {
  const result = await createStorePage(request.params.storeId as string, {
    ...request.body,
    authorId: request.user!.userId,
  });
  return result.ok
    ? sendSuccess(response, result.data, "Page created", 201)
    : sendFailure(response, result.message, 400);
});

// ─── Get single page ─────────────────────────────────────────────────────────

storePageRouter.get("/:id", async (request: AuthRequest, response: Response) => {
  const result = await getStorePage(request.params.id as string);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

// ─── Update page ─────────────────────────────────────────────────────────────

storePageRouter.put("/:id", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await updateStorePage(request.params.id as string, storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Page updated") : sendFailure(response, result.message);
});

// ─── Soft delete page ────────────────────────────────────────────────────────

storePageRouter.delete("/:id", async (request: AuthRequest, response: Response) => {
  const storeId = request.query.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await softDeleteStorePage(request.params.id as string, storeId, request.user!.userId);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message);
});

// ─── Duplicate page ──────────────────────────────────────────────────────────

storePageRouter.post("/:id/duplicate", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await duplicateStorePage(request.params.id as string, storeId, request.user!.userId);
  return result.ok ? sendSuccess(response, result.data, "Page duplicated") : sendFailure(response, result.message);
});

// ─── Publish page (with diff + cache invalidation) ──────────────────────────

storePageRouter.post("/:id/publish", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await publishPage(request.params.id as string, storeId, request.user!.userId);
  if (result.ok) {
    return sendSuccess(response, result.data, `Page published — ${result.data!.diff.summary}`);
  }
  return sendFailure(response, result.message || "Publish failed");
});

// ─── Unpublish page ──────────────────────────────────────────────────────────

storePageRouter.post("/:id/unpublish", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await unpublishPage(request.params.id as string, storeId, request.user!.userId);
  return result.ok ? sendSuccess(response, result.data, "Page unpublished") : sendFailure(response, result.message || "Failed to unpublish");
});

// ─── Schedule publish ────────────────────────────────────────────────────────

storePageRouter.post("/:id/schedule", async (request: AuthRequest, response: Response) => {
  const { storeId, scheduledAt } = request.body as { storeId: string; scheduledAt: string };
  if (!storeId) return sendFailure(response, "storeId is required");
  if (!scheduledAt) return sendFailure(response, "scheduledAt is required");
  const result = await scheduleStorePage(request.params.id as string, storeId, new Date(scheduledAt), request.user!.userId);
  return result.ok ? sendSuccess(response, result.data, "Page scheduled") : sendFailure(response, result.message);
});

// ─── Archive page ────────────────────────────────────────────────────────────

storePageRouter.post("/:id/archive", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await archiveStorePage(request.params.id as string, storeId, request.user!.userId);
  return result.ok ? sendSuccess(response, result.data, "Page archived") : sendFailure(response, result.message);
});

// ─── Restore page from archive ───────────────────────────────────────────────

storePageRouter.post("/:id/restore", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await restoreStorePage(request.params.id as string, storeId, request.user!.userId);
  return result.ok ? sendSuccess(response, result.data, "Page restored") : sendFailure(response, result.message);
});

// ─── Save draft (builder) ────────────────────────────────────────────────────

storePageRouter.put("/:id/draft", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await saveStorePageDraft(request.params.id as string, storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Draft saved") : sendFailure(response, result.message);
});

// ─── Rename page ─────────────────────────────────────────────────────────────

storePageRouter.patch("/:id/rename", async (request: AuthRequest, response: Response) => {
  const { storeId, title } = request.body as { storeId: string; title: string };
  if (!storeId || !title) return sendFailure(response, "storeId and title are required");
  const result = await renameStorePage(request.params.id as string, storeId, title, request.user!.userId);
  return result.ok ? sendSuccess(response, result.data, "Page renamed") : sendFailure(response, result.message);
});

// ─── Reorder pages ───────────────────────────────────────────────────────────

storePageRouter.put("/stores/:storeId/reorder", async (request: AuthRequest, response: Response) => {
  const { orderedIds } = request.body as { orderedIds: string[] };
  if (!orderedIds) return sendFailure(response, "orderedIds is required");
  const result = await reorderStorePages(request.params.storeId as string, orderedIds);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message);
});

// ─── Page versions ───────────────────────────────────────────────────────────

storePageRouter.get("/:id/versions", async (request: AuthRequest, response: Response) => {
  const result = await listPageVersions(request.params.id as string);
  return sendSuccess(response, result.data);
});

storePageRouter.get("/versions/:versionId", async (request: AuthRequest, response: Response) => {
  const result = await getPageVersion(request.params.versionId as string);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

storePageRouter.post("/:id/versions/:versionId/restore", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await restorePageVersion(
    request.params.versionId as string,
    request.params.id as string,
    storeId,
    request.user!.userId
  );
  return result.ok ? sendSuccess(response, result.data, "Version restored") : sendFailure(response, result.message);
});

// ─── Page history ────────────────────────────────────────────────────────────

storePageRouter.get("/:id/history", async (request: AuthRequest, response: Response) => {
  const storeId = request.query.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await listPageHistory(storeId, request.params.id as string);
  return sendSuccess(response, result.data);
});

storePageRouter.get("/stores/:storeId/history", async (request: AuthRequest, response: Response) => {
  const result = await listPageHistory(request.params.storeId as string);
  return sendSuccess(response, result.data);
});

// ─── Preview token ───────────────────────────────────────────────────────────

storePageRouter.post("/:id/preview-token", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await generatePreviewToken(request.params.id as string, storeId, request.user!.userId);
  return result.ok ? sendSuccess(response, result.data, "Preview token generated") : sendFailure(response, result.message);
});

// ─── Export sections ─────────────────────────────────────────────────────────

storePageRouter.get("/:id/export", async (request: AuthRequest, response: Response) => {
  const storeId = request.query.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await exportPageSections(request.params.id as string, storeId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

// ─── Import sections ─────────────────────────────────────────────────────────

storePageRouter.post("/:id/import", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await importPageSections(request.params.id as string, storeId, request.body, request.user!.userId);
  return result.ok ? sendSuccess(response, result.data, "Sections imported") : sendFailure(response, result.message);
});

// ─── List pages by type ───────────────────────────────────────────────────────

storePageRouter.get("/stores/:storeId/type/:pageType", async (request: AuthRequest, response: Response) => {
  const result = await listPagesByType(request.params.storeId as string, request.params.pageType as any);
  return sendSuccess(response, result.data);
});

// ─── Get page by type (single) ───────────────────────────────────────────────

storePageRouter.get("/stores/:storeId/type/:pageType/single", async (request: AuthRequest, response: Response) => {
  const result = await getPageByType(request.params.storeId as string, request.params.pageType as any);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

// ─── List system pages ───────────────────────────────────────────────────────

storePageRouter.get("/stores/:storeId/system", async (request: AuthRequest, response: Response) => {
  const result = await listSystemPages(request.params.storeId as string);
  return sendSuccess(response, result.data);
});

// ─── Update header sections ─────────────────────────────────────────────────

storePageRouter.put("/:id/header-sections", async (request: AuthRequest, response: Response) => {
  const { storeId, headerSections } = request.body as { storeId: string; headerSections: unknown[] };
  if (!storeId || !headerSections) return sendFailure(response, "storeId and headerSections are required");
  const result = await updatePageHeaderSections(request.params.id as string, storeId, headerSections);
  return result.ok ? sendSuccess(response, result.data, "Header sections updated") : sendFailure(response, result.message);
});

// ─── Update footer sections ─────────────────────────────────────────────────

storePageRouter.put("/:id/footer-sections", async (request: AuthRequest, response: Response) => {
  const { storeId, footerSections } = request.body as { storeId: string; footerSections: unknown[] };
  if (!storeId || !footerSections) return sendFailure(response, "storeId and footerSections are required");
  const result = await updatePageFooterSections(request.params.id as string, storeId, footerSections);
  return result.ok ? sendSuccess(response, result.data, "Footer sections updated") : sendFailure(response, result.message);
});

// ─── Update header settings ─────────────────────────────────────────────────

storePageRouter.put("/:id/header-settings", async (request: AuthRequest, response: Response) => {
  const { storeId, headerSettings } = request.body as { storeId: string; headerSettings: Record<string, unknown> };
  if (!storeId || !headerSettings) return sendFailure(response, "storeId and headerSettings are required");
  const result = await updatePageHeaderSettings(request.params.id as string, storeId, headerSettings);
  return result.ok ? sendSuccess(response, result.data, "Header settings updated") : sendFailure(response, result.message);
});

// ─── Update footer settings ─────────────────────────────────────────────────

storePageRouter.put("/:id/footer-settings", async (request: AuthRequest, response: Response) => {
  const { storeId, footerSettings } = request.body as { storeId: string; footerSettings: Record<string, unknown> };
  if (!storeId || !footerSettings) return sendFailure(response, "storeId and footerSettings are required");
  const result = await updatePageFooterSettings(request.params.id as string, storeId as string, footerSettings);
  return result.ok ? sendSuccess(response, result.data, "Footer settings updated") : sendFailure(response, result.message);
});

// ─── Deleted pages ───────────────────────────────────────────────────────────

storePageRouter.get("/stores/:storeId/deleted", async (request: AuthRequest, response: Response) => {
  const result = await listDeletedStorePages(request.params.storeId as string);
  return sendSuccess(response, result.data);
});

storePageRouter.get("/deleted/:id", async (request: AuthRequest, response: Response) => {
  const result = await getDeletedStorePage(request.params.id as string);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

storePageRouter.post("/:id/restore-deleted", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await restoreSoftDeletedPage(request.params.id as string, storeId, request.user!.userId);
  return result.ok ? sendSuccess(response, result.data, "Page restored from trash") : sendFailure(response, result.message);
});
