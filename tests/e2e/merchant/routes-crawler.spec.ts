import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { loginAsMerchant, loginAsSuperAdmin, discoverStoreSlug } from "../helpers/auth";
import { attachPageMonitor, type PageAuditMonitor } from "../helpers/monitor";

const reportDir = path.resolve(process.cwd(), "tests/reports");
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}
const auditLogFile = path.join(reportDir, "route-crawl-audit.json");

type RouteAuditResult = {
  path: string;
  module: string;
  status: "PASS" | "FAIL";
  httpStatus: number;
  chunkErrors: string[];
  hydrationErrors: string[];
  exceptions: string[];
  serverErrors: string[];
};

const allAuditResults: RouteAuditResult[] = [];

async function auditRoute(
  page: Page,
  moduleName: string,
  urlPath: string
): Promise<RouteAuditResult> {
  const monitor = attachPageMonitor(page);
  let passed = true;
  let httpStatus = 200;

  try {
    const response = await page.goto(urlPath, { waitUntil: "domcontentloaded", timeout: 25_000 });
    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
    httpStatus = response?.status() ?? 200;

    // Check for chunk loading errors
    if (monitor.chunkErrors.length > 0) {
      passed = false;
    }

    // Check for 500 server errors
    const serverErrors = monitor.failedRequests
      .filter((r) => r.status >= 500)
      .map((r) => `${r.method} ${r.url} [${r.status}]`);
    if (serverErrors.length > 0) {
      passed = false;
    }

    // Check for blank screen
    const bodyText = await page.locator("body").innerText().catch(() => "");
    if (!bodyText.trim() && !page.isClosed()) {
      passed = false;
    }

    // Test hard refresh
    await page.reload({ waitUntil: "domcontentloaded", timeout: 25_000 });
    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});

    const result: RouteAuditResult = {
      path: urlPath,
      module: moduleName,
      status: passed ? "PASS" : "FAIL",
      httpStatus,
      chunkErrors: monitor.chunkErrors,
      hydrationErrors: monitor.hydrationErrors,
      exceptions: monitor.uncaughtExceptions,
      serverErrors,
    };

    allAuditResults.push(result);
    fs.writeFileSync(auditLogFile, JSON.stringify(allAuditResults, null, 2), "utf8");

    if (!passed) {
      console.error(`  ❌ [FAIL] ${moduleName} -> ${urlPath} (Chunks: ${monitor.chunkErrors.length}, 5xx: ${serverErrors.length})`);
    } else {
      console.log(`  ✅ [PASS] ${moduleName} -> ${urlPath}`);
    }

    return result;
  } catch (err: any) {
    const result: RouteAuditResult = {
      path: urlPath,
      module: moduleName,
      status: "FAIL",
      httpStatus: 0,
      chunkErrors: monitor.chunkErrors,
      hydrationErrors: monitor.hydrationErrors,
      exceptions: [err.message],
      serverErrors: [],
    };
    allAuditResults.push(result);
    fs.writeFileSync(auditLogFile, JSON.stringify(allAuditResults, null, 2), "utf8");
    console.error(`  ❌ [FAIL] ${moduleName} -> ${urlPath}: ${err.message}`);
    return result;
  }
}

