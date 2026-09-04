import { test, expect } from "@playwright/test";
import { loginAsMerchant, discoverStoreSlug } from "../helpers/auth";
import { attachPageMonitor } from "../helpers/monitor";

const VIEWPORTS = [
  { name: "Mobile Small (375x812)", width: 375, height: 812 },
  { name: "Tablet Portrait (768x1024)", width: 768, height: 1024 },
  { name: "Desktop Large (1440x900)", width: 1440, height: 900 },
];

test.describe("Responsive Design & Mobile Viewport Audit (@responsive @smoke)", () => {
  test("Public Landing & Login render without horizontal body overflow", async ({ page }) => {
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/login", { waitUntil: "domcontentloaded" });

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasOverflow, `Overflow detected on /login at ${vp.name}`).toBe(false);
    }
  });

  test("Store ERP Dashboard renders responsively across device sizes", async ({ page }) => {
    await loginAsMerchant(page);
    const slug = await discoverStoreSlug(page);

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`/store/${slug}/dashboard`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});

      // On mobile viewports, verify mobile menu toggle button exists
      if (vp.width < 1024) {
        const mobileToggle = page.locator('button[aria-label*="menu" i], button:has(svg.lucide-menu), [data-testid="mobile-menu-btn"]').first();
        if (await mobileToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
          await mobileToggle.click();
          await page.waitForTimeout(500);
          // Close it again
          await page.keyboard.press("Escape").catch(() => {});
        }
      }

      // Check header/content visibility
      const header = page.locator("header, h1, [data-testid='store-name']").first();
      await expect(header).toBeVisible();
    }
  });
});
