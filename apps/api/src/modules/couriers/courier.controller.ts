import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { isCourierProviderSlug } from "./courier.constants.js";
import {
  getStoreCourier,
  listStoreCouriers,
  testStoreCourierConnection,
  updateStoreCourier,
  updateStoreCourierAccessProviders,
} from "./courier.service.js";
import { updateStoreCourierAccessSchema } from "./courier.validator.js";
import { resolveStoreCourierAccess } from "./courier.permission.js";

function storeIdFrom(request: AuthRequest) {
  return String(request.params.storeId ?? "");
}

function userIdFrom(request: AuthRequest) {
  return String(request.user?.userId ?? "");
}

function roleFrom(request: AuthRequest) {
  return String(request.user?.role ?? "");
}

export async function listStoreCouriersController(request: AuthRequest, response: Response) {
  const result = await listStoreCouriers(storeIdFrom(request), userIdFrom(request), roleFrom(request));
  if (!result.ok) return sendFailure(response, result.message, result.status);
  return sendSuccess(response, result.data);
}

export async function getStoreCourierController(request: AuthRequest, response: Response) {
  const provider = String(request.params.provider ?? "");
  if (!isCourierProviderSlug(provider)) return sendFailure(response, "Invalid courier provider", 400);
  const result = await getStoreCourier(storeIdFrom(request), provider, userIdFrom(request), roleFrom(request));
  if (!result.ok) return sendFailure(response, result.message, result.status);
  return sendSuccess(response, result.data);
}

export async function updateStoreCourierController(request: AuthRequest, response: Response) {
  const provider = String(request.params.provider ?? "");
  if (!isCourierProviderSlug(provider)) return sendFailure(response, "Invalid courier provider", 400);
  try {
    const result = await updateStoreCourier(
      storeIdFrom(request),
      provider,
      userIdFrom(request),
      request.body,
      request,
      roleFrom(request),
    );
    if (!result.ok) return sendFailure(response, result.message, result.status);
    return sendSuccess(response, result.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save courier settings";
    console.error("[courier] update failed:", message);
    return sendFailure(response, message, 500);
  }
}

export async function testStoreCourierController(request: AuthRequest, response: Response) {
  const provider = String(request.params.provider ?? "");
  if (!isCourierProviderSlug(provider)) return sendFailure(response, "Invalid courier provider", 400);
  try {
    const result = await testStoreCourierConnection(
      storeIdFrom(request),
      provider,
      userIdFrom(request),
      request,
      roleFrom(request),
    );
    if (!result.ok) return sendFailure(response, result.message, result.status);
    return sendSuccess(response, result.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to test courier connection";
    console.error("[courier] test failed:", message);
    return sendFailure(response, message, 500);
  }
}

export async function getStoreCourierAccessController(request: AuthRequest, response: Response) {
  const access = await resolveStoreCourierAccess(storeIdFrom(request));
  return sendSuccess(response, { access });
}

/** Super-admin / store owner access list update */
export async function updateStoreCourierAccessController(request: AuthRequest, response: Response) {
  const parsed = updateStoreCourierAccessSchema.safeParse(request.body);
  if (!parsed.success) return sendFailure(response, "Invalid courier access payload", 400);
  const result = await updateStoreCourierAccessProviders(
    storeIdFrom(request),
    parsed.data.providers,
    userIdFrom(request),
  );
  if (!result.ok) return sendFailure(response, result.message ?? "Failed", 404);
  return sendSuccess(response, result.data);
}
