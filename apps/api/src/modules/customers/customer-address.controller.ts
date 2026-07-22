import type { Response } from "express";
import type { SubdomainRequest } from "../../common/middleware/subdomain.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  listCustomerAddresses,
  setDefaultCustomerAddress,
  updateCustomerAddress,
} from "./customer-address.service.js";

function getStoreAndCustomer(request: SubdomainRequest) {
  const storeId = request.store?._id?.toString();
  const customerId = (request as SubdomainRequest & { customerId?: string }).customerId;
  return { storeId, customerId };
}

export async function listCustomerAddressesController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId } = getStoreAndCustomer(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  if (!customerId) return sendFailure(response, "Not authenticated", 401);
  const result = await listCustomerAddresses(storeId, customerId);
  return sendSuccess(response, result.data);
}

export async function createCustomerAddressController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId } = getStoreAndCustomer(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  if (!customerId) return sendFailure(response, "Not authenticated", 401);
  const result = await createCustomerAddress(storeId, customerId, request.body);
  return result.ok ? sendSuccess(response, result.data, "Address saved", 201) : sendFailure(response, result.message);
}

export async function updateCustomerAddressController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId } = getStoreAndCustomer(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  if (!customerId) return sendFailure(response, "Not authenticated", 401);
  const result = await updateCustomerAddress(storeId, customerId, String(request.params.id), request.body);
  return result.ok ? sendSuccess(response, result.data, "Address updated") : sendFailure(response, result.message, 404);
}

export async function deleteCustomerAddressController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId } = getStoreAndCustomer(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  if (!customerId) return sendFailure(response, "Not authenticated", 401);
  const result = await deleteCustomerAddress(storeId, customerId, String(request.params.id));
  return result.ok ? sendSuccess(response, result.data, "Address deleted") : sendFailure(response, result.message, 404);
}

export async function setDefaultCustomerAddressController(request: SubdomainRequest, response: Response) {
  const { storeId, customerId } = getStoreAndCustomer(request);
  if (!storeId) return sendFailure(response, "Store not found", 404);
  if (!customerId) return sendFailure(response, "Not authenticated", 401);
  const result = await setDefaultCustomerAddress(storeId, customerId, String(request.params.id));
  return result.ok ? sendSuccess(response, result.data, "Default address updated") : sendFailure(response, result.message, 404);
}
