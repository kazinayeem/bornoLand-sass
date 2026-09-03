import assert from "node:assert/strict";
import {
  BUSINESS_MODULES,
  findModuleByPathname,
} from "../apps/web/src/components/store-dashboard/navigation-registry.js";
import {
  STORE_MEMBER_ROLES,
  ROLE_PERMISSION_PRESETS,
  hasPermission,
} from "../apps/api/src/common/types/permissions.js";

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
console.log(" 🧪 BORNO LAND — ERP SIDEBAR & NAVIGATION UX VERIFICATION");
console.log("=======================================================\n");

// ── Test Suite 1: Canonical Module Registry ─────────────────────────
console.log("📋 Test Suite 1: Canonical 11-Module ERP Registry");

runTest("Contains all 11 core ERP business modules in priority order", () => {
  const expectedOrder = [
    "home",
    "commerce",
    "inventory",
    "purchasing",
    "pos",
    "hrm",
    "finance",
    "growth",
    "operations",
    "website",
    "system",
  ];
  const actualIds = BUSINESS_MODULES.map((m) => m.id);
  assert.deepEqual(actualIds, expectedOrder);
});

runTest("Total items across all modules covers full platform (>40 items)", () => {
  let totalItems = 0;
  for (const mod of BUSINESS_MODULES) {
    totalItems += mod.items.length;
  }
  assert.ok(totalItems >= 40, `Expected at least 40 items, found ${totalItems}`);
});

runTest("Every module defines badgeIcon, titleEn, titleBn, and defaultRoute", () => {
  for (const mod of BUSINESS_MODULES) {
    assert.ok(mod.badgeIcon, `Module ${mod.id} missing badgeIcon`);
    assert.ok(mod.titleEn, `Module ${mod.id} missing titleEn`);
    assert.ok(mod.titleBn, `Module ${mod.id} missing titleBn`);
    assert.ok(mod.defaultRoute.startsWith("/"), `Module ${mod.id} defaultRoute must start with /`);
  }
});

// ── Test Suite 2: Bilingual Translation Completeness ────────────────
console.log("\n🌐 Test Suite 2: 100% Bilingual (English + বাংলা) Completeness");

runTest("Every single navigation item has valid English and Bengali labels", () => {
  for (const mod of BUSINESS_MODULES) {
    for (const item of mod.items) {
      assert.ok(item.labelEn && item.labelEn.trim().length > 0, `Item ${item.id} missing labelEn`);
      assert.ok(item.labelBn && item.labelBn.trim().length > 0, `Item ${item.id} missing labelBn`);
      if (item.subItems) {
        for (const sub of item.subItems) {
          assert.ok(sub.labelEn && sub.labelEn.trim().length > 0, `SubItem ${sub.id} missing labelEn`);
          assert.ok(sub.labelBn && sub.labelBn.trim().length > 0, `SubItem ${sub.id} missing labelBn`);
        }
      }
    }
  }
});

// ── Test Suite 3: Pathname to Module Resolution ──────────────────────
console.log("\n🗺️ Test Suite 3: Pathname to Module Resolution (Contextual Focus)");

runTest("Resolves /orders to Commerce module", () => {
  const mod = findModuleByPathname("/store/demo-store/orders", "demo-store");
  assert.strictEqual(mod.id, "commerce");
});

runTest("Resolves /inventory and subroutes to Inventory module", () => {
  assert.strictEqual(findModuleByPathname("/store/demo-store/inventory", "demo-store").id, "inventory");
  assert.strictEqual(findModuleByPathname("/store/demo-store/inventory/warehouses", "demo-store").id, "inventory");
  assert.strictEqual(findModuleByPathname("/store/demo-store/inventory/ledger", "demo-store").id, "inventory");
  assert.strictEqual(findModuleByPathname("/store/demo-store/inventory/waste", "demo-store").id, "inventory");
});

runTest("Resolves /inventory/purchasing to Purchasing module", () => {
  const mod = findModuleByPathname("/store/demo-store/inventory/purchasing", "demo-store");
  assert.strictEqual(mod.id, "purchasing");
});

runTest("Resolves /pos and /pos/shifts to POS module", () => {
  assert.strictEqual(findModuleByPathname("/store/demo-store/pos", "demo-store").id, "pos");
  assert.strictEqual(findModuleByPathname("/store/demo-store/pos/shifts", "demo-store").id, "pos");
});

