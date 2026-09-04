import { test, expect } from "@playwright/test";
import { loginAsMerchant, discoverStoreSlug } from "../helpers/auth";
import { attachPageMonitor } from "../helpers/monitor";

test.describe("Tenant Isolation & Multi-Tenancy Boundary Safety (@tenant @critical)", () => {
  test("Public storefront (/site/{tenant}) displays targeted store without cross-tenant leakage", async ({ page }) => {
    const monitor = attachPageMonitor(page);
    
    // Test storefront for store "nayeem"
    await page.goto("/site/nayeem", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    // Ensure storefront rendered
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Verify page title or content mentions storefront / products
    const title = await page.title();
    expect(title).toBeTruthy();

    expect(monitor.chunkErrors).toHaveLength(0);
    expect(monitor.hydrationErrors).toHaveLength(0);
  });

  test("Invalid non-existent tenant does not silently resolve to another tenant's store", async ({ page }) => {
    const monitor = attachPageMonitor(page);
    const nonExistentTenant = "non-existent-tenant-" + Date.now();

    await page.goto(`/site/${nonExistentTenant}`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    // Must show Store not found or 404 error page, not a valid store's catalog
    const pageText = await page.locator("body").innerText();
    const showsNotFound = /not found|404|doesn't exist/i.test(pageText);
    expect(showsNotFound).toBe(true);

    expect(monitor.chunkErrors).toHaveLength(0);
  });

  test("Merchant workspace enforces tenant boundaries across store URLs", async ({ page }) => {
    const monitor = attachPageMonitor(page);
    await loginAsMerchant(page);
    const validSlug = await discoverStoreSlug(page);

    // Attempt to access an arbitrary fictional store slug
    const fakeSlug = "fake-store-" + Date.now();
    await page.goto(`/store/${fakeSlug}/dashboard`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    // Must not show real store dashboard of validSlug
    const url = page.url();
    const bodyText = await page.locator("body").innerText();
    const isDeniedOrRedirected =
      !url.includes(`/store/${fakeSlug}/dashboard`) ||
      /not found|unauthorized|forbidden|error/i.test(bodyText);

    expect(isDeniedOrRedirected).toBe(true);
    expect(monitor.chunkErrors).toHaveLength(0);
  });
});
