import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { getPages, getPage, savePage, createPage, deletePage, clearPage, updatePage, duplicatePage, renamePage, archivePage, restorePage, resetPage, getOrCreateHomePage, publishPage } from "./builder.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { recordAuditFromRequest } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../audit/audit-actions.js";
import { AUDIT_MODULES } from "../audit/audit.constants.js";

export async function getPagesController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const result = await getPages(storeId);
  return sendSuccess(response, result.data);
}

export async function getPageController(request: AuthRequest, response: Response) {
  const pageId = request.params.pageId as string;
  const result = await getPage(pageId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function savePageController(request: AuthRequest, response: Response) {
  const pageId = request.params.pageId as string;
  const result = await savePage(pageId, request.body);
  if (result.ok) {
    const page = result.data.page as { title?: string; storeId?: string };
    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.BUILDER_DRAFT_SAVED,
      module: AUDIT_MODULES.BUILDER,
      entityType: "BuilderPage",
      entityId: pageId,
      entityName: page.title,
      storeId: page.storeId ?? request.params.storeId as string,
      newValue: { sections: request.body?.sections?.length },
    });
  }
  return result.ok ? sendSuccess(response, result.data, "Page saved") : sendFailure(response, result.message, 404);
}

export async function createPageController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const { title, slug, templateId } = request.body as { title: string; slug: string; templateId?: string };
  const result = await createPage(storeId, { title, slug, templateId });
  return result.ok ? sendSuccess(response, result.data, "Page created", 201) : sendFailure(response, result.message);
}

export async function deletePageController(request: AuthRequest, response: Response) {
  const pageId = request.params.pageId as string;
  const result = await deletePage(pageId);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}

export async function clearPageController(request: AuthRequest, response: Response) {
  const pageId = request.params.pageId as string;
  const result = await clearPage(pageId, request.body);
  if (result.ok) {
    const page = result.data.page as { title?: string; storeId?: string };
    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.BUILDER_DRAFT_SAVED,
      module: AUDIT_MODULES.BUILDER,
      entityType: "BuilderPage",
      entityId: pageId,
      entityName: page.title,
      storeId: page.storeId ?? request.body?.storeId,
      newValue: { sections: 0 },
    });
  }
  return result.ok ? sendSuccess(response, result.data, "Page cleared") : sendFailure(response, result.message, 404);
}

export async function getOrCreateHomePageController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const result = await getOrCreateHomePage(storeId);
  return sendSuccess(response, result.data);
}

export async function updatePageController(request: AuthRequest, response: Response) {
  const pageId = request.params.pageId as string;
  const result = await updatePage(pageId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Page updated") : sendFailure(response, result.message, 404);
}

export async function duplicatePageController(request: AuthRequest, response: Response) {
  const pageId = request.params.pageId as string;
  const storeId = request.body.storeId as string;
  const result = await duplicatePage(pageId, storeId);
  return result.ok ? sendSuccess(response, result.data, "Page duplicated", 201) : sendFailure(response, result.message);
}

export async function renamePageController(request: AuthRequest, response: Response) {
  const pageId = request.params.pageId as string;
  const { title } = request.body as { title: string };
  const result = await renamePage(pageId, title);
  return result.ok ? sendSuccess(response, result.data, "Page renamed") : sendFailure(response, result.message, 404);
}

export async function archivePageController(request: AuthRequest, response: Response) {
  const pageId = request.params.pageId as string;
  const storeId = request.body.storeId as string;
  const result = await archivePage(pageId, storeId);
  return result.ok ? sendSuccess(response, result.data, "Page archived") : sendFailure(response, result.message);
}

export async function restorePageController(request: AuthRequest, response: Response) {
  const pageId = request.params.pageId as string;
  const storeId = request.body.storeId as string;
  const result = await restorePage(pageId, storeId);
  return result.ok ? sendSuccess(response, result.data, "Page restored") : sendFailure(response, result.message);
}

export async function resetPageController(request: AuthRequest, response: Response) {
  const pageId = request.params.pageId as string;
  const storeId = request.body.storeId as string;
  const result = await resetPage(pageId, storeId);
  return result.ok ? sendSuccess(response, result.data, "Page reset to template") : sendFailure(response, result.message, 404);
}

export async function publishPageController(request: AuthRequest, response: Response) {
  const pageId = request.params.pageId as string;
  const result = await publishPage(pageId, request.body);
  if (result.ok) {
    const page = result.data.page as { title?: string; storeId?: string };
    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.BUILDER_PUBLISHED,
      module: AUDIT_MODULES.BUILDER,
      entityType: "BuilderPage",
      entityId: pageId,
      entityName: page.title,
      storeId: page.storeId ?? request.body?.storeId,
    });
  }
  return result.ok ? sendSuccess(response, result.data, "Page published") : sendFailure(response, result.message, 404);
}