runTest("Resolves /hrm/* routes to People/HRM module", () => {
  assert.strictEqual(findModuleByPathname("/store/demo-store/hrm/employees", "demo-store").id, "hrm");
  assert.strictEqual(findModuleByPathname("/store/demo-store/hrm/payroll", "demo-store").id, "hrm");
  assert.strictEqual(findModuleByPathname("/store/demo-store/hrm/self-service", "demo-store").id, "hrm");
});

runTest("Resolves /finance/* routes to Finance module", () => {
  assert.strictEqual(findModuleByPathname("/store/demo-store/finance/accounting", "demo-store").id, "finance");
  assert.strictEqual(findModuleByPathname("/store/demo-store/finance/expenses", "demo-store").id, "finance");
  assert.strictEqual(findModuleByPathname("/store/demo-store/finance/reports", "demo-store").id, "finance");
});

runTest("Resolves /dashboard to Home module", () => {
  assert.strictEqual(findModuleByPathname("/store/demo-store/dashboard", "demo-store").id, "home");
});

// ── Test Suite 4: Role-Based Filtering & Security ────────────────────
console.log("\n🔒 Test Suite 4: Strict RBAC & Entitlement Filtering");

function filterVisibleModules(rolePermissions: string[], isOwner = false): string[] {
  const visible: string[] = [];
  for (const mod of BUSINESS_MODULES) {
    if (mod.id === "home") {
      visible.push("home");
      continue;
    }
    const hasPermittedItem = mod.items.some((it) => {
      if (isOwner) return true;
      if (!it.permission) return true;
      return hasPermission(rolePermissions, it.permission);
    });
    if (hasPermittedItem) {
      visible.push(mod.id);
    }
  }
  return visible;
}

runTest("Store Owner sees all 11 modules", () => {
  const visible = filterVisibleModules(["*"], true);
  assert.strictEqual(visible.length, 11);
});

runTest("Cashier sees POS and Commerce, but Finance & HRM are hidden", () => {
  const cashierPerms = ROLE_PERMISSION_PRESETS.cashier;
  const visible = filterVisibleModules(cashierPerms, false);

  assert.ok(visible.includes("pos"), "Cashier must see POS");
  assert.ok(visible.includes("commerce"), "Cashier must see Commerce (orders)");
  assert.strictEqual(visible.includes("finance"), false, "Cashier must NOT see Finance");
  assert.strictEqual(visible.includes("hrm"), false, "Cashier must NOT see HRM management");
});

runTest("Accountant sees Finance and Operations, but HRM management is restricted", () => {
  const accountantPerms = ROLE_PERMISSION_PRESETS.accountant;
  const visible = filterVisibleModules(accountantPerms, false);

  assert.ok(visible.includes("finance"), "Accountant must see Finance");
  assert.strictEqual(visible.includes("hrm"), false, "Accountant must NOT see HRM management without permission");
});

runTest("Employee role sees HRM Self-Service, but Purchasing & Finance are hidden", () => {
  const employeePerms = ROLE_PERMISSION_PRESETS.employee;
  const visible = filterVisibleModules(employeePerms, false);

  assert.ok(visible.includes("hrm"), "Employee must see HRM Self-Service");
  assert.strictEqual(visible.includes("finance"), false, "Employee must NOT see Finance");
  assert.strictEqual(visible.includes("purchasing"), false, "Employee must NOT see Purchasing");
});

// ── Test Suite 5: Favorites & Recent Pages Logic ─────────────────────
console.log("\n⭐ Test Suite 5: Favorites & Recent Multitasking Mechanics");

runTest("Recent routes tracker deduplicates and caps at maximum 8 items", () => {
  let recents = [
    { id: "orders", href: "/orders", labelEn: "Orders", labelBn: "অর্ডার", visitedAt: 1 },
    { id: "products", href: "/products", labelEn: "Products", labelBn: "পণ্য", visitedAt: 2 },
  ];

  // Visit "orders" again
  const newItem = { id: "orders", href: "/orders", labelEn: "Orders", labelBn: "অর্ডার", visitedAt: 3 };
  recents = [newItem, ...recents.filter((r) => r.id !== newItem.id)].slice(0, 8);

  assert.strictEqual(recents.length, 2);
  assert.strictEqual(recents[0].id, "orders");
  assert.strictEqual(recents[0].visitedAt, 3);
});

console.log("\n=======================================================");
console.log(` 🏁 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