test.describe("Deep Modular Route & Page Health Crawler (@navigation @crawler)", () => {
  let storeSlug = "nayeem";

  test.beforeAll(async () => {
    if (fs.existsSync(auditLogFile)) {
      fs.unlinkSync(auditLogFile);
    }
  });

  test("Module 1: Commerce & Orders Routes", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsMerchant(page);
    storeSlug = await discoverStoreSlug(page);

    const routes = [
      `/store/${storeSlug}/dashboard`,
      `/store/${storeSlug}/orders`,
      `/store/${storeSlug}/orders/incomplete`,
      `/store/${storeSlug}/customers`,
      `/store/${storeSlug}/products`,
      `/store/${storeSlug}/products/new`,
      `/store/${storeSlug}/categories`,
      `/store/${storeSlug}/reviews`,
    ];

    for (const r of routes) {
      const res = await auditRoute(page, "Commerce", r);
      expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
    }
  });

  test("Module 2: Inventory & Purchasing Routes", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsMerchant(page);
    storeSlug = await discoverStoreSlug(page);

    const routes = [
      `/store/${storeSlug}/inventory`,
      `/store/${storeSlug}/inventory/warehouses`,
      `/store/${storeSlug}/inventory/ledger`,
      `/store/${storeSlug}/inventory/waste`,
      `/store/${storeSlug}/inventory/purchasing`,
      `/store/${storeSlug}/inventory/suppliers`,
    ];

    for (const r of routes) {
      const res = await auditRoute(page, "Inventory", r);
      expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
    }
  });

  test("Module 3: Point of Sale (POS) Routes", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsMerchant(page);
    storeSlug = await discoverStoreSlug(page);

    const routes = [
      `/store/${storeSlug}/pos`,
      `/store/${storeSlug}/pos/shifts`,
    ];

    for (const r of routes) {
      const res = await auditRoute(page, "POS", r);
      expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
    }
  });

  test("Module 4: HRM & Organization Routes", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsMerchant(page);
    storeSlug = await discoverStoreSlug(page);

    const routes = [
      `/store/${storeSlug}/hrm/employees`,
      `/store/${storeSlug}/hrm/attendance`,
      `/store/${storeSlug}/hrm/leaves`,
      `/store/${storeSlug}/hrm/payroll`,
      `/store/${storeSlug}/hrm/self-service`,
      `/store/${storeSlug}/hrm/organization`,
    ];

    for (const r of routes) {
      const res = await auditRoute(page, "HRM", r);
      expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
    }
  });

  test("Module 5: Finance & Accounting Routes", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsMerchant(page);
    storeSlug = await discoverStoreSlug(page);

    const routes = [
      `/store/${storeSlug}/finance/accounting`,
      `/store/${storeSlug}/finance/accounting/coa`,
      `/store/${storeSlug}/finance/accounting/journal`,
      `/store/${storeSlug}/finance/expenses`,
      `/store/${storeSlug}/finance/reports`,
    ];

    for (const r of routes) {
      const res = await auditRoute(page, "Finance", r);
      expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
    }
  });

  test("Module 6: Operations & Task Workflows Routes", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsMerchant(page);
    storeSlug = await discoverStoreSlug(page);

    const routes = [
      `/store/${storeSlug}/operations/approvals`,
      `/store/${storeSlug}/operations/tasks`,
      `/store/${storeSlug}/settings/shipping`,
      `/store/${storeSlug}/settings/courier`,
      `/store/${storeSlug}/settings/payments`,
      `/store/${storeSlug}/settings/taxes`,
    ];

    for (const r of routes) {
      const res = await auditRoute(page, "Operations", r);
      expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
    }
  });

  test("Module 7: Growth, CRM & Analytics Routes", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsMerchant(page);
    storeSlug = await discoverStoreSlug(page);

    const routes = [
      `/store/${storeSlug}/crm/deals`,
      `/store/${storeSlug}/support/tickets`,
      `/store/${storeSlug}/marketing`,
      `/store/${storeSlug}/coupons`,
      `/store/${storeSlug}/settings/tracking`,
      `/store/${storeSlug}/analytics`,
      `/store/${storeSlug}/analytics/visitors`,
      `/store/${storeSlug}/analytics/live`,
      `/store/${storeSlug}/reports`,
    ];

    for (const r of routes) {
      const res = await auditRoute(page, "Growth", r);
      expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
    }
  });

  test("Module 8: Storefront CMS & Website Builder Routes", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsMerchant(page);
    storeSlug = await discoverStoreSlug(page);

    const routes = [
      `/store/${storeSlug}/theme`,
      `/store/${storeSlug}/design`,
      `/store/${storeSlug}/pages`,
      `/store/${storeSlug}/media`,
      `/store/${storeSlug}/customer-messages`,
      `/store/${storeSlug}/builder/home`,
    ];

    for (const r of routes) {
      const res = await auditRoute(page, "Website", r);
      expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
    }
  });

  test("Module 9: System Settings & Team Members Routes", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsMerchant(page);
    storeSlug = await discoverStoreSlug(page);

    const routes = [
      `/store/${storeSlug}/settings`,
      `/store/${storeSlug}/settings/checkout`,
      `/store/${storeSlug}/settings/localization`,
      `/store/${storeSlug}/settings/notifications`,
      `/store/${storeSlug}/members`,
      `/store/${storeSlug}/apps`,
      `/store/${storeSlug}/activity`,
      `/store/${storeSlug}/billing`,
    ];

    for (const r of routes) {
      const res = await auditRoute(page, "System", r);
      expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
    }
  });

  test("Module 10: Multi-Tenant Workspace Hub Routes", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsMerchant(page);

    const routes = [
      "/workshops",
      "/workshops/billing",
      "/workshops/team",
      "/workshops/settings",
      "/workshops/account",
      "/workshops/activity",
      "/workshops/security",
      "/workshops/plans",
      "/workshops/stores/create",
    ];

    for (const r of routes) {
      const res = await auditRoute(page, "Workspace", r);
      expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
    }
  });

  test("Module 11: Public Storefront End-to-End Routes", async ({ page }) => {
    test.setTimeout(180_000);
    await page.context().clearCookies();

    const routes = [
      "/",
      "/login",
      "/register",
      "/site/nayeem",
      "/site/nayeem/shop",
      "/site/nayeem/cart",
      "/site/nayeem/checkout",
      "/site/nayeem/about",
      "/site/nayeem/contact",
      "/site/nayeem/faq",
    ];

    for (const r of routes) {
      const res = await auditRoute(page, "PublicStorefront", r);
      expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
    }
  });

  test("Module 12: Super Admin Platform Oversight Routes", async ({ page }) => {
    test.setTimeout(180_000);
    await loginAsSuperAdmin(page);

    const routes = [
      "/dashboard",
      "/admin/dashboard/stores",
      "/admin/dashboard/plans",
      "/admin/dashboard/users",
      "/admin/dashboard/subscriptions",
      "/admin/dashboard/invoices",
      "/admin/dashboard/payments",
      "/admin/dashboard/activity",
      "/admin/dashboard/audit-center",
      "/admin/dashboard/analytics",
      "/admin/dashboard/security",
      "/admin/dashboard/settings",
    ];

    for (const r of routes) {
      const res = await auditRoute(page, "SuperAdmin", r);
      expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
    }
  });
});
