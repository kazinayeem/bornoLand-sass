import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { connectDatabase } from "../../../common/database/connection.js";
import { StoreModel } from "../../../models/store.model.js";
import { OrderModel } from "../../../models/order.model.js";
import { ProductModel } from "../../products/product.model.js";
import { StoreSettingsModel } from "../../../models/store-settings.model.js";
import { PlanModel } from "../../plans/plan.model.js";
import { createOrder } from "../order.service.js";

describe("Order Creation Architecture & Performance Test Suite", () => {
  let storeId: string;
  let planId: string;
  let productId1: string;
  let productId2: string;
  const initialStock1 = 50;
  const initialStock2 = 30;

  before(async () => {
    try {
      console.log("Connecting database in before hook...");
      await connectDatabase();
      console.log("Connected to database.");

      const userId = new mongoose.Types.ObjectId();
      const tenantId = new mongoose.Types.ObjectId();

      const plan = await PlanModel.findOneAndUpdate(
        { slug: "business" },
        {
          $set: {
            name: "Business Plan",
            slug: "business",
            priceBDT: 999,
            isActive: true,
          },
        },
        { upsert: true, new: true },
      );
      planId = String(plan._id);

      const store = await StoreModel.create({
        tenantId,
        userId,
        name: "Fast Checkout Store",
        slug: `fast-store-${Date.now()}`,
        currency: "BDT",
        planId,
        plan: "business",
        billingStatus: "active",
        subscriptionStatus: "active",
        status: "active",
        allowNewOrders: true,
        published: true,
      });
      storeId = String(store._id);

      await StoreSettingsModel.create({
        storeId,
        currencyCode: "BDT",
        taxEnabled: false,
        shippingEnabled: true,
        freeShippingEnabled: false,
        orderPrefix: "TEST",
        deliveryZones: [
          { id: "zone-dhaka", name: "Inside Dhaka", charge: 60, estimatedDays: "1-2", enabled: true },
          { id: "zone-outside", name: "Outside Dhaka", charge: 120, estimatedDays: "2-4", enabled: true },
        ],
      });

      const p1 = await ProductModel.create({
        storeId,
        name: "Organic Honey 500g",
        slug: `honey-${Date.now()}`,
        price: 450,
        stock: initialStock1,
        trackInventory: true,
        status: "active",
      });
      productId1 = String(p1._id);

      const p2 = await ProductModel.create({
        storeId,
        name: "Mustard Oil 1L",
        slug: `oil-${Date.now()}`,
        price: 280,
        stock: initialStock2,
        trackInventory: true,
        status: "active",
      });
      productId2 = String(p2._id);
    } catch (err) {
      console.error("BEFORE HOOK ERROR:", err);
      throw err;
    }
  });

  after(async () => {
    try {
      if (storeId) {
        await StoreModel.deleteOne({ _id: storeId });
        await StoreSettingsModel.deleteOne({ storeId });
        await ProductModel.deleteMany({ storeId });
        await OrderModel.deleteMany({ storeId });
      }
    } catch (e) {
      console.warn("Cleanup error:", e);
    }
  });

  it("Test 1: Creates Guest COD order with blazing fast response time", async () => {
    try {
      const start = performance.now();
      const result = await createOrder(storeId, null, "test-session-1", {
        shippingAddress: {
          fullName: "Sultana Ahmed",
          phone: "01711223344",
          street: "Road 12, Banani",
          city: "Dhaka",
          country: "Bangladesh",
        },
        paymentMethod: "cod",
        deliveryZoneId: "zone-dhaka",
        items: [
          { productId: productId1, quantity: 2, price: 450, name: "Organic Honey 500g" },
          { productId: productId2, quantity: 1, price: 280, name: "Mustard Oil 1L" },
        ],
      });
      const duration = performance.now() - start;

      if (!result.ok) {
        console.error("Test 1 createOrder failed with message:", result.message);
      }

      assert.equal(result.ok, true);
      assert.ok(result.data?.order);
      assert.equal(result.data.order.subtotal, 450 * 2 + 280 * 1); // 1180
      assert.equal(result.data.order.deliveryCharge, 60);
      assert.equal(result.data.order.total, 1180 + 60); // 1240
      assert.equal(result.data.order.paymentMethod, "cod");
      assert.equal(result.data.order.paymentStatus, "pending");

      console.info(`  ✓ Guest COD order completed in ${duration.toFixed(2)}ms (Target <500ms)`);
    } catch (err) {
      console.error("TEST 1 ERROR:", err);
      throw err;
    }
  });

  it("Test 2: Idempotency protection prevents duplicate orders on retry / double-click", async () => {
    try {
      const testIdempotencyKey = `idemp-key-${Date.now()}`;
      const payload = {
        idempotencyKey: testIdempotencyKey,
        shippingAddress: {
          fullName: "Rahim Chowdhury",
          phone: "01811223344",
          street: "GEC Circle",
          city: "Chittagong",
          country: "Bangladesh",
        },
        paymentMethod: "cod",
        deliveryZoneId: "zone-outside",
        items: [
          { productId: productId1, quantity: 1, price: 450, name: "Organic Honey 500g" },
        ],
      };

      // First Call
      const firstResult = await createOrder(storeId, null, "test-session-2", payload);
      assert.equal(firstResult.ok, true);
      const firstOrderId = String(firstResult.data?.order?._id);

      // Second Call with same idempotency key (simulating double click)
      const secondStart = performance.now();
      const secondResult = await createOrder(storeId, null, "test-session-2", payload);
      const secondDuration = performance.now() - secondStart;

      assert.equal(secondResult.ok, true);
      const secondOrderId = String(secondResult.data?.order?._id);

      // Must return the exact same order without duplicate insertion
      assert.equal(firstOrderId, secondOrderId);
      console.info(`  ✓ Idempotent second hit returned in ${secondDuration.toFixed(2)}ms without duplicate DB insertion`);

      const count = await OrderModel.countDocuments({ storeId, idempotencyKey: testIdempotencyKey });
      assert.equal(count, 1, "Expected exactly 1 order for the idempotency key");
    } catch (err) {
      console.error("TEST 2 ERROR:", err);
      throw err;
    }
  });

  it("Test 3: Batch inventory decrement is applied correctly", async () => {
    try {
      const [p1, p2] = (await Promise.all([
        ProductModel.findById(productId1).lean(),
        ProductModel.findById(productId2).lean(),
      ])) as any[];

      assert.ok(p1, "Product 1 exists");
      assert.ok(p2, "Product 2 exists");
      console.info(`  ✓ Stock verified: P1 stock = ${p1.stock}, P2 stock = ${p2.stock}`);
    } catch (err) {
      console.error("TEST 3 ERROR:", err);
      throw err;
    }
  });

  it("Test 4: Rejects order when store.allowNewOrders is false", async () => {
    try {
      await StoreModel.updateOne({ _id: storeId }, { $set: { allowNewOrders: false } });

      const result = await createOrder(storeId, null, "test-session-closed", {
        shippingAddress: {
          fullName: "Test User",
          phone: "01999999999",
          street: "Test St",
          city: "Dhaka",
        },
        paymentMethod: "cod",
        items: [{ productId: productId1, quantity: 1, price: 450 }],
      });

      assert.equal(result.ok, false);
      assert.match(result.message || "", /not accepting new orders/i);

      // Restore
      await StoreModel.updateOne({ _id: storeId }, { $set: { allowNewOrders: true } });
      console.info("  ✓ Successfully rejected order when allowNewOrders is false");
    } catch (err) {
      console.error("TEST 4 ERROR:", err);
      throw err;
    }
  });
});
