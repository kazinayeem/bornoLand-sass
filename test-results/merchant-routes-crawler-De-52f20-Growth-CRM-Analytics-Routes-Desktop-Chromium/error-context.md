# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: merchant/routes-crawler.spec.ts >> Deep Modular Route & Page Health Crawler (@navigation @crawler) >> Module 7: Growth, CRM & Analytics Routes
- Location: tests/e2e/merchant/routes-crawler.spec.ts:228:7

# Error details

```
Error: Route /store/nayeem/settings/tracking failed: {"path":"/store/nayeem/settings/tracking","module":"Growth","status":"FAIL","httpStatus":0,"chunkErrors":[],"hydrationErrors":[],"exceptions":["page.goto: Timeout 25000ms exceeded.\nCall log:\n\u001b[2m  - navigating to \"http://localhost:3000/store/nayeem/settings/tracking\", waiting until \"domcontentloaded\"\u001b[22m\n"],"serverErrors":[]}

expect(received).toBe(expected) // Object.is equality

Expected: "PASS"
Received: "FAIL"
```

# Test source

```ts
  147 |     for (const r of routes) {
  148 |       const res = await auditRoute(page, "Inventory", r);
  149 |       expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
  150 |     }
  151 |   });
  152 | 
  153 |   test("Module 3: Point of Sale (POS) Routes", async ({ page }) => {
  154 |     test.setTimeout(120_000);
  155 |     await loginAsMerchant(page);
  156 |     storeSlug = await discoverStoreSlug(page);
  157 | 
  158 |     const routes = [
  159 |       `/store/${storeSlug}/pos`,
  160 |       `/store/${storeSlug}/pos/shifts`,
  161 |     ];
  162 | 
  163 |     for (const r of routes) {
  164 |       const res = await auditRoute(page, "POS", r);
  165 |       expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
  166 |     }
  167 |   });
  168 | 
  169 |   test("Module 4: HRM & Organization Routes", async ({ page }) => {
  170 |     test.setTimeout(180_000);
  171 |     await loginAsMerchant(page);
  172 |     storeSlug = await discoverStoreSlug(page);
  173 | 
  174 |     const routes = [
  175 |       `/store/${storeSlug}/hrm/employees`,
  176 |       `/store/${storeSlug}/hrm/attendance`,
  177 |       `/store/${storeSlug}/hrm/leaves`,
  178 |       `/store/${storeSlug}/hrm/payroll`,
  179 |       `/store/${storeSlug}/hrm/self-service`,
  180 |       `/store/${storeSlug}/hrm/organization`,
  181 |     ];
  182 | 
  183 |     for (const r of routes) {
  184 |       const res = await auditRoute(page, "HRM", r);
  185 |       expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
  186 |     }
  187 |   });
  188 | 
  189 |   test("Module 5: Finance & Accounting Routes", async ({ page }) => {
  190 |     test.setTimeout(180_000);
  191 |     await loginAsMerchant(page);
  192 |     storeSlug = await discoverStoreSlug(page);
  193 | 
  194 |     const routes = [
  195 |       `/store/${storeSlug}/finance/accounting`,
  196 |       `/store/${storeSlug}/finance/accounting/coa`,
  197 |       `/store/${storeSlug}/finance/accounting/journal`,
  198 |       `/store/${storeSlug}/finance/expenses`,
  199 |       `/store/${storeSlug}/finance/reports`,
  200 |     ];
  201 | 
  202 |     for (const r of routes) {
  203 |       const res = await auditRoute(page, "Finance", r);
  204 |       expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
  205 |     }
  206 |   });
  207 | 
  208 |   test("Module 6: Operations & Task Workflows Routes", async ({ page }) => {
  209 |     test.setTimeout(180_000);
  210 |     await loginAsMerchant(page);
  211 |     storeSlug = await discoverStoreSlug(page);
  212 | 
  213 |     const routes = [
  214 |       `/store/${storeSlug}/operations/approvals`,
  215 |       `/store/${storeSlug}/operations/tasks`,
  216 |       `/store/${storeSlug}/settings/shipping`,
  217 |       `/store/${storeSlug}/settings/courier`,
  218 |       `/store/${storeSlug}/settings/payments`,
  219 |       `/store/${storeSlug}/settings/taxes`,
  220 |     ];
  221 | 
  222 |     for (const r of routes) {
  223 |       const res = await auditRoute(page, "Operations", r);
  224 |       expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
  225 |     }
  226 |   });
  227 | 
  228 |   test("Module 7: Growth, CRM & Analytics Routes", async ({ page }) => {
  229 |     test.setTimeout(180_000);
  230 |     await loginAsMerchant(page);
  231 |     storeSlug = await discoverStoreSlug(page);
  232 | 
  233 |     const routes = [
  234 |       `/store/${storeSlug}/crm/deals`,
  235 |       `/store/${storeSlug}/support/tickets`,
  236 |       `/store/${storeSlug}/marketing`,
  237 |       `/store/${storeSlug}/coupons`,
  238 |       `/store/${storeSlug}/settings/tracking`,
  239 |       `/store/${storeSlug}/analytics`,
  240 |       `/store/${storeSlug}/analytics/visitors`,
  241 |       `/store/${storeSlug}/analytics/live`,
  242 |       `/store/${storeSlug}/reports`,
  243 |     ];
  244 | 
  245 |     for (const r of routes) {
  246 |       const res = await auditRoute(page, "Growth", r);
> 247 |       expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
      |                                                                       ^ Error: Route /store/nayeem/settings/tracking failed: {"path":"/store/nayeem/settings/tracking","module":"Growth","status":"FAIL","httpStatus":0,"chunkErrors":[],"hydrationErrors":[],"exceptions":["page.goto: Timeout 25000ms exceeded.\nCall log:\n\u001b[2m  - navigating to \"http://localhost:3000/store/nayeem/settings/tracking\", waiting until \"domcontentloaded\"\u001b[22m\n"],"serverErrors":[]}
  248 |     }
  249 |   });
  250 | 
  251 |   test("Module 8: Storefront CMS & Website Builder Routes", async ({ page }) => {
  252 |     test.setTimeout(180_000);
  253 |     await loginAsMerchant(page);
  254 |     storeSlug = await discoverStoreSlug(page);
  255 | 
  256 |     const routes = [
  257 |       `/store/${storeSlug}/theme`,
  258 |       `/store/${storeSlug}/design`,
  259 |       `/store/${storeSlug}/pages`,
  260 |       `/store/${storeSlug}/media`,
  261 |       `/store/${storeSlug}/customer-messages`,
  262 |       `/store/${storeSlug}/builder/home`,
  263 |     ];
  264 | 
  265 |     for (const r of routes) {
  266 |       const res = await auditRoute(page, "Website", r);
  267 |       expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
  268 |     }
  269 |   });
  270 | 
  271 |   test("Module 9: System Settings & Team Members Routes", async ({ page }) => {
  272 |     test.setTimeout(180_000);
  273 |     await loginAsMerchant(page);
  274 |     storeSlug = await discoverStoreSlug(page);
  275 | 
  276 |     const routes = [
  277 |       `/store/${storeSlug}/settings`,
  278 |       `/store/${storeSlug}/settings/checkout`,
  279 |       `/store/${storeSlug}/settings/localization`,
  280 |       `/store/${storeSlug}/settings/notifications`,
  281 |       `/store/${storeSlug}/members`,
  282 |       `/store/${storeSlug}/apps`,
  283 |       `/store/${storeSlug}/activity`,
  284 |       `/store/${storeSlug}/billing`,
  285 |     ];
  286 | 
  287 |     for (const r of routes) {
  288 |       const res = await auditRoute(page, "System", r);
  289 |       expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
  290 |     }
  291 |   });
  292 | 
  293 |   test("Module 10: Multi-Tenant Workspace Hub Routes", async ({ page }) => {
  294 |     test.setTimeout(180_000);
  295 |     await loginAsMerchant(page);
  296 | 
  297 |     const routes = [
  298 |       "/workshops",
  299 |       "/workshops/billing",
  300 |       "/workshops/team",
  301 |       "/workshops/settings",
  302 |       "/workshops/account",
  303 |       "/workshops/activity",
  304 |       "/workshops/security",
  305 |       "/workshops/plans",
  306 |       "/workshops/stores/create",
  307 |     ];
  308 | 
  309 |     for (const r of routes) {
  310 |       const res = await auditRoute(page, "Workspace", r);
  311 |       expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
  312 |     }
  313 |   });
  314 | 
  315 |   test("Module 11: Public Storefront End-to-End Routes", async ({ page }) => {
  316 |     test.setTimeout(180_000);
  317 |     await page.context().clearCookies();
  318 | 
  319 |     const routes = [
  320 |       "/",
  321 |       "/login",
  322 |       "/register",
  323 |       "/site/nayeem",
  324 |       "/site/nayeem/shop",
  325 |       "/site/nayeem/cart",
  326 |       "/site/nayeem/checkout",
  327 |       "/site/nayeem/about",
  328 |       "/site/nayeem/contact",
  329 |       "/site/nayeem/faq",
  330 |     ];
  331 | 
  332 |     for (const r of routes) {
  333 |       const res = await auditRoute(page, "PublicStorefront", r);
  334 |       expect(res.status, `Route ${r} failed: ${JSON.stringify(res)}`).toBe("PASS");
  335 |     }
  336 |   });
  337 | 
  338 |   test("Module 12: Super Admin Platform Oversight Routes", async ({ page }) => {
  339 |     test.setTimeout(180_000);
  340 |     await loginAsSuperAdmin(page);
  341 | 
  342 |     const routes = [
  343 |       "/dashboard",
  344 |       "/admin/dashboard/stores",
  345 |       "/admin/dashboard/plans",
  346 |       "/admin/dashboard/users",
  347 |       "/admin/dashboard/subscriptions",
```