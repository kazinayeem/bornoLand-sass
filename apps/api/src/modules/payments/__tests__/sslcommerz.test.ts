import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { connectDatabase } from "../../../common/database/connection.js";
import { StoreModel } from "../../stores/store.model.js";
import { PlanModel } from "../../plans/plan.model.js";
import { PlanFeatureModel } from "../../features/plan-feature.model.js";
import { OrderModel } from "../../orders/order.model.js";
import { FeatureModel } from "../../features/feature.model.js";
import { StorePaymentGatewayModel } from "../store-payment-gateway.model.js";
import {
  getStoreSSLCommerzConfig,
  updateStoreSSLCommerzConfig,
  testSSLCommerzConnection,
  toggleStoreSSLCommerz,
  initiateSSLCommerzPayment,
  verifyAndHandleSSLCommerzCallback,
} from "../sslcommerz.service.js";
import { decryptSSLCommerzSecret } from "../sslcommerz.credentials.js";

describe("Multi-Tenant SSLCommerz Payment Gateway System", () => {
  let userAId: string;
  let userBId: string;
  let storeAId: string;
  let storeBId: string;
  let freePlanId: string;
  let starterPlanId: string;

  before(async () => {
    await connectDatabase();

    userAId = new mongoose.Types.ObjectId().toString();
    userBId = new mongoose.Types.ObjectId().toString();

    // Ensure feature exists
    await FeatureModel.findOneAndUpdate(
      { key: "sslcommerz_payment" },
      {
        $set: {
          key: "sslcommerz_payment",
          name: "SSLCommerz Payment Gateway",
          type: "boolean",
          category: "payments",
          isActive: true,
        },
      },
      { upsert: true }
    );

    // Create Free plan (sslcommerz_payment disabled)
    const freePlan = await PlanModel.findOneAndUpdate(
      { slug: "test-free-plan" },
      {
        $set: {
          name: "Test Free Plan",
          slug: "test-free-plan",
          priceBDT: 0,
        },
      },
      { upsert: true, new: true }
    );
    freePlanId = String(freePlan._id);

    // Create Starter plan (sslcommerz_payment enabled)
    const starterPlan = await PlanModel.findOneAndUpdate(
      { slug: "test-starter-plan" },
      {
        $set: {
          name: "Test Starter Plan",
          slug: "test-starter-plan",
          priceBDT: 1500,
        },
      },
      { upsert: true, new: true }
    );
    starterPlanId = String(starterPlan._id);

    // Seed plan features
    await PlanFeatureModel.findOneAndUpdate(
      { planId: freePlan._id, featureKey: "sslcommerz_payment" },
      { $set: { enabled: false, limit: 0, tierKey: "disabled", value: "disabled" } },
      { upsert: true }
    );

    await PlanFeatureModel.findOneAndUpdate(
      { planId: starterPlan._id, featureKey: "sslcommerz_payment" },
      { $set: { enabled: true, limit: 0, tierKey: "enabled", value: "enabled" } },
      { upsert: true }
    );

    // Create Store A (owned by User A, starter plan)
    const storeA = await StoreModel.create({
      tenantId: new mongoose.Types.ObjectId(),
      userId: userAId,
      name: "Store Alpha",
      slug: `store-alpha-${Date.now()}`,
      planId: starterPlanId,
      plan: "starter",
      status: "active",
    });
    storeAId = String(storeA._id);

    // Create Store B (owned by User B, starter plan)
    const storeB = await StoreModel.create({
      tenantId: new mongoose.Types.ObjectId(),
      userId: userBId,
      name: "Store Beta",
      slug: `store-beta-${Date.now()}`,
      planId: starterPlanId,
      plan: "starter",
      status: "active",
    });
    storeBId = String(storeB._id);
  });

  after(async () => {
    // Cleanup test records
    await StorePaymentGatewayModel.deleteMany({ storeId: { $in: [storeAId, storeBId] } });
    await OrderModel.deleteMany({ storeId: { $in: [storeAId, storeBId] } });
    await StoreModel.deleteMany({ _id: { $in: [storeAId, storeBId] } });
    await PlanFeatureModel.deleteMany({ planId: { $in: [freePlanId, starterPlanId] } });
    await PlanModel.deleteMany({ _id: { $in: [freePlanId, starterPlanId] } });
    await mongoose.disconnect();
  });

  it("1. Shop A can configure SSLCommerz credentials with AES encryption", async () => {
    const res = await updateStoreSSLCommerzConfig(storeAId, userAId, "merchant", {
      storeIdValue: "store_a_test_id",
      storePassword: "SecretPasswordA@123",
      environment: "sandbox",
      isEnabled: true,
    });

    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.storeIdValue, "store_a_test_id");
      assert.equal(res.data.hasPassword, true);
      assert.equal(res.data.maskedPassword, "••••••••••••");
      assert.equal(res.data.environment, "sandbox");
      assert.equal(res.data.isEnabled, true);
    }

    // Verify database stored encrypted password and NOT plaintext
    const doc = (await StorePaymentGatewayModel.findOne({ storeId: storeAId, provider: "sslcommerz" }).lean()) as any;
    assert.ok(doc?.encryptedStorePassword);
    assert.notEqual(doc?.encryptedStorePassword, "SecretPasswordA@123");
    assert.equal(decryptSSLCommerzSecret(doc!.encryptedStorePassword), "SecretPasswordA@123");
  });

  it("2. Shop B can configure different credentials without conflict", async () => {
    const res = await updateStoreSSLCommerzConfig(storeBId, userBId, "merchant", {
      storeIdValue: "store_b_test_id",
      storePassword: "SecretPasswordB@456",
      environment: "live",
      isEnabled: true,
    });

    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.data.storeIdValue, "store_b_test_id");
      assert.equal(res.data.environment, "live");
    }

    const docB = (await StorePaymentGatewayModel.findOne({ storeId: storeBId, provider: "sslcommerz" }).lean()) as any;
    assert.equal(decryptSSLCommerzSecret(docB!.encryptedStorePassword), "SecretPasswordB@456");
  });

  it("3. Multi-Tenancy Isolation: User A cannot read or modify Shop B credentials (IDOR protection)", async () => {
    // User A trying to get Shop B config
    const getRes = await getStoreSSLCommerzConfig(storeBId, userAId, "merchant");
    assert.equal(getRes.ok, false);
    assert.equal(getRes.status, 404);

    // User A trying to update Shop B config
    const updateRes = await updateStoreSSLCommerzConfig(storeBId, userAId, "merchant", {
      storeIdValue: "hacked_id",
    });
    assert.equal(updateRes.ok, false);
    assert.equal(updateRes.status, 404);
  });

  it("4. Unsupported package (Free) cannot configure SSLCommerz", async () => {
    // Downgrade Store A to Free Plan
    await StoreModel.updateOne({ _id: storeAId }, { $set: { planId: freePlanId, plan: "free" } });

    const res = await updateStoreSSLCommerzConfig(storeAId, userAId, "merchant", {
      storeIdValue: "free_attempt",
    });

    assert.equal(res.ok, false);
    assert.equal(res.status, 403);
  });

  it("5. Package upgrade restores access to configure SSLCommerz", async () => {
    // Upgrade Store A back to Starter Plan
    await StoreModel.updateOne({ _id: storeAId }, { $set: { planId: starterPlanId, plan: "starter" } });

    const res = await updateStoreSSLCommerzConfig(storeAId, userAId, "merchant", {
      storeIdValue: "store_a_restored_id",
    });

    assert.equal(res.ok, true);
  });

  it("6. Disabled gateway cannot initialize payment", async () => {
    // Disable gateway on Store A
    await toggleStoreSSLCommerz(storeAId, userAId, "merchant", false);

    const order = await OrderModel.create({
      storeId: storeAId,
      orderNumber: `ORD-TEST-${Date.now()}`,
      items: [{ name: "Item 1", price: 500, quantity: 1, productId: new mongoose.Types.ObjectId() }],
      subtotal: 500,
      total: 500,
      paymentMethod: "sslcommerz",
      paymentStatus: "pending",
      shippingAddress: { fullName: "John Doe", phone: "01700000000", street: "Dhaka", city: "Dhaka" },
    });

    const initRes = await initiateSSLCommerzPayment(storeAId, String(order._id));
    assert.equal(initRes.ok, false);
    assert.equal(initRes.status, 400);
  });

  it("7. Enabled gateway handles sandbox vs live mode endpoint routing", async () => {
    await toggleStoreSSLCommerz(storeAId, userAId, "merchant", true);

    const cfgA = await getStoreSSLCommerzConfig(storeAId, userAId, "merchant");
    assert.equal(cfgA.ok, true);
    if (cfgA.ok) {
      assert.equal(cfgA.data.environment, "sandbox");
      assert.equal(cfgA.data.isEnabled, true);
    }

    const cfgB = await getStoreSSLCommerzConfig(storeBId, userBId, "merchant");
    assert.equal(cfgB.ok, true);
    if (cfgB.ok) {
      assert.equal(cfgB.data.environment, "live");
      assert.equal(cfgB.data.isEnabled, true);
    }
  });

  it("8. Wrong shop/order combination is rejected in callback", async () => {
    const order = await OrderModel.create({
      storeId: storeAId,
      orderNumber: `ORD-MISMATCH-${Date.now()}`,
      items: [{ name: "Item 1", price: 750, quantity: 1, productId: new mongoose.Types.ObjectId() }],
      subtotal: 750,
      total: 750,
      paymentMethod: "sslcommerz",
      paymentStatus: "pending",
      shippingAddress: { fullName: "Jane Doe", phone: "01700000000", street: "Dhaka", city: "Dhaka" },
    });

    const fakeCallback = {
      tran_id: order.orderNumber,
      val_id: "VALIDATION_123",
      value_a: storeBId, // Incorrect store ID
      value_b: String(order._id),
      status: "VALID",
    };

    const res = await verifyAndHandleSSLCommerzCallback(fakeCallback, "success");
    assert.equal(res.ok, false);
    assert.equal(res.status, 400);
    assert.match(res.message, /Store ID mismatch/i);
  });

  it("9. Customer cancel callback updates order status to failed / cancelled", async () => {
    const order = await OrderModel.create({
      storeId: storeAId,
      orderNumber: `ORD-CANCEL-${Date.now()}`,
      items: [{ name: "Item 1", price: 1000, quantity: 1, productId: new mongoose.Types.ObjectId() }],
      subtotal: 1000,
      total: 1000,
      paymentMethod: "sslcommerz",
      paymentStatus: "pending",
      shippingAddress: { fullName: "User Cancel", phone: "01700000000", street: "Dhaka", city: "Dhaka" },
    });

    const cancelCallback = {
      tran_id: order.orderNumber,
      value_a: storeAId,
      value_b: String(order._id),
      status: "CANCELLED",
    };

    const res = await verifyAndHandleSSLCommerzCallback(cancelCallback, "cancel");
    assert.equal(res.ok, true);

    const updatedOrder = (await OrderModel.findById(order._id).lean()) as any;
    assert.equal(updatedOrder?.paymentStatus, "failed");
  });

  it("10. Duplicate IPN callbacks are idempotent and do not duplicate updates", async () => {
    const order = await OrderModel.create({
      storeId: storeAId,
      orderNumber: `ORD-IDEM-${Date.now()}`,
      items: [{ name: "Item 1", price: 1200, quantity: 1, productId: new mongoose.Types.ObjectId() }],
      subtotal: 1200,
      total: 1200,
      paymentMethod: "sslcommerz",
      paymentStatus: "paid", // Already paid
      status: "confirmed",
      shippingAddress: { fullName: "Idem Test", phone: "01700000000", street: "Dhaka", city: "Dhaka" },
    });

    const ipnCallback = {
      tran_id: order.orderNumber,
      val_id: "VAL_IDEM_999",
      value_a: storeAId,
      value_b: String(order._id),
      status: "VALID",
    };

    const res = await verifyAndHandleSSLCommerzCallback(ipnCallback, "ipn");
    assert.equal(res.ok, true);
    assert.match(res.message, /already verified and paid/i);
  });

  it("11. Refund on unpaid order is rejected", async () => {
    const { refundSSLCommerzPayment } = await import("../sslcommerz.service.js");
    const order = await OrderModel.create({
      storeId: storeAId,
      orderNumber: `ORD-UNPAID-REF-${Date.now()}`,
      items: [{ name: "Item 1", price: 500, quantity: 1, productId: new mongoose.Types.ObjectId() }],
      subtotal: 500,
      total: 500,
      paymentMethod: "sslcommerz",
      paymentStatus: "pending",
      shippingAddress: { fullName: "Unpaid Test", phone: "01700000000", street: "Dhaka", city: "Dhaka" },
    });

    const res = await refundSSLCommerzPayment(storeAId, String(order._id), userAId, "merchant", 500);
    assert.equal(res.ok, false);
    assert.equal(res.status, 400);
    assert.match(res.message, /only paid orders can be refunded/i);
  });

  it("12. Refund from unauthorized shop owner is rejected (IDOR protection)", async () => {
    const { refundSSLCommerzPayment } = await import("../sslcommerz.service.js");
    const order = await OrderModel.create({
      storeId: storeAId,
      orderNumber: `ORD-IDOR-REF-${Date.now()}`,
      items: [{ name: "Item 1", price: 500, quantity: 1, productId: new mongoose.Types.ObjectId() }],
      subtotal: 500,
      total: 500,
      paymentMethod: "sslcommerz",
      paymentStatus: "paid",
      shippingAddress: { fullName: "IDOR Test", phone: "01700000000", street: "Dhaka", city: "Dhaka" },
    });

    // User B tries to refund Store A's order
    const res = await refundSSLCommerzPayment(storeAId, String(order._id), userBId, "merchant", 500);
    assert.equal(res.ok, false);
    assert.equal(res.status, 404);
    assert.match(res.message, /store not found/i);
  });
});
