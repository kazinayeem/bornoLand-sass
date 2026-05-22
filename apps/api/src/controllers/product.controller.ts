import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, duplicateProduct
} from "../services/product.service.js";
import { StoreModel } from "../models/store.model.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

export async function listProductsController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const result = await getProducts(storeId);
  return sendSuccess(response, result.data);
}

export async function getProductController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const result = await getProduct(id);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function createProductController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const userId = request.user?.userId;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return sendFailure(response, "Store not found", 404);

  const result = await createProduct(storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Product created", 201) : sendFailure(response, result.message);
}

export async function updateProductController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const storeId = request.params.storeId as string;
  const result = await updateProduct(id, storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Product updated") : sendFailure(response, result.message, 404);
}

export async function deleteProductController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const storeId = request.params.storeId as string;
  const result = await deleteProduct(id, storeId);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}

export async function duplicateProductController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const storeId = request.params.storeId as string;
  const result = await duplicateProduct(id, storeId);
  return result.ok ? sendSuccess(response, result.data, "Product duplicated") : sendFailure(response, result.message, 404);
}
