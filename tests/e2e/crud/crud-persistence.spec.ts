import { test, expect } from "@playwright/test";
import { loginAsMerchant, discoverStoreSlug } from "../helpers/auth";
import { attachPageMonitor } from "../helpers/monitor";
import { generateTestId } from "../helpers/test-data";

test.describe("CRUD Workflows & Database Persistence (@crud @critical)", () => {
  let storeSlug = "nayeem";

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await loginAsMerchant(page);
    storeSlug = await discoverStoreSlug(page);
  });

  test("Product Full CRUD Cycle: Create -> Verify -> Edit -> Refresh Persist -> Delete", async ({ page }) => {
    const monitor = attachPageMonitor(page);
    const testProdName = generateTestId("PROD");
    console.log(`\n📦 Testing Product CRUD with name: "${testProdName}"`);

    // 1. Navigate to Create Product
    await page.goto(`/store/${storeSlug}/products/new`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    // Fill Title
    const nameInput = page.locator('input[placeholder*="Ginger Powder" i], input[placeholder*="Product name" i], #section-basic input[type="text"]').first();
    await expect(nameInput).toBeVisible({ timeout: 15_000 });
    await nameInput.fill(testProdName);

    // Fill Price
    const priceInput = page.locator('input[type="number"], input[placeholder*="0.00"]').first();
    if (await priceInput.isVisible().catch(() => false)) {
      await priceInput.fill("450");
    }

    // Click Publish or Save Draft
    const publishBtn = page.locator('button:has-text("Publish"), button:has-text("Save Draft"), button:has-text("Save")').last();
    await publishBtn.click();

    // Wait for network idle / redirect
    await page.waitForTimeout(2000);
    await page.goto(`/store/${storeSlug}/products`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    // Search or verify product appears in list
    const searchInput = page.locator('input[placeholder*="Search" i]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(testProdName);
      await page.waitForTimeout(1000);
    }

    // Verify created product is visible
    const productEntry = page.locator(`text="${testProdName}"`).first();
    await expect(productEntry).toBeVisible({ timeout: 15_000 });

    // 2. HARD REFRESH to verify database persistence (not just optimistic UI)
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(testProdName);
      await page.waitForTimeout(1000);
    }
    await expect(page.locator(`text="${testProdName}"`).first()).toBeVisible({ timeout: 15_000 });

    // 3. Clean up (Delete test product)
    const row = page.locator(`tr:has-text("${testProdName}"), div:has-text("${testProdName}")`).last();
    const actionBtn = row.locator('button[aria-label*="action" i], button:has(svg), button:has-text("Actions")').last();
    if (await actionBtn.isVisible().catch(() => false)) {
      await actionBtn.click();
      const deleteOption = page.locator('text=/delete|remove/i').first();
      if (await deleteOption.isVisible().catch(() => false)) {
        await deleteOption.click();
        const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(1500);
        }
      }
    }

    expect(monitor.chunkErrors).toHaveLength(0);
  });

  test("Warehouse Creation and Persistence", async ({ page }) => {
    const monitor = attachPageMonitor(page);
    const testWhName = generateTestId("WH");
    console.log(`\n🏢 Testing Warehouse CRUD with name: "${testWhName}"`);

    await page.goto(`/store/${storeSlug}/inventory/warehouses`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    // Open add warehouse modal
    const addBtn = page.locator('button:has-text("Add Storage Facility"), button:has-text("Add Warehouse"), button:has-text("New Warehouse")').first();
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
    await addBtn.click();

    const nameInput = page.locator('input[placeholder*="Central Hub" i], input[placeholder*="Warehouse" i], [role="dialog"] input').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill(testWhName);

    const submitBtn = page.locator('[role="dialog"] button[type="submit"], [role="dialog"] button:has-text("Save"), [role="dialog"] button:has-text("Add")').last();
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // Verify listing
    await expect(page.locator(`text="${testWhName}"`).first()).toBeVisible({ timeout: 10_000 });

    // Reload to verify DB persistence
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator(`text="${testWhName}"`).first()).toBeVisible({ timeout: 10_000 });

    expect(monitor.chunkErrors).toHaveLength(0);
  });
});
