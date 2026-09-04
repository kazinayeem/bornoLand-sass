import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import dotenvFlow from "dotenv-flow";
import mongoose from "mongoose";

dotenvFlow.config({ path: path.resolve(import.meta.dirname, "../../../.."), silent: true });
dotenvFlow.config({ path: path.resolve(import.meta.dirname, "../../../../../"), silent: true });

import { connectDatabase } from "../../../common/database/connection.js";
import { PlanModel } from "../plan.model.js";
import { updatePlan } from "../plan.service.js";
import { updatePlanSchema } from "../plan.validator.js";
import { getPlanFeatures } from "../../features/feature.service.js";
import { checkFeature } from "../../features/feature-access.service.js";
import { StoreModel } from "../../stores/store.model.js";
import { UserModel } from "../../users/user.model.js";

describe("Plan Builder Feature Persistence & Entitlement Test Suite", () => {
  let testPlanId: string;
  let testStoreId: string;
  let testUserId: string;

  before(async () => {
    await connectDatabase();

    const tenantId = new mongoose.Types.ObjectId();
    const user = await UserModel.create({
      email: `plan-test-owner-${Date.now()}@bornoland.test`,
      name: "Plan Test Owner",
      passwordHash: "dummyHash123",
      tenantId,
      role: "owner",
      status: "active",
    });
    testUserId = String(user._id);

    // Create a base plan
    const initialPlan = await PlanModel.create({
      name: "Persistence Test Plan",
      slug: `persist-test-${Date.now()}`,
      priceBDT: 1999,
      features: ["All basic tools"],
      featureToggles: {
        hrm: false,
        hrmEmployees: false,
        hrmAttendance: false,
        hrmPayroll: false,
        hrmLeave: false,
        hrmSelfService: false,
        erpCore: false,
        erpFinance: false,
        erpInventory: false,
        erpProcurement: false,
        erpManufacturing: false,
        erpProjects: false,
      },
    });
    testPlanId = String(initialPlan._id);

    // Create a store on this plan
    const store = await StoreModel.create({
      name: "Persistence Test Store",
      slug: `persist-store-${Date.now()}`,
      tenantId,
      userId: user._id,
      planId: initialPlan._id,
      plan: "business",
      status: "active",
      billingStatus: "active",
      subscriptionStatus: "active",
    });
    testStoreId = String(store._id);
  });

  after(async () => {
    if (testPlanId) await PlanModel.findByIdAndDelete(testPlanId);
    if (testStoreId) await StoreModel.findByIdAndDelete(testStoreId);
    if (testUserId) await UserModel.findByIdAndDelete(testUserId);
    await mongoose.disconnect();
  });

  it("1. updatePlanSchema parses and retains HRM and ERP feature toggles without stripping", () => {
    const rawPayload = {
      featureToggles: {
        hrm: true,
        hrmEmployees: true,
        hrmAttendance: true,
        hrmLeave: true,
        hrmPayroll: true,
        hrmSelfService: true,
        erpCore: true,
        erpFinance: true,
        erpInventory: true,
        erpProcurement: true,
        erpManufacturing: true,
        erpProjects: true,
        pos: true,
        accounting: true,
        crm: true,
        operations: true,
        inventory: true,
      },
    };

    const parsed = updatePlanSchema.safeParse(rawPayload);
    assert.equal(parsed.success, true, "Zod updatePlanSchema validation should succeed");
    if (!parsed.success) return;

    assert.equal(parsed.data.featureToggles?.hrm, true, "hrm should be retained");
    assert.equal(parsed.data.featureToggles?.hrmEmployees, true, "hrmEmployees should be retained");
    assert.equal(parsed.data.featureToggles?.hrmAttendance, true, "hrmAttendance should be retained");
    assert.equal(parsed.data.featureToggles?.hrmLeave, true, "hrmLeave should be retained");
    assert.equal(parsed.data.featureToggles?.hrmPayroll, true, "hrmPayroll should be retained");
    assert.equal(parsed.data.featureToggles?.hrmSelfService, true, "hrmSelfService should be retained");
    assert.equal(parsed.data.featureToggles?.erpCore, true, "erpCore should be retained");
    assert.equal(parsed.data.featureToggles?.erpFinance, true, "erpFinance should be retained");
    assert.equal(parsed.data.featureToggles?.erpInventory, true, "erpInventory should be retained");
    assert.equal(parsed.data.featureToggles?.erpProcurement, true, "erpProcurement should be retained");
    assert.equal(parsed.data.featureToggles?.erpManufacturing, true, "erpManufacturing should be retained");
    assert.equal(parsed.data.featureToggles?.erpProjects, true, "erpProjects should be retained");
  });

  it("2. Save + Reload: Enabling HRM Module and ERP Core persists to DB and returns on fresh read", async () => {
    const updateResult = await updatePlan(testPlanId, {
      featureToggles: {
        hrm: true,
        erpCore: true,
      },
    });

    assert.equal(updateResult.ok, true, "updatePlan should succeed");

    // Fetch directly from database model
    const dbPlan = (await PlanModel.findById(testPlanId).lean()) as any;
    assert.ok(dbPlan, "Plan must exist in DB");
    assert.equal(dbPlan?.featureToggles?.hrm, true, "DB featureToggles.hrm must be true");
    assert.equal(dbPlan?.featureToggles?.erpCore, true, "DB featureToggles.erpCore must be true");

    // Fetch via feature matrix service (API endpoint handler)
    const apiFeatures = await getPlanFeatures(testPlanId);
    assert.equal(apiFeatures.ok, true, "getPlanFeatures should succeed");
    if (!apiFeatures.ok) return;

    const hrmFeature = apiFeatures.data.features.find((f) => f.featureKey === "hrm");
    const erpCoreFeature = apiFeatures.data.features.find((f) => f.featureKey === "erp_core");

    assert.ok(hrmFeature, "hrm feature must exist in matrix");
    assert.equal(hrmFeature?.enabled, true, "hrm feature must be enabled in matrix");

    assert.ok(erpCoreFeature, "erp_core feature must exist in matrix");
    assert.equal(erpCoreFeature?.enabled, true, "erp_core feature must be enabled in matrix");
  });

  it("3. Uncheck Test: Disabling HRM Module persists OFF state to DB and returns disabled on fresh read", async () => {
    const updateResult = await updatePlan(testPlanId, {
      featureToggles: {
        hrm: false,
        erpCore: true,
      },
    });

    assert.equal(updateResult.ok, true, "updatePlan should succeed");

    // Fetch directly from DB
    const dbPlan = (await PlanModel.findById(testPlanId).lean()) as any;
    assert.equal(dbPlan?.featureToggles?.hrm, false, "DB featureToggles.hrm must be false");
    assert.equal(dbPlan?.featureToggles?.erpCore, true, "DB featureToggles.erpCore must remain true");

    // Fetch via feature matrix service
    const apiFeatures = await getPlanFeatures(testPlanId);
    assert.equal(apiFeatures.ok, true, "getPlanFeatures should succeed");
    if (!apiFeatures.ok) return;

    const hrmFeature = apiFeatures.data.features.find((f) => f.featureKey === "hrm");
    const erpCoreFeature = apiFeatures.data.features.find((f) => f.featureKey === "erp_core");

    assert.equal(hrmFeature?.enabled, false, "hrm feature must be false in matrix after uncheck");
    assert.equal(erpCoreFeature?.enabled, true, "erp_core feature must remain true");
  });

  it("4. Multiple Feature Test: Enabling full HRM and ERP suites persists all selected features", async () => {
    const fullPayload = {
      featureToggles: {
        // Full HRM Suite
        hrm: true,
        hrmEmployees: true,
        hrmAttendance: true,
        hrmLeave: true,
        hrmPayroll: true,
        hrmSelfService: true,
        // Full ERP Suite
        erpCore: true,
        erpFinance: true,
        erpInventory: true,
        erpProcurement: true,
        erpManufacturing: true,
        erpProjects: true,
      },
    };

    const updateResult = await updatePlan(testPlanId, fullPayload);
    assert.equal(updateResult.ok, true, "updatePlan should succeed");

    // Verify in database
    const dbPlan = (await PlanModel.findById(testPlanId).lean()) as any;
    assert.equal(dbPlan?.featureToggles?.hrm, true);
    assert.equal(dbPlan?.featureToggles?.hrmEmployees, true);
    assert.equal(dbPlan?.featureToggles?.hrmAttendance, true);
    assert.equal(dbPlan?.featureToggles?.hrmLeave, true);
    assert.equal(dbPlan?.featureToggles?.hrmPayroll, true);
    assert.equal(dbPlan?.featureToggles?.hrmSelfService, true);
    assert.equal(dbPlan?.featureToggles?.erpCore, true);
    assert.equal(dbPlan?.featureToggles?.erpFinance, true);
    assert.equal(dbPlan?.featureToggles?.erpInventory, true);
    assert.equal(dbPlan?.featureToggles?.erpProcurement, true);
    assert.equal(dbPlan?.featureToggles?.erpManufacturing, true);
    assert.equal(dbPlan?.featureToggles?.erpProjects, true);

    // Verify matrix API response
    const matrixRes = await getPlanFeatures(testPlanId);
    assert.equal(matrixRes.ok, true);
    if (!matrixRes.ok) return;

    const expectedKeys = [
      "hrm", "employees", "attendance", "leave_mgmt", "payroll", "self_service",
      "erp_core", "erp_finance", "erp_inventory", "erp_procurement", "erp_manufacturing", "erp_projects"
    ];

    const featuresList: any[] = matrixRes.data.features;
    for (const key of expectedKeys) {
      const matchFeat = featuresList.find((f) => f.featureKey === key);
      assert.ok(matchFeat, `Feature "${key}" must exist in matrix`);
      assert.equal(matchFeat?.enabled, true, `Feature "${key}" must be enabled in matrix`);
    }
  });

  it("5. Downstream store feature access check reflects the persisted plan configuration", async () => {
    // With full suite enabled on plan:
    const hrmCheck = await checkFeature(testStoreId, "hrm");
    assert.equal(hrmCheck.allowed, true, "Store on HRM-enabled plan should have access to HRM");

    const employeesCheck = await checkFeature(testStoreId, "employees");
    assert.equal(employeesCheck.allowed, true, "Store on HRM-enabled plan should have access to employees");

    const erpCoreCheck = await checkFeature(testStoreId, "erp_core");
    assert.equal(erpCoreCheck.allowed, true, "Store on ERP-enabled plan should have access to erp_core");

    const erpProcurementCheck = await checkFeature(testStoreId, "erp_procurement");
    assert.equal(erpProcurementCheck.allowed, true, "Store on ERP-enabled plan should have access to erp_procurement");
  });
});
