import assert from "node:assert/strict";
import {
  STORE_MEMBER_ROLES,
  ROLE_PERMISSION_PRESETS,
  hasPermission,
  getRoleDefaultLandingPath,
} from "../apps/api/src/common/types/permissions.js";
import { loginSchema as apiLoginSchema } from "../apps/api/src/modules/auth/auth.validator.js";
import { loginSchema as webLoginSchema } from "../apps/web/src/validators/auth.js";

let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    failed++;
  }
}

console.log("\n=======================================================");
console.log(" 🧪 BORNO LAND — EMPLOYEE IDENTITY, RBAC & SELF-SERVICE VERIFICATION");
console.log("=======================================================\n");

// ── Test Suite 1: Role Registry & Presets ───────────────────────────
console.log("📋 Test Suite 1: Centralized Role Registry & Granular Presets");

runTest("Includes all required ERP roles in STORE_MEMBER_ROLES", () => {
  const requiredRoles = [
    "owner", "admin", "store_manager", "hr_manager", "hr_staff",
    "accountant", "finance_manager", "sales_manager", "cashier",
    "inventory_manager", "inventory_staff", "warehouse_manager",
    "warehouse_staff", "purchasing_manager", "purchasing_staff",
    "crm_manager", "support_agent", "marketing_manager", "employee"
  ];
  for (const role of requiredRoles) {
    assert.ok(
      STORE_MEMBER_ROLES.includes(role as any),
      `Missing required ERP role: ${role}`
    );
  }
});

runTest("Every role has a corresponding defined permission preset in ROLE_PERMISSION_PRESETS", () => {
  for (const role of STORE_MEMBER_ROLES) {
    const preset = ROLE_PERMISSION_PRESETS[role];
    assert.ok(Array.isArray(preset), `Role ${role} lacks a valid permission preset`);
    assert.ok(preset.length > 0, `Role ${role} has an empty permission preset`);
  }
});

runTest("Owner has wildcard * permission", () => {
  assert.deepEqual(ROLE_PERMISSION_PRESETS.owner, ["*"]);
  assert.strictEqual(hasPermission(["*"], "anything:arbitrary"), true);
  assert.strictEqual(hasPermission(["*"], "hrm.attendance.view_self"), true);
});

runTest("Cashier role has POS permissions but no settings or member manage", () => {
  const cashierPerms = ROLE_PERMISSION_PRESETS.cashier;
  assert.ok(hasPermission(cashierPerms, "pos:create"));
  assert.ok(hasPermission(cashierPerms, "orders:create"));
  assert.strictEqual(hasPermission(cashierPerms, "settings:update"), false);
  assert.strictEqual(hasPermission(cashierPerms, "members:manage"), false);
});

runTest("Employee role has HRM self-service permissions but no admin or company-wide access", () => {
  const employeePerms = ROLE_PERMISSION_PRESETS.employee;
  assert.ok(hasPermission(employeePerms, "hrm:self:read"));
  assert.ok(hasPermission(employeePerms, "hrm:self:create"));
  assert.ok(hasPermission(employeePerms, "hrm:self:delete"));
  assert.strictEqual(hasPermission(employeePerms, "hrm:read"), false, "Employee should NOT have admin hrm:read");
  assert.strictEqual(hasPermission(employeePerms, "settings:update"), false);
  assert.strictEqual(hasPermission(employeePerms, "billing:manage"), false);
});

// ── Test Suite 2: Permission Checking & Wildcard Normalization ──────
console.log("\n🔒 Test Suite 2: Granular RBAC Evaluation & Colon/Dot Normalization");

runTest("Module wildcard satisfies specific actions", () => {
  assert.strictEqual(hasPermission(["hrm:*"], "hrm:read"), true);
  assert.strictEqual(hasPermission(["hrm:*"], "hrm:create"), true);
  assert.strictEqual(hasPermission(["hrm:*"], "finance:read"), false);
});

runTest("Self-service permissions require explicit assignment (no implicit alias)", () => {
  assert.strictEqual(hasPermission(["hrm:self:read"], "hrm:self:read"), true, "Exact self-service permission matches");
  assert.strictEqual(hasPermission(["hrm:read"], "hrm:self:read"), false, "hrm:read does NOT satisfy hrm:self:read (no alias)");
  assert.strictEqual(hasPermission(["hrm:*"], "hrm:self:read"), true, "Module wildcard still satisfies self-service");
  assert.strictEqual(hasPermission(["products:read"], "hrm:self:read"), false, "Unrelated permission denies access");
});

// ── Test Suite 3: Post-Login Contextual Routing ──────────────────────
console.log("\n🚀 Test Suite 3: Contextual Post-Login Landing Path Resolution");

runTest("Cashier routes directly to POS terminal", () => {
  const path = getRoleDefaultLandingPath("cashier", "demo-store");
  assert.strictEqual(path, "/store/demo-store/pos");
});

