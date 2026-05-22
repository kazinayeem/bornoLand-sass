import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { createStore, deleteStore, getStoreById, getUserStores, updateStore, changeStoreTheme } from "../services/store.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

export async function createStoreController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await createStore(userId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Store created", 201) : sendFailure(response, result.message);
}

export async function getUserStoresController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await getUserStores(userId);
  return sendSuccess(response, result.data);
}

export async function getStoreController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const id = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await getStoreById(id, userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function updateStoreController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const id = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await updateStore(id, userId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Store updated") : sendFailure(response, result.message, 404);
}

export async function deleteStoreController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const id = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await deleteStore(id, userId);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}

export async function changeStoreThemeController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const id = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await changeStoreTheme(id, userId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Theme updated") : sendFailure(response, result.message);
}
