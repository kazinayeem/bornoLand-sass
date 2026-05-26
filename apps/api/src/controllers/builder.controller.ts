import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { getPages, getPage, savePage, createPage, deletePage, publishPage } from "../services/builder.service.js";
import { serverConfig } from "../config/server.js";
import { StoreModel } from "../models/store.model.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

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
  return result.ok ? sendSuccess(response, result.data, "Page saved") : sendFailure(response, result.message, 404);
}

export async function createPageController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const result = await createPage(storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Page created", 201) : sendFailure(response, result.message);
}

export async function deletePageController(request: AuthRequest, response: Response) {
  const pageId = request.params.pageId as string;
  const result = await deletePage(pageId);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}

export async function publishPageController(request: AuthRequest, response: Response) {
  const pageId = request.params.pageId as string;
  const userId = request.user?.userId as string | undefined;
  const result = await publishPage(pageId, userId);
  if (result.ok) {
    try {
      // trigger frontend revalidation so Next updates the live storefront immediately
      const webUrl = serverConfig.FRONTEND_URL.replace(/\/$/, "");
      const page = result.data?.page as any;
      let subdomain: string | undefined;
      try {
        if (page?.storeId) {
          const store = await StoreModel.findById(page.storeId).lean();
          subdomain = store?.subdomain;
        }
      } catch (e) {
        // ignore
      }
      await fetch(`${webUrl}/api/revalidate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: subdomain, pageId }),
      });
    } catch (err) {
      // don't fail publish on revalidate errors
      console.warn("Revalidation call failed", err);
    }
  }
  return result.ok ? sendSuccess(response, result.data, "Page published") : sendFailure(response, result.message, 404);
}
