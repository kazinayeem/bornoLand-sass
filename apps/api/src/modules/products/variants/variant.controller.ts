import type { Response } from "express";
import type { AuthRequest } from "../../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../../common/utils/api-response.js";
import {
  bulkUpdateVariants,
  generateProductVariants,
  listOptionTemplates,
  createOptionTemplate,
  searchVariants,
  syncProductVariants,
} from "./variant.service.js";

export async function syncVariantsController(request: AuthRequest, response: Response) {
  const productId = String(request.params.id);
  const storeId = String(request.params.storeId);
  const result = await syncProductVariants(productId, storeId, request.body);
  return result.ok
    ? sendSuccess(response, result.data, "Variants synced")
    : sendFailure(response, result.message);
}

export async function generateVariantsController(request: AuthRequest, response: Response) {
  const productId = String(request.params.id);
  const storeId = String(request.params.storeId);
  const result = await generateProductVariants(productId, storeId);
  return result.ok
    ? sendSuccess(response, result.data, "Variants generated")
    : sendFailure(response, result.message);
}

export async function bulkVariantsController(request: AuthRequest, response: Response) {
  const productId = String(request.params.id);
  const storeId = String(request.params.storeId);
  const result = await bulkUpdateVariants(storeId, productId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Bulk update complete") : sendFailure(response, result.message);
}

export async function searchVariantsController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const { search, status, minPrice, maxPrice } = request.query as Record<string, string>;
  const result = await searchVariants(storeId, {
    search,
    status,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });
  return sendSuccess(response, result.data);
}

export async function listOptionTemplatesController(_request: AuthRequest, response: Response) {
  const result = await listOptionTemplates();
  return sendSuccess(response, result.data);
}

export async function createOptionTemplateController(request: AuthRequest, response: Response) {
  const result = await createOptionTemplate(request.body, request.user?.userId);
  return result.ok
    ? sendSuccess(response, result.data, "Template created", 201)
    : sendFailure(response, result.message);
}
