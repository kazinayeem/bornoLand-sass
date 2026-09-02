import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { connectDatabase } from "../../../common/database/connection.js";
import { StoreModel } from "../../../models/store.model.js";
import { CustomerModel } from "../../../models/customer.model.js";
import {
  registerCustomer,
  loginCustomer,
  requestCustomerPasswordReset,
} from "../customer.service.js";

describe("Customer Authentication Flow & Integration Test Suite", () => {
  let storeId: string;
  const testEmail = `cust-${Date.now()}@example.com`;
  const testPassword = "Password123!";

  before(async () => {
    await connectDatabase();

    const store = await StoreModel.create({
      tenantId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      name: "Auth Test Store",
      slug: `auth-store-${Date.now()}`,
      currency: "BDT",
      status: "active",
      billingStatus: "active",
      subscriptionStatus: "active",
    });
    storeId = String(store._id);
  });

  after(async () => {
    try {
      if (storeId) {
        await StoreModel.deleteOne({ _id: storeId });
        await CustomerModel.deleteMany({ storeId });
      }
    } catch (e) {
      console.warn("Cleanup error:", e);
    }
  });

  it("Test 1: Registers a new customer and hashes password securely", async () => {
    const result = await registerCustomer(storeId, {
      name: "Tanvir Hasan",
      email: testEmail,
      password: testPassword,
    });

    assert.equal(result.ok, true);
    assert.ok(result.data?.customer);
    assert.equal(result.data.customer.email, testEmail);
    assert.equal(result.data.customer.name, "Tanvir Hasan");
    assert.ok(result.data.token, "Token was issued on registration");

    const savedInDb = await CustomerModel.findById(result.data.customer._id);
    assert.ok(savedInDb);
    assert.notEqual(savedInDb.passwordHash, testPassword);
    assert.ok(savedInDb.passwordHash.length > 20);
  });

  it("Test 2: Prevents duplicate registration with the same email in the same store", async () => {
    const result = await registerCustomer(storeId, {
      name: "Duplicate User",
      email: testEmail,
      password: "AnotherPassword123",
    });

    assert.equal(result.ok, false);
    assert.match(result.message || "", /already registered|exists/i);
  });

  it("Test 3: Successfully logs in with valid credentials and issues JWT token", async () => {
    const result = await loginCustomer(storeId, {
      email: testEmail,
      password: testPassword,
    });

    assert.equal(result.ok, true);
    assert.ok(result.data?.token);
    assert.equal(result.data.customer.email, testEmail);
  });

  it("Test 4: Rejects login with incorrect password", async () => {
    const result = await loginCustomer(storeId, {
      email: testEmail,
      password: "WrongPassword999",
    });

    assert.equal(result.ok, false);
    assert.match(result.message || "", /invalid email or password/i);
  });

  it("Test 5: Handles password reset request gracefully", async () => {
    const result = await requestCustomerPasswordReset(storeId, testEmail);
    assert.equal(result.ok, true);
  });
});
