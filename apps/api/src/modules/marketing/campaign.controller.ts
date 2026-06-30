import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { StoreModel } from "../stores/store.model.js";
import { createCampaign, deleteCampaign, listCampaigns, updateCampaign } from "./campaign.service.js";

async function verifyStoreOwner(storeId: string, userId?: string) {
  return Boolean(await StoreModel.findOne({ _id: storeId, userId }).lean());
}

export async function listCampaignsController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) return sendFailure(response, "Store not found", 404);
  const result = await listCampaigns(storeId);
  return sendSuccess(response, result.data);
}

export async function createCampaignController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) return sendFailure(response, "Store not found", 404);
  const result = await createCampaign(storeId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Campaign created", 201) : sendFailure(response, result.message);
}

export async function updateCampaignController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) return sendFailure(response, "Store not found", 404);
  const result = await updateCampaign(storeId, id, request.body);
  return result.ok ? sendSuccess(response, result.data, "Campaign updated") : sendFailure(response, result.message, 404);
}

export async function deleteCampaignController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const id = String(request.params.id);
  if (!(await verifyStoreOwner(storeId, request.user?.userId))) return sendFailure(response, "Store not found", 404);
  const result = await deleteCampaign(storeId, id);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}
