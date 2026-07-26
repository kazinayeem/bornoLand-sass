import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import {
  cancelOrderShipment,
  createOrderShipment,
  getShipmentOptionsForOrder,
  trackOrderShipment,
} from "./shipment.service.js";

function storeIdFrom(request: AuthRequest) {
  return String(request.params.storeId ?? "");
}

function orderIdFrom(request: AuthRequest) {
  return String(request.params.orderId ?? request.params.id ?? "");
}

function userIdFrom(request: AuthRequest) {
  return String(request.user?.userId ?? "");
}

function roleFrom(request: AuthRequest) {
  return String(request.user?.role ?? "");
}

export async function getShipmentOptionsController(request: AuthRequest, response: Response) {
  try {
    const result = await getShipmentOptionsForOrder(
      storeIdFrom(request),
      orderIdFrom(request),
      userIdFrom(request),
      roleFrom(request),
    );
    if (!result.ok) return sendFailure(response, result.message, result.status);
    return sendSuccess(response, result.data);
  } catch (error) {
    console.error("[shipment] options failed:", error);
    return sendFailure(response, "Failed to load shipment options", 500);
  }
}

export async function createShipmentController(request: AuthRequest, response: Response) {
  try {
    const body = (request.body ?? {}) as {
      provider?: string;
      weightKg?: number;
      specialInstruction?: string;
      packageType?: string;
      codAmount?: number;
    };
    if (!body.provider) return sendFailure(response, "Provider is required", 400);

    const result = await createOrderShipment(
      storeIdFrom(request),
      orderIdFrom(request),
      body.provider,
      userIdFrom(request),
      {
        weightKg: body.weightKg,
        specialInstruction: body.specialInstruction,
        packageType: body.packageType,
        codAmount: body.codAmount,
      },
      { role: roleFrom(request), request },
    );
    if (!result.ok) return sendFailure(response, result.message, result.status);
    return sendSuccess(response, result.data, "Shipment created");
  } catch (error) {
    console.error("[shipment] create failed:", error);
    return sendFailure(response, "Failed to create shipment", 500);
  }
}

export async function cancelShipmentController(request: AuthRequest, response: Response) {
  try {
    const result = await cancelOrderShipment(
      storeIdFrom(request),
      orderIdFrom(request),
      userIdFrom(request),
      roleFrom(request),
      request,
    );
    if (!result.ok) return sendFailure(response, result.message, result.status);
    return sendSuccess(response, result.data, "Shipment cancelled");
  } catch (error) {
    console.error("[shipment] cancel failed:", error);
    return sendFailure(response, "Failed to cancel shipment", 500);
  }
}

export async function trackShipmentController(request: AuthRequest, response: Response) {
  try {
    const result = await trackOrderShipment(
      storeIdFrom(request),
      orderIdFrom(request),
      userIdFrom(request),
      roleFrom(request),
    );
    if (!result.ok) return sendFailure(response, result.message, result.status);
    return sendSuccess(response, result.data);
  } catch (error) {
    console.error("[shipment] track failed:", error);
    return sendFailure(response, "Failed to track shipment", 500);
  }
}
