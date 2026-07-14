import { Router } from "express";
import type { Response } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";
import {
  listNavigations,
  getNavigation,
  updateNavigation,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,
  getAvailableNavPages,
  checkPageNavigationUsage,
  getHeaderSettings,
  updateHeaderSettings,
  getFooterSettings,
  updateFooterSettings,
} from "./navigation.service.js";

export const navigationRouter: Router = Router();

navigationRouter.use(requireAuth);

// ─── List all navigations for a store (with menu items tree) ─────────────────

navigationRouter.get("/stores/:storeId", async (request: AuthRequest, response: Response) => {
  const result = await listNavigations(request.params.storeId as string);
  return sendSuccess(response, result.data);
});

// ─── Get single navigation ───────────────────────────────────────────────────

navigationRouter.get("/:id", async (request: AuthRequest, response: Response) => {
  const result = await getNavigation(request.params.id as string);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

// ─── Update navigation ───────────────────────────────────────────────────────

navigationRouter.put("/:id", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await updateNavigation(request.params.id as string, storeId, request.body);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
});

// ─── Add menu item ───────────────────────────────────────────────────────────

navigationRouter.post("/:id/items", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await addMenuItem(request.params.id as string, storeId, request.body);
  return result.ok
    ? sendSuccess(response, result.data, "Menu item added", 201)
    : sendFailure(response, result.message);
});

// ─── Update menu item ────────────────────────────────────────────────────────

navigationRouter.put("/items/:itemId", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await updateMenuItem(request.params.itemId as string, storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Menu item updated") : sendFailure(response, result.message);
});

// ─── Delete menu item ────────────────────────────────────────────────────────

navigationRouter.delete("/items/:itemId", async (request: AuthRequest, response: Response) => {
  const storeId = request.query.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const result = await deleteMenuItem(request.params.itemId as string, storeId);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message);
});

// ─── Reorder menu items ──────────────────────────────────────────────────────

navigationRouter.put("/:id/items/reorder", async (request: AuthRequest, response: Response) => {
  const storeId = request.body.storeId as string;
  if (!storeId) return sendFailure(response, "storeId is required");
  const { orderedIds } = request.body as { orderedIds: string[] };
  if (!orderedIds) return sendFailure(response, "orderedIds is required");
  const result = await reorderMenuItems(request.params.id as string, storeId, orderedIds);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message);
});

// ─── Available pages for navigation linking ───────────────────────────────────

navigationRouter.get("/stores/:storeId/available-pages", async (request: AuthRequest, response: Response) => {
  const result = await getAvailableNavPages(request.params.storeId as string);
  return sendSuccess(response, result.data);
});

// ─── Check page usage in navigation ───────────────────────────────────────────

navigationRouter.get("/pages/:storeId/usage", async (request: AuthRequest, response: Response) => {
  const slug = request.query.slug as string;
  if (!slug) return sendFailure(response, "slug query parameter is required");
  const result = await checkPageNavigationUsage(request.params.storeId as string, slug);
  return sendSuccess(response, result.data);
});

// ─── Header Settings ──────────────────────────────────────────────────────────

navigationRouter.get("/header-settings/:storeId", async (request: AuthRequest, response: Response) => {
  const pageId = request.query.pageId as string | undefined;
  const result = await getHeaderSettings(request.params.storeId as string, pageId);
  return sendSuccess(response, result.data);
});

navigationRouter.put("/header-settings/:storeId", async (request: AuthRequest, response: Response) => {
  const result = await updateHeaderSettings(request.params.storeId as string, request.body);
  return sendSuccess(response, result.data);
});

// ─── Footer Settings ──────────────────────────────────────────────────────────

navigationRouter.get("/footer-settings/:storeId", async (request: AuthRequest, response: Response) => {
  const result = await getFooterSettings(request.params.storeId as string);
  return sendSuccess(response, result.data);
});

navigationRouter.put("/footer-settings/:storeId", async (request: AuthRequest, response: Response) => {
  const result = await updateFooterSettings(request.params.storeId as string, request.body);
  return sendSuccess(response, result.data);
});
