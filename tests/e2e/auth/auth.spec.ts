import { test, expect } from "@playwright/test";
import { loginAsMerchant, loginAsSuperAdmin, logout, TEST_CREDENTIALS } from "../helpers/auth";
import { attachPageMonitor } from "../helpers/monitor";

test.describe("Authentication & Session Lifecycle (@auth @smoke)", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("Invalid login displays validation or error feedback", async ({ page }) => {
    const monitor = attachPageMonitor(page);
    await page.goto("/login");

    await page.fill('input[type="email"], input[name="email"]', "invalid-user@bornoland.test");
    await page.fill('input[type="password"], input[name="password"]', "WrongPassword123!");
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify error state appears
    const errorAlert = page.locator("text=/incorrect|invalid|failed|not found|error|too many/i").first();
    await expect(errorAlert).toBeVisible({ timeout: 10_000 });

    // Ensure no chunk load failures occurred
    expect(monitor.chunkErrors).toHaveLength(0);
  });

  test("Merchant logs in successfully and lands at workspace/store (@smoke)", async ({ page }) => {
    const monitor = attachPageMonitor(page);
    const finalUrl = await loginAsMerchant(page);

    expect(finalUrl).toMatch(/\/(workshops|store\/[^/]+\/dashboard)/);

    // Verify session persistence on hard refresh
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);

    expect(monitor.chunkErrors).toHaveLength(0);
    expect(monitor.hydrationErrors).toHaveLength(0);
  });

  test("Super Admin logs in and reaches Platform Overview (/dashboard)", async ({ page }) => {
    const monitor = attachPageMonitor(page);
    const finalUrl = await loginAsSuperAdmin(page);

    expect(finalUrl).toMatch(/\/(dashboard|admin\/dashboard)/);

    // Hard refresh persistence
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/(dashboard|admin\/dashboard)/);

    expect(monitor.chunkErrors).toHaveLength(0);
    expect(monitor.hydrationErrors).toHaveLength(0);
  });

  test("Logout clears session and blocks access to protected routes", async ({ page }) => {
    await loginAsMerchant(page);
    await logout(page);

    // Try navigating to a protected route directly
    await page.goto("/workshops", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    expect(page.url()).toContain("/login");
  });

  test("Unauthenticated access to /admin/dashboard redirects to admin login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    expect(page.url()).toMatch(/login/);
  });
});
