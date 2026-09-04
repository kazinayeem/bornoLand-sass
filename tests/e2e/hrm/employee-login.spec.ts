import { test, expect } from "@playwright/test";
import { loginAsMerchant, loginAsSuperAdmin } from "../helpers/auth";
import { attachPageMonitor } from "../helpers/monitor";

test.describe("Employee login uses the existing auth system (@auth @hrm)", () => {
  test("does not expose a separate employee or staff login page", async ({ page }) => {
    await page.goto("/employee-login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /employee login/i })).toHaveCount(0);
    await page.goto("/staff-login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /staff login/i })).toHaveCount(0);
  });

  test("shared /login form accepts email or employee ID", async ({ page }) => {
    const monitor = attachPageMonitor(page);
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#login-email")).toBeVisible();
    await expect(page.getByText(/email or employee id/i).first()).toBeVisible();
    expect(page.url()).toContain("/login");
    expect(monitor.chunkErrors).toHaveLength(0);
  });

  test("merchant login is unchanged", async ({ page }) => {
    const finalUrl = await loginAsMerchant(page);
    expect(finalUrl).toMatch(/\/(workshops|store\/[^/]+\/dashboard)/);
  });

  test("super admin login is unchanged", async ({ page }) => {
    const finalUrl = await loginAsSuperAdmin(page);
    expect(finalUrl).toMatch(/\/(dashboard|admin\/dashboard)/);
  });
});
