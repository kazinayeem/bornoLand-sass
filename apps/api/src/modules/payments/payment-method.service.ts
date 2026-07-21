import { connectDatabase } from "../../common/database/connection.js";
import { PaymentMethodModel } from "../../models/payment-method.model.js";

type PaymentPayload = {
  type: string;
  label: string;
  accountNumber?: string;
  accountType?: string;
  instructions?: string;
  logoUrl?: string;
  bankName?: string;
  branch?: string;
  accountName?: string;
  routingNumber?: string;
  swift?: string;
  enabled?: boolean;
  sortOrder?: number;
};

export async function createPaymentMethod(storeId: string, payload: PaymentPayload) {
  await connectDatabase();

  const method = await PaymentMethodModel.create({
    storeId,
    type: payload.type,
    label: payload.label,
    accountNumber: payload.accountNumber ?? "",
    accountType: payload.accountType ?? "",
    instructions: payload.instructions ?? "",
    logoUrl: payload.logoUrl ?? "",
    bankName: payload.bankName ?? "",
    branch: payload.branch ?? "",
    accountName: payload.accountName ?? "",
    routingNumber: payload.routingNumber ?? "",
    swift: payload.swift ?? "",
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
  payload: Partial<PaymentPayload>
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
