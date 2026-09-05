import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import dotenvFlow from "dotenv-flow";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, "../../../../");
const repoRoot = path.resolve(appDir, "../../");
dotenvFlow.config({ path: appDir, node_env: process.env.NODE_ENV ?? "development", silent: true });
dotenvFlow.config({ path: repoRoot, node_env: process.env.NODE_ENV ?? "development", silent: true });

import mongoose from "mongoose";
import { connectDatabase } from "../../../common/database/connection.js";
import { StoreModel } from "../../../models/store.model.js";
import { OrderModel } from "../../../models/order.model.js";
import { ProductModel } from "../../products/product.model.js";
import { CustomerModel } from "../../../models/customer.model.js";
import { StoreSettingsModel } from "../../../models/store-settings.model.js";
import { PlanModel } from "../../plans/plan.model.js";
import { createOrder } from "../order.service.js";

describe("BornoLand POS Terminal Flow & Sales Completion Test Suite", () => {
  let storeId: string;
  let planId: string;
  let productId1: string;
  let productId2: string;
  const initialStock1 = 100;
  const initialStock2 = 50;

  before(async () => {
    await connectDatabase();

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
      name: "BornoLand POS Flagship Store",
      slug: `pos-store-${Date.now()}`,
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
      shippingEnabled: false,
      freeShippingEnabled: false,
      orderPrefix: "POS",
      invoicePrefix: "INV",
    });

    const p1 = await ProductModel.create({
      storeId,
      name: "Signature Canvas Tote",
      slug: `canvas-tote-${Date.now()}`,
      price: 650,
      stock: initialStock1,
      trackInventory: true,
      status: "active",
    });
    productId1 = String(p1._id);

    const p2 = await ProductModel.create({
      storeId,
      name: "Ceramic Coffee Mug",
      slug: `coffee-mug-${Date.now()}`,
      price: 250,
      stock: initialStock2,
      trackInventory: true,
      status: "active",
    });
    productId2 = String(p2._id);
  });

  after(async () => {
    try {
      if (storeId) {
        await StoreModel.deleteOne({ _id: storeId });
        await StoreSettingsModel.deleteOne({ storeId });
        await ProductModel.deleteMany({ storeId });
        await OrderModel.deleteMany({ storeId });
        await CustomerModel.deleteMany({ storeId });
      }
      await mongoose.connection.close();
    } catch (e) {
      console.warn("Cleanup error:", e);
    }
  });

  it("1. Successfully completes Cash POS sale with Delivered status and Paid payment", async () => {
    const p1Before = (await ProductModel.findById(productId1).lean()) as any;
    const stockBefore = p1Before?.stock ?? 0;

    const payload = {
      isPos: true,
      channel: "pos" as const,
      paymentMethod: "cash",
      tenderedAmount: 1000,
      changeAmount: 350,
      paymentDetails: {
        tenderedAmount: 1000,
        changeAmount: 350,
      },
      items: [
        {
          productId: productId1,
          quantity: 1,
          price: 650,
          name: "Signature Canvas Tote",
        },
      ],
      shippingAddress: {
        fullName: "Walk-in Customer",
        phone: "01700000000",
        street: "POS Register 1",
        city: "Dhaka",
      },
    };

    const res = await createOrder(storeId, null, "pos-session-1", payload);
    assert.equal(res.ok, true, "POS sale should succeed");
    if (!res.ok) return;

    const order = res.data.order;
    assert.equal(order.status, "delivered", "POS order status must be 'delivered'");
    assert.equal(order.paymentStatus, "paid", "POS payment status must be 'paid'");
    assert.equal(order.paymentMethod, "cash", "Payment method must be cash");
    assert.equal(order.channel, "pos", "Order channel must be pos");
    assert.equal(order.isPos, true, "isPos must be true");

    // Inventory check
    const p1After = (await ProductModel.findById(productId1).lean()) as any;
    assert.equal(p1After?.stock, stockBefore - 1, "Stock must be decremented by exactly 1");

    // DB Persistence check
    const dbOrder = (await OrderModel.findById(order._id).lean()) as any;
    assert.ok(dbOrder, "Order must persist in DB");
    assert.equal(dbOrder?.status, "delivered");
    assert.equal(dbOrder?.paymentStatus, "paid");
    assert.equal(dbOrder?.paymentDetails?.tenderedAmount, 1000);
    assert.equal(dbOrder?.paymentDetails?.changeAmount, 350);
  });

  it("2. Successfully completes Card POS sale with Delivered and Paid status", async () => {
    const p2Before = (await ProductModel.findById(productId2).lean()) as any;
    const stockBefore = p2Before?.stock ?? 0;

    const payload = {
      isPos: true,
      channel: "pos" as const,
      paymentMethod: "card",
      items: [
        {
          productId: productId2,
          quantity: 2,
          price: 250,
          name: "Ceramic Coffee Mug",
        },
      ],
      shippingAddress: {
        fullName: "Walk-in Customer",
        phone: "01700000000",
        street: "POS Register 1",
        city: "Dhaka",
      },
    };

    const res = await createOrder(storeId, null, "pos-session-2", payload);
    assert.equal(res.ok, true);
    if (!res.ok) return;

    const order = res.data.order;
    assert.equal(order.status, "delivered");
    assert.equal(order.paymentStatus, "paid");
    assert.equal(order.paymentMethod, "card");

    const p2After = (await ProductModel.findById(productId2).lean()) as any;
    assert.equal(p2After?.stock, stockBefore - 2, "Stock must be decremented by 2");
  });

  it("3. Regular online storefront checkout remains pending / pending", async () => {
    const payload = {
      isPos: false,
      channel: "online" as const,
      paymentMethod: "cod",
      items: [
        {
          productId: productId2,
          quantity: 1,
          price: 250,
          name: "Ceramic Coffee Mug",
        },
      ],
      shippingAddress: {
        fullName: "Online Shopper",
        phone: "01811111111",
        street: "Gulshan 2",
        city: "Dhaka",
      },
    };

    const res = await createOrder(storeId, null, "online-session-1", payload);
    assert.equal(res.ok, true);
    if (!res.ok) return;

    const order = res.data.order;
    assert.equal(order.status, "pending", "Online order must remain pending");
    assert.equal(order.paymentStatus, "pending", "Online order payment must remain pending");
    assert.equal(order.channel, "online");
  });

  it("4. Idempotency prevents duplicate order and duplicate stock deduction", async () => {
    const p1Before = (await ProductModel.findById(productId1).lean()) as any;
    const stockBefore = p1Before?.stock ?? 0;

    const idempotencyKey = `pos_test_idem_${Date.now()}`;
    const payload = {
      isPos: true,
      idempotencyKey,
      paymentMethod: "cash",
      items: [
        {
          productId: productId1,
          quantity: 2,
          price: 650,
          name: "Signature Canvas Tote",
        },
      ],
      shippingAddress: {
        fullName: "Walk-in Customer",
        phone: "01700000000",
        street: "Counter Sales",
        city: "Dhaka",
      },
    };

    const res1 = await createOrder(storeId, null, "pos-session-idem", payload);
    assert.equal(res1.ok, true);

    const stockAfterFirst = ((await ProductModel.findById(productId1).lean()) as any)?.stock ?? 0;
    assert.equal(stockAfterFirst, stockBefore - 2);

    // Second immediate submission with same idempotencyKey
    const res2 = await createOrder(storeId, null, "pos-session-idem", payload);
    assert.equal(res2.ok, true);
    assert.equal(String(res1.data.order._id), String(res2.data.order._id), "Must return the same order");

    // Ensure stock was NOT decremented a second time
    const stockAfterSecond = ((await ProductModel.findById(productId1).lean()) as any)?.stock ?? 0;
    assert.equal(stockAfterSecond, stockAfterFirst, "Stock must NOT be decremented twice");
  });

  it("5. Insufficient stock prevents order creation and preserves stock", async () => {
    const p2Before = (await ProductModel.findById(productId2).lean()) as any;
    const currentStock = p2Before?.stock ?? 0;

    const payload = {
      isPos: true,
      paymentMethod: "cash",
      items: [
        {
          productId: productId2,
          quantity: currentStock + 50, // Request more than available
          price: 250,
          name: "Ceramic Coffee Mug",
        },
      ],
      shippingAddress: {
        fullName: "Walk-in Customer",
        phone: "01700000000",
        street: "Counter Sales",
        city: "Dhaka",
      },
    };

    const res = await createOrder(storeId, null, "pos-session-overstock", payload);
    assert.equal(res.ok, false, "Should fail due to insufficient stock");
    assert.ok(res.message.includes("Insufficient stock"));

    const p2After = (await ProductModel.findById(productId2).lean()) as any;
    assert.equal(p2After?.stock, currentStock, "Stock must remain unchanged");
  });

  it("6. Recent orders query returns paymentStatus: paid and status: delivered", async () => {
    const orders = await OrderModel.find({ storeId, isPos: true })
      .select("_id orderNumber invoiceNumber total subtotal discount tax paymentMethod paymentStatus status createdAt items")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    assert.ok(orders.length > 0, "Should have POS orders");
    const deliveredPaid = orders.find((o) => o.status === "delivered");
    assert.ok(deliveredPaid, "Must have delivered POS order");
    assert.equal(deliveredPaid?.paymentStatus, "paid", "Recent order must have paymentStatus: 'paid'");
  });
});
