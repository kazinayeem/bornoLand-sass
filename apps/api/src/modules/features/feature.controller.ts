import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import {
  createFeature,
  createFeatureGroup,
  deleteFeature,
  getFeatureDetail,
  getFeatureTiers,
  getPlanFeatures,
  listFeatureGroups,
  listFeatures,
  setFeatureTiers,
  setPlanFeatures,
  updateFeature,
  updateFeatureGroup,
} from "./feature.service.js";
import { getStoreFeatureAccessMatrix } from "./feature-access.service.js";

function requireSuperAdmin(request: AuthRequest, response: Response) {
  if (request.user?.role !== "super_admin") {
    sendFailure(response, "Forbidden", 403);
    return false;
  }
  return true;
}

export async function listFeaturesController(request: AuthRequest, response: Response) {
  const group = typeof request.query.group === "string" ? request.query.group : undefined;
  const result = await listFeatures(group);
  return sendSuccess(response, result.data);
}

export async function getFeatureDetailController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const result = await getFeatureDetail(request.params.key as string);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function createFeatureController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const result = await createFeature(request.body);
  return result.ok ? sendSuccess(response, result.data, "Feature created", 201) : sendFailure(response, result.message);
}

export async function updateFeatureController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const result = await updateFeature(request.params.key as string, request.body);
  return result.ok ? sendSuccess(response, result.data, "Feature updated") : sendFailure(response, result.message, 404);
}

export async function deleteFeatureController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const result = await deleteFeature(request.params.key as string);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}

export async function listFeatureGroupsController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const result = await listFeatureGroups();
  return sendSuccess(response, result.data);
}

export async function createFeatureGroupController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const result = await createFeatureGroup(request.body);
  return sendSuccess(response, result.data, "Group created", 201);
}

export async function updateFeatureGroupController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const result = await updateFeatureGroup(request.params.key as string, request.body);
  if (!result.ok) return sendFailure(response, result.message, 404);
  return sendSuccess(response, result.data, "Group updated");
}

export async function getFeatureTiersController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const result = await getFeatureTiers(request.params.key as string);
  return sendSuccess(response, result.data);
}

export async function setFeatureTiersController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const { tiers } = request.body as { tiers: Array<{ tierKey: string; label: string; rank: number; description?: string }> };
  const result = await setFeatureTiers(request.params.key as string, tiers ?? []);
  return sendSuccess(response, result.data, "Tiers updated");
}

export async function getPlanFeaturesController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const result = await getPlanFeatures(request.params.planId as string);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function setPlanFeaturesController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const { features } = request.body as {
    features: Array<{ featureKey: string; enabled?: boolean; limit?: number; tierKey?: string; value?: string }>;
  };
  const result = await setPlanFeatures(request.params.planId as string, features ?? []);
  return result.ok ? sendSuccess(response, result.data, "Plan features updated") : sendFailure(response, result.message, 404);
}

export async function getStoreFeatureAccessController(request: AuthRequest, response: Response) {
  const result = await getStoreFeatureAccessMatrix(request.params.storeId as string);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}
