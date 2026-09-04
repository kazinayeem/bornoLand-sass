import { test, expect } from "@playwright/test";
import { loginAsMerchant, loginAsSuperAdmin, logout } from "../helpers/auth";
import { attachPageMonitor } from "../helpers/monitor";

test.describe("Permissions & Strict Role-Based Access Control (@permissions @critical)", () => {
  test("Merchant is strictly blocked from accessing Super Admin portal (/admin/dashboard)", async ({ page }) => {
    const monitor = attachPageMonitor(page);
    await loginAsMerchant(page);

    // Attempt direct navigation to Super Admin route
    await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    // Must NOT remain on /admin/dashboard
    expect(page.url()).not.toContain("/admin/dashboard");
    // Should be redirected to /unauthorized, /workshops, or store dashboard
    expect(page.url()).toMatch(/\/(unauthorized|workshops|store\/[^/]+\/dashboard)/);

    expect(monitor.chunkErrors).toHaveLength(0);
  });

  test("Super Admin has full authorized access to /dashboard and admin panels", async ({ page }) => {
    const monitor = attachPageMonitor(page);
    await loginAsSuperAdmin(page);

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    // Must be on /dashboard or /admin/dashboard
    expect(page.url()).toMatch(/\/(dashboard|admin\/dashboard)/);
    const heading = page.locator("h1, h2, header").first();
    await expect(heading).toBeVisible({ timeout: 15_000 });

    expect(monitor.chunkErrors).toHaveLength(0);
    expect(monitor.hydrationErrors).toHaveLength(0);
  });

  test("Unauthenticated user accessing /store/{slug}/dashboard is redirected to /login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/store/nayeem/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    expect(page.url()).toContain("/login");
  });
});
