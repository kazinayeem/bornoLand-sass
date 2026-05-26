import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import type { SubdomainRequest } from "../middleware/subdomain.middleware.js";
import { getCmsPages, getCmsPage, saveCmsPage, getFaqs, createFaq, updateFaq, deleteFaq, reorderFaqs } from "../services/cms.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

export async function getPagesController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const result = await getCmsPages(storeId);
  return sendSuccess(response, result.data);
}

export async function getPageController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const slug = request.params.slug as string;
  const result = await getCmsPage(storeId, slug);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function savePageController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const slug = request.params.slug as string;
  const userId = request.user?.userId as string;
  const result = await saveCmsPage(storeId, userId, slug, request.body);
  return result.ok ? sendSuccess(response, result.data, "Page saved") : sendFailure(response, result.message, 404);
}

export async function getFaqsController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const result = await getFaqs(storeId);
  return sendSuccess(response, result.data);
}

export async function createFaqController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const userId = request.user?.userId as string;
  const result = await createFaq(storeId, userId, request.body);
  return result.ok ? sendSuccess(response, result.data, "FAQ created", 201) : sendFailure(response, result.message, 404);
}

export async function updateFaqController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const faqId = request.params.faqId as string;
  const userId = request.user?.userId as string;
  const result = await updateFaq(faqId, storeId, userId, request.body);
  return result.ok ? sendSuccess(response, result.data, "FAQ updated") : sendFailure(response, result.message, 404);
}

export async function deleteFaqController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const faqId = request.params.faqId as string;
  const userId = request.user?.userId as string;
  const result = await deleteFaq(faqId, storeId, userId);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}

export async function reorderFaqsController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const userId = request.user?.userId as string;
  const { orderedIds } = request.body as { orderedIds: string[] };
  const result = await reorderFaqs(storeId, userId, orderedIds);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}

export async function getPublicPageController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id?.toString() ?? (request.query.storeId as string | undefined);
  const slug = request.params.slug as string;
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const result = await getCmsPage(storeId, slug);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}
