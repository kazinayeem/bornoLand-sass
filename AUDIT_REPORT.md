# Bornoland — Enterprise Audit Report

**Repository:** `bornoland` (pnpm + Turborepo monorepo)
**Applications audited:** `apps/web` (Next.js 15.3.3 / React 19.1 / Tailwind v4 / RTK Query), `apps/api` (Express 5 / Mongoose 8 / MongoDB), `mobileapp` (Expo, surveyed only)
**Audit date:** 26 July 2026
**Audit type:** Read-only static audit. No source files were modified.
**Overall verdict:** **NOT PRODUCTION READY** — 11 Critical and 24 High severity findings, including live database credentials committed to Git, systemic cross-tenant authorization failures, and several advertised features that are non-functional stubs.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Methodology, Scope & Confidence](#2-methodology-scope--confidence)
3. [Codebase Statistics](#3-codebase-statistics)
4. [Scorecard](#4-scorecard)
5. [Critical Findings — Top 12](#5-critical-findings--top-12)
6. [Security Audit](#6-security-audit)
7. [API Audit](#7-api-audit)
8. [Database Audit](#8-database-audit)
9. [Performance Audit](#9-performance-audit)
10. [React Audit](#10-react-audit)
11. [Next.js Audit](#11-nextjs-audit)
12. [UI Audit](#12-ui-audit)
13. [Accessibility Audit](#13-accessibility-audit)
14. [Mobile & Responsive Audit](#14-mobile--responsive-audit)
15. [Dark Mode Audit](#15-dark-mode-audit)
16. [Image Audit](#16-image-audit)
17. [SEO Audit](#17-seo-audit)
18. [Builder Audit](#18-builder-audit)
19. [CMS & Page System Audit](#19-cms--page-system-audit)
20. [Store Panel Audit](#20-store-panel-audit)
21. [Admin & Super Admin Audit](#21-admin--super-admin-audit)
22. [Business Module Audit](#22-business-module-audit)
23. [Plan & Feature Gating Audit](#23-plan--feature-gating-audit)
24. [Code Quality Audit](#24-code-quality-audit)
25. [Dependency Audit](#25-dependency-audit)
26. [Error Handling, Logging & Monitoring](#26-error-handling-logging--monitoring)
27. [Production Readiness](#27-production-readiness)
28. [Consolidated Priority Table](#28-consolidated-priority-table)
29. [Remediation Roadmap](#29-remediation-roadmap)
30. [Appendix — Verified Command Output](#30-appendix--verified-command-output)

---

## 1. Executive Summary

Bornoland is an ambitious multi-tenant e-commerce SaaS: a merchant storefront builder, store operations panel, admin console, and super-admin platform layer, with a Bangladesh-focused feature set (BDT pricing, Pathao/RedX/Steadfast couriers, Bangla copy). The scope is genuinely large — roughly **1,450 TypeScript files**, **~469 API endpoints**, **~93 Mongoose models**, and **164 Next.js routes**.

The front-end craft is real. The design token system, skeleton library, data-grid virtualization, storefront ISR, and builder UI are all better than typical for a project this young. But the audit found a consistent pattern: **the presentation layer is substantially ahead of the enforcement and integration layers beneath it.** Three themes dominate.

**Theme 1 — Authorization is decorative in large parts of the API.** The codebase contains three separate, correct store-ownership middlewares (`requireStoreAccess`, `requireStoreAccessForParam`, `requireStoreOwnership`). Between them they guard essentially one router. Everywhere else, `requireAuth` alone protects `/:storeId` routes, which means *any* authenticated merchant can read and write *any other* merchant's data by changing an ID in the URL. This affects payment methods (bank account numbers), the page builder, products, analytics, navigation, and inventory. Compounding it, `checkFeature` returns `{ allowed: true }` whenever a feature key is not found in the catalog — so a typo in a guard silently disables that guard, and the plan builder's camelCase keys never match the catalog's snake_case keys at all.

**Theme 2 — Several shipped features do nothing, and one of them lies about it.** All five courier providers are 7-line empty classes. The base class's `testProductionConnection` returns `{ ok: true, message: "... credentials configured (production)" }` **without contacting the courier**. A merchant enters real Pathao production credentials, clicks "Test connection," is told it succeeded, and discovers the truth when their first real order fails to ship. No payment gateway is wired (Stripe is installed and never imported). Refunds write database rows and move no money, with no over-refund validation. The legacy nested reports stack is mounted and live but matches a string `storeId` against an ObjectId field, so it returns zeros forever.

**Theme 3 — Data integrity has no transactional floor.** `startSession` appears in exactly one file in the entire API (`store.service.ts`). Order creation performs four independent writes — create order, decrement stock, increment coupon usage, clear cart — with no session. Stock decrement is a read-modify-write, so two concurrent orders for the last unit both succeed. Purchase-order receive and FIFO batch allocation have the same shape. Cancellation and refund never restock.

Separately and most urgently: **`.env`, `apps/api/.env`, and `apps/web/.env` are tracked in Git**, and `.gitignore` does not exclude them. `.env` contains a `mongodb+srv://` connection string with credentials, plus `JWT_SECRET`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `CLOUDINARY_API_SECRET`, `STRIPE_SECRET_KEY`, and `SSL_COMMERZ_STORE_PASSWORD`. These must be treated as compromised and rotated today, before any other work.

The good news is that most of this is *addable* rather than *rewritable*. The ownership middlewares already exist and just need to be mounted. The transaction boundaries are well-defined. The feature catalog is well-designed and only needs to fail closed. A focused four-to-six week effort by a small team can move this from "not shippable" to "cautiously shippable."

### Findings by severity

| Severity | Count | Meaning |
|---|---:|---|
| **Critical** | 11 | Data loss, money loss, credential exposure, or a feature that actively misleads users |
| **High** | 24 | Broken core path, cross-tenant exposure, or systemic quality failure |
| **Medium** | 38 | Degraded correctness, performance, or accessibility |
| **Low** | 21 | Tech debt, cosmetic, dead code |
| **Total** | **94** | |

---

## 2. Methodology, Scope & Confidence

### What was done

- Full structural survey of the monorepo, both `package.json` manifests, `turbo.json`, `next.config.ts`, `docker-compose.yml`, and the CI workflow.
- Six parallel deep-dive reviews covering: API architecture and routing, the Mongoose data layer, front-end performance, security, UI/accessibility/responsive/dark-mode, and business-module completeness.
- Direct verification of every Critical and most High findings by reading the cited source and running non-mutating shell checks (`git ls-files`, `rg`, `wc`, `tsc --noEmit`).

### What was **not** done

This is a static audit. The following would materially sharpen the results and are recommended as follow-ups:

| Not performed | Why it matters | Suggested tool |
|---|---|---|
| Runtime profiling | Re-render counts and actual API latencies are **inferred from code shape**, not measured | React DevTools Profiler, `clinic.js` |
| Live index inspection | Production may have manually created indexes not in code, or `autoIndex` may be off | `db.collection.getIndexes()` |
| Real-device responsive testing | Breakpoint findings come from reading Tailwind classes | BrowserStack, Chrome DevTools device mode |
| Automated a11y scan | Contrast ratios are computed from tokens; DOM-level violations not enumerated | `axe-core`, Lighthouse |
| Bundle analysis | Bundle findings are import-graph inference, not measured KB | `@next/bundle-analyzer` |
| Dependency CVE scan | Outdated/vulnerable package versions not checked | `pnpm audit`, Snyk, Dependabot |
| Penetration testing | IDOR findings are code-read, not exploited | Burp Suite, manual testing |

### Confidence levels used

- **Verified** — I read the exact source line or ran a command confirming it.
- **High confidence** — reported by a deep-dive review with a specific `file:line` reference consistent with surrounding code I read.
- **Inferred** — derived from code shape; needs runtime confirmation. Flagged inline where used.

---

## 3. Codebase Statistics

### Overall

| Metric | Value |
|---|---:|
| TypeScript/TSX files (`apps/`) | **1,452** |
| `apps/web` `.tsx` files | 677 |
| `apps/web` `.ts` files | 217 |
| Next.js `page.tsx` route files | 164 |
| Next.js `layout.tsx` files | 69 |
| Files with `"use client"` | 540 (~80% of `.tsx`) |
| React components | ~394 |
| Custom hooks | 25 |
| RTK Query API slices | 38 |
| RTK Query endpoints | ~373 |
| API route files | 50 |
| API HTTP handlers | ~469 |
| Mongoose model files | 159 (~92–93 unique models) |
| Zod validator files | 24 |
| **Test files** | **0** |

### Client vs server split (`apps/web`)

| Area | Client pages | Server pages |
|---|---:|---:|
| `(store)` workspace | 47 | 11 |
| `site/[tenant]` storefront | 21 | 12 |
| `admin` | 16 | 14 |
| `(dashboard)` | 24 | 8 |
| **Total** | **108 (66%)** | **56 (34%)** |

### Largest files (refactor candidates)

| Lines | File |
|---:|---|
| 1,444 | `apps/api/src/modules/inventory/inventory-erp.service.ts` |
| 1,130 | `apps/web/src/components/builder/properties-panel.tsx` |
| 1,091 | `apps/web/src/lib/section-registry.ts` |
| 1,052 | `apps/api/src/modules/reports/report.service.ts` |
| 1,037 | `apps/web/src/components/workspace/orders-tab.tsx` |
| 986 | `apps/web/src/components/workspace/inventory/inventory-modules.tsx` |
| 950 | `apps/web/src/components/media/media-picker.tsx` |
| 945 | `apps/api/src/modules/pages/store-page.service.ts` |
| 931 | `apps/api/src/modules/orders/order-invoice-pdf.service.ts` |
| 862 | `apps/web/src/redux/slices/builder-slice.ts` |
| 861 | `apps/api/src/modules/couriers/shipment.service.ts` |
| 843 | `apps/web/src/components/admin/plans/plan-builder.tsx` |
| 836 | `apps/web/src/components/store-dashboard/navigation-manager/navigation-manager.tsx` |
| 822 | `apps/api/src/modules/products/variants/variant.service.ts` |
| 821 | `apps/api/src/modules/platform/platform.service.ts` |

### Code health signals

| Signal | Count | Note |
|---|---:|---|
| `as any` casts | 205 | High for a `strict: true` project |
| `@ts-ignore` / `@ts-expect-error` | 0 | Good — no suppression |
| **API `tsc --noEmit` errors** | **26** | **CI is red on `main`** (verified) |
| Web `tsc --noEmit` errors | 0 | Clean (verified) |
| `console.log` in `apps/api/src` | 66 | Should be pino |
| `console.error` in `apps/api/src` | 153 | Should be pino |
| `console.log` in `apps/web/src` | 8 | Acceptable |
| `TODO` / `FIXME` / `HACK` comments | 0 | Unfinished work is undocumented rather than absent — arguably worse |
| `dangerouslySetInnerHTML` sites | 12 across 11 files | Zero sanitization library installed |
| `startSession` (transactions) | 1 file | See §8.5 |
| `React.memo` usage | 22 files | Thin for 394 components |
| `framer-motion` import sites | 140 | |
| `recharts` import sites | 25 | |
| `next/dynamic` usage | 8 | |
| `next/image` importers | 6 | vs ~45 raw `<img>` tags |

---

## 4. Scorecard

Scores are 0–100, where 70 is "acceptable for production" and 85 is "strong."

| Dimension | Score | Grade | Rationale |
|---|---:|:---:|---|
| **Architecture** | 58 | D+ | Clean modular monorepo and a sensible module-per-domain layout, undermined by five parallel duplicate systems (Page/StorePage, two reports stacks, two variant models, two email systems, `models/` shims over `modules/`) |
| **Code Quality** | 52 | F | `strict: true` is set, but 26 API type errors on `main`, 205 `as any`, zero tests, no ESLint config in `apps/api`, and fifteen files over 800 lines |
| **Performance** | 48 | F | Unbounded `.find()` on hot paths, no caching layer despite `ioredis` installed, 66% client-rendered pages, 200-order client-side aggregation, virtualization built but mostly bypassed |
| **UI** | 68 | D+ | Genuinely good design token system, skeleton library, and empty states — but ~210 files bypass the tokens for raw `zinc`/`gray`/`slate` |
| **UX** | 55 | F | Seven "coming soon" settings tabs, three tabs rendering the same component, a fully-built `/pages` route missing from navigation, and success toasts on operations that did nothing |
| **Accessibility** | 35 | F | No focus trap in `Modal`/`Drawer`/`ConfirmDialog`, no `htmlFor` in the shared `Field` wrapper, default muted text fails WCAG AA at 4.3:1, no skip link, no `<main>` landmark in root layout |
| **SEO** | 45 | F | Strong per-route metadata and canonicals, but the sitemap contains three URLs and no tenant storefronts, and there is no Product/Organization JSON-LD |
| **Security** | 22 | F | Committed live credentials, systemic IDOR, unsanitized HTML rendering with no sanitizer installed, CORS regex bypass, fail-open feature gating |
| **Backend** | 45 | F | Well-organized routing and a solid refresh-token implementation, undercut by missing ownership checks, unused Zod middleware, and unbounded queries |
| **Database** | 44 | F | Good index coverage on StockLog/MediaFile/Customer, but no transactions anywhere it matters, missing `{storeId, createdAt}` compounds, and a live ObjectId/string mismatch |
| **Scalability** | 38 | F | In-memory rate limiter and in-memory email queue break horizontally; `maxPoolSize: 10`; no `allowDiskUse` on any aggregation; no Redis despite the dependency |
| **Maintainability** | 50 | F | Consistent structure and naming help, but duplicate systems, zero tests, and 1,000-line components make change risky |
| **OVERALL** | **45** | **F** | Substantial and capable work that is one focused remediation cycle away from being defensible — but not shippable in its current state |

---

## 5. Critical Findings — Top 12

Ordered by remediation urgency, not by severity score alone. Items 1–3 should be started today.

### C-01 — Live credentials committed to Git *(Verified)*

`.env`, `apps/api/.env`, and `apps/web/.env` are all tracked. `.gitignore` (13 lines) does not mention `.env` at all.

```bash
$ git ls-files | grep -i env
.env
.env.example
.env.production
.env.production.example
apps/api/.env
apps/web/.env
apps/web/.env.development
mobileapp/.env.example
```

`.env` contains `MONGODB_URI` with a `mongodb+srv://` cluster string, plus `JWT_SECRET`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `CLOUDINARY_API_SECRET`, `STRIPE_SECRET_KEY`, `SSL_COMMERZ_STORE_PASSWORD`, and `REDIS_TOKEN`.

**Impact:** Anyone with repository access — current collaborators, past collaborators, anyone who has ever cloned it, and the entire internet if the repo is or ever becomes public — has direct database access and can forge JWTs for any user including `super_admin`.

**Action (today, in order):** rotate the MongoDB user password and restrict cluster IP access; rotate `JWT_SECRET` and `NEXTAUTH_SECRET` (this logs everyone out — that is the point); rotate Google OAuth, Cloudinary, Stripe, and SSLCommerz credentials; add `.env*` (with `!.env.example` exceptions) to `.gitignore`; `git rm --cached` the tracked files; purge history with `git filter-repo` or BFG and force-push with team coordination.

---

### C-02 — Systemic cross-tenant IDOR on `/:storeId` routes

Three correct ownership middlewares exist and are almost entirely unmounted:

- `common/middleware/store-access.middleware.ts` — `requireStoreAccess` / `requireStoreAccessForParam`, used only by builder-templates
- `common/middleware/ownership.middleware.ts` — `requireStoreOwnership`, **defined and never imported**
- `common/middleware/feature.middleware.ts` — `requireFeatureAccess` checks the *plan*, **not** whether the caller owns the store

Verified example — the entire builder router is protected by nothing but `requireAuth`:

```16:29:apps/api/src/modules/builder/builder.route.ts
builderRouter.use(requireAuth);

builderRouter.get("/:storeId/pages", getPagesController);
builderRouter.get("/:storeId/home", getOrCreateHomePageController);
builderRouter.get("/page/:pageId", getPageController);
builderRouter.put("/page/:pageId/save", attachStoreIdFromPage, savePageController);
```

Affected surfaces (all reachable by any authenticated merchant with a guessed or enumerated ID):

| Surface | Route | Exposure |
|---|---|---|
| **Payment methods** | `/payment-methods/store/:storeId` | Read/write bank and mobile-money account numbers — **can redirect customer payments** |
| **Page builder** | `/builder/:storeId/*`, `/builder/page/:pageId/*` | Read, edit, clear, delete any store's storefront |
| **Products** | `PUT`/`DELETE /products/:storeId/:id` | Create checks ownership; update/delete/list do not |
| **Analytics** | `/analytics/:storeId/*` | Full competitor revenue and traffic data |
| **Inventory** | `/stores/:storeId/inventory/*` | Feature-gated only, not ownership-gated |
| **Store pages** | `/store-pages/stores/:storeId` | CMS content |
| **Navigation / global sections** | `/navigation/stores/:storeId`, `/global-sections/stores/:storeId` | Storefront structure |
| **Top-level reports** | `/reports/stores/:storeId/*` | Feature check only |
| **Subscriptions / features** | `/subscriptions/stores/:storeId`, `/features/stores/:storeId/access` | Plan and billing posture |
| **Tenants** | `GET /tenants/:tenantId` | **No authentication at all** |

There is also a data-layer variant: `order.service.ts:34` calls `ProductModel.findById(item.productId)` with no `storeId` filter during stock decrement, so a poisoned cart can decrement another tenant's inventory.

**Fix:** Create one `requireStoreOwner` middleware and mount it on every `/:storeId` merchant router. Additionally add `storeId` to every data-layer `findById`, so the query layer is defense-in-depth rather than the only line being the missing middleware.

---

### C-03 — `checkFeature` fails open *(Verified)*

```272:292:apps/api/src/modules/features/feature-access.service.ts
  const store = (await StoreModel.findById(storeId).lean()) as { planId?: unknown } | null;
  if (!store?.planId) {
    return { allowed: true, featureKey };
  }

  const feature = (await FeatureModel.findOne({ key: featureKey.toLowerCase(), isActive: true }).lean()) as {
    /* ... */
  } | null;
  if (!feature) {
    return { allowed: true, featureKey };
  }

  const type = normalizeFeatureType(feature.type);
  const assignment = await getPlanFeatureAssignment(String(store.planId), featureKey);
  if (!assignment) {
    return { allowed: true, featureKey, featureName: feature.name };
  }
```

Three separate fail-open paths. The middle one is the dangerous one: **any feature key not present in `feature.seed.ts` grants universal access, with no log and no warning.** A guard written as `requireFeatureAccess("advanced_reprting")` is not a guard.

This compounds with a second bug: `PlanModel.featureToggles` uses camelCase (`advancedReports`) while the catalog and all `checkFeature` call sites use snake_case (`advanced_reports`). Toggles set in the plan builder therefore never match the keys enforcement looks up — and every failed lookup resolves to *allowed*.

**Net effect:** the 60+ toggles in the admin store-features drawer and the plan builder are, for most features, decorative. Disabling a feature for a store leaves it fully usable.

**Fix:** Return `{ allowed: false }` for unknown keys and log the miss at `error` level. Add a startup assertion that every key referenced by `requireFeatureAccess` exists in the catalog — a 20-line check that would have caught this. Normalize toggle keys to snake_case at the boundary.

---

### C-04 — Courier "Test connection" fabricates success *(Verified)*

All five providers are 7-line stubs:

```bash
$ wc -l apps/api/src/modules/couriers/providers/*.ts
     212 base.provider.ts
       7 paperfly.provider.ts
       7 pathao.provider.ts
       7 redx.provider.ts
       7 steadfast.provider.ts
       7 sundarban.provider.ts
```

And the base class returns success without a network call:

```73:80:apps/api/src/modules/couriers/providers/base.provider.ts
  protected async testProductionConnection(ctx: CourierProviderContext): Promise<CourierTestResult> {
    return {
      ok: true,
      message: `${this.name} credentials configured (production)`,
      environment: "production",
      testedAt: new Date().toISOString(),
    };
  }
```

**Impact:** This is the single most damaging finding in the audit, because it does not merely fail — it *actively lies to the user about a state they are explicitly trying to verify.* A merchant enters real Pathao production credentials, receives confirmation, and builds their fulfilment operation on it. `shipment-sync.cron.ts` then runs every 5 minutes against these stubs, consuming resources to sync nothing.

**Fix (today, one line):** return `{ ok: false, message: "Integration not yet available" }`. Then implement the providers properly, or remove the courier UI until they exist.

---

### C-05 — No payment gateway integration *(Verified)*

`stripe` is in `apps/api/package.json` and is **never imported anywhere in `apps/api/src`** (verified by `rg -l "from \"stripe\"" apps/api/src` → no results). There is no bKash, Nagad, SSLCommerz, or aamarPay integration despite `SSL_COMMERZ_*` credentials in `.env`. `POST /billing/webhook` parses a Zod schema and has **no signature verification and no side effects** (`billing.route.ts:14-27`).

Only cash-on-delivery and manual/offline payment marking actually work. This cascades: refunds cannot move money, subscription billing cannot charge, and any UI implying online payment is misleading.

---

### C-06 — Refunds move no money and permit unlimited over-refunding

`processRefundController` (`apps/api/src/modules/stores/store-order.controller.ts`) writes a refund record and updates payment status. It calls no payment provider (there is none — C-05) and validates the refund amount against neither the order total nor previously refunded amounts. The same order can be "refunded" repeatedly for arbitrary sums, and every downstream report built on those records will be wrong.

---

### C-07 — Order creation is not transactional, and stock decrement races

`startSession` appears in exactly one file in the entire API (`store.service.ts`) — verified. `apps/api/src/modules/orders/order.service.ts` performs four independent writes with no session:

1. `OrderModel.create(...)`
2. loop → `decrementProductStock(...)`
3. coupon `$inc` usage
4. cart delete

Any crash or failure mid-sequence leaves permanent inconsistency: stock decremented with no order, coupon consumed with no order, or an order whose cart was never cleared (double-order risk).

Separately, stock decrement is read-modify-write (`order.service.ts:63-67` — read, subtract in JS, `save()`), so **two concurrent orders for the last unit both succeed**. The same pattern appears in `variant.service.ts:816-819`, `inventory-erp.service.ts` `receivePurchaseOrder` (which also has no optimistic lock on PO status, allowing double-receive), and `fifoAllocate`.

**Fix:** Wrap order creation in a session. Replace RMW with `updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })` and treat `modifiedCount === 0` as out-of-stock.

---

### C-08 — Publishing is a no-op; every autosave goes live

`apps/api/src/modules/pages/store-page.model.ts:160-167` defines a single `sections` array. There is no `draftSections` / `publishedSections` separation. `saveStorePageDraft` (`store-page.service.ts:681-711`) writes straight into it. `publishPage` (`publish.service.ts:79-160`) snapshots into `PageVersionModel` and flips `status` — it copies no content anywhere.

**Consequence:** once a page is published, every builder autosave is immediately live. A merchant editing their homepage is editing production in real time, with half-finished sections visible to shoppers. The Publish button is effectively "create a version snapshot," and draft/preview mode is illusory for any already-published page.

---

### C-09 — Builder autosave silently loses pages over 64 KB

`apps/web/src/hooks/use-builder-auto-save.ts:217` uses `fetch(..., { keepalive: true })` for the unload path. The Fetch specification caps keepalive request bodies at **64 KB**; browsers reject larger bodies outright. An image-heavy or text-heavy builder page exceeds this easily.

**Impact:** silent, unreported data loss at exactly the moment the user is relying on autosave — closing the tab. The endpoint URL is also hardcoded in the hook rather than routed through RTK Query, bypassing shared auth and error handling.

**Fix:** Use `navigator.sendBeacon` with a size check, or persist to `localStorage` on unload and reconcile on next load. At minimum, detect oversized payloads and warn the user before they close.

---

### C-10 — Stored XSS: unsanitized HTML with no sanitizer installed *(Verified)*

12 `dangerouslySetInnerHTML` sites across 11 files, and **neither `package.json` contains DOMPurify, sanitize-html, or any equivalent** (verified).

| File | Content source |
|---|---|
| `app/site/[tenant]/blog/[slug]/page.tsx` | CMS blog body |
| `app/site/[tenant]/{about,contact,faq}/*-page-client.tsx` | CMS page body |
| `app/site/[tenant]/products/[slug]/product-detail-client.tsx` | Product description |
| `components/storefront/{cms-page-view,quick-view-modal}.tsx` | CMS / product HTML |
| `app/(dashboard)/dashboard/settings/email/page.tsx` | Email template preview |
| `app/(store)/store/[storeSlug]/(shell)/settings/notifications/page.tsx` | Notification template preview |

API side stores raw HTML without sanitization (`cms-page.model.ts:16-18`, `cms.service.ts:51-80`, `product.validator.ts:74-78`).

**Impact:** Merchant-controlled HTML executes in customer storefront sessions. Because customer JWTs are in `localStorage` (see H-03), this yields direct account takeover, and can alter checkout or issue credentialed API calls. In a multi-tenant SaaS, "merchant-controlled" includes any staff member and anyone who compromises a merchant account.

**Fix:** Sanitize on write with an allowlist (strip `<script>`, event handlers, `javascript:` URLs, `<iframe>`, `<object>`, inline SVG), and sanitize again on render. Add a Content-Security-Policy to `apps/web` — there currently is none.

---

### C-11 — Legacy reports stack is live and returns zeros *(Verified)*

`reports.route.ts` **is** mounted, at `store.route.ts:85` → `storeRouter.use("/:storeId/reports", reportsRouter)`. Its service matches a string against an ObjectId field inside an aggregation:

```7:20:apps/api/src/modules/reports/reports.service.ts
export async function getSalesReport(storeId: string, from?: string, to?: string) {
  await connectDatabase();
  const match: Record<string, unknown> = { storeId };
  /* ... */
  const [summary, daily, topProducts] = await Promise.all([
    OrderModel.aggregate([
      { $match: match },
```

`OrderModel.storeId` is an ObjectId. Mongoose casts types in `find()` but **not** inside `aggregate()`, so every `$match` here matches zero documents.

**Nuance worth noting:** the web app calls the *other* stack — `reports-api.ts` uses `/reports/stores/${storeId}/*` (`report.route.ts` / `report.service.ts`), which is a different, working implementation. So this bug is not currently visible in the product UI. It is still Critical because the broken endpoints are mounted, authenticated, and reachable, and the duplication guarantees someone eventually wires the UI to the wrong one. `getInventoryReport` on line 72 uses `ProductModel.find({ storeId })` and works fine, which makes the failure inconsistent and harder to spot.

Also: `getSalesReport` does not exclude `cancelled` orders, so once the ObjectId bug is fixed, revenue will be inflated by every cancelled order.

---

### C-12 — In-memory email queue loses all queued mail on restart

`apps/api/src/modules/email/email-queue.service.ts` holds jobs in a process-memory array. Every restart, deploy, or crash loses everything queued — including order confirmations and password resets. Additional defects in the same file: `processQueue` has no error handling (a throw takes down the process), there is no concurrency control (unbounded simultaneous SMTP connections), `retryFailedEmails` marks jobs for retry but never re-sends them, and `stopEmailQueue` leaks `retryInterval`.

**Mitigating context:** this queue belongs to `email-engine.service.ts`, which has **zero production call sites**. Live email goes through the simpler `common/integrations/email.ts`. So these defects are latent — but they all activate the moment someone switches over, which is clearly the intent.

---

## 6. Security Audit

### 6.1 Findings table

| ID | Sev | Title | Location | Fix |
|---|:---:|---|---|---|
| S-01 | **Crit** | Live credentials in Git | `.env`, `apps/api/.env`, `apps/web/.env`; `.gitignore:1-13` | Rotate everything, purge history, ignore `.env*` |
| S-02 | **Crit** | Cross-tenant builder page access | `builder.route.ts:17-29`, `builder.controller.ts:15-105` | Resolve store from `request.user` |
| S-03 | **Crit** | Cross-tenant product mutation | `product.route.ts:20-36`, `product.controller.ts:51-137` | Mount ownership middleware |
| S-04 | **Crit** | Cross-tenant payment-method access | `payment-method.route.ts:12-17`, `payment-method.service.ts:20-78` | Ownership check + field whitelist |
| S-05 | **Crit** | `checkFeature` fails open | `feature-access.service.ts:272-292` | Fail closed + startup key assertion |
| S-06 | **High** | Stored XSS from CMS/product HTML | 12 sites; no sanitizer installed | Allowlist sanitize on write and render |
| S-07 | **High** | Customer JWT in `localStorage` | `account/login/page.tsx:54-61`, `auth-init.tsx:18-35` | httpOnly cookie |
| S-08 | **High** | Logout does not revoke legacy JWT | `auth.service.ts:354-361` | Increment `sessionVersion` on logout |
| S-09 | **High** | SSRF via media URL import | `media.controller.ts:212-234`, `media.service.ts:229-265` | Block private IPs on every redirect hop |
| S-10 | **High** | Active SVG served from API origin | `media.constants.ts:20-27`, `app.ts:198` | Reject or rasterize SVG; separate origin |
| S-11 | **High** | Courier role confusion | `courier.service.ts:82-89`, `user.model.ts:13-17` | Only `super_admin` is platform-wide |
| S-12 | **High** | CORS regex allows attacker-controlled domains | `app.ts:87-95` | See §6.3 |
| S-13 | **High** | Customer auth endpoints lack `authRateLimit` | `customer.route.ts:27-29` | Apply `authRateLimit` |
| S-14 | **Med** | No CSRF protection for cookie auth | `auth.middleware.ts:33-69`, `jwt.ts:85-108` | Drop cookie auth for API, or add CSRF tokens |
| S-15 | **Med** | Next middleware JWT fallback secret | `middleware.ts:9` — `?? "bornoland-dev-secret"` | Fail startup if unset |
| S-16 | **Med** | Next admin gate is cosmetic | `middleware.ts:136-191` | Treat API as the boundary; document it |
| S-17 | **Med** | Regex injection / ReDoS in search | `customer.service.ts:238-263`, `media.service.ts:400-410`, `store-page.service.ts:835-846` | Use the existing `escapeRegex()` helper |
| S-18 | **Med** | NoSQL operator injection in email verify | `auth.route.ts:24`, `auth.controller.ts:179-186` | Apply `verifyEmailSchema`; enable `sanitizeFilter` |
| S-19 | **Med** | Encryption key falls back to JWT secret | `common/utils/encryption.ts:7-22` | Require dedicated 32-byte key |
| S-20 | **Med** | Public invoice endpoint returns full PII | `invoice.route.ts:23-28`, `invoice.service.ts:184-195` | Minimal projection; `Referrer-Policy: no-referrer` |
| S-21 | **Med** | No customer password policy or lockout | `customer.service.ts:14-24` | Shared Zod rules + per-account throttle |
| S-22 | **Med** | No CSP on `apps/web` | `next.config.ts` (no `headers()`) | Add CSP, HSTS, `X-Frame-Options` |
| S-23 | **Med** | Stripe webhook has no signature verification | `billing.route.ts:14-27` | Implement or remove |
| S-24 | **Low** | JWT algorithms not pinned | `common/utils/jwt.ts:30-49`, `lib/jwt.ts:15-25` | `algorithms: ["HS256"]` |
| S-25 | **Low** | OAuth `state` unsigned, no nonce | `auth.controller.ts:308-351` | One-time state cookie + PKCE |

### 6.2 What is done well

Not everything here is bad, and the good parts should be preserved:

- **Refresh tokens are properly implemented** — 32 random bytes, SHA-256 hashed at rest, rotated on use, family-revoked on reuse detection, TTL-indexed (`common/utils/jwt.ts:56-66`, `auth.service.ts:249-289`, `refresh-token.model.ts:5-24`). This is textbook.
- **bcrypt cost 12** consistently for both merchant and customer passwords.
- **Password reset** uses 32 random bytes with 1-hour expiry, increments `sessionVersion`, and revokes refresh tokens (`auth.service.ts:379-422`).
- **AES-256-GCM** with random IVs and auth tags for stored third-party credentials (`encryption.ts:25-46`); SMTP passwords redacted in responses.
- **No `$where` usage** anywhere.
- **Central error handler does not leak stack traces** (`error.middleware.ts:26-27`).
- Merchant cookies are `httpOnly`, `SameSite=Strict` for refresh, `Secure` in production.

### 6.3 CORS bypass — detailed

The origin allowlist is pattern-based (`app.ts:76-95`). Two of the patterns are too permissive:

```typescript
new RegExp(
  String.raw`^https?://(?:${DNS_LABEL}\.)?${IPV4_DOTTED}\.[a-z0-9.-]+(?::\d+)?$`,
  "i",
),
```

This is intended to match wildcard-DNS providers like `myslug.203.0.113.10.nip.io`. But the trailing `[a-z0-9.-]+` matches **any** suffix. An attacker who owns `evil.com` simply creates the DNS record `1.2.3.4.evil.com`, and `http://1.2.3.4.evil.com` passes the check. Combined with `credentials: true`, an attacker-controlled origin can make credentialed cross-origin reads against the API.

Additionally, the ROOT_DOMAIN pattern allows **all** tenant subdomains with credentials, so one compromised merchant storefront can read credentialed API responses from any other origin in the family.

**Fix:** Restrict the IP-encoded patterns to an explicit list of known wildcard-DNS suffixes (`nip.io`, `sslip.io`, `traefik.me`), and disable them entirely when `NODE_ENV === "production"`. Do not send credentials to tenant-controlled origins; use bearer tokens for cross-origin storefront calls.

### 6.4 Helmet / CSP on the API

```168:182:apps/api/src/app.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      /* ... */
```

`'unsafe-inline'` on `scriptSrc` combined with `/uploads` static serving from the same origin (`app.ts:198`) and SVG upload acceptance is the exact three-part chain needed for stored XSS on the API origin. `'unsafe-eval'` is correctly absent, and `objectSrc`/`frameSrc` are `'none'`.

`apps/web` has **no security headers at all** — `next.config.ts` defines no `headers()` function. Given the 12 `dangerouslySetInnerHTML` sites, this is the single highest-leverage defensive addition available.

---

## 7. API Audit

### 7.1 Middleware order (`apps/api/src/app.ts`)

| # | Middleware | Line | Assessment |
|---:|---|---:|---|
| 1 | `trust proxy = 1` | 167 | Correct behind one proxy |
| 2 | `helmet` | 168 | CSP too permissive (§6.4) |
| 3 | `cors` | 183 | Regex bypass (§6.3) |
| 4 | `express.json({ limit: "1mb" })` | 184 | Parses **before** rate limiting |
| 5 | `globalRateLimit` | 185 | Should run before body parsing |
| 6 | `subdomainDetector` | 187 | |
| 7 | `pino-http` | 188 | |
| 8 | `X-Request-Id` | 192 | Assigned *after* logging — request-id absent from HTTP log lines |
| 9 | Static `/uploads` | 198 | Same origin as API (§6.4) |
| 10 | Health | 200 | Exposes `process.memoryUsage()` |
| 11 | Routers | 218-254 | |
| 12 | `notFoundHandler` → `errorHandler` | 256 | Correct |

Two easy ordering fixes: move `globalRateLimit` above `express.json`, and move the request-id assignment above `pino-http` so log correlation works.

### 7.2 Rate limiting *(Verified)*

| Limiter | Window | Max | Applied to |
|---|---|---:|---|
| `globalRateLimit` | 60s | 100 | Everything |
| `authRateLimit` | 60s | 10 | `/auth` only |
| `newsletterRateLimit` | 60s | 5 | `/newsletter`, `/contact` |
| `analyticsTrackRateLimit` | 60s | 60 | Public tracking |
| `writeRateLimit` | 60s | 30 | Profile writes |
| `sensitiveWriteRateLimit` | 60s | 10 | Profile writes |

Two problems:

1. **Customer auth is unprotected.** `POST /customer/login`, `/register`, and `/forgot-password` (`customer.route.ts:27-29`) get only the global 100/min. That is 100 password guesses per minute per IP against the storefront login.
2. **The store is in-memory.** No Redis store is configured, so limits are per-process. `docker-compose.yml` defines a `frontend` and a `backend` service; the moment `backend` scales beyond one replica, the effective limit multiplies by the replica count. Combined with `trust proxy: 1`, this needs `rate-limit-redis` before any horizontal scaling.

### 7.3 Validation

24 validator files and ~65 `safeParse` call sites exist, but `common/middleware/validate.middleware.ts` — which exports `validate`, `validateQuery`, and `validateParams` — is **never imported by any route**. Validation happens ad-hoc in services, so coverage is uneven.

Routes accepting raw `request.body`:

| Sev | Location | Risk |
|:---:|---|---|
| High | `inventory-erp.controller.ts` — `request.body ?? {}` into suppliers, POs, transfers, alerts | Unvalidated ERP writes |
| High | `builder.controller.ts` — `savePage`, `updatePage`, `clearPage` | Arbitrary section trees |
| High | `store-page.route.ts` — create, update, import | Arbitrary page content |
| High | `payment-method.controller.ts` | Only `type`/`label` checked |
| Med | `admin.route.ts:605` — `request.body[key]` with no whitelist | Mass assignment |
| Med | `navigation.route.ts`, `review.controller.ts:25` | Unvalidated |

### 7.4 Response envelope inconsistency

Three envelope shapes coexist:

| Shape | Where |
|---|---|
| `{ success, data, message }` | `common/utils/api-response.ts` — the majority |
| `{ ok: true \| false, ... }` | analytics and inventory controllers |
| Bare `{ message }` / `{ tenant }` / `{ pages }` | auth 401s, tenant route, legacy page route |

Every client must handle all three. Normalize on `{ success, data, message }`.

### 7.5 Duplicate and overlapping endpoints

| Sev | Duplication |
|:---:|---|
| Med | Two report stacks: `/reports/stores/:storeId/*` (working, used by web) vs `/stores/:storeId/reports/*` (broken, mounted — see C-11) |
| Med | Legacy `/pages/:tenantId` vs modern `/store-pages/stores/:storeId` |
| Low | `/builder` pages vs store-pages builder |
| Low | Dual `/stores` mounts: `storeRouter` (`app.ts:224`) and `storeEmailRouter` (`app.ts:254`) |

### 7.6 Endpoint distribution

| Handlers | Route file |
|---:|---|
| 38 | `settings/admin.route.ts` |
| 36 | `inventory/inventory.route.ts` |
| 34 | `stores/store.route.ts` |
| 34 | `pages/store-page.route.ts` |
| 15 | `products/product.route.ts`, `customers/customer.route.ts` |

---

## 8. Database Audit

### 8.1 Model registration

~93 registered models across 159 files. `src/models/*.ts` (66 files) are almost all re-export shims over `src/modules/**/*.model.ts`.

**Three models omit the idempotent-registration guard** and will throw `OverwriteModelError` on hot reload or double import:

```22:22:apps/api/src/modules/cart/wishlist.model.ts
export const WishlistModel = mongoose.model("Wishlist", wishlistSchema);
```

Same in `modules/notifications/newsletter.model.ts:11` and `modules/notifications/contact.model.ts:23`. Every other model uses `models.X ?? model(...)`. Severity: **High** for developer experience with `tsx watch`.

### 8.2 Duplicate / conflicting definitions

| Sev | Issue |
|:---:|---|
| High | **BillingNotification vs Notification** — `modules/notifications/billing-notification.model.ts` defines collection `"BillingNotification"`, but the shim aliases `NotificationModel as BillingNotificationModel`, so the schema file is dead and callers write to `Notification` |
| High | **Page vs StorePage** — two page collections, both created on store bootstrap (`store.service.ts:187-237`) |
| High | **Three sources of stock truth** — `product.stock`, embedded `product.variants[].stock`, and `VariantInventory.quantity`, with no synchronization layer |
| Med | **Subscription vs StoreSubscription** — intentional split, easy to query the wrong one |

The three-way stock split (§22.B) is the root cause of a class of "inventory looks wrong" bugs that will be very hard to diagnose in production, because the answer depends on which code path wrote the value and which read it.

### 8.3 Index coverage

**Well indexed:** StockLog (`{storeId,createdAt}`, `{productId,createdAt}`, `{storeId,reason,createdAt}`, `{storeId,warehouseId,createdAt}`), MediaFile, StorePage, Customer (unique `{storeId,email}`), Coupon (`{storeId,code}`), Product (unique `{storeId,slug}` + several `{storeId,*}` compounds + text index).

**Missing, ordered by impact:**

| Sev | Query shape | Used at | Needed index |
|:---:|---|---|---|
| High | `{storeId}` sort `createdAt:-1` | `product.service.ts:142-143` | `{storeId:1, createdAt:-1}` |
| High | `{storeId, status?, paymentStatus?}` sort `createdAt` | `store-order.controller.ts:56-99` | `{storeId:1, createdAt:-1}`, `{storeId:1, paymentStatus:1, createdAt:-1}` |
| High | `{storeId, customerId}` cart lookup | `order.service.ts:173` | unique sparse `{storeId, customerId}` — currently multiple carts per customer are possible |
| Med | `{storeId, customerId}` sort `createdAt` | `order.service.ts:461` | `{storeId:1, customerId:1, createdAt:-1}` |
| Med | `{storeId, stock}` | `product.service.ts:122-123` | `{storeId:1, stock:1}` |
| Med | Address `{storeId, customerId}` | `customer-address.service.ts:61` | `{storeId:1, customerId:1}` — `storeId` is required but unindexed |
| Med | Regex on order customer name/phone | `store-order.controller.ts:70-76` | Text index or supporting field indexes |

*Confidence: inferred from schema declarations and query code. Production indexes should be confirmed with `db.collection.getIndexes()`.*

### 8.4 Schema design

| Sev | Issue | Examples |
|:---:|---|---|
| High | **Unbounded arrays** (16 MB document ceiling) | `Product.variants[]`, `Order.timeline` / `orderNotes` / `items`, `Cart.items`, `Wishlist.items`, page `sections` |
| High | **No unique customer cart** | `cart.model.ts:28` indexes `{storeId, sessionId}` only |
| Med | **`Schema.Types.Mixed`** with no validation | StorePage sections, PageVersion snapshots, AuditLog old/new, `Order.shipment.rawResponse` |
| Med | **Denormalized customer stats drift** | `totalOrders`/`totalSpent` synced best-effort after order (`order.service.ts:405-408`) |
| Med | **Order number globally unique, not per-store** | `order.model.ts:150` |
| Med | **Loose enums** | Legacy `Page.pageType` plain String; order timeline `status` free string while `order.status` is an enum |
| Low | **Missing `timestamps: true`** | Wishlist uses manual date defaults; Newsletter has `createdAt` only |

### 8.5 Transactions — the biggest data-integrity gap

`startSession` appears in **one file**: `store.service.ts` (store create ~139, store delete ~510). Every other multi-document write is non-atomic.

| Flow | Writes | Corruption on partial failure | Sev |
|---|---|---|:---:|
| Order create | order + stock + coupon + cart | Stock without order; coupon consumed without order; cart not cleared | **Crit** |
| Stock decrement | RMW `save()` | Oversell under concurrency | **Crit** |
| PO receive | stock++ per line, batches, logs, timeline, cost history, PO save, supplier `$inc` | Partial receive; stock up but PO open; double-receive (no status lock) | **Crit** |
| `adjustStock` | inventory + StockLog + timeline | Stock changed without audit trail | High |
| `fifoAllocate` | batch saves + logs | Race on `remainingQuantity`; partial allocation | High |
| `completeStockTransfer` | writes transfer_out/in logs but **does not move stock** (commented as "v1 single-pool") then marks completed | Warehouse attribution is fiction | High |

### 8.6 Aggregations

| Sev | Finding |
|:---:|---|
| High | Nested `$lookup` on the inventory list hot path (`inventory.service.ts:134-198`: `productvariants` → `variantinventories` + `variantprices`) |
| High | **No `allowDiskUse` anywhere in `apps/api`** — large tenants will hit the 100 MB in-memory aggregation limit and get hard errors |
| High | Unbounded platform `$group` over all orders (`admin.route.ts:556-558`, `platform.service.ts`) |
| Med | Report `$lookup` pipelines (`report.service.ts` ~457, 500, 675, 756, 801) |

Analytics PageView aggregations are the counter-example done right: `$match` on `storeId` first, with a 90-day TTL on the collection (`page-view.model.ts:44-51`).

### 8.7 Connection handling

```8:24:apps/api/src/common/database/connection.ts
export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB ?? "bornoland",
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    maxPoolSize: 10,
  });

  return mongoose.connection;
}
```

Singleton pattern is correct. `maxPoolSize: 10` is tight for a multi-tenant API — raise to 50–100 and set `minPoolSize` and `maxIdleTimeMS`. Only `CartModel.syncIndexes()` runs at startup (`index.ts:15-16`); every other collection relies on `autoIndex`, which should be disabled in production in favour of an explicit migration.

### 8.8 Orphan models

`CustomerGroup` (no service or controller references), `ProductQuestion` (only `deleteMany` on store delete), and the dead `BillingNotification` schema file.

---

## 9. Performance Audit

Each finding follows the requested format. **Estimated improvements are engineering judgment, not measurements** — they should be validated with profiling.

### P-01 — Unbounded `.find({ storeId })` on list endpoints
- **Problem:** Multiple services call `.find({ storeId })` with no limit — inventory reports (`reports.service.ts:72,83`), media storage recount (`media-storage.service.ts:65`), coupons, campaigns, shipping zones, CMS pages, cross-store admin queries (`report.service.ts:993`).
- **Impact:** A merchant with 50,000 products causes a multi-second query, tens of MB of driver memory, and a payload that stalls the Node event loop during JSON serialization. One large tenant degrades every other tenant on the same instance.
- **Recommendation:** Apply the existing `pagination.ts` helper (which already clamps at 100) universally. For genuine full-scans (recount jobs), use `.cursor()` and stream.
- **Priority:** Critical
- **Est. improvement:** p99 on affected endpoints from seconds to <200 ms for large tenants.

### P-02 — No caching layer despite `ioredis` installed *(Verified)*
- **Problem:** `ioredis` is in `apps/api/package.json` with **zero imports in `src/`**. The only HTTP cache header in the codebase is on public plans (`plan.controller.ts:23`). Feature access, plan lookups, and store-by-slug resolution hit MongoDB on every single request.
- **Impact:** `checkFeature` alone performs 3–4 queries per guarded request (store, feature, assignment, plan). With ~469 endpoints mostly behind feature guards, this is a large multiplier on total DB load.
- **Recommendation:** Cache the feature matrix per `(storeId, planId)` with a 60s TTL and explicit invalidation on plan update. Cache store-by-slug. Add `Cache-Control` to public storefront endpoints.
- **Priority:** Critical
- **Est. improvement:** 40–60% reduction in DB queries per request.

### P-03 — Client-side aggregation of 200 orders
- **Problem:** `analytics-tab.tsx:16-46` fetches 200 orders and computes revenue, top products, and unique customers in the browser.
- **Impact:** Multi-MB payload, main-thread blocking on a mobile device, and figures that are silently wrong for any store with more than 200 orders.
- **Recommendation:** Add a server aggregate endpoint; return a small stats object.
- **Priority:** High
- **Est. improvement:** 90%+ payload reduction; correctness restored.

### P-04 — Charts and animation loaded eagerly
- **Problem:** `recharts` is statically imported at 25 sites, `framer-motion` at 140 — including `providers/loading-provider.tsx:12`, which sits in the **global** provider tree and therefore ships framer-motion to the marketing landing page. Only 8 `next/dynamic` call sites exist.
- **Impact:** Recharts is roughly 400 KB gzipped, framer-motion roughly 120 KB. Both are in first-load JS for routes that may not render a chart.
- **Recommendation:** `next/dynamic({ ssr: false })` for all chart components. Replace framer-motion in the loading provider with CSS transitions.
- **Priority:** High
- **Est. improvement:** 300–500 KB off first-load JS; LCP improvement of 0.5–1.5 s on 3G.

### P-05 — N+1 query patterns
- **Problem:** Navigation loads menu items per nav via `map(async)` (`navigation.service.ts:54-55`); feature tiers are loaded per feature (`feature.service.ts:168-173`, 60+ round trips per access-matrix call); billing cron updates sequentially per store (`billing-cron.service.ts:22-48`); media upload processes files sequentially (`media.service.ts:107-207`).
- **Impact:** Linear latency growth. The feature matrix is called on nearly every page load in the store panel.
- **Recommendation:** Batch with `$in` and group in memory; `Promise.all` for independent I/O.
- **Priority:** High
- **Est. improvement:** Feature matrix from ~60 queries to 2.

### P-06 — Virtualization built but bypassed
- **Problem:** `@tanstack/react-virtual` is used in exactly one file (`DataGridVirtualRows.tsx`), activating at ≥50 rows via `DataGrid`. But analytics pages, admin products/orders/users/invoices, inventory modules, and media grids all use hand-rolled `<table>` and `.map()` rendering that bypasses DataGrid entirely.
- **Impact:** 500 rows × ~15 DOM nodes = 7,500 nodes, with layout thrash on every state change.
- **Recommendation:** Migrate hand-rolled tables to `DataGrid`.
- **Priority:** High
- **Est. improvement:** 5–10× faster render on large lists.

### P-07 — Aggressive polling
- **Problem:** Live analytics polls at **5 s** (`analytics/live/page.tsx:17-18`), analytics overview and visitors at 15 s, dashboard visitors at 10 s, notifications at 15 s, landing pricing at 60 s.
- **Impact:** A single open live-analytics tab generates 720 requests/hour, each triggering unindexed aggregations. Ten merchants with the tab open is 7,200 req/hour of pure polling.
- **Recommendation:** Server-Sent Events for live data; back off to 30 s otherwise; pause polling when `document.hidden`.
- **Priority:** Medium
- **Est. improvement:** 80% reduction in analytics request volume.

### P-08 — `Math.random()` during render
- **Problem:** `skeleton.tsx:116-121` generates chart skeleton bar heights with `Math.random()` in the render body; `instagram-feed.tsx:21` does the same for like counts; `account/security/page.tsx:114` uses it as a React `key`.
- **Impact:** Guaranteed hydration mismatch (server and client produce different HTML), forcing React to discard and re-render the subtree. The `key` case defeats reconciliation entirely — every render remounts the list.
- **Recommendation:** Use a fixed height array; use a stable id for keys.
- **Priority:** Medium
- **Est. improvement:** Removes a full hydration re-render on any page with a chart skeleton.

### P-09 — Builder history deep-clones on every keystroke
- **Problem:** `builder-history-middleware.ts` runs `JSON.parse(JSON.stringify(...))` over the entire section tree on every history-eligible action. `BUILDER_HISTORY_LIMIT` is 10, so memory is bounded — but the per-event cost is not.
- **Impact:** Dragging a slider or typing into a text prop triggers a full serialize-plus-parse of the document per event, on the main thread. Visible input lag on content-heavy pages.
- **Recommendation:** Debounce history capture to ~500 ms for continuous inputs, or use `structuredClone`, or move to Immer patches (which RTK already includes).
- **Priority:** High
- **Est. improvement:** Eliminates builder input lag.

### P-10 — RTK Query cache tag errors
- **Problem:** `getPublicPlans` is tagged `"Stores"` (`public-plan-api.ts:8-12`), so any store mutation invalidates public pricing while actual plan edits may not. Product mutations invalidate `{type:"Products", id: storeId}` but not the item/slug tags `getProduct`/`getPublicProduct` use (`product-api.ts:164-204`), so edits do not appear until a hard refresh. `PaymentMethods` and admin `Orders` tags are unscoped, causing cross-store over-invalidation. All analytics queries share one tag, so any invalidation refetches six queries.
- **Impact:** Both stale data (a correctness bug users will report) and over-fetching.
- **Recommendation:** Audit all `providesTags`/`invalidatesTags`; scope by id consistently.
- **Priority:** High
- **Est. improvement:** Eliminates a class of stale-data bugs; reduces refetch volume.

### P-11 — Missing `skip` guards
- **Problem:** `useGetStoreFeatureAccessQuery(storeId)` has no `skip` in three places (`use-store-features.tsx:18,49,67`), and many workspace tabs query with a `storeId` prop and no guard.
- **Impact:** Requests fired with `""` on first render, returning 400/404 and polluting the cache.
- **Recommendation:** `{ skip: !storeId }` everywhere.
- **Priority:** Medium

### P-12 — `keepUnusedDataFor` never configured
- **Problem:** Not set globally or on any endpoint; RTK's 60 s default applies uniformly.
- **Impact:** Heavy dashboard payloads are held for 60 s regardless of size, while rarely-changing data (plans, features, categories) is discarded just as fast.
- **Recommendation:** Long TTL for static data, short for volatile.
- **Priority:** Low

### P-13 — Dynamic `import()` on hot paths
- **Problem:** `order.service.ts:42-110`, inventory, auth refresh, and cart all use dynamic imports inside request handlers.
- **Impact:** Module resolution on the first request of each path; obscures the dependency graph.
- **Recommendation:** Hoist to static imports unless breaking a genuine cycle.
- **Priority:** Low

---

## 10. React Audit

A true Profiler-driven audit requires runtime measurement. What follows is a static analysis of render-correctness risks, which is where the actionable findings are.

### 10.1 Memoization coverage

| API | Files |
|---|---:|
| `React.memo` | 22 |
| `useMemo` | 76 |
| `useCallback` | 50 |

Against 394 components and 108 client pages, this is thin — particularly for list-heavy surfaces (`orders-tab`, `inventory-tab`, `products-tab`, media grids) where row components re-render on every parent state change.

### 10.2 Component-by-component risk assessment

| Component | Lines | Why it re-renders | Avoidable? | Recommendation |
|---|---:|---|---|---|
| `builder/properties-panel.tsx` | 1,130 | Redux `selectedSection` + every prop edit | Partially | Split per control group; `React.memo` each; subscribe to narrow selectors |
| `workspace/orders-tab.tsx` | 1,037 | Local filter/search state + RTK refetch; entire table re-renders on any filter keystroke | Yes | Extract `OrderRow` as `memo`; hoist column defs out of render |
| `inventory/inventory-modules.tsx` | 986 | 11 modules in one file, shared parent state | Yes | Split into 11 files; lazy-load per active tab |
| `media/media-picker.tsx` | 950 | Grid re-renders on selection change | Yes | `memo` the grid item; `useCallback` the select handler |
| `admin/plans/plan-builder.tsx` | 843 | 60+ toggles in one state object; every toggle re-renders all | Yes | `useReducer` + memoized group components |
| `navigation-manager.tsx` | 836 | dnd-kit drag state re-renders the whole tree | Partially | `memo` tree nodes; use dnd-kit's own optimizations |
| `store-dashboard.tsx` | 703 | Multiple RTK subscriptions in one component | Yes | Split by card; each owns its query |
| `site/[tenant]/checkout/page.tsx` | 630 | Form state on a single component | Yes | `react-hook-form` (already a dependency) with uncontrolled inputs |
| `storefront/navbar-renderer.tsx` | 606 | Re-renders on every route change | Partially | `memo` + stable props |

### 10.3 Correctness risks

| Sev | Issue | Location |
|:---:|---|---|
| High | `Math.random()` in render → hydration mismatch | `skeleton.tsx:116-121`, `instagram-feed.tsx:21` |
| Med | `Math.random()` as React `key` → remounts every render | `account/security/page.tsx:114` |
| Med | Global keyboard handlers fire while typing — Delete deletes the **section** instead of a character while editing a text prop | `builder/builder-editor.tsx` |
| Low | `new Date()` in render | `use-footer-data.ts:58` |
| Low | `Math.random()` at module scope in mock data | `lib/admin/data.ts:95-97` |

### 10.4 Context

`StoreProvider` (`store-context.tsx:53-72`) and `DeviceContext` (`device-context.tsx:60-76`) both correctly memoize their values and clean up listeners. The concern is `AppProviders` (`app-providers.tsx:23-36`), which wraps the entire app — including the marketing landing page and public storefronts — in Redux, `LoadingProvider`, and `SessionInit`. The storefront pays for merchant-dashboard infrastructure. Consider a lighter provider tree for `site/[tenant]` and `/`.

### 10.5 Effect hygiene

Many tabs sync form state from query results via `useEffect`. No confirmed infinite loop was found in sampling, but the pattern combined with unmemoized object dependencies is the standard way one appears. Listener and interval cleanup is consistently good where sampled (`floating-section-toolbar.tsx:43-49`, `storefront-canvas.tsx:126-131`, `session-init.tsx:143-155`).

---

## 11. Next.js Audit

| Area | Status | Finding |
|---|:---:|---|
| Server Components | ⚠️ | 540 `"use client"` files; 66% of pages are client. Several are thin client wrappers around a single child (`reports/page.tsx:1-7`, `categories/page.tsx`, `apps/page.tsx`) that could be server shells |
| Client Components | ⚠️ | Appropriate for the dashboard; over-applied on storefront and marketing |
| SSR | ✅ | Storefront tenant layout does server-side fetch with `generateMetadata` (`site/[tenant]/layout.tsx:17-40`) |
| SSG / ISR | ✅ | Storefront home uses ISR + Suspense (`site/[tenant]/page.tsx:8-30`). No `generateStaticParams` for product/category pages — an opportunity |
| Metadata | ✅ | ~79 `metadata`/`generateMetadata` sites; canonical helpers in `lib/server/page-metadata.ts:98-118` |
| Dynamic routes | ✅ | Correct `[tenant]`, `[storeSlug]`, `[slug]` conventions with route groups |
| Caching | ❌ | No `revalidate` tuning; no `fetch` cache options; no `unstable_cache` |
| Streaming / Suspense | ⚠️ | Used on storefront home; absent elsewhere |
| Image optimization | ❌ | 6 files use `next/image` vs ~45 raw `<img>` tags |
| Fonts | ✅ | Inter via `next/font/google` as a CSS variable (`layout.tsx:2,13-17`) — correctly self-hosted |
| Bundle optimization | ❌ | Only 8 `next/dynamic` sites for recharts/framer-motion/tiptap/dnd-kit |
| Prefetching | ✅ | Default `<Link>` prefetch |
| Build safety | ✅ | **No** `typescript.ignoreBuildErrors`, **no** `eslint.ignoreDuringBuilds` — verified |
| Security headers | ❌ | No `headers()` function in `next.config.ts` — no CSP, HSTS, or `X-Frame-Options` |
| `output` | ✅ | `"standalone"` for Docker |

Properly code-split already: the builder editor (`editor-client.tsx:6-12`, `ssr: false`), TipTap in the CMS editor (`cms-page-editor.tsx:14-16`), and the section component registry.

---

## 12. UI Audit

### 12.1 Design system

The token system is genuinely well-designed. `apps/web/src/app/globals.css` `@theme` (lines 15–99) defines:

- **Colors** (15–63): `--color-apple-primary` `#0066cc`, `apple-ink` `#1d1d1f`, `apple-hairline` `#e0e0e0`, `apple-canvas` `#fff`, `apple-canvas-parchment` `#f5f5f7`, surface tiles, `apple-ink-muted-80/48`, plus semantic aliases
- **Radii** (66–75), **spacing** (78–85), **type families** (88–89), **shadow** (92), **motion easing** (95–98)
- A named type scale, `.text-hero-display` through `.text-micro-legal` (205–333)

Two problems:

| Sev | Finding |
|:---:|---|
| High | **~210 of 677 files (31%) bypass the tokens** for raw `zinc`/`gray`/`slate`/`neutral`. Worst offenders by occurrence: `inventory-modules.tsx` (128), `stores/store-drawer.tsx` (50), `settings/email/page.tsx` (47), `settings/notifications/page.tsx` (44), `admin/dashboard/settings/page.tsx` (43), `visual-controls.tsx` (36), `plan-builder.tsx` (35) |
| Med | **Tokens declared twice** — in `globals.css` `@theme` (authoritative in Tailwind v4) and again in `tailwind.config.ts:25-118` (legacy, redundant, will drift) |

### 12.2 Component-level assessment

| Area | Status | Notes |
|---|:---:|---|
| Spacing | ✅ | Consistent `--spacing-apple-*` scale where tokens are used |
| Typography | ✅ | Named scale is a strong pattern |
| Icons | ✅ | Lucide, tree-shakeable named imports |
| Consistency | ⚠️ | Token drift (above) is the main issue |
| Loading states | ✅ | Rich skeleton library: Table/Card/List/StatCard/Chart/Row |
| Empty states | ✅ | Reusable `EmptyState`/`NoResults`/`ErrorState` used in ~37 files |
| Error states | ⚠️ | `app/error.tsx` and `site/[tenant]/error.tsx` exist; 100+ files surface failures as a toast only, with no inline retry |
| Animation | ⚠️ | Extensive framer-motion; reduced-motion ignored in ~137 of 140 files |
| Tables | ⚠️ | `DataGrid` is good; many hand-rolled tables bypass it |
| Modals | ❌ | No focus trap — see §13.1 |
| Navigation | ⚠️ | `/pages` route fully built but missing from the sidebar |
| Toasts | ✅ | Single global `<Toaster>` at `layout.tsx:48`; Sonner provides polite live regions by default |

### 12.3 Loading and error gaps

| Sev | Finding |
|:---:|---|
| High | Fetch failures often surface only as a toast, with no inline error UI or retry affordance |
| Med | Admin sub-routes have no per-route `loading.tsx` (only `admin/dashboard/loading.tsx` exists) |
| Med | Some tables render a raw `.map()` with no zero-state (`settings/email/page.tsx`, `settings/notifications/page.tsx`) |
| Low | Inline pulse blocks used instead of the skeleton system (`inventory-modules.tsx:95`) |

---

## 13. Accessibility Audit

**Assessed level: fails WCAG 2.1 Level A** on multiple criteria. This is the lowest-scoring dimension in the audit and carries legal exposure in several jurisdictions.

### 13.1 Dialogs (WCAG 2.1.2 No Keyboard Trap, 2.4.3 Focus Order)

| Component | role/aria-modal | Escape | Scroll lock | **Focus trap** | **Focus restore** | Labelled |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `ui/modal.tsx` | ✅ (89-91) | ✅ (51-53) | ✅ (54-59) | ❌ | ❌ | ❌ |
| `ui/confirm-dialog.tsx` | ✅ (65-67) | ✅ (51-58) | ❌ | ❌ | ❌ | ❌ |
| `ui/drawer.tsx` | ❌ | ✅ (38-42) | ❌ | ❌ | ❌ | ❌ |
| `ui/dropdown-menu.tsx` | ✅ | ✅ | n/a | ✅ | ✅ (107) | ✅ |

`DropdownMenu` uses `@floating-ui`'s `FloatingFocusManager` with full arrow/Home/End/Escape navigation. It is a genuinely good implementation and should be the template for fixing the other three: `Modal`, `ConfirmDialog`, and `Drawer` all let Tab escape to background content, and none returns focus to the trigger on close. Since `Modal` and `Drawer` are used app-wide, this is **Critical** for keyboard and screen-reader users.

Ad-hoc dialogs that reimplement the pattern (and may lack even the above): `builder/section-library-modal.tsx:219`, `storefront/quick-view-modal.tsx:265`, `dashboard/stores/store-drawer.tsx`, `store-dashboard/pages/page-settings-drawer.tsx`.

### 13.2 Forms (WCAG 1.3.1, 3.3.2, 4.1.2)

| Sev | Finding | Location |
|:---:|---|---|
| **Crit** | The shared `Field` wrapper renders its label as **plain text** with no `id`/`htmlFor` generation. Every field using it is unlabelled for assistive technology — ~15 uses on the account page alone | `app/(dashboard)/dashboard/account/page.tsx:18` |
| **Crit** | Only **6 files** in the entire app use `htmlFor`/`aria-invalid`/`aria-describedby` — the auth forms and `newsletter.tsx` | app-wide |
| High | `ui/input.tsx:9-18` has no `id`; placeholders serve as de-facto labels | `ui/input.tsx` |
| High | `aria-invalid` essentially unused, so validation errors are invisible to screen readers | app-wide |
| Med | Native `<select>`/`<textarea>` unlabelled on settings pages | `dashboard/account/page.tsx:55-57` |

The fix is highly leveraged: adding `useId()`-based association inside `Field`, `Input`, and `Label` fixes hundreds of form controls at once.

### 13.3 Colour contrast (WCAG 1.4.3)

`--color-muted-foreground` = `--color-apple-ink-muted-48` = **`#7a7a7a`**.

| Combination | Ratio | Verdict |
|---|---:|---|
| `#7a7a7a` on `#ffffff` (canvas) | **4.3:1** | **Fails AA** for normal text (needs 4.5:1) |
| `#7a7a7a` on `#f5f5f7` (parchment) | **4.0:1** | **Fails AA** |

This is the default muted, caption, and placeholder colour, applied at 14 px (`.text-caption`), 12 px (`.text-fine-print`), and 10 px (`.text-micro-legal`) — all below the large-text exemption. It appears in `empty-state.tsx:33`, `modal.tsx:108`, `dropdown-menu.tsx:250,256`, every input placeholder via `input.tsx:13`, and `search-bar.tsx:52`.

**Fix:** Darken to approximately `#616161`, which yields ≈5.7:1 on white. This is a one-token change with app-wide effect. Dark-mode muted (`#cccccc` on `#2a2a2c` ≈ 9:1) is fine.

### 13.4 Structure and keyboard

| Sev | Finding |
|:---:|---|
| High | **No skip-to-content link** anywhere |
| Med | **Root layout has no `<main>` landmark** (`app/layout.tsx:42-53`); only ~46 files use any landmark element |
| Med | Custom widgets built from `div` + `onClick` without `role`/`tabIndex`/key handlers — `admin/admin-tabs.tsx`, `reports/ReportsModuleNav.tsx`, `builder/panels/*`, `page-tree-node.tsx` (a tree with no `role="tree"`) |
| Med | Icon-only buttons without `aria-label` — `aria-label` appears in ~70 files but there are considerably more icon buttons. Specific gaps: `builder/floating-section-toolbar.tsx`, `builder/layers-panel.tsx`, `cms/cms-faqs-editor.tsx`, `admin/dashboard/orders/page.tsx`, `admin/dashboard/templates/page.tsx` |
| Med | Missing `alt` — `workspace/inventory-tab.tsx:695` and `:732` |
| Low | Portaled dialogs use `<h2>`/`<h3>` which may break document heading order |

### 13.5 Reduced motion (WCAG 2.3.3)

`globals.css:135-154` defines a correct `@media (prefers-reduced-motion: reduce)` block — but it zeroes **CSS** animation and transition durations only. **Framer-motion animates via JS inline transforms, which this rule cannot stop.** So Modal, Drawer, ConfirmDialog, and EmptyState entrance animations still play at full strength for users who have explicitly asked for reduced motion.

`useReducedMotion` is used in exactly 3 of ~140 framer-motion files (`landing/store-builder.tsx:21`, `loading/navigation-progress-bar.tsx:8`, `providers/loading-provider.tsx:192,292`).

**Fix:** Call `useReducedMotion()` in the shared primitives and set `transition={{ duration: 0 }}` when true. Fixing `Modal`, `Drawer`, `ConfirmDialog`, and `EmptyState` covers most of the surface.

---

## 14. Mobile & Responsive Audit

Findings are from reading Tailwind classes. **Real-device testing is required to confirm.**

### 14.1 What is done well

Page shells use `max-w-[1440px]` with responsive padding (`workspace-shell.tsx:23`, `admin-shell.tsx:24`, `store-shell.tsx:81`). Wide tables are generally wrapped in `overflow-x-auto` with a `min-w`. The store sidebar has a proper mobile drawer (`store-shell.tsx:95`, `w-[280px]` slide-in). `.prose table` is scroll-wrapped with a mobile font reduction (`globals.css:600-615`).

### 14.2 Breakpoint risk assessment

| Width | Risk | Detail |
|---|:---:|---|
| **320px** | High | Builder side panels are fixed at `w-[260px]`/`w-[300px]` (`builder-loading-screen.tsx:99,121`), leaving ~20 px of canvas. `section-library-modal.tsx:334` has a `w-[320px]` panel plus a `w-[220px]` aside inside a `h-[92vh]` modal |
| **375px** | Med | Data tables with `min-w-[720px]`/`min-w-[760px]` (`inventory-modules.tsx:195,497,960`) force horizontal scroll — acceptable if wrapped, but confirm each parent has `overflow-x-auto` |
| **768px** | Med | Builder and admin assume desktop; likely unusable below this width |
| **1024px** | Low | Generally fine |

### 14.3 Touch targets (WCAG 2.5.5 — 44×44 px)

The base `Button` correctly enforces `min-h-[44px]` (`ui/button.tsx:34-37`). Violations are all ad-hoc buttons that bypass it:

| Location | Issue |
|---|---|
| `orders-tab.tsx:501` | `h-6` input (24 px) with `max-w-[100px]` |
| `orders-tab.tsx:563` | `text-[8px]` — both a touch-target and a legibility failure |
| `upload-progress.tsx`, `admin/dashboard/orders/page.tsx`, `cms-faqs-editor.tsx`, `templates/page.tsx`, `builder-command-palette.tsx`, `categories-tab.tsx` | `h-6`/`h-7`/`p-1` icon buttons |

### 14.4 Recommended manual test matrix

| Page | 320 | 375 | 768 | 1024 |
|---|:---:|:---:|:---:|:---:|
| Storefront home / PDP / cart / checkout | ☐ | ☐ | ☐ | ☐ |
| Store dashboard, orders, products, inventory | ☐ | ☐ | ☐ | ☐ |
| Builder canvas | ☐ | ☐ | ☐ | ☐ |
| Admin dashboard, plans, stores | ☐ | ☐ | ☐ | ☐ |

Check each for: horizontal overflow, clipped/hidden buttons, modals wider than viewport, unreachable sticky elements, and sub-44px targets.

---

## 15. Dark Mode Audit

**Verdict: half-built and currently non-functional.** This is worth calling out separately because the *appearance* of support is high while actual support is near zero.

### What exists

- Correct Tailwind v4 class strategy: `@custom-variant dark (&:is(.dark *))` (`globals.css:4`) and `darkMode: "class"` (`tailwind.config.ts:4`)
- Full `.dark { ... }` token overrides (`globals.css:105-122`, `168-171`), plus dark rules for prose, frosted bars, skeleton shimmer, and storefront/dashboard surfaces
- 36 component files with `dark:` variants

### What is missing

| Sev | Finding |
|:---:|---|
| **Crit** | **No `ThemeProvider`, no `next-themes`, no theme context.** `AppProviders` (`app-providers.tsx:23-37`) wires Redux, Loading, and Session only |
| **Crit** | **No persistence and no anti-FOUC init script.** Nothing reads a stored preference or `prefers-color-scheme` and applies `.dark` on load (`app/layout.tsx:42-53`) |
| **Crit** | **The only toggle in the app is orphaned** — `document.documentElement.classList.toggle("dark", ...)` fires inside the profile page's `save()` handler, is never persisted, and is lost on reload (`app/(dashboard)/dashboard/account/page.tsx:40`) |
| **Crit** | **Coverage is ~5%.** Only `ui/*` primitives, `auth/*`, `inventory-modules`, `platform-sidebar`, `admin-shell`, `workspace-shell`, `data-grid`, `storefront-product-grid`, `dynamic-footer`, `empty-state`, `confirm-dialog`, and `drawer` have `dark:` variants. Admin pages, store-dashboard pages, and most storefront sections have none — **if `.dark` were ever applied, those areas would render dark text on hardcoded `bg-white`** |
| High | ~180 files hardcode `bg-white`/`text-black` with no dark variant |
| Low | `theme-slice.ts`, `theme-tab.tsx`, `theme-panel.tsx` refer to **storefront** theming, not app dark mode — easy to conflate when planning the fix |

**Recommendation:** Pick one. Either (a) remove the `dark:` classes and the `.dark` CSS block to stop implying support that does not exist, or (b) commit to it: add `next-themes`, a provider, an inline no-FOUC script, and then backfill dark variants across admin, store-dashboard, and storefront. Option (b) is roughly 3–4 weeks of work across 180+ files. Option (a) is a day. Given everything else in this report, (a) now and (b) later is the defensible sequence.

---

## 16. Image Audit

| Metric | Value |
|---|---:|
| Files importing `next/image` | 6 |
| Files with raw `<img>` | ~35 (≈46 tags) |
| `unoptimized` flags | 0 (good) |

### Configuration (`next.config.ts:7-36`)

`formats: ["image/avif", "image/webp"]`, `minimumCacheTTL: 60`, and `remotePatterns` for Cloudinary, picsum, placehold, and `localhost:4000/uploads`. This is correct — it is simply bypassed by most of the app.

### Raw `<img>` hotspots

`product-hero.tsx:14`, `category-grid.tsx:31`, `gallery.tsx:30`, `products-tab.tsx:308,496`, `checkout/page.tsx:590`, `cart/page.tsx:83`, `inventory-tab.tsx:176`, `store-hero.tsx:82`, `media-picker.tsx:757+`.

These are the storefront's LCP elements. Every one forgoes AVIF/WebP conversion, responsive `srcset`, lazy loading, and CLS prevention.

| Sev | Finding | Fix |
|:---:|---|---|
| High | Storefront product and category images use raw `<img>` | Migrate to `next/image` or the existing `SmartImage` wrapper |
| Med | `AsyncImage` renders **nothing** for non-whitelisted hosts (`async-image.tsx:52`) rather than falling back to `<img>` — storefront images from an unexpected CDN silently disappear | Fall back to `<img>` with a console warning |
| Med | `minimumCacheTTL: 60` is very short for immutable product images | Raise to 31536000 for content-addressed URLs |
| Low | Some `next/image` uses omit `sizes` when not using `fill` | Add `sizes` |

No source images were found committed to the repo (`project_image/` holds documentation screenshots), so there is no oversized-asset problem to report — but there is also no image compression pipeline for merchant uploads beyond `sharp`'s WebP conversion in the media processor.

---

## 17. SEO Audit

| Check | Status | Detail |
|---|:---:|---|
| Metadata | ✅ | ~79 `metadata`/`generateMetadata` sites; tenant, product, and category pages all have dynamic metadata |
| Open Graph | ✅ | Root layout (`layout.tsx:19-39`) and tenant helpers |
| Twitter Card | ✅ | Present in root metadata |
| Canonical | ✅ | `alternates.canonical` via `lib/server/page-metadata.ts:98-118` |
| Robots | ✅ | Correctly disallows `/admin`, `/dashboard`, `/store`, `/api` |
| **Sitemap** | ❌ | **Three URLs total** |
| **Structured data** | ❌ | One JSON-LD block, on the marketing home only |
| Performance (Core Web Vitals) | ⚠️ | Raw `<img>` hurts LCP; eager recharts/framer-motion hurt FID/INP |

### The sitemap problem *(Verified)*

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getAppOrigin();
  if (!origin) return [];
  const now = new Date();
  return [
    { url: origin, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${origin}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${origin}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
```

For an e-commerce platform, this means **no tenant storefront, no product page, and no category page is ever submitted to search engines.** The single largest SEO asset of the product — thousands of merchant product pages — is invisible.

**Fix:** Generate per-tenant sitemaps. Use `sitemap.ts` with `generateSitemaps()` for tenant partitioning, or serve a sitemap index from the API that enumerates published storefronts and their published products and pages.

### Structured data

The only JSON-LD is a `SoftwareApplication` block on the marketing home (`app/page.tsx:25-37`). Missing and high-value:

- `Product` + `Offer` + `AggregateRating` on product detail pages → rich snippets with price and stock in search results
- `Organization` + `LocalBusiness` on tenant home → knowledge panel eligibility
- `BreadcrumbList` on category and product pages
- `Article` on blog posts

For an e-commerce SaaS, Product schema is directly revenue-linked for every merchant on the platform. This is the highest-ROI SEO work available.

---

## 18. Builder Audit

State management is **Redux Toolkit** (`redux/slices/builder-slice.ts`, 862 lines), with history maintained by `redux/middleware/builder-history-middleware.ts` as a `past`/`future` snapshot pair.

| ID | Sev | Finding |
|---|:---:|---|
| B-01 | **Crit** | **Autosave silently drops pages >64 KB** — `fetch(..., { keepalive: true })` at `use-builder-auto-save.ts:217`; spec caps keepalive bodies at 64 KB. Silent data loss on tab close. Endpoint is also hardcoded, bypassing RTK Query auth/error handling |
| B-02 | High | **Every history snapshot deep-clones the full section tree** via `JSON.parse(JSON.stringify(...))`. `BUILDER_HISTORY_LIMIT` is 10 so memory is bounded, but per-keystroke cost is a full serialize+parse on the main thread |
| B-03 | High | **Applying a template destroys undo history and marks the page clean** — `templates-panel.tsx:156` dispatches `loadSections()`, which clears `past`/`future` and sets `isDirty = false`. Template application is irreversible, and if the explicit `saveDraft` on line 157 fails, the user sees a failure toast while autosave believes there is nothing to save |
| B-04 | High | **Global keyboard shortcuts fire while typing** — `builder-editor.tsx` binds Delete and Cmd+C to `window` without checking whether the target is an input, textarea, or contentEditable. Pressing Delete while editing a text prop deletes the selected *section* |
| B-05 | Med | **Template "insert sections" drops styling and floods history** — `templates-panel.tsx:165-173` copies only `id`, `type`, `label`, `visible`, `props`; the `style` field is lost. Each section is a separate dispatch, so a 15-section template produces 15 deep clones and evicts the entire 10-entry undo window |
| B-06 | Med | **Builder is hardcoded to the home page** — `builder-editor.tsx` loads only `isHomePage: true`, despite `/pages` letting merchants create arbitrary pages and the section system being page-agnostic |
| B-07 | Med | **History panel is not usable as a history UI** — `history-panel.tsx` labels entries only "Snapshot N — X sections", with no timestamp and no change description. `restoreHistorySnapshot` is itself history-tracked, so restoring shifts every number in the list |
| B-08 | Med | **Custom CSS injected unsanitized** — `section-renderer.tsx:202-213` writes `section.style.customCss` into a `<style>` tag. Not XSS, but CSS can escape section scope and overlay the whole storefront, including covering a checkout button |
| B-09 | Low | **Stuck spinner** — `templates-panel.tsx:151-154` returns early on missing `page.id` without calling `setApplying(null)` |

### Drag & drop — expectation setting

Worth stating plainly: `builder/layers-panel.tsx` implements native HTML5 drag events for reordering, and `builder/store-preview.tsx` supports click-to-select and hover — but there is **no drag-and-drop on the canvas itself.** Users cannot drag a section into place on the preview. If marketing describes this as a drag-and-drop builder, that claim currently applies only to the layers list.

### Memory

Bounded at 10 snapshots, which is fine. The risk is CPU (B-02), not memory.

---

## 19. CMS & Page System Audit

| ID | Sev | Finding |
|---|:---:|---|
| D-01 | **Crit** | **No draft/published separation** — a single `sections` array (`store-page.model.ts:160-167`). `saveStorePageDraft` writes directly into it; `publishPage` only snapshots and flips status. Once published, every autosave is live (see C-08) |
| D-02 | High | **Scheduled publishing never fires** — `scheduleStorePage` exists and the model has a `"scheduled"` status with `scheduledAt`, but no cron or worker ever queries for and publishes them. Pages sit in `"scheduled"` forever |
| D-03 | Med | **Dual page systems** — `modules/pages/*` (StorePage, live) and `modules/stores/page.route.ts` (Page, legacy, unmounted). Both collections are created on store bootstrap |
| D-04 | Med | **Slug lookup ignores publication status** — `getStorePageBySlug` (`store-page.service.ts:206-211`) filters `storeId`, `slug`, `deletedAt` but **not** `status`, so drafts and archived pages are returned. The calling route is behind store auth, which contains the blast radius, but the function is one careless reuse away from leaking unpublished content |

### What works well

`PageVersionModel`, `computeDiff`, `getPublishHistory`, and `rollbackToVersion` (`publish.service.ts:204-217`) are genuinely implemented with full section snapshots. This is the strongest part of the CMS and, ironically, makes D-01 more fixable than it looks — the version infrastructure needed for a proper draft/publish split already exists.

---

## 20. Store Panel Audit

The store panel is the most complete area of the product. Orders, products, customers, coupons, and media are real: real endpoints, loading/error/empty states, and server-side pagination. The order detail view, product editor, and customer profiles are substantial.

| Area | Status | Notes |
|---|:---:|---|
| Dashboard | ✅ | Functional; 703-line component should be split |
| Orders | ✅ | Complete UI; backend has no status state machine (§22.A) |
| Products | ✅ | Full editor; two competing variant systems underneath |
| Inventory | ✅ | Extensive ERP module set, recently built |
| Customers | ✅ | Profiles, groups, addresses |
| Reports | ⚠️ | Six stub modules (§22.I) |
| Media | ⚠️ | Works; page is a 36-line wrapper with no server guard or metadata |
| **Settings** | ❌ | **7 of 21 sections are "coming soon"** placeholders: Markets, Gift cards, Metafields, Customer accounts, Policies, Files, Brand. Three more — Localization, Currency, Taxes — **all render the same component**, so selecting any of them shows identical content |
| **Shipping** | ❌ | **Drives a dead model** — the UI reads/writes `ShippingZoneModel`, but checkout uses `DeliveryZoneModel`. A merchant can configure zones in full, save successfully, and affect nothing |
| Coupons | ⚠️ | Two coupon types silently do nothing (§22.C) |
| Courier | ❌ | All providers are stubs (C-04) |
| Invoices / Print | ⚠️ | See below |
| **`/pages`** | ⚠️ | **Fully built and unreachable** — complete page management (list, create, delete, publish) at `(shell)/pages/page.tsx`, with no sidebar entry |

### Invoice PDF cannot render Bengali — High

`apps/api/src/modules/orders/order-invoice-pdf.service.ts:383-410` loads only Inter (`Inter-Regular/Medium/SemiBold/Bold.ttf` from `apps/api/src/assets/fonts`), falling back to Helvetica. **Neither font contains Bengali glyphs.**

For a product targeting Bangladesh — BDT pricing, Pathao/RedX/Steadfast couriers, Bangla marketing copy — any Bangla product name, customer name, or address renders as blank boxes or dropped glyphs on **every invoice**. This is a market-blocking defect, not a cosmetic one.

**Fix:** Bundle a Bengali-capable font (Noto Sans Bengali) and register it with PDFKit, selecting per script run or embedding a font with both Latin and Bengali coverage.

---

## 21. Admin & Super Admin Audit

| Area | Status | Notes |
|---|:---:|---|
| Dashboard | ❌ | Renders mock data (below) |
| Plans | ⚠️ | Plan builder works but writes camelCase keys enforcement never reads (C-03) |
| Stores | ✅ | Store list and detail drawer functional |
| Users | ✅ | Functional |
| Analytics | ❌ | Partly mock data |
| Settings | ⚠️ | `admin.route.ts:605` writes `request.body[key]` with no whitelist — mass assignment |
| Permissions | ❌ | 60+ toggles, ~90% unenforced (C-03) |
| Reports | ❌ | Partly mock data |
| Invoices | ✅ | Functional |
| Subscriptions | ⚠️ | Cron runs; no payment provider to charge with (C-05) |

### Mock data in production UI — High

`apps/web/src/lib/admin/data.ts` contains hardcoded fixtures (including `Math.random()` at module scope, lines 95–97) that are still imported and rendered by admin screens. Admin dashboard figures and portions of analytics and reports display invented numbers.

An operator making platform decisions from these screens is reading fiction. This should be either wired to `platform.service.ts` or replaced with an explicit "no data" state — a fabricated number is worse than a blank.

### Route group duplication — Low

Both `app/(admin)/` and `app/admin/` exist as top-level segments. Consolidate.

---

## 22. Business Module Audit

### A. Orders

| ID | Sev | Finding |
|---|:---:|---|
| E-01 | **Crit** | No transaction around order create + stock + coupon + cart (C-07) |
| E-02 | **Crit** | Read-modify-write stock decrement → oversell (C-07) |
| E-03 | **Crit** | Refunds move no money, no over-refund validation (C-06) |
| E-04 | High | **Prices trusted from the cart** — order totals come from prices stored on the cart document, not re-read from the product at order time. Stale or client-influenced prices become the order price |
| E-05 | High | **No status state machine** — `store-order.controller.ts` accepts and writes any status. `delivered` → `pending` and `cancelled` → `shipped` are both allowed |
| E-06 | High | **Cancellation and refund never restock** — inventory is permanently lost from the sellable pool on every cancelled order, with no signal to the merchant |
| E-07 | High | **Returns do not exist** — the status enum includes `refunded` and `partial_refund`, and the reports dashboard has a `ReturnsModule`, but there is no returns model, no RMA flow, and no return endpoint |
| E-08 | Med | **PII logged to console** — `order.service.ts` `console.log`s customer contact details during order creation. In any environment with log aggregation this is a data-protection issue |

### B. Products & Variants

| Sev | Finding |
|:---:|---|
| High | **Three competing stock representations** — `product.stock`, embedded `product.variants[]`, and separate `ProductVariant`/`VariantInventory`/`VariantPrice` collections. Different call sites read different representations with no synchronization layer. Stock and price can disagree depending on which path wrote and which read |
| Med | **Import/export round-trip is lossy** — exports do not carry the full variant structure, so export→re-import loses data for variant-heavy catalogs |

### C. Coupons

| Sev | Finding |
|:---:|---|
| High | **`buy_x_get_y` always discounts zero** — the type is accepted, validated, and creatable in the admin UI; the discount computation returns 0. The coupon applies successfully and reduces the total by nothing |
| High | **`free_shipping` is computed then discarded** — `calculateCouponDiscount` returns a `free_shipping` flag that `order.service.ts` never reads. Shipping is charged in full |
| High | **Coupon lookup is not store-scoped in all paths** — cross-tenant concern |
| Med | **`categoryIds` and `shipping` params accepted and ignored** — category-restricted coupons apply to everything |
| Med | **`usageCount` increments are not atomic** — usage limits can be exceeded under concurrency |

Two of these share a failure shape worth naming: the coupon *appears* to apply. The user sees a success state and a coupon chip. Only the total is wrong. Silent-wrongness bugs like this are far more damaging than errors, because nobody reports them until the accounting doesn't reconcile.

### D. Shipping

`ShippingZoneModel` has a complete service, routes, and UI — and nothing reads it at checkout, which uses `DeliveryZoneModel`. Two parallel shipping models, one entirely decorative. **High.**

### E. Courier

All five providers are 7-line stubs; the base class fabricates connection-test success (C-04). `shipment-sync.cron.ts` runs every 5 minutes against nothing. **Critical.**

### F. Payment

No gateway integrated; Stripe installed and never imported; webhook is an unsigned stub (C-05). Only COD and manual marking work. **Critical.**

### G. Notifications & Email

Two systems exist:

- **Active:** `common/integrations/email.ts` — plain Nodemailer + SMTP env config. Every real `sendEmail` call uses this.
- **Dead:** `modules/email/email-engine.service.ts` — templates, tracking, queueing, provider abstraction. **Zero production call sites.**

Defects in the dead system, all latent until someone switches over:

| Sev | Finding |
|:---:|---|
| **Crit** | In-memory queue loses everything on restart; no error handling in `processQueue`; no concurrency control; `retryFailedEmails` never re-sends; `stopEmailQueue` leaks `retryInterval`; `enqueueEmail` has no callers (C-12) |
| High | **Template renderer is injectable and ReDoS-prone** — `renderTemplate` builds regexes from unescaped variable names and passes user values as the `String.replace` replacement argument, where `$&` and `$1` are interpreted as patterns |
| High | **TLS verification disabled** — `createTransporter` sets `rejectUnauthorized: false`, opening SMTP to MITM. The transporter cache is never invalidated on config change, so credential updates need a restart |
| Med | **`Notification` model is dead** — no read or write call sites |
| Med | **Push notifications do not exist** — no service worker, no FCM/APNs, no device token storage. Any UI or copy claiming push is unbacked |
| Low | Tracking pixel is gated on an unrelated `bccEmail` condition, so open-tracking silently does nothing by default |

### H. Reports

| Sev | Finding |
|:---:|---|
| **Crit** | `reports.service.ts` string/ObjectId `$match` mismatch — mounted, live, returns zeros (C-11) |
| High | `getSalesReport` counts cancelled orders as revenue |
| Med | Duplicated report stacks: `report.route.ts` (used by web) vs `reports.route.ts` (broken) |
| Med | Six stub dashboard modules with no backing data: `WalletModule`, `ReturnsModule`, `StaffModule`, `ProfitLossModule`, `ExpenseModule`, `SubscriptionModule`. `ProfitLossModule` contains accounting errors in the little logic it has |
| Med | `handleExport` always exports the dashboard KPI payload regardless of the active module — exporting from the Customers report yields KPI data |

### I. Media

Functional. Security concerns are covered in §6: SVG acceptance without sanitization (S-10) and SSRF via URL import (S-09). Sequential per-file processing is a performance issue (P-05).

---

## 23. Plan & Feature Gating Audit

This subsystem is well-designed on paper and does not work in practice.

**Design:** A feature catalog (`feature.seed.ts`) defines keys; `PlanFeature` assigns them per plan; `checkFeature` resolves access; `requireFeatureAccess` guards routes; `FeatureGate` and `useStoreFeatures` gate the UI. Store-level overrides exist. This is the right architecture.

**Reality:**

| ID | Sev | Finding |
|---|:---:|---|
| J-01 | **Crit** | `checkFeature` fails open on three paths — no plan, unknown feature key, or missing assignment all return `allowed: true` (C-03) |
| J-02 | High | **camelCase vs snake_case mismatch** — `PlanModel.featureToggles` uses `advancedReports`; the catalog and all call sites use `advanced_reports`. `store-override.service.ts` sits between the two and does not translate. Combined with J-01, every failed lookup resolves to *allowed* |
| J-03 | High | **Features referenced in routes but absent from the catalog** — including collections, marketing, and navigation. Because of J-01 these are currently ungated on every plan |
| J-04 | Med | **N+1 in `getStoreFeatureAccessMatrix`** — queries per feature rather than batching; 60+ round trips per call, and it is called on nearly every store-panel page load |
| J-05 | Low | `common/middleware/plan-enforcement.middleware.ts` is never mounted |
| J-06 | Low | `resolveUsageValue` accepts an unused `unit` parameter — unfinished quota logic |

**The compounding effect is the point.** J-01 alone would be a bug. J-02 alone would be a bug. Together they mean: an admin toggles a feature off in the plan builder → the toggle writes a camelCase key → enforcement looks up the snake_case key → no assignment found → `allowed: true`. **Plan restrictions do not restrict.** For a SaaS whose revenue model is plan tiers, this is a direct revenue leak: every store has enterprise access regardless of what they pay.

**Recommended fix order:** (1) make `checkFeature` fail closed and log misses; (2) add a startup assertion that every `requireFeatureAccess` key exists in the catalog; (3) normalize keys to snake_case at the boundary; (4) run a full audit of which features are actually enforced and reconcile the admin UI to show only those.

---

## 24. Code Quality Audit

| Dimension | Assessment |
|---|---|
| **Folder structure** | ✅ Good. Module-per-domain in the API (`modules/<domain>/<domain>.{route,controller,service,model,validator}.ts`); feature-grouped components in web |
| **Naming** | ✅ Consistent and predictable |
| **SOLID** | ⚠️ Single Responsibility violated by 15 files over 800 lines. Dependency Inversion is well done for courier providers (a clean base-class abstraction — which makes the empty implementations more frustrating, since the seams are already there) |
| **DRY** | ❌ Five parallel duplicate systems: Page/StorePage, two reports stacks, three stock representations, two email systems, `models/` shims over `modules/` |
| **KISS** | ⚠️ The feature-gating layer is more complex than its (non-)enforcement justifies |
| **Type safety** | ⚠️ `strict: true` in `tsconfig.base.json`, zero `@ts-ignore` — genuinely good discipline. Undercut by **205 `as any`** and **26 API type errors on `main`** |
| **Unused / dead code** | ❌ See inventory below |
| **Duplicated code** | ❌ See DRY |
| **Large files** | ❌ 15 files over 800 lines; the largest is 1,444 |
| **Reusable components** | ✅ `ui/*`, `DataGrid`, `EmptyState`, and the skeleton library are well-factored |
| **Reusable hooks** | ✅ 25 hooks including good debounce utilities |
| **Testing** | ❌ **Zero test files.** No Jest, Vitest, Playwright, or Cypress in either manifest |

### Type errors on `main` *(Verified)*

```bash
$ cd apps/api && npx tsc --noEmit
exit=2 — 26 errors across 6 files
```

| File | Errors |
|---|---:|
| `src/modules/notifications/contact.service.ts` | ~10 |
| `src/modules/stores/store-contact.service.ts` | several |
| `src/modules/cart/cart.controller.ts` | 2 |
| `src/modules/auth/auth.controller.ts` | 1 |
| `src/modules/customers/customer-auth.middleware.ts` | 1 |
| `src/modules/stores/store-branding-logo.ts` | several |

Most are the same root cause — `.lean()` returning `T[] | T | null` where the code assumes a single document:

```
contact.service.ts(33,14): error TS2339: Property 'userId' does not exist on type
'(FlattenMaps<any> & Required<{ _id: unknown; }> & { __v: number; })[] | ...'
```

`apps/web` typechecks clean (0 errors, verified).

**This means CI is red on `main`.** `.github/workflows/ci.yml` runs `pnpm lint` and `pnpm typecheck` on every push and PR to `main`. The API typecheck fails, so either the workflow is failing and being ignored, or branch protection is not enforcing it. A red CI that nobody acts on is worse than no CI — it trains the team to ignore the signal.

### Missing ESLint configuration *(Verified)*

`apps/api/package.json` declares `"lint": "eslint ."`, but **no ESLint config file exists** in `apps/api` (no `.eslintrc*`, no `eslint.config.*`). `pnpm lint` in CI therefore either errors or lints nothing.

### Dead code inventory

| Item | Location |
|---|---|
| `plan-enforcement.middleware.ts` | Never mounted |
| `validate.middleware.ts` | Defined, never imported by a route |
| `ownership.middleware.ts` | Defined, never imported |
| `notification.model.ts` | No call sites |
| `stores/page.route.ts` | Not mounted |
| `reports/reports.service.ts` | Mounted but broken |
| `email-engine.service.ts` + `email-queue.service.ts` | No production call sites |
| `shipping.service.ts` / `ShippingZoneModel` | UI writes it; nothing reads it |
| `enqueueEmail` | No callers |
| `CustomerGroup`, `ProductQuestion` models | Orphans |
| `stripe` dependency | Installed, never imported |
| `ioredis` dependency | Installed, never imported |
| `billing-notification.model.ts` | Dead schema behind an aliasing shim |

---

## 25. Dependency Audit

### Unused *(Verified)*

| Package | App | Note |
|---|---|---|
| `stripe` (^18.5.0) | api | Zero imports in `src/` |
| `ioredis` (^5.7.0) | api | Zero imports in `src/`; health endpoint reports `redis: "unknown"` |

### Misplaced — server packages in the web app

| Package | Risk |
|---|---|
| `mongoose` (^8.16.4) | Used only in `lib/mongoose.ts`, models, and seed scripts |
| `bcryptjs` (^2.4.3) | Used only in `lib/password.ts` and seed |
| `nodemailer` (^7.0.6) | Used only in `services/email.service.ts` |

None are currently imported from client components, so they are not in the client bundle today. But they inflate install size and one careless import away from shipping Mongoose to the browser. Since `apps/api` already owns the database and email, these should move there or into a private server-only package.

### Heavy dependencies

| Package | Approx. gzipped | Import sites | Assessment |
|---|---:|---:|---|
| `recharts` | ~400 KB | 25 | Mostly static imports — should be dynamic |
| `framer-motion` | ~120 KB | 140 | Including the global loading provider |
| `@tiptap/*` (11 packages) | ~200 KB | few | ✅ Correctly dynamic |
| `@dnd-kit/*` (3 packages) | ~40 KB | 1 | Low surface |
| `pdfkit` | server | api | Appropriate |
| `sharp` | server (native) | api | Appropriate |

### Duplicate-purpose

| Overlap | Note |
|---|---|
| `zustand` **and** `@reduxjs/toolkit` | Both installed; Redux is the primary store. Check whether zustand is used at all — if not, remove |
| `axios` **and** RTK Query's `fetchBaseQuery` | Both present |
| `@tanstack/react-table` **and** the custom DataGrid | Verify the former is actually used |
| `autoprefixer` + `postcss` with Tailwind v4 | Tailwind v4's Vite/PostCSS plugin handles this; likely vestigial |

### Not assessed

**Outdated packages and known CVEs were not checked** — this requires `pnpm outdated` and `pnpm audit`, which need network access. Given `.env` exposure and the security findings, running both should be part of the immediate remediation. Enable Dependabot or Renovate.

---

## 26. Error Handling, Logging & Monitoring

### Error handling

| Sev | Finding |
|:---:|---|
| High | **`builder.controller.ts:80-84` returns `error.message` to the client on 500** — leaks internal detail |
| Med | `test-email.controller.ts:57-59` returns raw SMTP error messages |
| Med | `courier.controller.ts:56,76` return derived `error.message` |
| ✅ | Central `errorHandler` (`error.middleware.ts:26-27`) correctly returns a generic message and no stack trace, and maps CastError/ValidationError/duplicate-key properly |

### Logging

| Sev | Finding |
|:---:|---|
| High | **219 `console.*` calls in `apps/api/src`** (66 `console.log`, 153 `console.error`) versus structured pino, which is configured but used only for HTTP request logging. Application logs are therefore unstructured, unlevelled, unsearchable, and uncorrelated |
| Med | **`X-Request-Id` is assigned after `pino-http`** (`app.ts:188` then `:192`), so the request id never appears in HTTP log lines — defeating its purpose |
| Med | Bootstrap and shutdown log via `console` (`index.ts:23-50`) |
| Med | **PII in logs** — order creation logs customer contact details |

### Monitoring

| Capability | Status |
|---|:---:|
| Health endpoint | ✅ `/health` and `/api/health` — DB `readyState`, uptime, memory |
| Redis health | ❌ Hardcoded `"unknown"` |
| Error tracking (Sentry etc.) | ❌ None |
| APM / tracing | ❌ None |
| Metrics (Prometheus) | ❌ None |
| Uptime monitoring | ❌ Not configured in-repo |
| Log aggregation | ❌ None |
| Alerting | ❌ None |

Health exposes `process.memoryUsage()` publicly — minor information disclosure; gate it behind auth or trim the payload.

### Graceful shutdown

`index.ts:31-44` closes the HTTP server and the Mongoose connection on SIGTERM/SIGINT. It does **not** clear the four `setInterval` schedulers (billing, storage, shipment sync, email queue), and `process.exit(0)` can cut in-flight work. In Docker with a short grace period this will truncate operations mid-write — and since nothing is transactional (§8.5), truncation means corruption.

---

## 27. Production Readiness

| Gate | Status | Detail |
|---|:---:|---|
| Secrets management | ❌ | Credentials in Git (C-01) |
| Tests | ❌ | Zero |
| CI | ❌ | Runs, but API typecheck fails and there is no API ESLint config |
| Error tracking | ❌ | None |
| Monitoring / alerting | ❌ | None |
| Structured logging | ❌ | 219 `console.*` calls |
| Caching | ❌ | `ioredis` installed, unused |
| Horizontal scalability | ❌ | In-memory rate limiter and email queue |
| Database transactions | ❌ | One file |
| Backups / DR | ❓ | Not visible in-repo |
| Load testing | ❌ | No evidence |
| Documentation | ⚠️ | `README.md` (29 KB) and `DESIGN.md` (37 KB) exist; no runbook or ADRs |
| Docker | ✅ | Multi-stage build, `output: "standalone"`, compose with `backend`/`frontend`/network |
| `.dockerignore` | ✅ | Present |
| Feature flags | ⚠️ | Exist but fail open |
| Rollback | ⚠️ | Page-level rollback exists; no deployment rollback documented |

### Debug and placeholder code

| Category | Count / detail |
|---|---|
| `console.log` (api) | 66 |
| `console.error` (api) | 153 |
| `console.log` (web) | 8 |
| `TODO`/`FIXME`/`HACK` | **0** — unfinished work is undocumented rather than absent, which makes it harder to find, not easier |
| "Coming soon" UI | 7 settings sections + 6 report modules |
| Mock data in production UI | `apps/web/src/lib/admin/data.ts` |
| Stub implementations | 5 courier providers + fabricated connection test |
| Seed scripts | `apps/api/src/seed/*` (`nayeem-store.seed.ts` is 921 lines) — verify these are not reachable in production |
| Test routes | None found |

---

## 28. Consolidated Priority Table

Estimates assume one mid-to-senior engineer familiar with the codebase.

### Critical

| ID | Issue | Location | Impact | Est. | 
|---|---|---|---|---|
| C-01 | Live credentials in Git | `.env`, `apps/api/.env`, `apps/web/.env` | Full DB compromise; JWT forgery for any role | **4 h** (+ history purge) |
| C-04 | Courier test fabricates success | `base.provider.ts:73-80` | Merchants build operations on a false signal | **15 min** (honesty fix) |
| C-03 | `checkFeature` fails open | `feature-access.service.ts:272-292` | Plan restrictions do not restrict — direct revenue leak | **1 d** |
| C-02 | Systemic cross-tenant IDOR | ~10 routers | Any merchant reads/writes any other merchant's data | **3 d** |
| C-10 | Stored XSS, no sanitizer | 12 sites, both apps | Customer account takeover | **2 d** |
| C-07 | No order transaction; stock race | `order.service.ts` | Oversell; orphaned stock/coupon writes | **3 d** |
| C-06 | Refunds unvalidated, move no money | `store-order.controller.ts` | Unlimited over-refund; false accounting | **1 d** |
| C-09 | Autosave drops pages >64 KB | `use-builder-auto-save.ts:217` | Silent data loss on tab close | **1 d** |
| C-08 | Publish is a no-op | `store-page.model.ts:160-167` | Merchants edit production live | **5 d** |
| C-11 | Legacy reports return zeros | `reports.service.ts:9,85,94,110` | Broken endpoints mounted and reachable | **4 h** |
| C-05 | No payment gateway | api-wide | Cannot take online payment | **10 d** per provider |
| C-12 | In-memory email queue | `email-queue.service.ts` | All queued mail lost on restart (latent) | **3 d** |

### High

| ID | Issue | Location | Impact | Est. |
|---|---|---|---|---|
| H-01 | 26 API type errors; CI red | 6 files | Broken quality gate | 1 d |
| H-02 | No ESLint config in `apps/api` | `apps/api/` | Lint step is a no-op | 2 h |
| H-03 | Customer JWT in `localStorage` | `account/login/page.tsx:54-61` | XSS → account takeover | 1 d |
| H-04 | CORS regex allows any `*.IP.evil.com` | `app.ts:87-95` | Credentialed cross-origin reads | 4 h |
| H-05 | Customer auth lacks rate limiting | `customer.route.ts:27-29` | 100 password guesses/min/IP | 1 h |
| H-06 | Dialogs have no focus trap | `modal.tsx`, `drawer.tsx`, `confirm-dialog.tsx` | Keyboard users trapped outside dialog | 1 d |
| H-07 | Forms unlabelled (`Field` wrapper) | `Field`, `Input`, `Label` | Screen readers cannot use most forms | 2 d |
| H-08 | Muted text fails WCAG AA (4.3:1) | `globals.css` token | App-wide contrast failure | **30 min** |
| H-09 | Sitemap has 3 URLs | `sitemap.ts` | No storefront is indexed | 1 d |
| H-10 | No Product JSON-LD | storefront | No rich snippets for any merchant | 1 d |
| H-11 | Unbounded `.find()` | multiple services | One large tenant degrades all | 2 d |
| H-12 | No caching; `ioredis` unused | api-wide | 3–4× DB queries per request | 3 d |
| H-13 | 200-order client aggregation | `analytics-tab.tsx:16` | Multi-MB payload; wrong numbers | 1 d |
| H-14 | Recharts/framer-motion eager | 165 sites | 300–500 KB first-load JS | 2 d |
| H-15 | Raw `<img>` on storefront | ~35 files | LCP and CLS regression | 2 d |
| H-16 | RTK cache tag errors | `public-plan-api.ts`, `product-api.ts` | Stale data after edits | 1 d |
| H-17 | Missing `{storeId, createdAt}` indexes | Product, Order, Cart | Slow lists at scale | 4 h |
| H-18 | Bengali invoice PDFs unrenderable | `order-invoice-pdf.service.ts:383-410` | Market-blocking for Bangladesh | 1 d |
| H-19 | Coupons: `buy_x_get_y`, `free_shipping` no-op | `coupon.service.ts` | Silent revenue loss | 2 d |
| H-20 | Shipping zones dead | `shipping.service.ts` | Configured shipping affects nothing | 3 d |
| H-21 | Cancel/refund never restock | `order.service.ts` | Permanent inventory drift | 1 d |
| H-22 | No order status state machine | `store-order.controller.ts` | Illegal transitions | 1 d |
| H-23 | Mock data in admin UI | `lib/admin/data.ts` | Operators read fiction | 2 d |
| H-24 | Builder history deep-clone per keystroke | `builder-history-middleware.ts` | Input lag | 1 d |

### Medium (selected)

| Issue | Location | Est. |
|---|---|---|
| Dark mode half-built | app-wide | 1 d (remove) / 15 d (complete) |
| Reduced motion ignored by framer-motion | ~137 files | 2 d (primitives only) |
| 219 `console.*` → pino | `apps/api/src` | 2 d |
| Request-id assigned after logger | `app.ts:188-196` | 15 min |
| Zod `validate` middleware unused | 24 validators | 3 d |
| Response envelope inconsistency | analytics, inventory | 1 d |
| Three stock representations | products/variants | 5 d |
| Page vs StorePage duplication | pages modules | 3 d |
| N+1 in feature matrix | `feature.service.ts:168` | 4 h |
| No `allowDiskUse` | all aggregations | 2 h |
| `maxPoolSize: 10` | `connection.ts:19` | 15 min |
| Rate limiter in-memory | `rate-limit.middleware.ts` | 4 h |
| Aggressive polling (5 s) | analytics pages | 1 d |
| Token drift (~210 files) | web-wide | 5 d |
| Touch targets <44 px | ~8 files | 1 d |
| Scheduled publishing never fires | `store-page.service.ts` | 2 d |
| Six report stub modules | `ReportsDashboard.tsx` | 5 d |
| Builder locked to home page | `builder-editor.tsx` | 2 d |
| No CSP on web | `next.config.ts` | 4 h |
| Regex injection in search | 4 services | 2 h |
| Unguarded `mongoose.model()` ×3 | wishlist, newsletter, contact | 15 min |

### Low (selected)

| Issue | Est. |
|---|---|
| Remove `stripe`, `ioredis` (or use them) | 30 min |
| Move `mongoose`/`bcryptjs`/`nodemailer` out of web | 2 h |
| Delete dead code inventory (§24) | 1 d |
| Split 15 files over 800 lines | 10 d |
| JWT algorithm pinning | 30 min |
| Consolidate `(admin)` / `admin` route groups | 2 h |
| Duplicate token definitions | 1 h |
| Skip link + `<main>` landmark | 2 h |
| `keepUnusedDataFor` tuning | 4 h |

---

## 29. Remediation Roadmap

### Immediate — today

The first two items are measured in minutes and prevent ongoing harm.

1. **Rotate every credential in `.env`** — MongoDB first, then `JWT_SECRET`, `NEXTAUTH_SECRET`, Google OAuth, Cloudinary, Stripe, SSLCommerz. Restrict MongoDB Atlas IP access.
2. **Make the courier test honest** — one line in `base.provider.ts:73-80`, from fabricated success to `{ ok: false, message: "Integration not yet available" }`. Every hour this stays as-is, another merchant may be building fulfilment on a false signal.
3. **Add `.env*` to `.gitignore`**, `git rm --cached` the tracked files, and plan the history purge with the team.
4. **Fix the muted-text token** — `#7a7a7a` → `#616161` in `globals.css`. One line, app-wide WCAG AA improvement.
5. **Move `globalRateLimit` above `express.json`** and **`X-Request-Id` above `pino-http`.** Two line moves.

### Week 1 — stop the bleeding

- Purge secrets from Git history (`git filter-repo`), coordinate the force-push.
- **Fix `checkFeature` to fail closed** + add the startup assertion that every guard key exists in the catalog.
- Mount a single `requireStoreOwner` middleware across all `/:storeId` merchant routers (C-02).
- Fix the 26 API type errors; add an ESLint config to `apps/api`; make CI blocking on `main`.
- Apply `authRateLimit` to customer auth endpoints.
- Tighten the CORS regexes; disable IP-wildcard patterns in production.
- Add refund amount validation.
- Fix `reports.service.ts` ObjectId casting, or delete the legacy stack.
- Add the three missing `{storeId, createdAt}` compound indexes.
- Add `escapeRegex()` to the four unescaped search paths.

### Month 1 — make it correct

- **Transactions:** wrap order creation, PO receive, and stock transfer in sessions; convert stock decrement to atomic `$inc` with a `$gte` guard.
- **Sanitization:** add a sanitizer, sanitize on write and render at all 12 `dangerouslySetInnerHTML` sites, add a CSP to `apps/web`.
- **Draft/publish separation** for pages (C-08) — the `PageVersion` infrastructure needed already exists.
- **Fix builder autosave** — `sendBeacon` or localStorage fallback (C-09).
- **Accessibility pass:** focus traps in the three dialogs, `useId()` association in `Field`/`Input`/`Label`, skip link, `<main>` landmark, reduced-motion in shared primitives.
- **Performance pass:** paginate all unbounded `.find()`; dynamic-import recharts and framer-motion; replace the 200-order client aggregation with a server endpoint; fix the RTK cache tags.
- **Introduce testing.** Vitest for services, Playwright for the checkout and order flows. Start with the paths that carry money.
- **Add Sentry** to both apps.
- Restock on cancel and refund; add an order status state machine.
- Replace `console.*` with pino in the API.
- Fix the Bengali invoice font.
- Decide the dark-mode question (§15) and act on it.

### Month 3 — make it scale and complete

- Integrate a real payment gateway (SSLCommerz or bKash for the Bangladesh market) with signature-verified webhooks.
- Implement the five courier providers, or remove the UI.
- Add Redis: feature-matrix caching, rate-limit store, and a durable email queue (BullMQ).
- Consolidate the duplicate systems: one page model, one reports stack, one stock representation, one email system.
- Fix or remove the six report stub modules and the seven "coming soon" settings tabs.
- Complete or remove the shipping-zone feature.
- Split the 15 files over 800 lines.
- Migrate the ~210 token-drift files.
- Per-tenant sitemaps + Product/Organization JSON-LD.
- Load-test with realistic multi-tenant data; tune the connection pool.
- Add `allowDiskUse` to all aggregations.

### Future

- Read replicas for reporting; consider a separate analytics store (ClickHouse or Timescale) for page views and events.
- Move image processing to a queue.
- Real-time features over SSE/WebSocket instead of polling.
- Returns/RMA workflow.
- Push notifications (service worker + FCM).
- Full WCAG 2.1 AA certification pass.
- Multi-region deployment.
- Complete the mobile app (Expo project surveyed but not audited).

---

## 30. Appendix — Verified Command Output

Every claim marked *(Verified)* in this report is backed by one of the following. All commands are read-only.

```bash
# Tracked environment files — C-01
$ git ls-files | grep -i env
.env
.env.example
.env.production
.env.production.example
apps/api/.env
apps/web/.env
apps/web/.env.development
mobileapp/.env.example

$ cat .gitignore    # 13 lines, no .env entry
node_modules / .next / dist / build / coverage / .turbo / .DS_Store
.pnpm-store / apps/api/uploads / mobileapp/node_modules

$ rg -c "mongodb\+srv" .env apps/api/.env
.env:1
apps/api/.env:1
```

```bash
# Unused dependencies — C-05, P-02
$ rg -l 'from "stripe"|require\(.stripe.\)' apps/api/src
(no results)
$ rg -l "ioredis" apps/api/src
(no results)
```

```bash
# Courier stubs — C-04
$ wc -l apps/api/src/modules/couriers/providers/*.ts
     212 base.provider.ts
       7 paperfly.provider.ts
       7 pathao.provider.ts
       7 redx.provider.ts
       7 steadfast.provider.ts
       7 sundarban.provider.ts
```

```bash
# Reports stack is mounted — C-11
$ rg -n "reports" apps/api/src/modules/stores/store.route.ts
31:import { reportsRouter } from "../reports/reports.route.js";
85:storeRouter.use("/:storeId/reports", reportsRouter);
```

```bash
# Type checking — H-01
$ cd apps/api && npx tsc --noEmit
exit=2 — 26 errors across 6 files

$ cd apps/web && npx tsc --noEmit
exit=0 — 0 errors
```

```bash
# XSS surface — C-10
$ rg -n "dangerouslySetInnerHTML" apps/web/src | wc -l
12
$ rg -n "dompurify|sanitize-html|xss" apps/web/package.json apps/api/package.json
(no results)
```

```bash
# Transactions — C-07
$ rg -ln "startSession" apps/api/src
apps/api/src/modules/stores/store.service.ts
```

```bash
# Debug code — §27
$ rg -c --no-filename "console\.log" apps/api/src | awk '{s+=$1} END {print s}'
66
$ rg -c --no-filename "console\.error" apps/api/src | awk '{s+=$1} END {print s}'
153
$ rg -c --no-filename "console\.log" apps/web/src | awk '{s+=$1} END {print s}'
8
$ rg -c --no-filename -e TODO -e FIXME -e HACK apps | awk '{s+=$1} END {print s}'
0
```

```bash
# Type safety — §24
$ rg -c --no-filename "\bas any\b" apps/api/src apps/web/src | awk '{s+=$1} END {print s}'
205
$ rg -c --no-filename "@ts-ignore|@ts-expect-error" apps/api/src apps/web/src | awk '{s+=$1} END {print s}'
0
$ rg -n "strict" tsconfig.base.json
9:    "strict": true,
```

```bash
# Tests and lint config — §24, §27
$ find apps -type d -name node_modules -prune -o -type f \( -name "*.test.*" -o -name "*.spec.*" \) -print
(no results)
$ ls apps/api/.eslintrc* apps/api/eslint.config.*
(no matches)
```

---

*End of report. Prepared by static analysis on 26 July 2026. Runtime profiling, live index inspection, penetration testing, dependency CVE scanning, and real-device responsive testing are recommended as follow-up work — see §2.*