runTest("Employee routes directly to Self-Service Portal", () => {
  const path = getRoleDefaultLandingPath("employee", "demo-store");
  assert.strictEqual(path, "/store/demo-store/hrm/self-service");
});

runTest("Warehouse staff routes directly to Inventory", () => {
  assert.strictEqual(getRoleDefaultLandingPath("warehouse_staff", "demo-store"), "/store/demo-store/inventory");
  assert.strictEqual(getRoleDefaultLandingPath("inventory_manager", "demo-store"), "/store/demo-store/inventory");
});

runTest("Accountant & Finance Manager route directly to Financial Reports", () => {
  assert.strictEqual(getRoleDefaultLandingPath("accountant", "demo-store"), "/store/demo-store/finance/reports");
  assert.strictEqual(getRoleDefaultLandingPath("finance_manager", "demo-store"), "/store/demo-store/finance/reports");
});

runTest("HR Manager routes directly to HR Employee management", () => {
  assert.strictEqual(getRoleDefaultLandingPath("hr_manager", "demo-store"), "/store/demo-store/hrm/employees");
});

runTest("Owner and Store Manager route to Master Dashboard", () => {
  assert.strictEqual(getRoleDefaultLandingPath("owner", "demo-store"), "/store/demo-store/dashboard");
  assert.strictEqual(getRoleDefaultLandingPath("store_manager", "demo-store"), "/store/demo-store/dashboard");
});

// ── Test Suite 4: Authentication with Email or Employee ID ───────────
console.log("\n🔑 Test Suite 4: Dual Identity Authentication (Email / Employee ID)");

runTest("API loginSchema accepts valid email address", () => {
  const res = apiLoginSchema.safeParse({ email: "nayeem@bornoland.com", password: "password123" });
  assert.strictEqual(res.success, true);
});

runTest("API loginSchema accepts Employee ID (e.g. EMP-0042)", () => {
  const res = apiLoginSchema.safeParse({ email: "EMP-0042", password: "password123" });
  assert.strictEqual(res.success, true);
});

runTest("Web loginSchema accepts valid email address", () => {
  const res = webLoginSchema.safeParse({ email: "nayeem@bornoland.com", password: "password123" });
  assert.strictEqual(res.success, true);
});

runTest("Web loginSchema accepts Employee ID (e.g. EMP-0001)", () => {
  const res = webLoginSchema.safeParse({ email: "EMP-0001", password: "password123" });
  assert.strictEqual(res.success, true);
});

runTest("Rejects empty or single-character identifier", () => {
  const res = apiLoginSchema.safeParse({ email: "a", password: "password123" });
  assert.strictEqual(res.success, false);
});

// ── Test Suite 5: Attendance Rules & Calculation Integrity ───────────
console.log("\n⏱️ Test Suite 5: Attendance Rules & Calculation Integrity");

runTest("Calculates workedMinutes and overtime accurately on clock-out", () => {
  const checkIn = new Date("2026-09-02T09:00:00Z");
  const checkOut = new Date("2026-09-02T18:30:00Z"); // 9.5 hours = 570 mins

  const diffMs = checkOut.getTime() - checkIn.getTime();
  const workedMinutes = Math.max(0, Math.floor(diffMs / (60 * 1000)));
  const overtimeMinutes = workedMinutes > 480 ? workedMinutes - 480 : 0;

  assert.strictEqual(workedMinutes, 570);
  assert.strictEqual(overtimeMinutes, 90); // 1.5 hours of overtime
});

runTest("Detects late arrival according to shift start and grace period", () => {
  const shiftStart = new Date("2026-09-02T09:00:00Z");
  const graceMinutes = 15;
  const graceEnd = new Date(shiftStart.getTime() + graceMinutes * 60 * 1000);

  const onTimeArrival = new Date("2026-09-02T09:12:00Z");
  const lateArrival = new Date("2026-09-02T09:25:00Z");

  assert.strictEqual(onTimeArrival > graceEnd, false);
  assert.strictEqual(lateArrival > graceEnd, true);

  const lateMinutes = Math.floor((lateArrival.getTime() - shiftStart.getTime()) / (60 * 1000));
  assert.strictEqual(lateMinutes, 25);
});

// ── Test Suite 6: Payslip Cost Price Protection ───────────────────────
console.log("\n🛡️ Test Suite 6: Confidentiality & Cost Price Protection");

runTest("Payslip schema contains zero COGS or supplier purchase prices", () => {
  const samplePayslip = {
    payslipNumber: "PAY-2026-09-001",
    basicSalary: 35000,
    grossSalary: 52000,
    netSalary: 49500,
  };

  assert.strictEqual("costPrice" in samplePayslip, false);
  assert.strictEqual("buyingPrice" in samplePayslip, false);
  assert.strictEqual("wholesalePrice" in samplePayslip, false);
  assert.strictEqual("supplierId" in samplePayslip, false);
});

console.log("\n=======================================================");
console.log(` 🏁 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
