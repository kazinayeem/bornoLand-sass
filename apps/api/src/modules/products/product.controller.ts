import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, duplicateProduct,
  createVariant, updateVariant, deleteVariant
} from "./product.service.js";
import { ProductModel } from "../../models/product.model.js";
import { StoreModel } from "../../models/store.model.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { recordAuditFromRequest } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../audit/audit-actions.js";
import { AUDIT_MODULES } from "../audit/audit.constants.js";
import { computeChanges } from "../audit/audit.utils.js";

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
  if (result.ok) {
    const product = result.data.product as { id?: string; _id?: string; name?: string };
    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.PRODUCT_CREATED,
      module: AUDIT_MODULES.PRODUCTS,
      entityType: "Product",
      entityId: product.id ?? String(product._id),
      entityName: product.name,
      storeId,
      newValue: request.body,
    });
  }
  return result.ok ? sendSuccess(response, result.data, "Product created", 201) : sendFailure(response, result.message);
}

export async function updateProductController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const storeId = request.params.storeId as string;
  const before = await ProductModel.findOne({ _id: id, storeId }).lean() as { name?: string; status?: string } | null;
  const result = await updateProduct(id, storeId, request.body);
  if (result.ok && before) {
    const product = result.data.product as { name?: string };
    const changes = computeChanges(
      before as Record<string, unknown>,
      { ...before, ...request.body } as Record<string, unknown>,
      Object.keys(request.body ?? {}),
    );
    const priceChange = changes.find((c) => c.field === "price");
    await recordAuditFromRequest(request, {
      action: priceChange ? AUDIT_ACTIONS.PRODUCT_PRICE_CHANGED : AUDIT_ACTIONS.PRODUCT_UPDATED,
      module: AUDIT_MODULES.PRODUCTS,
      entityType: "Product",
      entityId: id,
      entityName: product.name ?? before.name,
      storeId,
      oldValue: before,
      newValue: result.data.product,
      changes,
    });
  }
  return result.ok ? sendSuccess(response, result.data, "Product updated") : sendFailure(response, result.message, 404);
}

export async function deleteProductController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const storeId = request.params.storeId as string;
  const before = await ProductModel.findOne({ _id: id, storeId }).lean() as { name?: string; status?: string } | null;
  const result = await deleteProduct(id, storeId);
  if (result.ok && before) {
    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.PRODUCT_DELETED,
      module: AUDIT_MODULES.PRODUCTS,
      entityType: "Product",
      entityId: id,
      entityName: before.name,
      storeId,
      oldValue: before,
    });
  }
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}

export async function duplicateProductController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const storeId = request.params.storeId as string;
  const result = await duplicateProduct(id, storeId);
  if (result.ok) {
    const product = result.data.product as { id?: string; _id?: string; name?: string };
    await recordAuditFromRequest(request, {
      action: AUDIT_ACTIONS.PRODUCT_DUPLICATED,
      module: AUDIT_MODULES.PRODUCTS,
      entityType: "Product",
      entityId: product.id ?? String(product._id),
      entityName: product.name,
      storeId,
      metadata: { sourceProductId: id },
    });
  }
  return result.ok ? sendSuccess(response, result.data, "Product duplicated") : sendFailure(response, result.message, 404);
}

export async function createVariantController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const storeId = request.params.storeId as string;
  const result = await createVariant(id, storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Variant created", 201) : sendFailure(response, result.message);
}

export async function updateVariantController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const variantId = request.params.variantId as string;
  const storeId = request.params.storeId as string;
  const result = await updateVariant(id, variantId, storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Variant updated") : sendFailure(response, result.message);
}

export async function deleteVariantController(request: AuthRequest, response: Response) {
  const id = request.params.id as string;
  const variantId = request.params.variantId as string;
  const storeId = request.params.storeId as string;
  const result = await deleteVariant(id, variantId, storeId);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message);
}
