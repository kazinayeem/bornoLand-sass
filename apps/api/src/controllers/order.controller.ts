import type { Response } from "express";
import type { SubdomainRequest } from "../middleware/subdomain.middleware.js";
import { createOrder, getCustomerOrders, getOrderById } from "../services/order.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

function getCustomerId(request: SubdomainRequest): string | null {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const jwt = JSON.parse(atob(header.split(" ")[1].split(".")[1]));
    return jwt.customerId ?? null;
  } catch {
    return null;
  }
}

export async function createOrderController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id?.toString();
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const customerId = getCustomerId(request);
  if (!customerId) return sendFailure(response, "Not authenticated", 401);

  const sessionId = (request.headers["x-session-id"] as string) ?? `sess-${request.ip}`;

  const result = await createOrder(storeId, customerId, sessionId, request.body);
  return result.ok
    ? sendSuccess(response, result.data, "Order created", 201)
    : sendFailure(response, result.message);
}

export async function listOrdersController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id?.toString();
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const customerId = getCustomerId(request);
  if (!customerId) return sendFailure(response, "Not authenticated", 401);

  const result = await getCustomerOrders(storeId, customerId);
  return sendSuccess(response, result.data);
}

export async function getOrderController(request: SubdomainRequest, response: Response) {
  const customerId = getCustomerId(request);
  if (!customerId) return sendFailure(response, "Not authenticated", 401);

  const orderId = request.params.id as string;
  const result = await getOrderById(orderId, customerId);
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message, 404);
}
