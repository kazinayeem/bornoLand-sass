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

  const { StorePaymentGatewayModel } = await import("./store-payment-gateway.model.js");
  const { checkFeature } = await import("../features/feature-access.service.js");

  const gateway = (await StorePaymentGatewayModel.findOne({
    storeId,
    provider: "sslcommerz",
  }).lean()) as any;

  const entitlement = await checkFeature(storeId, "sslcommerz_payment");

  const isGatewayActive = Boolean(
    gateway &&
    gateway.isEnabled &&
    gateway.storeIdValue &&
    gateway.encryptedStorePassword &&
    entitlement.allowed
  );

  const filteredMethods = methods.filter((m) => {
    if (m.type === "sslcommerz") {
      return isGatewayActive;
    }
    return true;
  });

  // If SSLCommerz gateway is active and not explicitly in PaymentMethod collection, add it automatically
  if (isGatewayActive && !filteredMethods.some((m) => m.type === "sslcommerz")) {
    filteredMethods.push({
      _id: `sslcommerz_${storeId}` as never,
      storeId: storeId as never,
      type: "sslcommerz",
      label: "SSLCommerz (Cards / Mobile Banking / Net Banking)",
      accountNumber: "",
      accountType: "",
      instructions: "Pay securely via SSLCommerz gateway with Visa, Mastercard, bKash, Nagad, or Internet Banking.",
      logoUrl: "",
      bankName: "",
      branch: "",
      accountName: "",
      routingNumber: "",
      swift: "",
      enabled: true,
      sortOrder: 10,
      createdAt: new Date() as never,
      updatedAt: new Date() as never,
    } as never);
  }

  return { ok: true as const, data: { paymentMethods: filteredMethods } };
}

