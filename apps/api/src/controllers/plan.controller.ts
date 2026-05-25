import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { createPlan, deletePlan, listPlans, updatePlan } from "../services/plan.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

function requireSuperAdmin(request: AuthRequest, response: Response) {
  if (request.user?.role !== "super_admin") {
    sendFailure(response, "Forbidden", 403);
    return false;
  }
  return true;
}

export async function listPlansController(_request: AuthRequest, response: Response) {
  const result = await listPlans();
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