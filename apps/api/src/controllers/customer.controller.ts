import type { Response } from "express";
import type { SubdomainRequest } from "../middleware/subdomain.middleware.js";
import { registerCustomer, loginCustomer, getCustomerById } from "../services/customer.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "bornoland-customer-secret";

export async function registerController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id;
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const { name, email, password } = request.body;
  if (!name || !email || !password) return sendFailure(response, "Name, email, and password required");

  const result = await registerCustomer(storeId.toString(), { name, email, password });
  return result.ok
    ? sendSuccess(response, result.data, "Registered", 201)
    : sendFailure(response, result.message);
}

export async function loginController(request: SubdomainRequest, response: Response) {
  const storeId = request.store?._id;
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const { email, password } = request.body;
  if (!email || !password) return sendFailure(response, "Email and password required");

  const result = await loginCustomer(storeId.toString(), { email, password });
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message, 401);
}

export async function meController(request: SubdomainRequest, response: Response) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return sendFailure(response, "Not authenticated", 401);

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as { customerId: string };
    const result = await getCustomerById(decoded.customerId);
    return result.ok
      ? sendSuccess(response, result.data)
      : sendFailure(response, result.message, 404);
  } catch {
    return sendFailure(response, "Invalid token", 401);
  }
}
