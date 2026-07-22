import crypto from "crypto";
import type { Response } from "express";
import type { SubdomainRequest } from "../../common/middleware/subdomain.middleware.js";
import { createOrder, getCustomerOrders, getOrderById, trackOrderByNumber } from "./order.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import jwt from "jsonwebtoken";
import { generateOrderInvoice } from "./order-invoice.service.js";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

function getCustomerId(request: SubdomainRequest): string | null {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.verify(header.split(" ")[1], getJwtSecret()) as { customerId?: string };
    return decoded.customerId ?? null;
  } catch {
    return null;
  }
}

export async function createOrderController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id?.toString();
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const sessionHeader = request.headers["x-session-id"];
  const sessionId =
    typeof sessionHeader === "string" && sessionHeader.trim().length > 0
      ? sessionHeader.trim()
      : crypto.randomUUID();

  let customerId = getCustomerId(request);

  if (!customerId) {
    const guestEmail = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
    if (!guestEmail) return sendFailure(response, "Not authenticated", 401);

    const { createGuestCustomer } = await import("../customers/customer.service.js");
    const guest = await createGuestCustomer(storeId, guestEmail, request.body?.shippingAddress?.fullName);
    customerId = String(guest.data.customer._id);
  }

  console.info("[orders] createOrder request", {
    storeId,
    customerId,
    sessionId,
    cartId: request.body?.cartId ?? null,
    itemCount: Array.isArray(request.body?.items) ? request.body.items.length : 0,
  });

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
  const storeId = request.store?._id?.toString();
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const customerId = getCustomerId(request);
  if (!customerId) return sendFailure(response, "Not authenticated", 401);

  const result = await getOrderById(request.params.id as string, customerId);
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message, 404);
}

export async function trackOrderController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id?.toString() ?? (request.query.storeId as string | undefined);
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const orderNumber = typeof request.query.orderNumber === "string" ? request.query.orderNumber : "";
  const email = typeof request.query.email === "string" ? request.query.email : "";
  if (!orderNumber.trim() || !email.trim()) {
    return sendFailure(response, "Order number and email are required", 400);
  }

  const result = await trackOrderByNumber(storeId, orderNumber, email);
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message, 404);
}

export async function downloadOrderInvoiceController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id?.toString();
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const customerId = getCustomerId(request);
  if (!customerId) return sendFailure(response, "Not authenticated", 401);

  const result = await generateOrderInvoice({
    storeId,
    orderId: request.params.id as string,
    customerId,
  });

  if (!result.ok) {
    return sendFailure(response, result.message, result.message.includes("not found") ? 404 : 500);
  }

  response.setHeader("Content-Type", "application/pdf");
  response.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  response.setHeader("Content-Length", result.buffer.length);
  return response.send(result.buffer);
}
