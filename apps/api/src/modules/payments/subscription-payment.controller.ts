import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import {
  approveSubscriptionPayment,
  getAllPlatformPaymentMethods,
  getPlatformPaymentMethods,
  getStoreSubscriptionPayments,
  listSubscriptionPayments,
  rejectSubscriptionPayment,
  requestInfoSubscriptionPayment,
  submitStoreSubscriptionPayment,
  updatePlatformPaymentMethod,
} from "./subscription-payment.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";

export async function getPlatformPaymentMethodsController(_request: AuthRequest, response: Response) {
  const result = await getPlatformPaymentMethods();
  return sendSuccess(response, result.data);
}

export async function submitStorePaymentController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await submitStoreSubscriptionPayment(storeId, userId, request.body);
  return result.ok
    ? sendSuccess(response, result.data, "Payment submitted", 201)
    : sendFailure(response, result.message);
}

export async function getStorePaymentsController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);
  const result = await getStoreSubscriptionPayments(storeId, userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function listAdminPaymentsController(request: AuthRequest, response: Response) {
  const status = request.query.status as string | undefined;
  const result = await listSubscriptionPayments(status);
  return sendSuccess(response, result.data);
}

export async function approvePaymentController(request: AuthRequest, response: Response) {
  const adminUserId = request.user?.userId;
  const paymentId = request.params.id as string;
  if (!adminUserId) return sendFailure(response, "Unauthorized", 401);
  const result = await approveSubscriptionPayment(paymentId, adminUserId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Payment approved") : sendFailure(response, result.message);
}

export async function rejectPaymentController(request: AuthRequest, response: Response) {
  const adminUserId = request.user?.userId;
  const paymentId = request.params.id as string;
  if (!adminUserId) return sendFailure(response, "Unauthorized", 401);
  const result = await rejectSubscriptionPayment(paymentId, adminUserId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Payment rejected") : sendFailure(response, result.message);
}

export async function requestInfoPaymentController(request: AuthRequest, response: Response) {
  const adminUserId = request.user?.userId;
  const paymentId = request.params.id as string;
  if (!adminUserId) return sendFailure(response, "Unauthorized", 401);
  const result = await requestInfoSubscriptionPayment(paymentId, adminUserId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Info requested") : sendFailure(response, result.message);
}

export async function getAdminPaymentMethodsController(_request: AuthRequest, response: Response) {
  const result = await getAllPlatformPaymentMethods();
  return sendSuccess(response, result.data);
}

export async function updateAdminPaymentMethodController(request: AuthRequest, response: Response) {
  const adminUserId = request.user?.userId;
  const type = request.params.type as string;
  if (!adminUserId) return sendFailure(response, "Unauthorized", 401);
  const result = await updatePlatformPaymentMethod(type, adminUserId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Payment method updated") : sendFailure(response, result.message);
}
