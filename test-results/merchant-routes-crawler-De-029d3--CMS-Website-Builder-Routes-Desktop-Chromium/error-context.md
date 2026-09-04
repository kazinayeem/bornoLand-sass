# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: merchant/routes-crawler.spec.ts >> Deep Modular Route & Page Health Crawler (@navigation @crawler) >> Module 8: Storefront CMS & Website Builder Routes
- Location: tests/e2e/merchant/routes-crawler.spec.ts:251:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link "BornoLand" [ref=e4] [cursor=pointer]:
        - /url: /
    - main [ref=e15]:
      - generic [ref=e18]:
        - generic [ref=e19]:
          - heading "Welcome back" [level=1] [ref=e20]
          - paragraph [ref=e21]: Sign in to manage your business.
        - generic [ref=e22]:
          - generic [ref=e23]:
            - generic [ref=e24]: Email or Employee ID
            - textbox "Email or Employee ID" [ref=e25]:
              - /placeholder: name@company.com or EMP-0001
          - generic [ref=e26]:
            - generic [ref=e27]:
              - generic [ref=e28]: Password
              - link "Forgot password?" [ref=e29] [cursor=pointer]:
                - /url: /forgot-password
            - generic [ref=e30]:
              - textbox "Password" [ref=e31]:
                - /placeholder: ••••••••
              - button "Show password" [ref=e32] [cursor=pointer]
          - generic [ref=e36]:
            - checkbox "Remember me on this device" [ref=e37] [cursor=pointer]
            - generic [ref=e38] [cursor=pointer]: Remember me on this device
          - button "Sign in" [ref=e39] [cursor=pointer]
          - generic [ref=e41]: OR
          - button "Continue with Google" [ref=e46] [cursor=pointer]
          - generic [ref=e53]:
            - generic [ref=e54]: Try BornoLand Demo
            - generic [ref=e56]:
              - button "Demo Merchant" [ref=e57] [cursor=pointer]
              - button "Demo Super Admin" [ref=e63] [cursor=pointer]
        - paragraph [ref=e68]:
          - text: Don't have an account?
          - link "Create an account" [ref=e69] [cursor=pointer]:
            - /url: /register
    - contentinfo [ref=e70]:
      - generic [ref=e71]:
        - link "Terms" [ref=e72] [cursor=pointer]:
          - /url: /terms
        - generic [ref=e73]: •
        - link "Privacy" [ref=e74] [cursor=pointer]:
          - /url: /privacy
        - generic [ref=e75]: •
        - link "User Rules" [ref=e76] [cursor=pointer]:
          - /url: /user-rules
      - generic [ref=e78]:
        - generic [ref=e79]: Made by
        - link "BornoSoft.bd" [ref=e80] [cursor=pointer]:
          - /url: https://bornosoft.site
  - region "Notifications alt+T"
  - alert [ref=e81]
  - button "Open Next.js Dev Tools" [ref=e87] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect, type Page } from "@playwright/test";
  2   | 
  3   | export const TEST_CREDENTIALS = {
  4   |   merchant: {
  5   |     email: process.env.TEST_MERCHANT_EMAIL || "demo@bornoland.com",
  6   |     password: process.env.TEST_MERCHANT_PASSWORD || "Demo@123",
  7   |   },
  8   |   admin: {
  9   |     email: process.env.TEST_ADMIN_EMAIL || "admin@bornoland.com",
  10  |     password: process.env.TEST_ADMIN_PASSWORD || "Admin@123",
  11  |   },
  12  | };
  13  | 
  14  | /**
  15  |  * Log into the platform as Demo Merchant
  16  |  */
  17  | export async function loginAsMerchant(page: Page): Promise<string> {
  18  |   await page.goto("/login", { waitUntil: "domcontentloaded" });
  19  |   await page.waitForLoadState("networkidle").catch(() => {});
  20  | 
  21  |   // Check if Demo Merchant button is present
  22  |   const demoBtn = page.getByRole("button", { name: /Demo Merchant/i });
  23  |   if (await demoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  24  |     await demoBtn.click();
  25  |   } else {
  26  |     // Fill credentials manually
  27  |     const emailInput = page.locator('#login-email, input[name="email"], input[type="email"]').first();
  28  |     const passwordInput = page.locator('#login-password, input[name="password"], input[type="password"]').first();
  29  |     await emailInput.fill(TEST_CREDENTIALS.merchant.email);
  30  |     await passwordInput.fill(TEST_CREDENTIALS.merchant.password);
  31  |     const submitBtn = page.locator('button[type="submit"]');
  32  |     await submitBtn.click();
  33  |   }
  34  | 
  35  |   // Expect redirect to either /workshops or /store/*/dashboard
> 36  |   await page.waitForURL((url) => {
      |              ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  37  |     const path = url.pathname;
  38  |     return path.startsWith("/workshops") || path.startsWith("/store/") || path === "/dashboard";
  39  |   }, { timeout: 30000 });
  40  | 
  41  |   return page.url();
  42  | }
  43  | 
  44  | /**
  45  |  * Log into the platform as Super Admin
  46  |  */
  47  | export async function loginAsSuperAdmin(page: Page): Promise<string> {
  48  |   // Try /login first because it has the Quick Demo Super Admin button, or /admin/login
  49  |   await page.goto("/login", { waitUntil: "domcontentloaded" });
  50  |   await page.waitForLoadState("networkidle").catch(() => {});
  51  | 
  52  |   const demoAdminBtn = page.getByRole("button", { name: /Demo Super Admin/i });
  53  |   if (await demoAdminBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  54  |     await demoAdminBtn.click();
  55  |   } else {
  56  |     await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  57  |     const emailInput = page.locator('#login-email, input[name="email"], input[type="email"]').first();
  58  |     const passwordInput = page.locator('#login-password, input[name="password"], input[type="password"]').first();
  59  |     await emailInput.fill(TEST_CREDENTIALS.admin.email);
  60  |     await passwordInput.fill(TEST_CREDENTIALS.admin.password);
  61  |     const submitBtn = page.locator('button[type="submit"]');
  62  |     await submitBtn.click();
  63  |   }
  64  | 
  65  |   await page.waitForURL((url) => {
  66  |     return url.pathname === "/dashboard" || url.pathname.startsWith("/admin/dashboard");
  67  |   }, { timeout: 30000 });
  68  | 
  69  |   return page.url();
  70  | }
  71  | 
  72  | /**
  73  |  * Discovers accessible store slug from /workshops
  74  |  */
  75  | export async function discoverStoreSlug(page: Page): Promise<string> {
  76  |   // If not already on /workshops, go there
  77  |   if (!page.url().includes("/workshops")) {
  78  |     await page.goto("/workshops", { waitUntil: "domcontentloaded" });
  79  |   }
  80  |   await page.waitForLoadState("networkidle").catch(() => {});
  81  | 
  82  |   // Find store links (links containing /store/ or store cards)
  83  |   const storeLinks = page.locator('a[href*="/store/"]');
  84  |   const count = await storeLinks.count();
  85  | 
  86  |   if (count > 0) {
  87  |     for (let i = 0; i < count; i++) {
  88  |       const href = await storeLinks.nth(i).getAttribute("href");
  89  |       if (href) {
  90  |         const match = href.match(/\/store\/([^/]+)/);
  91  |         if (match && match[1] && match[1] !== "[storeSlug]") {
  92  |           return match[1];
  93  |         }
  94  |       }
  95  |     }
  96  |   }
  97  | 
  98  |   // If already redirected to /store/[storeSlug]/dashboard
  99  |   const currentMatch = page.url().match(/\/store\/([^/]+)/);
  100 |   if (currentMatch && currentMatch[1]) {
  101 |     return currentMatch[1];
  102 |   }
  103 | 
  104 |   // Fallback to verified seeded store
  105 |   return "nayeem";
  106 | }
  107 | 
  108 | /**
  109 |  * Logout the current user
  110 |  */
  111 | export async function logout(page: Page): Promise<void> {
  112 |   // Try to find logout button in user menu
  113 |   const userMenuBtn = page.locator('button[aria-label="User menu"], [data-testid="user-menu"], header button:has(svg)').last();
  114 |   if (await userMenuBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  115 |     await userMenuBtn.click();
  116 |     const logoutBtn = page.getByRole("menuitem", { name: /log out|sign out/i }).or(page.getByText(/log out|sign out/i));
  117 |     if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  118 |       await logoutBtn.click();
  119 |     }
  120 |   }
  121 | 
  122 |   // Fallback: Clear cookies and navigate to /login
  123 |   await page.context().clearCookies();
  124 |   await page.goto("/login", { waitUntil: "domcontentloaded" });
  125 |   await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
  126 | }
  127 | 
```