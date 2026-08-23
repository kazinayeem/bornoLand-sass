import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import type { SubdomainRequest } from "../../common/middleware/subdomain.middleware.js";
import { StoreModel } from "../../models/store.model.js";
import {
  getCategories, getCategory, createCategory, updateCategory, deleteCategory, reorderCategories,
} from "./category.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";

export async function listCategoriesController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const result = await getCategories(storeId, request.query as Record<string, unknown>);
  return sendSuccess(response, result.data);
}

/** Public storefront — same getCategories() as the merchant dashboard / builder. */
export async function getPublicCategoriesController(request: SubdomainRequest, response: Response) {
  const storeIdFromHost = request.store?._id ? String(request.store._id) : null;
  const storeIdFromQuery =
    typeof request.query.storeId === "string" && request.query.storeId.trim()
      ? request.query.storeId.trim()
      : null;
  const storeId = storeIdFromHost ?? storeIdFromQuery;

  if (!storeId) {
    return sendFailure(response, "Store not found", 404);
  }

  const store = await StoreModel.findOne({ _id: storeId, status: "active" }).lean();
  if (!store) {
    return sendFailure(response, "Store not found", 404);
  }

  const result = await getCategories(storeId, {
    ...request.query,
    page: request.query.page ?? 1,
    limit: request.query.limit ?? 100,
    status: request.query.status ?? "active",
  });
  return sendSuccess(response, result.data);
}

export async function getCategoryController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const categoryId = request.params.id as string;
  const result = await getCategory(categoryId, storeId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function createCategoryController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const userId = request.user?.userId as string;
  const result = await createCategory(storeId, userId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Category created", 201) : sendFailure(response, result.message);
}

export async function updateCategoryController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const categoryId = request.params.id as string;
  const userId = request.user?.userId as string;
  const result = await updateCategory(categoryId, storeId, userId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Category updated") : sendFailure(response, result.message, 404);
}

export async function deleteCategoryController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const categoryId = request.params.id as string;
  const userId = request.user?.userId as string;
  const result = await deleteCategory(categoryId, storeId, userId);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}

export async function reorderCategoriesController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const userId = request.user?.userId as string;
  const { orderedIds } = request.body as { orderedIds: string[] };
  const result = await reorderCategories(storeId, userId, orderedIds);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}
