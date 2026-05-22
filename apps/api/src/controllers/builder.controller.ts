import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { getPages, getPage, savePage, createPage, deletePage, publishPage } from "../services/builder.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

export async function getPagesController(request: AuthRequest, response: Response) {
  const result = await getPages(request.params.storeId);
  return sendSuccess(response, result.data);
}

export async function getPageController(request: AuthRequest, response: Response) {
  const result = await getPage(request.params.pageId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function savePageController(request: AuthRequest, response: Response) {
  const result = await savePage(request.params.pageId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Page saved") : sendFailure(response, result.message, 404);
}

export async function createPageController(request: AuthRequest, response: Response) {
  const result = await createPage(request.params.storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Page created", 201) : sendFailure(response, result.message);
}

export async function deletePageController(request: AuthRequest, response: Response) {
  const result = await deletePage(request.params.pageId);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}

export async function publishPageController(request: AuthRequest, response: Response) {
  const result = await publishPage(request.params.pageId);
  return result.ok ? sendSuccess(response, result.data, "Page published") : sendFailure(response, result.message, 404);
}
