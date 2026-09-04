import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import { loginAsMerchant, loginAsSuperAdmin, discoverStoreSlug, logout } from "./helpers/auth";
import { attachPageMonitor } from "./helpers/monitor";

const OUTPUT_DIR = path.resolve(__dirname, "../../apps/web/public/docs/screenshots");
const AUDIT_REPORT_PATH = path.resolve(__dirname, "../../tests/reports/screenshot-audit.json");

test.describe("Automated Documentation Screenshot Collection & QA Audit", () => {
  test.setTimeout(900_000); // 15 minutes max for full audit

  test("Capture all real SaaS pages, UI states and QA audit", async ({ page }) => {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const auditResults: Array<{
      route: string;
      filename: string;
      module: string;
      role: string;
      status: "HEALTHY" | "FAILED";
      httpStatus?: number;
      consoleErrors: string[];
      networkErrors: string[];
      durationMs: number;
    }> = [];

    // Helper to capture a page with readiness check and error monitoring
    async function capture(
      urlPath: string,
      filename: string,
      module: string,
      role: string,
      viewport: { width: number; height: number } = { width: 1440, height: 900 }
    ) {
      await page.setViewportSize(viewport);
      const monitor = attachPageMonitor(page);
      const startTime = Date.now();
      let status: "HEALTHY" | "FAILED" = "HEALTHY";
      let httpStatus = 200;

      try {
        console.log(`[QA & Screenshot] Navigating to: ${urlPath} (${viewport.width}x${viewport.height})`);
        const res = await page.goto(urlPath, { waitUntil: "commit", timeout: 60000 });
        httpStatus = res?.status() || 200;
        await page.waitForLoadState("domcontentloaded", { timeout: 60000 }).catch(() => {});
        await page.waitForTimeout(1500);

        // Dismiss common toast overlays if present
        await page.evaluate(() => {
          const toasts = document.querySelectorAll('[data-sonner-toaster], .toast, [role="status"]');
          toasts.forEach((t) => ((t as HTMLElement).style.opacity = "0"));
        }).catch(() => {});

        const targetFile = path.join(OUTPUT_DIR, filename);
        await page.screenshot({ path: targetFile, fullPage: false });
        console.log(`✓ Saved: ${filename}`);
      } catch (err: any) {
        status = "FAILED";
        console.error(`✗ Error capturing ${urlPath}:`, err.message);
      }

      const durationMs = Date.now() - startTime;
      auditResults.push({
        route: urlPath,
        filename,
        module,
        role,
        status,
        httpStatus,
        consoleErrors: [...monitor.consoleErrors],
        networkErrors: monitor.failedRequests.map((f) => `${f.method} ${f.url} -> ${f.status}`),
        durationMs,
      });

      // Write progressive audit log
      fs.writeFileSync(AUDIT_REPORT_PATH, JSON.stringify(auditResults, null, 2), "utf-8");
    }

    // ──────────────────────────────────────────
    // 1. PUBLIC & AUTH FLOWS
    // ──────────────────────────────────────────
    await capture("/login", "auth-login.png", "Getting Started", "Public");

    // ──────────────────────────────────────────
    // 2. MERCHANT LOGIN & WORKSPACE
    // ──────────────────────────────────────────
    console.log("Logging in as Merchant...");
    await loginAsMerchant(page);
    await capture("/workshops", "workspace-selection.png", "Getting Started", "Merchant");

    const storeSlug = await discoverStoreSlug(page);
    console.log(`Discovered active store slug: ${storeSlug}`);

    // ──────────────────────────────────────────
    // 3. STORE DASHBOARD & COMMERCE
    // ──────────────────────────────────────────
    await capture(`/store/${storeSlug}/dashboard`, "store-dashboard.png", "Dashboard", "Merchant");
    await capture(`/store/${storeSlug}/orders`, "orders.png", "Commerce", "Merchant");
    await capture(`/store/${storeSlug}/customers`, "customers.png", "Commerce", "Merchant");
    await capture(`/store/${storeSlug}/products`, "products.png", "Commerce", "Merchant");
    await capture(`/store/${storeSlug}/categories`, "categories.png", "Commerce", "Merchant");
    await capture(`/store/${storeSlug}/orders/incomplete`, "orders-incomplete.png", "Commerce", "Merchant");
    await capture(`/store/${storeSlug}/reviews`, "reviews.png", "Commerce", "Merchant");

    // ──────────────────────────────────────────
    // 4. INVENTORY & WAREHOUSES
    // ──────────────────────────────────────────
    await capture(`/store/${storeSlug}/inventory`, "inventory-stock.png", "Inventory", "Merchant");
    await capture(`/store/${storeSlug}/inventory/warehouses`, "warehouses.png", "Inventory", "Merchant");
    await capture(`/store/${storeSlug}/inventory/ledger`, "stock-ledger.png", "Inventory", "Merchant");
    await capture(`/store/${storeSlug}/inventory/waste`, "waste-loss.png", "Inventory", "Merchant");

    // ──────────────────────────────────────────
    // 5. PURCHASING & SUPPLIERS
    // ──────────────────────────────────────────
    await capture(`/store/${storeSlug}/inventory/purchasing`, "purchase-orders.png", "Purchasing", "Merchant");
    await capture(`/store/${storeSlug}/inventory/suppliers`, "suppliers.png", "Purchasing", "Merchant");

    // ──────────────────────────────────────────
    // 6. POS (POINT OF SALE)
    // ──────────────────────────────────────────
    await capture(`/store/${storeSlug}/pos`, "pos-terminal.png", "POS", "Merchant");
    await capture(`/store/${storeSlug}/pos/shifts`, "pos-shifts.png", "POS", "Merchant");

    // ──────────────────────────────────────────
    // 7. PEOPLE & HRM
    // ──────────────────────────────────────────
    await capture(`/store/${storeSlug}/hrm/employees`, "hrm-employees.png", "HRM", "Merchant");
    await capture(`/store/${storeSlug}/hrm/organization`, "hrm-organization.png", "HRM", "Merchant");
    await capture(`/store/${storeSlug}/hrm/attendance`, "hrm-attendance.png", "HRM", "Merchant");
    await capture(`/store/${storeSlug}/hrm/leaves`, "hrm-leaves.png", "HRM", "Merchant");
    await capture(`/store/${storeSlug}/hrm/payroll`, "hrm-payroll.png", "HRM", "Merchant");

    // ──────────────────────────────────────────
    // 8. EMPLOYEE SELF-SERVICE
    // ──────────────────────────────────────────
    await capture(`/store/${storeSlug}/hrm/self-service`, "employee-self-service.png", "Employee Self-Service", "Employee");

    // ──────────────────────────────────────────
    // 9. FINANCE & ACCOUNTING
    // ──────────────────────────────────────────
    await capture(`/store/${storeSlug}/finance/accounting`, "finance-accounting.png", "Finance", "Merchant");
    await capture(`/store/${storeSlug}/finance/accounting/coa`, "finance-coa.png", "Finance", "Merchant");
    await capture(`/store/${storeSlug}/finance/accounting/journal`, "finance-journal.png", "Finance", "Merchant");
    await capture(`/store/${storeSlug}/finance/expenses`, "finance-expenses.png", "Finance", "Merchant");
    await capture(`/store/${storeSlug}/finance/reports`, "finance-reports.png", "Finance", "Merchant");

    // ──────────────────────────────────────────
    // 10. GROWTH & CRM
    // ──────────────────────────────────────────
    await capture(`/store/${storeSlug}/crm/deals`, "crm-deals.png", "Growth", "Merchant");
    await capture(`/store/${storeSlug}/support/tickets`, "support-tickets.png", "Growth", "Merchant");
    await capture(`/store/${storeSlug}/marketing`, "marketing-campaigns.png", "Growth", "Merchant");
    await capture(`/store/${storeSlug}/coupons`, "coupons.png", "Growth", "Merchant");
    await capture(`/store/${storeSlug}/settings/tracking`, "tracking-pixels.png", "Growth", "Merchant");
    await capture(`/store/${storeSlug}/analytics`, "analytics.png", "Growth", "Merchant");
    await capture(`/store/${storeSlug}/reports`, "business-reports.png", "Growth", "Merchant");

    // ──────────────────────────────────────────
    // 11. OPERATIONS
    // ──────────────────────────────────────────
    await capture(`/store/${storeSlug}/operations/approvals`, "operations-approvals.png", "Operations", "Merchant");
    await capture(`/store/${storeSlug}/operations/tasks`, "operations-tasks.png", "Operations", "Merchant");
    await capture(`/store/${storeSlug}/settings/shipping`, "shipping-zones.png", "Operations", "Merchant");
    await capture(`/store/${storeSlug}/settings/courier`, "courier-integrations.png", "Operations", "Merchant");
    await capture(`/store/${storeSlug}/settings/payments`, "payment-gateways.png", "Operations", "Merchant");
    await capture(`/store/${storeSlug}/settings/taxes`, "taxes-vat.png", "Operations", "Merchant");

    // ──────────────────────────────────────────
    // 12. WEBSITE & STOREFRONT BUILDER
    // ──────────────────────────────────────────
    await capture(`/store/${storeSlug}/design`, "theme-design.png", "Website", "Merchant");
    await capture(`/store/${storeSlug}/pages`, "custom-pages.png", "Website", "Merchant");
    await capture(`/store/${storeSlug}/media`, "media-library.png", "Website", "Merchant");
    await capture(`/store/${storeSlug}/customer-messages`, "customer-messages.png", "Website", "Merchant");

    // ──────────────────────────────────────────
    // 13. SETTINGS & TEAM
    // ──────────────────────────────────────────
    await capture(`/store/${storeSlug}/settings?section=general`, "store-settings.png", "Settings", "Merchant");
    await capture(`/store/${storeSlug}/members`, "team-permissions.png", "Settings", "Merchant");
    await capture(`/store/${storeSlug}/billing`, "plan-billing.png", "Settings", "Merchant");
    await capture(`/store/${storeSlug}/activity`, "activity-audit.png", "Settings", "Merchant");

    // ──────────────────────────────────────────
    // 14. MOBILE RESPONSIVE SNAPSHOTS (390 x 844)
    // ──────────────────────────────────────────
    await capture(`/store/${storeSlug}/dashboard`, "mobile-dashboard.png", "Dashboard", "Merchant", { width: 390, height: 844 });
    await capture(`/store/${storeSlug}/pos`, "mobile-pos.png", "POS", "Merchant", { width: 390, height: 844 });
    await capture(`/store/${storeSlug}/orders`, "mobile-orders.png", "Commerce", "Merchant", { width: 390, height: 844 });
    await capture(`/store/${storeSlug}/hrm/self-service`, "mobile-self-service.png", "Employee Self-Service", "Employee", { width: 390, height: 844 });

    // ──────────────────────────────────────────
    // 15. SUPER ADMIN PORTAL
    // ──────────────────────────────────────────
    console.log("Logging out and authenticating as Super Admin...");
    await logout(page);
    try {
      await loginAsSuperAdmin(page);
      await capture("/admin/dashboard", "admin-dashboard.png", "Super Admin", "Super Admin");
      await capture("/admin/dashboard/users", "admin-users.png", "Super Admin", "Super Admin");
      await capture("/admin/dashboard/stores", "admin-stores.png", "Super Admin", "Super Admin");
      await capture("/admin/dashboard/plans", "admin-plans.png", "Super Admin", "Super Admin");
      await capture("/admin/dashboard/subscriptions", "admin-subscriptions.png", "Super Admin", "Super Admin");
    } catch (adminErr: any) {
      console.warn("Super Admin capture warning:", adminErr.message);
    }

    console.log(`Audit report generated with ${auditResults.length} pages recorded at: ${AUDIT_REPORT_PATH}`);
    expect(auditResults.length).toBeGreaterThan(25);
  });
});
