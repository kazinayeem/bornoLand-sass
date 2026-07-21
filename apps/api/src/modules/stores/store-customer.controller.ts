import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { listStoreCustomers, getStoreCustomerDetail, updateStoreCustomer } from "../customers/customer.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { isValidObjectId } from "../../common/utils/object-id.js";
import { StoreModel } from "../../models/store.model.js";

export async function listStoreCustomersController(request: AuthRequest, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    const userId = request.user?.userId;
    const { search, page, limit, status } = request.query as Record<string, string>;

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) return response.status(404).json({ message: "Store not found" });

    const result = await listStoreCustomers(storeId, {
      search,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return sendSuccess(response, result.data);
  } catch (error) {
    console.error("listStoreCustomers error:", error);
    response.status(500).json({ message: "Failed to fetch customers" });
  }
}

export async function getStoreCustomerController(request: AuthRequest, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    const customerId = String(request.params.customerId ?? "");
    const userId = request.user?.userId;

    if (!isValidObjectId(customerId)) return sendFailure(response, "Invalid customer ID", 400);

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) return response.status(404).json({ message: "Store not found" });

    const result = await getStoreCustomerDetail(storeId, customerId);
    return result.ok
      ? sendSuccess(response, result.data)
      : sendFailure(response, result.message, 404);
  } catch (error) {
    console.error("getStoreCustomer error:", error);
    response.status(500).json({ message: "Failed to fetch customer" });
  }
}

export async function updateStoreCustomerController(request: AuthRequest, response: Response) {
  try {
    const storeId = String(request.params.storeId ?? "");
    const customerId = String(request.params.customerId ?? "");
    const userId = request.user?.userId;

    if (!isValidObjectId(customerId)) return sendFailure(response, "Invalid customer ID", 400);

    const store = await StoreModel.findOne({ _id: storeId, userId });
    if (!store) return response.status(404).json({ message: "Store not found" });

    const { name, email, phone, status, notes, tags } = request.body;
    const result = await updateStoreCustomer(storeId, customerId, { name, email, phone, status, notes, tags });
    return result.ok
      ? sendSuccess(response, result.data)
      : sendFailure(response, result.message, 404);
  } catch (error) {
    console.error("updateStoreCustomer error:", error);
    response.status(500).json({ message: "Failed to update customer" });
  }
}
