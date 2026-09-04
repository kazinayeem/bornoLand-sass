import { test, expect } from "@playwright/test";
import { loginAsMerchant, discoverStoreSlug } from "../helpers/auth";
import { attachPageMonitor } from "../helpers/monitor";

test.describe("Workspace & Dynamic Store Discovery (@smoke @navigation)", () => {
  test("Merchant discovers accessible stores dynamically on /workshops", async ({ page }) => {
    const monitor = attachPageMonitor(page);
    await loginAsMerchant(page);

    await page.goto("/workshops", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    // Discover the active store slug from the UI
    const slug = await discoverStoreSlug(page);
    expect(slug).toBeTruthy();
    console.log(`[Dynamic Discovery] Discovered active store slug: "${slug}"`);

    // Navigate to the discovered store's dashboard
    await page.goto(`/store/${slug}/dashboard`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    // Verify store dashboard elements exist
    await expect(page).toHaveURL(new RegExp(`/store/${slug}/dashboard`));
    const mainHeading = page.locator("h1, h2, [data-testid='store-name'], header").first();
    await expect(mainHeading).toBeVisible({ timeout: 15_000 });

    // Verify zero chunk load errors
    expect(monitor.chunkErrors).toHaveLength(0);
    expect(monitor.hydrationErrors).toHaveLength(0);
  });

  test("Direct URL navigation to /store/{slug}/dashboard succeeds with refresh", async ({ page }) => {
    const monitor = attachPageMonitor(page);
    await loginAsMerchant(page);
    const slug = await discoverStoreSlug(page);

    await page.goto(`/store/${slug}/dashboard`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(`/store/${slug}/dashboard`));

    // Hard refresh
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(`/store/${slug}/dashboard`));

    expect(monitor.chunkErrors).toHaveLength(0);
    expect(monitor.hydrationErrors).toHaveLength(0);
  });
});
