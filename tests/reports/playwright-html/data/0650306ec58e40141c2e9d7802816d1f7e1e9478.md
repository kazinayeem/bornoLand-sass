# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/auth.spec.ts >> Authentication & Session Lifecycle (@auth @smoke) >> Super Admin logs in and reaches Platform Overview (/dashboard)
- Location: tests/e2e/auth/auth.spec.ts:37:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link "BornoLand" [ref=e4] [cursor=pointer]:
        - /url: /
    - main [ref=e15]:
      - generic [ref=e18]:
        - generic [ref=e19]:
          - heading "Super Admin Portal" [level=1] [ref=e20]
          - paragraph [ref=e21]: Sign in to BornoLand platform administration.
        - generic [ref=e22]:
          - generic [ref=e23]:
            - generic [ref=e24]: Email or Employee ID
            - textbox "Email or Employee ID" [active] [invalid] [ref=e25]:
              - /placeholder: name@company.com or EMP-0001
            - paragraph [ref=e26]: Email or Employee ID is required
          - generic [ref=e27]:
            - generic [ref=e28]:
              - generic [ref=e29]: Password
              - link "Forgot password?" [ref=e30] [cursor=pointer]:
                - /url: /forgot-password
            - generic [ref=e31]:
              - textbox "Password" [ref=e32]:
                - /placeholder: ••••••••
              - button "Show password" [ref=e33] [cursor=pointer]
            - paragraph [ref=e37]: Invalid input
          - generic [ref=e38]:
            - checkbox "Remember me on this device" [ref=e39] [cursor=pointer]
            - generic [ref=e40] [cursor=pointer]: Remember me on this device
          - button "Sign in" [ref=e41] [cursor=pointer]
        - link "← Back to Merchant Sign in" [ref=e44] [cursor=pointer]:
          - /url: /login
    - contentinfo [ref=e45]:
      - generic [ref=e46]:
        - link "Terms" [ref=e47] [cursor=pointer]:
          - /url: /terms
        - generic [ref=e48]: •
        - link "Privacy" [ref=e49] [cursor=pointer]:
          - /url: /privacy
        - generic [ref=e50]: •
        - link "User Rules" [ref=e51] [cursor=pointer]:
          - /url: /user-rules
      - generic [ref=e53]:
        - generic [ref=e54]: Made by
        - link "BornoSoft.bd" [ref=e55] [cursor=pointer]:
          - /url: https://bornosoft.site
  - region "Notifications alt+T"
  - alert [ref=e56]
  - button "Open Next.js Dev Tools" [ref=e62] [cursor=pointer]
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
  27  |     await page.fill('input[type="email"], input[name="email"]', TEST_CREDENTIALS.merchant.email);
  28  |     await page.fill('input[type="password"], input[name="password"]', TEST_CREDENTIALS.merchant.password);
  29  |     const submitBtn = page.locator('button[type="submit"]');
  30  |     await submitBtn.click();
  31  |   }
  32  | 
  33  |   // Expect redirect to either /workshops or /store/*/dashboard
  34  |   await page.waitForURL((url) => {
  35  |     const path = url.pathname;
  36  |     return path.startsWith("/workshops") || path.startsWith("/store/") || path === "/dashboard";
  37  |   }, { timeout: 15000 });
  38  | 
  39  |   return page.url();
  40  | }
  41  | 
  42  | /**
  43  |  * Log into the platform as Super Admin
  44  |  */
  45  | export async function loginAsSuperAdmin(page: Page): Promise<string> {
  46  |   await page.goto("/admin/login", { waitUntil: "domcontentloaded" }).catch(async () => {
  47  |     await page.goto("/login", { waitUntil: "domcontentloaded" });
  48  |   });
  49  | 
  50  |   const demoAdminBtn = page.getByRole("button", { name: /Demo Super Admin/i });
  51  |   if (await demoAdminBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  52  |     await demoAdminBtn.click();
  53  |   } else {
  54  |     await page.fill('input[type="email"], input[name="email"]', TEST_CREDENTIALS.admin.email);
  55  |     await page.fill('input[type="password"], input[name="password"]', TEST_CREDENTIALS.admin.password);
  56  |     const submitBtn = page.locator('button[type="submit"]');
  57  |     await submitBtn.click();
  58  |   }
  59  | 
> 60  |   await page.waitForURL((url) => {
      |              ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  61  |     return url.pathname === "/dashboard" || url.pathname.startsWith("/admin/dashboard");
  62  |   }, { timeout: 15000 });
  63  | 
  64  |   return page.url();
  65  | }
  66  | 
  67  | /**
  68  |  * Discovers accessible store slug from /workshops
  69  |  */
  70  | export async function discoverStoreSlug(page: Page): Promise<string> {
  71  |   // If not already on /workshops, go there
  72  |   if (!page.url().includes("/workshops")) {
  73  |     await page.goto("/workshops", { waitUntil: "domcontentloaded" });
  74  |   }
  75  |   await page.waitForLoadState("networkidle").catch(() => {});
  76  | 
  77  |   // Find store links (links containing /store/ or store cards)
  78  |   const storeLinks = page.locator('a[href*="/store/"]');
  79  |   const count = await storeLinks.count();
  80  | 
  81  |   if (count > 0) {
  82  |     for (let i = 0; i < count; i++) {
  83  |       const href = await storeLinks.nth(i).getAttribute("href");
  84  |       if (href) {
  85  |         const match = href.match(/\/store\/([^/]+)/);
  86  |         if (match && match[1] && match[1] !== "[storeSlug]") {
  87  |           return match[1];
  88  |         }
  89  |       }
  90  |     }
  91  |   }
  92  | 
  93  |   // If already redirected to /store/[storeSlug]/dashboard
  94  |   const currentMatch = page.url().match(/\/store\/([^/]+)/);
  95  |   if (currentMatch && currentMatch[1]) {
  96  |     return currentMatch[1];
  97  |   }
  98  | 
  99  |   // Fallback to verified seeded store
  100 |   return "nayeem";
  101 | }
  102 | 
  103 | /**
  104 |  * Logout the current user
  105 |  */
  106 | export async function logout(page: Page): Promise<void> {
  107 |   // Try to find logout button in user menu
  108 |   const userMenuBtn = page.locator('button[aria-label="User menu"], [data-testid="user-menu"], header button:has(svg)').last();
  109 |   if (await userMenuBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  110 |     await userMenuBtn.click();
  111 |     const logoutBtn = page.getByRole("menuitem", { name: /log out|sign out/i }).or(page.getByText(/log out|sign out/i));
  112 |     if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  113 |       await logoutBtn.click();
  114 |     }
  115 |   }
  116 | 
  117 |   // Fallback: Clear cookies and navigate to /login
  118 |   await page.context().clearCookies();
  119 |   await page.goto("/login", { waitUntil: "domcontentloaded" });
  120 |   await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
  121 | }
  122 | 
```