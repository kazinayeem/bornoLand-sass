import assert from "node:assert/strict";
import { resolvePostLoginDestination } from "../apps/web/src/lib/auth-redirect-client.js";

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
console.log(" 🧪 BORNO LAND — DEMO LOGIN & ROLE DESTINATION ROUTING VERIFICATION");
console.log("=======================================================\n");

console.log("👑 Test Suite 1: Super Admin Post-Login Destination");

runTest("Super Admin resolves to Platform Overview (/dashboard)", () => {
  const dest = resolvePostLoginDestination({
    user: { id: "u-admin", role: "super_admin", email: "admin@bornoland.com" },
    session: { role: "super_admin", defaultStoreSlug: null },
    defaultLandingPath: "/dashboard",
  });
  assert.strictEqual(dest, "/dashboard");
});

runTest("Super Admin redirect to /admin/dashboard normalizes to /dashboard", () => {
  const dest = resolvePostLoginDestination(
    {
      user: { id: "u-admin", role: "super_admin", email: "admin@bornoland.com" },
      session: { role: "super_admin" },
    },
    "/admin/dashboard"
  );
  assert.strictEqual(dest, "/dashboard");
});

runTest("Super Admin redirect to /admin/plans is permitted", () => {
  const dest = resolvePostLoginDestination(
    {
      user: { id: "u-admin", role: "super_admin" },
      session: { role: "super_admin" },
    },
    "/admin/plans"
  );
  assert.strictEqual(dest, "/admin/plans");
});

console.log("\n🏪 Test Suite 2: Merchant & Store Owner Destination");

runTest("Demo Merchant with single store resolves directly to /store/{slug}/dashboard", () => {
  const dest = resolvePostLoginDestination({
    user: {
      id: "u-demo",
      role: "owner",
      email: "demo@bornoland.com",
      defaultStoreSlug: "demo-store",
      stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
    },
    stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
    defaultStoreSlug: "demo-store",
    defaultLandingPath: "/store/demo-store/dashboard",
  });
  assert.strictEqual(dest, "/store/demo-store/dashboard");
});

runTest("Merchant with multiple stores resolves to /dashboard/stores", () => {
  const dest = resolvePostLoginDestination({
    user: {
      id: "u-merchant",
      role: "owner",
      email: "multi@bornoland.com",
      stores: [
        { id: "s-1", slug: "store-one", name: "Store One" },
        { id: "s-2", slug: "store-two", name: "Store Two" },
      ],
    },
    stores: [
      { id: "s-1", slug: "store-one", name: "Store One" },
      { id: "s-2", slug: "store-two", name: "Store Two" },
    ],
    defaultLandingPath: "/dashboard/stores",
  });
  assert.strictEqual(dest, "/dashboard/stores");
});

runTest("Merchant with 0 stores resolves to /dashboard/stores/create", () => {
  const dest = resolvePostLoginDestination({
    user: {
      id: "u-new",
      role: "owner",
      email: "new@bornoland.com",
      stores: [],
    },
    stores: [],
    defaultLandingPath: "/dashboard/stores/create",
  });
  assert.strictEqual(dest, "/dashboard/stores/create");
});

runTest("Merchant redirect to /admin/dashboard is blocked and falls back to store dashboard", () => {
  const dest = resolvePostLoginDestination(
    {
      user: {
        id: "u-demo",
        role: "owner",
        email: "demo@bornoland.com",
        defaultStoreSlug: "demo-store",
        stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
      },
      stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
      defaultStoreSlug: "demo-store",
    },
    "/admin/dashboard"
  );
  assert.strictEqual(dest, "/store/demo-store/dashboard");
});

runTest("Merchant redirect to root /dashboard is blocked and falls back to store dashboard", () => {
  const dest = resolvePostLoginDestination(
    {
      user: {
        id: "u-demo",
        role: "owner",
        email: "demo@bornoland.com",
        defaultStoreSlug: "demo-store",
        stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
      },
      stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
      defaultStoreSlug: "demo-store",
    },
    "/dashboard"
  );
  assert.strictEqual(dest, "/store/demo-store/dashboard");
});

runTest("Merchant redirect to legitimate store subroute /store/demo-store/products is allowed", () => {
  const dest = resolvePostLoginDestination(
    {
      user: {
        id: "u-demo",
        role: "owner",
        defaultStoreSlug: "demo-store",
        stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
      },
      stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
    },
    "/store/demo-store/products"
  );
  assert.strictEqual(dest, "/store/demo-store/products");
});

runTest("Merchant redirect to workspace /dashboard/billing is allowed", () => {
  const dest = resolvePostLoginDestination(
    {
      user: {
        id: "u-demo",
        role: "owner",
        defaultStoreSlug: "demo-store",
        stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
      },
      stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
    },
    "/dashboard/billing"
  );
  assert.strictEqual(dest, "/dashboard/billing");
});

console.log("\n👥 Test Suite 3: Staff & Member Permitted Module Routing");

runTest("Cashier routes directly to POS terminal", () => {
  const dest = resolvePostLoginDestination({
    user: {
      id: "u-cashier",
      role: "viewer",
      defaultStoreSlug: "demo-store",
      stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
    },
    stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
    defaultLandingPath: "/store/demo-store/pos",
  });
  assert.strictEqual(dest, "/store/demo-store/pos");
});

runTest("Warehouse staff routes directly to Inventory module", () => {
  const dest = resolvePostLoginDestination({
    user: {
      id: "u-wh",
      role: "viewer",
      defaultStoreSlug: "demo-store",
      stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
    },
    stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
    defaultLandingPath: "/store/demo-store/inventory",
  });
  assert.strictEqual(dest, "/store/demo-store/inventory");
});

runTest("Accountant routes directly to Finance reports", () => {
  const dest = resolvePostLoginDestination({
    user: {
      id: "u-acc",
      role: "viewer",
      defaultStoreSlug: "demo-store",
      stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
    },
    stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
    defaultLandingPath: "/store/demo-store/finance/reports",
  });
  assert.strictEqual(dest, "/store/demo-store/finance/reports");
});

console.log("\n👤 Test Suite 4: Employee Self-Service Workspace Routing");

runTest("Employee role routes directly to HRM Self-Service (/store/{slug}/hrm/self-service)", () => {
  const dest = resolvePostLoginDestination({
    user: {
      id: "u-emp",
      role: "employee",
      email: "EMP-0042",
      defaultStoreSlug: "demo-store",
      stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
    },
    stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
    defaultStoreSlug: "demo-store",
    defaultLandingPath: "/store/demo-store/hrm/self-service",
  });
  assert.strictEqual(dest, "/store/demo-store/hrm/self-service");
});

runTest("Employee redirect to /admin is blocked and falls back to self-service", () => {
  const dest = resolvePostLoginDestination(
    {
      user: {
        id: "u-emp",
        role: "employee",
        defaultStoreSlug: "demo-store",
        stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
      },
      stores: [{ id: "s-1", slug: "demo-store", name: "Demo Store" }],
      defaultStoreSlug: "demo-store",
    },
    "/admin/users"
  );
  assert.strictEqual(dest, "/store/demo-store/hrm/self-service");
});

console.log("\n=======================================================");
console.log(` 🏁 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
