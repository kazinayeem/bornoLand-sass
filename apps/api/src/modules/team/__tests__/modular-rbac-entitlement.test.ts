import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../../../common/database/connection.js";
import { UserModel } from "../../users/user.model.js";
import { StoreModel } from "../../stores/store.model.js";
import { PlanModel } from "../../plans/plan.model.js";
import { StoreMemberModel } from "../store-member.model.js";
import {
  validateModuleDependencies,
  resolveRequiredModules,
  CANONICAL_MODULE_REGISTRY,
} from "../../../common/constants/modules.js";
import {
  checkStoreModuleEntitlement,
  getStoreEntitledModules,
} from "../../../common/services/module-entitlement.service.js";
import {
  inviteStoreMember,
  getEffectiveUserPermissions,
} from "../team.service.js";
import {
  hasPermission,
  roleToPermissions,
} from "../../../common/types/permissions.js";

describe("Unified Member, RBAC & Modular Entitlement Test Suite", () => {
  let storeAId: string;
  let storeBId: string;
  let ownerAId: string;
  let planModularId: string;
  let tenantAId: mongoose.Types.ObjectId;

  before(async () => {
    await connectDatabase();

    tenantAId = new mongoose.Types.ObjectId();
    const ownerA = await UserModel.create({
      email: `owner-${Date.now()}@bornoland.test`,
      name: "Owner A",
      passwordHash: await bcrypt.hash("Password123!", 10),
      tenantId: tenantAId,
      role: "user",
      status: "active",
    });
    ownerAId = String(ownerA._id);

    // Create a modular plan with commerce, pos, and inventory enabled
    const plan = await PlanModel.create({
      name: "Business Modular",
      slug: `business-mod-${Date.now()}`,
      priceBDT: 2999,
      features: ["commerce", "pos", "inventory"],
      featureToggles: {
        pos: true,
        inventory: true,
        warehousesEnabled: false, // Warehouse NOT enabled
        staffManagement: true,
      },
      limits: {
        staff: 10,
        products: 1000,
      },
    });
    planModularId = String(plan._id);

    const storeA = await StoreModel.create({
      tenantId: tenantAId,
      userId: ownerA._id,
      name: "Store A",
      slug: `store-a-${Date.now()}`,
      subdomain: `store-a-${Date.now()}`,
      planId: plan._id,
      status: "active",
      billingStatus: "active",
      subscriptionStatus: "active",
    });
    storeAId = String(storeA._id);

    const storeB = await StoreModel.create({
      tenantId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      name: "Store B",
      slug: `store-b-${Date.now()}`,
      subdomain: `store-b-${Date.now()}`,
      status: "active",
      billingStatus: "active",
      subscriptionStatus: "active",
    });
    storeBId = String(storeB._id);
  });

  after(async () => {
    // Cleanup created test records
    await StoreMemberModel.deleteMany({ storeId: { $in: [storeAId, storeBId] } });
    await StoreModel.deleteMany({ _id: { $in: [storeAId, storeBId] } });
    await PlanModel.deleteMany({ _id: planModularId });
    await UserModel.deleteMany({ tenantId: tenantAId });
  });

  it("1. Canonical Module Dependencies: resolves and validates prerequisite chains", () => {
    // Warehouse requires inventory
    const invalidDeps = validateModuleDependencies(["warehouse"]);
    assert.equal(invalidDeps.valid, false, "Warehouse alone without inventory must fail validation");
    assert.deepEqual(invalidDeps.missingDependencies.warehouse, ["inventory"]);

    // POS requires commerce
    const validDeps = validateModuleDependencies(["commerce", "pos", "inventory", "warehouse"]);
    assert.equal(validDeps.valid, true, "Full dependency chain must pass validation");

    // Auto-resolution
    const resolved = resolveRequiredModules(["warehouse", "pos"]);
    assert.ok(resolved.includes("inventory"), "Resolved modules must automatically include inventory");
    assert.ok(resolved.includes("commerce"), "Resolved modules must automatically include commerce");
  });

  it("2. Modular Entitlement: Store A has commerce, pos, and inventory, but NOT warehouse", async () => {
    const entitledModules = await getStoreEntitledModules(storeAId);
    assert.ok(entitledModules.includes("commerce"), "Store A must have commerce entitled");
    assert.ok(entitledModules.includes("pos"), "Store A must have pos entitled");
    assert.ok(entitledModules.includes("inventory"), "Store A must have inventory entitled");
    assert.equal(entitledModules.includes("warehouse"), false, "Store A must NOT have warehouse entitled");

    const posEntitlement = await checkStoreModuleEntitlement(storeAId, "pos");
    assert.equal(posEntitlement.entitled, true, "POS check must return entitled: true");

    const warehouseEntitlement = await checkStoreModuleEntitlement(storeAId, "warehouse");
    assert.equal(warehouseEntitlement.entitled, false, "Warehouse check must return entitled: false");
    assert.equal(warehouseEntitlement.code, "MODULE_NOT_ENTITLED");
  });

  it("3. Member Creation: Creates new user with hashed password and active StoreMember", async () => {
    const memberEmail = `staff-${Date.now()}@bornoland.test`;
    const result = await inviteStoreMember({
      storeId: storeAId,
      tenantId: String(tenantAId),
      email: memberEmail,
      name: "Staff Member",
      password: "InitialPassword123!",
      role: "cashier",
      permissions: ["pos:read", "pos:create"],
      invitedById: ownerAId,
    });

    assert.equal(result.ok, true);
    assert.equal(result.status, "active");

    // Verify user was created in UserModel with valid passwordHash
    const createdUser = await UserModel.findOne({ email: memberEmail }).select("+passwordHash");
    assert.ok(createdUser, "User record must exist in UserModel");
    assert.ok(createdUser.passwordHash, "User must have a hashed password");

    const passwordMatches = await bcrypt.compare("InitialPassword123!", createdUser.passwordHash);
    assert.equal(passwordMatches, true, "Hashed password must verify correctly with bcrypt");

    // Verify StoreMember record
    const memberRecord = await StoreMemberModel.findOne({ storeId: storeAId, email: memberEmail });
    assert.ok(memberRecord, "StoreMember record must exist");
    assert.equal(memberRecord.role, "cashier");
    assert.equal(memberRecord.status, "active");
  });

  it("4. Member Creation with Existing User: Reuses user without overwriting existing password", async () => {
    const existingUserEmail = `existing-${Date.now()}@bornoland.test`;
    const originalPassword = "OriginalSecretPassword123!";
    const originalUser = await UserModel.create({
      email: existingUserEmail,
      name: "Existing User",
      passwordHash: await bcrypt.hash(originalPassword, 10),
      tenantId: tenantAId,
      role: "user",
      status: "active",
    });

    // Add this user to Store A
    const result = await inviteStoreMember({
      storeId: storeAId,
      tenantId: String(tenantAId),
      email: existingUserEmail,
      name: "Existing User",
      password: "SomeNewPasswordAttempt456!", // should NOT overwrite original user's password
      role: "manager",
      permissions: ["orders:read", "orders:update"],
      invitedById: ownerAId,
    });

    assert.equal(result.ok, true);

    // Verify original password is UNCHANGED
    const userInDb = await UserModel.findById(originalUser._id).select("+passwordHash");
    assert.ok(userInDb);
    const originalValid = await bcrypt.compare(originalPassword, userInDb.passwordHash);
    assert.equal(originalValid, true, "Original user password must be strictly preserved");

    const newAttemptValid = await bcrypt.compare("SomeNewPasswordAttempt456!", userInDb.passwordHash);
    assert.equal(newAttemptValid, false, "New password input must NOT have overwritten existing password");
  });

  it("5. Granular Permissions & Role Presets: Cashier and Manager permission resolution", () => {
    const cashierPerms = roleToPermissions("cashier");
    assert.ok(hasPermission(cashierPerms, "pos:read"), "Cashier must have pos:read permission");
    assert.ok(hasPermission(cashierPerms, "pos:create"), "Cashier must have pos:create permission");
    assert.equal(hasPermission(cashierPerms, "settings:manage"), false, "Cashier must not have settings:manage");

    const managerPerms = roleToPermissions("manager");
    assert.ok(hasPermission(managerPerms, "products:read"), "Manager must have products:read");
    assert.ok(hasPermission(managerPerms, "orders:read"), "Manager must have orders:read");
    assert.equal(hasPermission(managerPerms, "members:manage"), false, "Manager must not have members:manage by default");
  });

  it("6. Tenant Isolation: Store A member has no access to Store B", async () => {
    const memberEmail = `isolated-${Date.now()}@bornoland.test`;
    await inviteStoreMember({
      storeId: storeAId,
      tenantId: String(tenantAId),
      email: memberEmail,
      name: "Store A Member",
      password: "Password123!",
      role: "staff",
      permissions: ["orders:read"],
      invitedById: ownerAId,
    });

    const user = await UserModel.findOne({ email: memberEmail });
    assert.ok(user);
    const userId = String(user._id);

    // Check permissions in Store A (Allowed)
    const permsStoreA = await getEffectiveUserPermissions(storeAId, userId);
    assert.ok(permsStoreA, "User must have active permissions in Store A");
    assert.equal(permsStoreA.role, "staff");

    // Check permissions in Store B (Denied - null)
    const permsStoreB = await getEffectiveUserPermissions(storeBId, userId);
    assert.equal(permsStoreB, null, "User must NOT have access to Store B");
  });
});
