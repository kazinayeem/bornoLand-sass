import { expect, type Page } from "@playwright/test";

export const TEST_CREDENTIALS = {
  merchant: {
    email: process.env.TEST_MERCHANT_EMAIL || "demo@bornoland.com",
    password: process.env.TEST_MERCHANT_PASSWORD || "Demo@123",
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || "admin@bornoland.com",
    password: process.env.TEST_ADMIN_PASSWORD || "Admin@123",
  },
};

/**
 * Log into the platform as Demo Merchant
 */
export async function loginAsMerchant(page: Page): Promise<string> {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});

  // Check if Demo Merchant button is present
  const demoBtn = page.getByRole("button", { name: /Demo Merchant/i });
  if (await demoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await demoBtn.click();
  } else {
    // Fill credentials manually
    const emailInput = page.locator('#login-email, input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('#login-password, input[name="password"], input[type="password"]').first();
    await emailInput.fill(TEST_CREDENTIALS.merchant.email);
    await passwordInput.fill(TEST_CREDENTIALS.merchant.password);
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
  }

  // Expect redirect to either /workshops or /store/*/dashboard
  await page.waitForURL((url) => {
    const path = url.pathname;
    return path.startsWith("/workshops") || path.startsWith("/store/") || path === "/dashboard";
  }, { timeout: 30000 });

  return page.url();
}

/**
 * Log into the platform as Super Admin
 */
export async function loginAsSuperAdmin(page: Page): Promise<string> {
  // Try /login first because it has the Quick Demo Super Admin button, or /admin/login
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});

  const demoAdminBtn = page.getByRole("button", { name: /Demo Super Admin/i });
  if (await demoAdminBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await demoAdminBtn.click();
  } else {
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    const emailInput = page.locator('#login-email, input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('#login-password, input[name="password"], input[type="password"]').first();
    await emailInput.fill(TEST_CREDENTIALS.admin.email);
    await passwordInput.fill(TEST_CREDENTIALS.admin.password);
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
  }

  await page.waitForURL((url) => {
    return url.pathname === "/dashboard" || url.pathname.startsWith("/admin/dashboard");
  }, { timeout: 30000 });

  return page.url();
}

/**
 * Discovers accessible store slug from /workshops
 */
export async function discoverStoreSlug(page: Page): Promise<string> {
  // If not already on /workshops, go there
  if (!page.url().includes("/workshops")) {
    await page.goto("/workshops", { waitUntil: "domcontentloaded" });
  }
  await page.waitForLoadState("networkidle").catch(() => {});

  // Find store links (links containing /store/ or store cards)
  const storeLinks = page.locator('a[href*="/store/"]');
  const count = await storeLinks.count();

  if (count > 0) {
    for (let i = 0; i < count; i++) {
      const href = await storeLinks.nth(i).getAttribute("href");
      if (href) {
        const match = href.match(/\/store\/([^/]+)/);
        if (match && match[1] && match[1] !== "[storeSlug]") {
          return match[1];
        }
      }
    }
  }

  // If already redirected to /store/[storeSlug]/dashboard
  const currentMatch = page.url().match(/\/store\/([^/]+)/);
  if (currentMatch && currentMatch[1]) {
    return currentMatch[1];
  }

  // Fallback to verified seeded store
  return "nayeem";
}

/**
 * Logout the current user
 */
export async function logout(page: Page): Promise<void> {
  // Try to find logout button in user menu
  const userMenuBtn = page.locator('button[aria-label="User menu"], [data-testid="user-menu"], header button:has(svg)').last();
  if (await userMenuBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await userMenuBtn.click();
    const logoutBtn = page.getByRole("menuitem", { name: /log out|sign out/i }).or(page.getByText(/log out|sign out/i));
    if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutBtn.click();
    }
  }

  // Fallback: Clear cookies and navigate to /login
  await page.context().clearCookies();
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
}
