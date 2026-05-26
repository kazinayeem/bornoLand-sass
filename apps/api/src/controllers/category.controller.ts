import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getCategories, getCategory, createCategory, updateCategory, deleteCategory, reorderCategories,
} from "../services/category.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

export async function listCategoriesController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const result = await getCategories(storeId);
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
