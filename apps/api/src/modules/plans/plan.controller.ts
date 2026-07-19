import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { createPlan, deletePlan, duplicatePlan, getPlanPrice, listPlans, listPublicPlans, updatePlan } from "./plan.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { planDurationSchema } from "./plan.validator.js";

function requireSuperAdmin(request: AuthRequest, response: Response) {
  if (request.user?.role !== "super_admin") {
    sendFailure(response, "Forbidden", 403);
    return false;
  }
  return true;
}

export async function listPlansController(request: AuthRequest, response: Response) {
  const includeHidden = request.user?.role === "super_admin" && request.query.all === "true";
  const result = await listPlans(includeHidden);
  return sendSuccess(response, result.data);
}

export async function listPublicPlansController(_request: AuthRequest, response: Response) {
  const result = await listPublicPlans();
  response.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  return sendSuccess(response, result.data);
}

export async function createPlanController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const result = await createPlan(request.body);
  return result.ok ? sendSuccess(response, result.data, "Plan created", 201) : sendFailure(response, result.message);
}

export async function updatePlanController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const result = await updatePlan(request.params.id as string, request.body);
  return result.ok ? sendSuccess(response, result.data, "Plan updated") : sendFailure(response, result.message, 404);
}

export async function deletePlanController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const result = await deletePlan(request.params.id as string);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}

export async function duplicatePlanController(request: AuthRequest, response: Response) {
  if (!requireSuperAdmin(request, response)) return;
  const result = await duplicatePlan(request.params.id as string);
  return result.ok ? sendSuccess(response, result.data, "Plan duplicated", 201) : sendFailure(response, result.message, 404);
}

export async function getPlanPriceController(request: AuthRequest, response: Response) {
  const durationParsed = planDurationSchema.safeParse(request.query.duration ?? "monthly");
  if (!durationParsed.success) return sendFailure(response, "Invalid duration");
  const result = await getPlanPrice(request.params.id as string, durationParsed.data);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}
