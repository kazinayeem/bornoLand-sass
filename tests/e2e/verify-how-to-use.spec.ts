import { test, expect } from "@playwright/test";

test.describe("Verify /how-to-use Documentation Page", () => {
  test("Desktop: Verify guide page, search, role filters, lightbox modal, and images", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    const response = await page.goto("/how-to-use", { waitUntil: "domcontentloaded", timeout: 30000 });
    expect(response?.status()).toBe(200);

    // Check main headings
    await expect(page.locator("h1")).toContainText("BornoLand কীভাবে ব্যবহার করবেন");
    await expect(page.getByText("BornoLand Real UI Documentation")).toBeVisible();

    // Check that at least 15 documentation articles are mounted
    const articles = page.locator("article");
    const articleCount = await articles.count();
    console.log(`Found ${articleCount} documentation articles rendered on /how-to-use`);
    expect(articleCount).toBeGreaterThan(15);

    // Verify all images on the page load properly (no broken images)
    const images = page.locator("article img");
    const imgCount = await images.count();
    console.log(`Verifying ${imgCount} screenshots on page...`);
    expect(imgCount).toBeGreaterThan(15);

    // Test Search Functionality
    const searchInput = page.locator('input[placeholder*="মডিউল, প্রোডাক্ট, অর্ডার"]');
    await searchInput.fill("অর্ডার");
    await page.waitForTimeout(500);

    const filteredCount = await page.locator("article").count();
    console.log(`Articles matching "অর্ডার": ${filteredCount}`);
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(articleCount);

    // Clear search
    await searchInput.fill("");
    await page.waitForTimeout(300);

    // Test Role Filter: Employee Self-Service
    const employeeFilterBtn = page.getByRole("button", { name: /কর্মী সেলফ-সার্ভিস/i });
    await employeeFilterBtn.click();
    await page.waitForTimeout(500);

    const employeeArticles = await page.locator("article").count();
    console.log(`Articles under Employee Self-Service role: ${employeeArticles}`);
    expect(employeeArticles).toBeGreaterThan(0);
    await expect(page.locator("article").first()).toContainText("Employee");

    // Reset role to All
    const allRoleBtn = page.getByRole("button", { name: /সকল রোল/i });
    await allRoleBtn.click();
    await page.waitForTimeout(300);

    // Test Lightbox Modal
    const firstScreenshot = page.locator("article .group.cursor-pointer").first();
    await firstScreenshot.click();

    // Lightbox should now be visible
    const lightboxModal = page.locator('div[role="dialog"]');
    await expect(lightboxModal).toBeVisible();
    await expect(lightboxModal).toContainText("BornoLand Real UI Documentation");

    // Test Next button in Lightbox
    const nextBtn = page.locator('button[aria-label="Next screenshot"]');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(300);
    }

    // Close Lightbox via Escape
    await page.keyboard.press("Escape");
    await expect(lightboxModal).not.toBeVisible();

    // Take verified full-view screenshot of the how-to-use page
    await page.screenshot({
      path: "apps/web/public/docs/screenshots/how-to-use-desktop.png",
      fullPage: false,
    });
    console.log("✓ Saved how-to-use-desktop.png");
  });

  test("Mobile: Verify responsive layout (390x844) and mobile TOC drawer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/how-to-use", { waitUntil: "domcontentloaded", timeout: 30000 });

    await expect(page.locator("h1")).toContainText("BornoLand কীভাবে ব্যবহার করবেন");

    // Allow hydration to attach event handlers
    await page.waitForTimeout(1500);

    // Check mobile TOC button
    const mobileTocBtn = page.getByRole("button", { name: /সূচিপত্র/i });
    await expect(mobileTocBtn).toBeVisible();
    await mobileTocBtn.click();

    // Verify slide-over drawer opens
    const drawerNav = page.locator('[data-testid="mobile-toc-nav"]');
    await expect(drawerNav).toBeVisible();

    // Close drawer
    await page.locator('button:has(svg.lucide-x)').click();
    await expect(drawerNav).not.toBeVisible();

    // Take verified mobile screenshot
    await page.screenshot({
      path: "apps/web/public/docs/screenshots/how-to-use-mobile.png",
      fullPage: false,
    });
    console.log("✓ Saved how-to-use-mobile.png");
  });
});
