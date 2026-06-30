import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { StoreModel } from "../stores/store.model.js";
import { createCollection, deleteCollection, listCollections, updateCollection } from "./collection.service.js";

async function verifyStoreOwner(storeId: string, userId?: string) {
  return Boolean(await StoreModel.findOne({ _id: storeId, userId }).lean());
}

export async function listCollectionsController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) return sendFailure(response, "Store not found", 404);
  const result = await listCollections(storeId);
  return sendSuccess(response, result.data);
}

export async function createCollectionController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) return sendFailure(response, "Store not found", 404);
  const result = await createCollection(storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Collection created", 201) : sendFailure(response, result.message);
}

export async function updateCollectionController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) return sendFailure(response, "Store not found", 404);
  const result = await updateCollection(storeId, id, request.body);
  return result.ok ? sendSuccess(response, result.data, "Collection updated") : sendFailure(response, result.message, 404);
}

export async function deleteCollectionController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) return sendFailure(response, "Store not found", 404);
  const result = await deleteCollection(storeId, id);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}
