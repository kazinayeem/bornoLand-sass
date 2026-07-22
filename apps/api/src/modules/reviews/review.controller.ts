import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { StoreModel } from "../stores/store.model.js";
import { createReview, deleteReview, listReviews, updateReviewStatus } from "./review.service.js";

async function verifyStoreOwner(storeId: string, userId?: string) {
  return Boolean(await StoreModel.findOne({ _id: storeId, userId }).lean());
}

export async function listReviewsController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await listReviews(storeId, request.query as Record<string, unknown>);
  return sendSuccess(response, result.data);
}

export async function createReviewController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await createReview(storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Review created", 201) : sendFailure(response, result.message);
}

export async function updateReviewStatusController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  const { status } = request.body as { status: string };
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await updateReviewStatus(storeId, id, status);
  return result.ok ? sendSuccess(response, result.data, "Review updated") : sendFailure(response, result.message, 404);
}

export async function deleteReviewController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) {
    return sendFailure(response, "Store not found", 404);
  }
  const result = await deleteReview(storeId, id);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}
