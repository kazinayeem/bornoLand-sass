import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import dotenvFlow from "dotenv-flow";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenvFlow.config({ path: path.resolve(import.meta.dirname, "../../../.."), silent: true });
dotenvFlow.config({ path: path.resolve(import.meta.dirname, "../../../../../"), silent: true });

import { connectDatabase } from "../../../common/database/connection.js";
import { UserModel } from "../../users/user.model.js";
import { StoreModel } from "../../stores/store.model.js";
import { PlanModel } from "../../plans/plan.model.js";
import { StoreMemberModel } from "../../team/store-member.model.js";
import { EmployeeModel } from "../employee.model.js";
import { createEmployee, updateEmployee } from "../hrm.service.js";
import { findUserIdByEmployeeIdentifier } from "../employee-account.service.js";
import { loginUser, logoutUser, sessionFromRefreshToken } from "../../auth/auth.service.js";
import { changePassword } from "../../profile/profile.service.js";
import { inviteStoreMember, getEffectiveUserPermissions } from "../../team/team.service.js";
import { hasPermission, roleToPermissions } from "../../../common/types/permissions.js";

const stamp = Date.now();
const NEW_PASSWORD = "Employee#123";
const PHONE = "01712345678";

describe("HRM employee login provisioning", { concurrency: false }, () => {
  let storeAId = "";
  let storeBId = "";
  let storeASlug = "";
  let ownerAId = "";
  let planId = "";
  let tenantAId: mongoose.Types.ObjectId;
  let tenantBId: mongoose.Types.ObjectId;
  let employeeEmail = "";
  let employeeCode = "";
  let employeeUserId = "";
  let employeeId = "";
  let ownerEmail = "";
  let staffEmail = "";
  let adminEmail = "";

  before(async () => {
    await connectDatabase();
    tenantAId = new mongoose.Types.ObjectId();
    tenantBId = new mongoose.Types.ObjectId();

    ownerEmail = `owner-${stamp}@bornoland.test`;
    const ownerA = await UserModel.create({
      email: ownerEmail,
      name: "Owner A",
      passwordHash: await bcrypt.hash("Password123!", 12),
      tenantId: tenantAId,
      role: "owner",
      status: "active",
    });
    ownerAId = String(ownerA._id);

    adminEmail = `admin-${stamp}@bornoland.test`;
    await UserModel.create({
      email: adminEmail,
      name: "Platform Admin",
      passwordHash: await bcrypt.hash("Admin@1234", 12),
      tenantId: new mongoose.Types.ObjectId(),
      role: "super_admin",
      status: "active",
    });

    const plan = await PlanModel.create({
      name: "Employee QA Plan",
      slug: `emp-qa-${stamp}`,
      priceBDT: 0,
      features: ["hrm", "employees"],
      featureToggles: {
        staffManagement: true,
        employees: true,
        hrmEmployees: true,
      },
      limits: { staff: 25, products: 100 },
    });
    planId = String(plan._id);

    storeASlug = `emp-store-a-${stamp}`;
    const storeA = await StoreModel.create({
      tenantId: tenantAId,
      userId: ownerA._id,
      name: "Employee Store A",
      slug: storeASlug,
      subdomain: storeASlug,
      planId: plan._id,
      status: "active",
      billingStatus: "active",
      subscriptionStatus: "active",
    });
    storeAId = String(storeA._id);

    const storeB = await StoreModel.create({
      tenantId: tenantAId,
      userId: ownerA._id,
      name: "Employee Store B",
      slug: `emp-store-b-${stamp}`,
      subdomain: `emp-store-b-${stamp}`,
      planId: plan._id,
      status: "active",
      billingStatus: "active",
      subscriptionStatus: "active",
    });
    storeBId = String(storeB._id);
  });

  after(async () => {
    await EmployeeModel.deleteMany({ storeId: { $in: [storeAId, storeBId] } });
    await StoreMemberModel.deleteMany({ storeId: { $in: [storeAId, storeBId] } });
    await StoreModel.deleteMany({ _id: { $in: [storeAId, storeBId] } });
    await PlanModel.deleteMany({ _id: planId });
    await UserModel.deleteMany({
      email: {
        $in: [
          ownerEmail,
          staffEmail,
          adminEmail,
          employeeEmail,
          `foreign-${stamp}@bornoland.test`,
          `linked-${stamp}@bornoland.test`,
          `other-${stamp}@bornoland.test`,
        ].filter(Boolean),
      },
    });
    await mongoose.disconnect();
  });

  it("creates Employee + User + StoreMember with hashed mobile password", async () => {
    employeeEmail = `rahim-${stamp}@bornoland.test`;
    employeeCode = `EMP-${String(stamp).slice(-4)}`;
    const result = await createEmployee(storeAId, {
      firstName: "Rahim",
      lastName: "Khan",
      email: employeeEmail,
      phone: PHONE,
      employeeCode,
      memberRole: "employee",
      employmentType: "full_time",
      salaryStructure: { basic: 25000 },
    });

    assert.ok(result.employee);
    assert.ok(result.loginAccount);
    assert.equal(result.loginAccount.created, true);
    assert.equal(result.loginAccount.email, employeeEmail);
    assert.equal(result.loginAccount.role, "employee");
    assert.equal(result.loginAccount.mustChangePassword, true);
    assert.equal("password" in result.loginAccount, false);
    assert.equal("passwordHash" in result.loginAccount, false);

    employeeId = String(result.employee._id);
    employeeUserId = result.loginAccount.userId;

    const employee = await EmployeeModel.findById(employeeId).lean() as {
      userId?: unknown;
      storeId?: unknown;
      email?: string;
      phone?: string;
    } | null;
    assert.ok(employee);
    assert.equal(String(employee.userId), employeeUserId);
    assert.equal(String(employee.storeId), storeAId);
    assert.equal(employee.email, employeeEmail);
    assert.equal(employee.phone, PHONE);

    const user = await UserModel.findById(employeeUserId).select("email role status passwordHash mustChangePassword").lean() as {
      passwordHash?: string;
      mustChangePassword?: boolean;
      role?: string;
      status?: string;
      email?: string;
    } | null;
    assert.ok(user);
    assert.equal(user.email, employeeEmail);
    assert.equal(user.role, "viewer");
    assert.equal(user.status, "active");
    assert.equal(user.mustChangePassword, true);
    assert.ok(user.passwordHash);
    assert.notEqual(user.passwordHash, PHONE);
    assert.equal(await bcrypt.compare(PHONE, user.passwordHash), true);

    const member = await StoreMemberModel.findOne({ storeId: storeAId, userId: employeeUserId }).lean() as {
      role?: string;
      status?: string;
      storeId?: unknown;
      permissions?: string[];
    } | null;
    assert.ok(member);
    assert.equal(member.role, "employee");
    assert.equal(member.status, "active");
    assert.equal(String(member.storeId), storeAId);
    assert.ok(!(member.permissions || []).includes("*"));
  });

  it("assigns employee self-service permissions and not merchant modules", async () => {
    const perms = await getEffectiveUserPermissions(storeAId, employeeUserId);
    assert.ok(perms);
    assert.equal(perms.role, "employee");
    assert.equal(hasPermission(perms.permissions, "hrm:self:read"), true);
    assert.equal(hasPermission(perms.permissions, "*"), false);
    assert.equal(hasPermission(perms.permissions, "members:manage"), false);
    assert.equal(hasPermission(perms.permissions, "billing:read"), false);
    assert.equal(hasPermission(perms.permissions, "settings:update"), false);
    assert.equal(hasPermission(roleToPermissions("employee"), "hrm:*"), false);
  });

  it("logs in with email + temporary mobile password and requires password change", async () => {
    const login = await loginUser({
      email: employeeEmail,
      password: PHONE,
      loginType: "user",
    });
    assert.equal(login.ok, true);
    if (!login.ok) return;
    assert.equal(login.data.mustChangePassword, true);
    assert.equal(login.data.memberRole, "employee");
    assert.equal(login.data.defaultStoreSlug, storeASlug);
    assert.equal(login.data.stores?.length, 1);
    assert.equal(login.data.stores?.[0]?.id, storeAId);
    assert.ok(login.data.defaultLandingPath?.includes("/hrm/self-service"));
    assert.ok(!login.data.stores?.some((store) => store.id === storeBId));
  });

  it("logs in with Employee ID when the code maps to a single User", async () => {
    const login = await loginUser({
      email: employeeCode,
      password: PHONE,
      loginType: "user",
    });
    assert.equal(login.ok, true);
    if (!login.ok) return;
    assert.equal(login.data.user.id, employeeUserId);
  });

  it("rejects ambiguous Employee IDs that map to different users", async () => {
    const otherUser = await UserModel.create({
      email: `other-${stamp}@bornoland.test`,
      name: "Other",
      passwordHash: await bcrypt.hash("Password123!", 12),
      tenantId: tenantBId,
      role: "viewer",
      status: "active",
    });
    await EmployeeModel.create({
      storeId: storeBId,
      userId: otherUser._id,
      employeeCode,
      firstName: "Other",
      email: `other-${stamp}@bornoland.test`,
      phone: "01812345678",
      status: "active",
    });
    await assert.rejects(
      () => findUserIdByEmployeeIdentifier(employeeCode),
      /ambiguous/i,
    );
    await EmployeeModel.deleteOne({ storeId: storeBId, employeeCode });
    await UserModel.deleteOne({ _id: otherUser._id });
  });

  it("changes password on first login and rejects the old mobile password", async () => {
    const changed = await changePassword(employeeUserId, {
      currentPassword: PHONE,
      newPassword: NEW_PASSWORD,
      confirmPassword: NEW_PASSWORD,
    });
    assert.equal(changed.ok, true);

    const user = await UserModel.findById(employeeUserId).select("passwordHash mustChangePassword").lean() as {
      passwordHash?: string;
      mustChangePassword?: boolean;
    } | null;
    assert.ok(user);
    assert.equal(user.mustChangePassword, false);
    assert.equal(await bcrypt.compare(PHONE, user.passwordHash || ""), false);
    assert.equal(await bcrypt.compare(NEW_PASSWORD, user.passwordHash || ""), true);

    const oldLogin = await loginUser({ email: employeeEmail, password: PHONE, loginType: "user" });
    assert.equal(oldLogin.ok, false);

    const newLogin = await loginUser({ email: employeeEmail, password: NEW_PASSWORD, loginType: "user" });
    assert.equal(newLogin.ok, true);
    if (!newLogin.ok) return;
    assert.equal(newLogin.data.mustChangePassword, false);
    assert.equal(newLogin.data.memberRole, "employee");
    assert.equal(newLogin.data.defaultStoreSlug, storeASlug);
  });

  it("denies sibling-store access", async () => {
    const permsB = await getEffectiveUserPermissions(storeBId, employeeUserId);
    assert.equal(permsB, null);
  });

  it("rejects terminated and suspended employee login", async () => {
    await updateEmployee(storeAId, employeeId, { status: "terminated" });
    const terminated = await loginUser({ email: employeeEmail, password: NEW_PASSWORD, loginType: "user" });
    assert.equal(terminated.ok, false);

    await updateEmployee(storeAId, employeeId, { status: "suspended" });
    const suspended = await loginUser({ email: employeeEmail, password: NEW_PASSWORD, loginType: "user" });
    assert.equal(suspended.ok, false);

    await updateEmployee(storeAId, employeeId, { status: "active" });
    const restored = await loginUser({ email: employeeEmail, password: NEW_PASSWORD, loginType: "user" });
    assert.equal(restored.ok, true);
  });

  it("rejects duplicate Employee ID and unsafe emails", async () => {
    await assert.rejects(
      () =>
        createEmployee(storeAId, {
          firstName: "Dup",
          email: `dup-${stamp}@bornoland.test`,
          phone: "01912345678",
          employeeCode,
        }),
      /already exists/i,
    );

    await assert.rejects(
      () =>
        createEmployee(storeAId, {
          firstName: "DupMail",
          email: employeeEmail,
          phone: "01312345678",
          employeeCode: `EMP-D-${stamp.toString().slice(-3)}`,
        }),
      /email already exists/i,
    );

    await UserModel.create({
      email: `foreign-${stamp}@bornoland.test`,
      name: "Foreign",
      passwordHash: await bcrypt.hash("Password123!", 12),
      tenantId: tenantBId,
      role: "viewer",
      status: "active",
    });

    await assert.rejects(
      () =>
        createEmployee(storeAId, {
          firstName: "Foreign",
          email: `foreign-${stamp}@bornoland.test`,
          phone: "01612345678",
          employeeCode: `EMP-F-${stamp.toString().slice(-3)}`,
        }),
      /another workspace|cannot be linked/i,
    );
  });

  it("does not overwrite an existing same-tenant user password when linking", async () => {
    const linkedEmail = `linked-${stamp}@bornoland.test`;
    const originalPassword = "KeepMe#123";
    const existing = await UserModel.create({
      email: linkedEmail,
      name: "Existing Linked",
      passwordHash: await bcrypt.hash(originalPassword, 12),
      tenantId: tenantAId,
      role: "viewer",
      status: "active",
    });

    const result = await createEmployee(storeAId, {
      firstName: "Linked",
      lastName: "User",
      email: linkedEmail,
      phone: "01512345678",
      employeeCode: `EMP-L-${stamp.toString().slice(-3)}`,
      memberRole: "employee",
    });

    assert.equal(result.loginAccount.created, false);
    assert.equal(result.loginAccount.linked, true);
    assert.equal(result.loginAccount.userId, String(existing._id));

    const userInDb = await UserModel.findById(existing._id).select("passwordHash mustChangePassword").lean() as {
      passwordHash?: string;
      mustChangePassword?: boolean;
    } | null;
    assert.ok(userInDb);
    assert.equal(await bcrypt.compare(originalPassword, userInDb.passwordHash || ""), true);
    assert.equal(await bcrypt.compare("01512345678", userInDb.passwordHash || ""), false);
  });

  it("keeps merchant, staff, and super admin login working", async () => {
    staffEmail = `staff-${stamp}@bornoland.test`;
    const invited = await inviteStoreMember({
      storeId: storeAId,
      tenantId: String(tenantAId),
      email: staffEmail,
      name: "Existing Staff",
      password: "StaffPass#123",
      role: "cashier",
      permissions: [],
      invitedById: ownerAId,
    });
    assert.equal(invited.ok, true);
    const merchant = await loginUser({ email: ownerEmail, password: "Password123!", loginType: "user" });
    assert.equal(merchant.ok, true);
    if (merchant.ok) {
      assert.equal(merchant.data.user.role, "owner");
      assert.notEqual(merchant.data.memberRole, "employee");
    }

    const staff = await loginUser({ email: staffEmail, password: "StaffPass#123", loginType: "user" });
    assert.equal(staff.ok, true);
    if (staff.ok) {
      assert.equal(staff.data.mustChangePassword, false);
      assert.equal(staff.data.memberRole, "cashier");
    }

    const admin = await loginUser({ email: adminEmail, password: "Admin@1234", loginType: "admin" });
    assert.equal(admin.ok, true);
    if (admin.ok) {
      assert.equal(admin.data.user.role, "super_admin");
    }
  });

  it("logout revokes refresh tokens and a new login still works", async () => {
    const login = await loginUser({ email: employeeEmail, password: NEW_PASSWORD, loginType: "user" });
    assert.equal(login.ok, true);
    if (!login.ok) return;
    await logoutUser(employeeUserId);
    const refreshed = await sessionFromRefreshToken(login.data.refreshToken);
    assert.equal(refreshed.ok, false);

    const again = await loginUser({ email: employeeEmail, password: NEW_PASSWORD, loginType: "user" });
    assert.equal(again.ok, true);
    if (!again.ok) return;
    const keep = await sessionFromRefreshToken(again.data.refreshToken, { rotate: true });
    assert.equal(keep.ok, true);
    if (keep.ok) {
      assert.equal(keep.data.session.mustChangePassword, false);
      assert.equal(keep.data.user.memberRole, "employee");
    }
  });
});
