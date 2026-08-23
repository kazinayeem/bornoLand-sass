import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import {
  getBrands, getBrand, createBrand, updateBrand, deleteBrand, reorderBrands
} from "./brand.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";

export async function listBrandsController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const result = await getBrands(storeId, request.query as Record<string, unknown>);
  return sendSuccess(response, result.data);
}

export async function getBrandController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const brandId = request.params.id as string;
  const result = await getBrand(brandId, storeId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function createBrandController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const userId = request.user?.userId as string;
  const result = await createBrand(storeId, userId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Brand created", 201) : sendFailure(response, result.message);
}

export async function updateBrandController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const brandId = request.params.id as string;
  const userId = request.user?.userId as string;
  const result = await updateBrand(brandId, storeId, userId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Brand updated") : sendFailure(response, result.message, 404);
}

export async function deleteBrandController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const brandId = request.params.id as string;
  const userId = request.user?.userId as string;
  const result = await deleteBrand(brandId, storeId, userId);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}

export async function reorderBrandsController(request: AuthRequest, response: Response) {
  const storeId = request.params.storeId as string;
  const userId = request.user?.userId as string;
  const { orderedIds } = request.body as { orderedIds: string[] };
  const result = await reorderBrands(storeId, userId, orderedIds);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}
