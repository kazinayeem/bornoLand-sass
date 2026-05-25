import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { createHomepageSlider, deleteHomepageSlider, listHomepageSliders, updateHomepageSlider } from "../services/homepage-slider.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

export async function listHomepageSlidersController(request: AuthRequest, response: Response) {
  const storeId = request.params.id as string;
  const userId = request.user?.userId;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await listHomepageSliders(storeId, userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function createHomepageSliderController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.id as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await createHomepageSlider(storeId, userId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Slider created", 201) : sendFailure(response, result.message);
}

export async function updateHomepageSliderController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.id as string;
  const sliderId = request.params.sliderId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await updateHomepageSlider(storeId, userId, sliderId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Slider updated") : sendFailure(response, result.message, 404);
}

export async function deleteHomepageSliderController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.id as string;
  const sliderId = request.params.sliderId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await deleteHomepageSlider(storeId, userId, sliderId);
  return result.ok ? sendSuccess(response, undefined, result.message) : sendFailure(response, result.message, 404);
}