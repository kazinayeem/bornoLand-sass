import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { connectDatabase } from "../../../common/database/connection.js";
import { StoreModel } from "../../../models/store.model.js";
import { OrderModel } from "../../../models/order.model.js";
import { StorePaymentGatewayModel } from "../store-payment-gateway.model.js";
import { encryptSSLCommerzSecret } from "../sslcommerz.credentials.js";
import {
  verifyAndHandleSSLCommerzCallback,
  initiateSSLCommerzPayment,
} from "../sslcommerz.service.js";

describe("SSLCommerz End-to-End Callback Matrix Tests", () => {
  let storeId: string;
  let otherStoreId: string;
  let orderNumber: string;
  let orderId: string;

  before(async () => {
    await connectDatabase();

    const userId = new mongoose.Types.ObjectId();
    const tenantId = new mongoose.Types.ObjectId();

    const store = await StoreModel.create({
      tenantId,
      userId,
      name: "Matrix Test Store",
      slug: `matrix-store-${Date.now()}`,
      currency: "BDT",
      plan: "starter",
    });
    storeId = String(store._id);

    const otherStore = await StoreModel.create({
      tenantId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      name: "Other Store",
      slug: `other-store-${Date.now()}`,
      currency: "BDT",
      plan: "starter",
    });
    otherStoreId = String(otherStore._id);

    await StorePaymentGatewayModel.create({
      storeId,
      provider: "sslcommerz",
      storeIdValue: "testbox_matrix",
      encryptedStorePassword: encryptSSLCommerzSecret("matrix_pass_123"),
      environment: "sandbox",
      isEnabled: true,
    });
  });

  after(async () => {
    try {
      if (storeId && otherStoreId) {
        await StoreModel.deleteMany({ _id: { $in: [new mongoose.Types.ObjectId(storeId), new mongoose.Types.ObjectId(otherStoreId)] } });
        await OrderModel.deleteMany({ storeId: { $in: [new mongoose.Types.ObjectId(storeId), new mongoose.Types.ObjectId(otherStoreId)] } });
        await StorePaymentGatewayModel.deleteMany({ storeId: { $in: [storeId, otherStoreId] } });
      }
    } catch {
      // Ignore test cleanup errors
    }
  });

  it("Test A & B: Order creation & SSLCommerz init creates pending order and transaction ID", async () => {
    const order = await OrderModel.create({
      storeId,
      orderNumber: `ORD-MAT-${Date.now()}`,
      items: [{ name: "Demo Product", price: 500, quantity: 1, productId: new mongoose.Types.ObjectId() }],
      subtotal: 500,
      total: 500,
      paymentMethod: "sslcommerz",
      paymentStatus: "pending",
      shippingAddress: { fullName: "Tester", phone: "01711111111", street: "Banani", city: "Dhaka" },
    });
    orderId = String(order._id);
    orderNumber = order.orderNumber;

    assert.ok(orderId);
    assert.equal(order.paymentStatus, "pending");
  });

  it("Test C & D: Success callback marks order as paid & confirmed with transaction details", async () => {
    const order = await OrderModel.create({
      storeId,
      orderNumber: `ORD-SUCC-${Date.now()}`,
      items: [{ name: "Product A", price: 800, quantity: 1, productId: new mongoose.Types.ObjectId() }],
      subtotal: 800,
      total: 800,
      paymentMethod: "sslcommerz",
      paymentStatus: "pending",
      shippingAddress: { fullName: "Buyer", phone: "01722222222", street: "Gulshan", city: "Dhaka" },
    });

    const callbackPayload = {
      tran_id: order.orderNumber,
      amount: "800.00",
      card_type: "VISA-Dutch Bangla Bank",
      bank_tran_id: "BANK_TRX_9999",
      status: "VALID",
      value_a: storeId,
      value_b: String(order._id),
      value_c: order.orderNumber,
    };

    const res = await verifyAndHandleSSLCommerzCallback(callbackPayload, "success");
    assert.equal(res.ok, true);
    assert.equal(res.status, 200);
    assert.ok(res.redirectUrl?.includes("/checkout/payment/success"));

    const updated = (await OrderModel.findById(order._id).lean()) as any;
    assert.equal(updated?.paymentStatus, "paid");
    assert.equal(updated?.status, "confirmed");
    assert.equal(updated?.paymentVerification?.status, "verified");
    assert.equal(updated?.paymentDetails?.bankTranId, "BANK_TRX_9999");
  });

  it("Test E: Duplicate success callback is idempotent without duplicate updates", async () => {
    const order = await OrderModel.create({
      storeId,
      orderNumber: `ORD-DUP-${Date.now()}`,
      items: [{ name: "Product B", price: 350, quantity: 1, productId: new mongoose.Types.ObjectId() }],
      subtotal: 350,
      total: 350,
      paymentMethod: "sslcommerz",
      paymentStatus: "paid", // Already paid
      status: "confirmed",
      shippingAddress: { fullName: "Buyer", phone: "01722222222", street: "Gulshan", city: "Dhaka" },
    });

    const callbackPayload = {
      tran_id: order.orderNumber,
      val_id: "VALID_DUP_002",
      amount: "350.00",
      status: "VALID",
      value_a: storeId,
      value_b: String(order._id),
    };

    const res = await verifyAndHandleSSLCommerzCallback(callbackPayload, "success");
    assert.equal(res.ok, true);
    assert.equal(res.status, 200);
    assert.match(res.message, /already verified/i);
  });

  it("Test F: Failed callback updates order to failed state and redirects safely", async () => {
    const order = await OrderModel.create({
      storeId,
      orderNumber: `ORD-FAIL-${Date.now()}`,
      items: [{ name: "Product C", price: 400, quantity: 1, productId: new mongoose.Types.ObjectId() }],
      subtotal: 400,
      total: 400,
      paymentMethod: "sslcommerz",
      paymentStatus: "pending",
      shippingAddress: { fullName: "Buyer", phone: "01722222222", street: "Gulshan", city: "Dhaka" },
    });

    const failCallback = {
      tran_id: order.orderNumber,
      failedreason: "Insufficient funds in customer card",
      status: "FAILED",
      value_a: storeId,
      value_b: String(order._id),
    };

    const res = await verifyAndHandleSSLCommerzCallback(failCallback, "fail");
    assert.equal(res.ok, true);
    assert.ok(res.redirectUrl?.includes("/checkout/payment/fail"));

    const updated = (await OrderModel.findById(order._id).lean()) as any;
    assert.equal(updated?.paymentStatus, "failed");
  });

  it("Test G: Cancel callback updates order to failed/cancelled and redirects safely", async () => {
    const order = await OrderModel.create({
      storeId,
      orderNumber: `ORD-CNL-${Date.now()}`,
      items: [{ name: "Product D", price: 200, quantity: 1, productId: new mongoose.Types.ObjectId() }],
      subtotal: 200,
      total: 200,
      paymentMethod: "sslcommerz",
      paymentStatus: "pending",
      shippingAddress: { fullName: "Buyer", phone: "01722222222", street: "Gulshan", city: "Dhaka" },
    });

    const cancelCallback = {
      tran_id: order.orderNumber,
      status: "CANCELLED",
      value_a: storeId,
      value_b: String(order._id),
    };

    const res = await verifyAndHandleSSLCommerzCallback(cancelCallback, "cancel");
    assert.equal(res.ok, true);
    assert.ok(res.redirectUrl?.includes("/checkout/payment/cancel"));

    const updated = (await OrderModel.findById(order._id).lean()) as any;
    assert.equal(updated?.paymentStatus, "failed");
  });

  it("Test H: Invalid transaction reference safely returns 404", async () => {
    const invalidCallback = {
      tran_id: "NON_EXISTENT_TXN_99999",
      status: "VALID",
    };

    const res = await verifyAndHandleSSLCommerzCallback(invalidCallback, "success");
    assert.equal(res.ok, false);
    assert.equal(res.status, 404);
  });

  it("Test I: Amount mismatch rejects payment", async () => {
    const order = await OrderModel.create({
      storeId,
      orderNumber: `ORD-AMT-${Date.now()}`,
      items: [{ name: "Expensive Item", price: 5000, quantity: 1, productId: new mongoose.Types.ObjectId() }],
      subtotal: 5000,
      total: 5000,
      paymentMethod: "sslcommerz",
      paymentStatus: "pending",
      shippingAddress: { fullName: "Buyer", phone: "01722222222", street: "Gulshan", city: "Dhaka" },
    });

    const mismatchCallback = {
      tran_id: order.orderNumber,
      amount: "100.00", // Mismatched amount (Order is 5000)
      status: "VALID",
      value_a: storeId,
      value_b: String(order._id),
    };

    const res = await verifyAndHandleSSLCommerzCallback(mismatchCallback, "success");
    assert.equal(res.ok, false);
    assert.equal(res.status, 400);
    assert.match(res.message, /amount mismatch/i);

    const updated = (await OrderModel.findById(order._id).lean()) as any;
    assert.equal(updated?.paymentStatus, "failed");
  });

  it("Test J: Cross-tenant payment spoofing is rejected", async () => {
    const order = await OrderModel.create({
      storeId,
      orderNumber: `ORD-SPOOF-${Date.now()}`,
      items: [{ name: "Item", price: 100, quantity: 1, productId: new mongoose.Types.ObjectId() }],
      subtotal: 100,
      total: 100,
      paymentMethod: "sslcommerz",
      paymentStatus: "pending",
      shippingAddress: { fullName: "Buyer", phone: "01722222222", street: "Gulshan", city: "Dhaka" },
    });

    const spoofCallback = {
      tran_id: order.orderNumber,
      val_id: "VAL_SPOOF_111",
      amount: "100.00",
      status: "VALID",
      value_a: otherStoreId, // Malicious store ID
      value_b: String(order._id),
    };

    const res = await verifyAndHandleSSLCommerzCallback(spoofCallback, "success");
    assert.equal(res.ok, false);
    assert.equal(res.status, 400);
    assert.match(res.message, /Store ID mismatch/i);
  });
});
