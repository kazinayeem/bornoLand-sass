import { connectDatabase } from "../config/database.js";
import { PaymentMethodModel } from "../models/payment-method.model.js";

export async function createPaymentMethod(
  storeId: string,
  payload: {
    type: string;
    label: string;
    accountNumber?: string;
    accountType?: string;
    instructions?: string;
    enabled?: boolean;
    sortOrder?: number;
  }
) {
  await connectDatabase();

  const method = await PaymentMethodModel.create({
    storeId,
    type: payload.type,
    label: payload.label,
    accountNumber: payload.accountNumber ?? "",
    accountType: payload.accountType ?? "",
    instructions: payload.instructions ?? "",
    enabled: payload.enabled ?? true,
    sortOrder: payload.sortOrder ?? 0,
  });

  return { ok: true as const, data: { paymentMethod: method.toObject() } };
}

export async function listPaymentMethods(storeId: string) {
  await connectDatabase();
  const methods = await PaymentMethodModel.find({ storeId })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  return { ok: true as const, data: { paymentMethods: methods } };
}

export async function updatePaymentMethod(
  id: string,
  storeId: string,
  payload: Partial<{
    type: string;
    label: string;
    accountNumber: string;
    accountType: string;
    instructions: string;
    enabled: boolean;
    sortOrder: number;
  }>
) {
  await connectDatabase();
  const method = await PaymentMethodModel.findOneAndUpdate(
    { _id: id, storeId },
    { $set: payload },
    { new: true }
  ).lean();
  if (!method) return { ok: false as const, message: "Payment method not found" };
  return { ok: true as const, data: { paymentMethod: method } };
}

export async function deletePaymentMethod(id: string, storeId: string) {
  await connectDatabase();
  const method = await PaymentMethodModel.findOneAndDelete({ _id: id, storeId }).lean();
  if (!method) return { ok: false as const, message: "Payment method not found" };
  return { ok: true as const, message: "Payment method deleted" };
}

export async function getEnabledPaymentMethods(storeId: string) {
  await connectDatabase();
  const methods = await PaymentMethodModel.find({ storeId, enabled: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  return { ok: true as const, data: { paymentMethods: methods } };
}
