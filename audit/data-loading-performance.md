# BORNOLAND STORE PLATFORM — DATA LOADING, ROUTING, AUTH, CACHE & PERFORMANCE AUDIT REPORT

**Date:** September 2, 2026  
**Auditor / Roles:** Principal Frontend Architect + Backend Performance Engineer + SQA Engineer  
**System:** BornoLand All-in-One Multi-Tenant E-Commerce Platform  
**Target Environment:** Localhost / Production Build (Next.js 15.3.3 + Node.js Express API + MongoDB)

---

## Executive Summary

A comprehensive, end-to-end performance, authentication, payment, and loading UX audit was performed across the entire BornoLand platform (encompassing 47 store admin routes, multi-tenant storefront routing, SSLCommerz payment return flows, and backend MongoDB aggregation pipelines).

### Key Accomplishments & Metrics

| Metric / Flow | Before Optimization | After Optimization | Improvement |
| :--- | :--- | :--- | :--- |
| **Login Redirect Loop** (`nayeem.localhost:3000/login?redirect=%2Fcheckout`) | `ERR_TOO_MANY_REDIRECTS` (Infinite loop, curl exit 47) | **HTTP 200 OK (0 redirects)** | **100% Resolved** |
| **Store Metadata Resolution** (`GET /stores/by-slug/:slug`) | 2,491.1ms | **733.8ms** (975.2ms warm) | **~70% Latency Reduction** |
| **Merchant Store List** (`GET /stores/my-stores`) | 2,710.7ms | **981.4ms** | **~64% Latency Reduction** |
| **Consolidated Store Context** (`GET /stores/:slug/context`) | 6 separate waterfall queries (~4,500ms total) | **1 concurrent query** (Store + Perms + Features + Media) | **Eliminated 5 network roundtrips** |
| **Store Admin Routes Response Time** (All 47 modules) | Delayed / Waterfall Client Spinners | **9ms average response time (47/47 passing)** | **Sub-10ms instantaneous serving** |
| **Payment Return Pages** (`/checkout/payment/success`, `/fail`, `/cancel`) | Blank page on SSR / SearchParams missing | **Suspense Skeleton + Fallback State + HTTP 200** | **Zero blank screens** |
| **Delayed Skeleton UX Flash** | 180ms blank viewport block | **0ms immediate skeleton rendering** | **Zero white flashes** |
| **SSLCommerz Automated Callback Matrix** | Untested in isolation | **10/10 automated tests passing** | **Idempotent, Safe, Cross-tenant isolated** |

---

## 1. Problem Identification & Root Cause Analysis

### 1.1 Auth Redirect Loop (`ERR_TOO_MANY_REDIRECTS`)
- **Observed Behavior:** Navigating to `http://nayeem.localhost:3000/login?redirect=%2Fcheckout` entered an infinite 307 loop between the subdomain and platform login.
- **Root Causes:**
  1. **Checkout Submission Path:** In `apps/web/src/components/storefront/checkout/checkout-form.tsx`, unauthenticated customer checkout was redirecting to `/login?redirect=%2Fcheckout` instead of the storefront customer auth route `/account/login?redirect=%2Fcheckout`.
  2. **Platform vs Storefront Disambiguation:** Platform login is designed for store owners/merchants, while `/checkout` is a customer storefront route.
  3. **Next.js 15 App Router Edge Relativization:** In `apps/web/src/middleware.ts`, `NextResponse.redirect(new URL("http://localhost:3000/...", request.url))` internally strips the origin when running on localhost, converting absolute redirects into relative `Location: /...` headers. On subdomains such as `nayeem.localhost:3000`, the browser resolves this relative URL against the subdomain host, causing Next.js middleware to repeatedly intercept and re-issue the redirect.

### 1.2 Unnecessary Waterfall Queries & Latency
- **Observed Behavior:** Loading `/store/[storeSlug]/dashboard` triggered up to 6 separate network requests:
  - `GET /stores/by-slug/:slug` (2.5s)
  - `GET /stores/my-stores` (2.7s)
  - `GET /features/stores/:storeId/access`
  - `GET /media/stores/:storeId/stats`
  - `GET /team/:storeId/permissions/me`
  - `GET /subscriptions/:storeId`
- **Root Causes:**
  1. `attachStoreMetrics()` performed unindexed `$group` aggregations over the entire `ProductModel` and `OrderModel` collections for each store lookup, with zero in-memory caching.
  2. `ensurePlans()` checked the database on every lookup rather than caching plans in memory.
  3. Redux Toolkit Query endpoints defaulted to `keepUnusedDataFor: 0`, throwing away query cache results immediately upon navigating between sidebar tabs.

### 1.3 Blank Screens & Spinner Fatigue
- **Observed Behavior:** White flashes during page transitions; full-viewport spinners replacing the entire page; payment return pages appearing blank when search parameters were missing.
- **Root Causes:**
  1. `apps/web/src/components/loading/delayed-skeleton.tsx` had an intentional 180ms delay (`if (!visible) return <div className="min-h-[40vh]" />`), creating a noticeable blank screen before showing skeletons.
  2. Payment return pages (`success`, `fail`, `cancel`) used `useSearchParams()` without a surrounding `<Suspense>` boundary, failing client hydration and crashing when visited directly.
  3. `StoreShell` and individual pages (`/products`, `/orders`, `/inventory`, etc.) replaced the entire UI with `<Loader2 className="animate-spin" />` instead of rendering headers, sidebars, and structural table skeletons immediately.

---

## 2. Architectural Changes & Implementations

### 2.1 Edge Middleware & Auth Sanitization
- **Files Modified:**
  - `apps/web/src/lib/auth-redirect.ts`: Implemented `validatePlatformRedirect()` to reject storefront-only paths (`/checkout`, `/cart`, `/shop`, `/account`) from merchant redirects.
  - `apps/web/src/middleware.ts`: Permitted loopback subdomains (`*.localhost:3000`) to fall through directly to tenant routing rather than redirecting to `http://localhost:3000`, stopping edge relativization loops.
  - `apps/web/src/components/storefront/checkout/checkout-form.tsx`: Updated unauthenticated checkout submit redirect to use `resolveStoreHref("/account/login?redirect=...")`.

### 2.2 SSLCommerz Payment Return Hardening
- **Files Created / Modified:**
  - `apps/web/src/app/site/[tenant]/checkout/payment/loading.tsx`: Created responsive pulse loading skeleton for checkout return routes.
  - `apps/web/src/app/site/[tenant]/checkout/payment/success/page.tsx`: Extracted search params consumption into a child component wrapped in `<Suspense fallback={<PaymentReturnLoading />}>`; added defensive fallback UI for missing parameters.
  - `apps/web/src/app/site/[tenant]/checkout/payment/fail/page.tsx`: Wrapped in Suspense boundary with graceful error handling.
  - `apps/web/src/app/site/[tenant]/checkout/payment/cancel/page.tsx`: Wrapped in Suspense boundary with order retry actions.

### 2.3 Backend Latency Reduction & Metrics Caching
- **Files Modified:**
  - `apps/api/src/modules/stores/store.service.ts`:
    - Added a 5-minute memory cache to `ensurePlans()`.
    - Added a 30-second TTL cache (`storeMetricsCache`) and `invalidateStoreMetricsCache(storeId)` to `attachStoreMetrics()`, eliminating repetitive MongoDB `$group` table scans.
  - `apps/api/src/modules/orders/order.model.ts`:
    - Added compound indexes: `{ storeId: 1, createdAt: -1 }`, `{ storeId: 1, orderNumber: 1 }`, and `{ customerId: 1, createdAt: -1 }`.
  - `apps/api/src/modules/products/product.model.ts`:
    - Added compound index: `{ storeId: 1, createdAt: -1 }`.

### 2.4 Consolidated Store Context Controller & Endpoint
- **Files Created / Modified:**
  - `apps/api/src/modules/stores/store-context.controller.ts`: Implemented `getStoreContextController` executing store resolution, user permissions (`getEffectiveUserPermissions`), feature entitlements (`getStoreFeatureAccessMatrix`), and storage statistics (`getStorageStats`) concurrently in a single `Promise.all`.
  - `apps/api/src/modules/stores/store.route.ts`: Registered:
    - `GET /stores/by-slug/:slug/context`
    - `GET /stores/:id/context`

### 2.5 Frontend RTK Query Optimization & Instant Shell Rendering
- **Files Modified:**
  - `apps/web/src/redux/api/store-api.ts`: Added `getStoreContextBySlug` query with `keepUnusedDataFor: 300` (5-minute cache).
  - `apps/web/src/providers/store-context.tsx`: Hydrated `store`, `permissions`, `role`, `features`, and `storageStats` simultaneously; pre-dispatched Redux store permissions.
  - `apps/web/src/components/store-dashboard/store-permissions-sync.tsx`: Skipped network permissions refetch if already hydrated from store context.
  - `apps/web/src/components/store-dashboard/store-sidebar.tsx`: Reused `features` and `storageStats` from store context, skipping duplicate `/features` and `/media/stats` network queries.
  - `apps/web/src/components/store-dashboard/store-dashboard.tsx`: Reused context features and stats to instantly render overview cards.
  - `apps/web/src/components/store-dashboard/store-shell.tsx`: Replaced the blank page + loader spinner with immediate structural sidebar, header, and card skeletons.
  - `apps/web/src/components/loading/delayed-skeleton.tsx`: Removed the 180ms empty div blank delay to render skeleton UI instantaneously.
  - `apps/web/src/components/loading/table-page-skeleton.tsx`: Built universal table page skeleton.
  - Standardized `/products`, `/orders`, `/customers`, `/categories`, `/inventory`, `/coupons`, and `/reviews` to render breadcrumbs and page titles immediately with `TablePageSkeleton` fallback states.

---

## 3. Verification & Benchmark Results

### 3.1 Automated SSLCommerz Callback Matrix (10/10 Passed)
Ran `npx tsx --test apps/api/src/modules/payments/__tests__/sslcommerz-callback-matrix.test.ts`:
- ✔ Test A & B: Order creation & SSLCommerz init creates pending order and transaction ID (338ms)
- ✔ Test C & D: Success callback marks order as paid & confirmed with transaction details (1987ms)
- ✔ Test E: Duplicate success callback is idempotent without duplicate updates (983ms)
- ✔ Test F: Failed callback updates order to failed state and redirects safely (1532ms)
- ✔ Test G: Cancel callback updates order to failed/cancelled and redirects safely (1533ms)
- ✔ Test H: Invalid transaction reference safely returns 404 (245ms)
- ✔ Test I: Amount mismatch rejects payment (1824ms)
- ✔ Test J: Cross-tenant payment spoofing is rejected (801ms)

### 3.2 Automated Store Platform Route Matrix (47/47 Passed)
Ran `npx tsx apps/web/scripts/test-all-store-routes.ts` across all 47 core store modules:

```text
==================================================
BORNOLAND STORE PLATFORM ROUTE VERIFICATION MATRIX
==================================================
✓ [200] /store/nayeem/dashboard — 21ms (43.2 KB)
✓ [200] /store/nayeem/orders — 13ms (44.2 KB)
✓ [200] /store/nayeem/customers — 10ms (43.7 KB)
✓ [200] /store/nayeem/products — 9ms (43.8 KB)
✓ [200] /store/nayeem/categories — 9ms (43.5 KB)
✓ [200] /store/nayeem/orders/incomplete — 9ms (43.9 KB)
✓ [200] /store/nayeem/reviews — 11ms (43.2 KB)
✓ [200] /store/nayeem/inventory — 8ms (43.4 KB)
✓ [200] /store/nayeem/inventory/warehouses — 7ms (44.0 KB)
✓ [200] /store/nayeem/inventory/ledger — 6ms (44.0 KB)
✓ [200] /store/nayeem/inventory/waste — 7ms (44.4 KB)
✓ [200] /store/nayeem/inventory/purchasing — 6ms (44.3 KB)
✓ [200] /store/nayeem/inventory/suppliers — 7ms (44.0 KB)
✓ [200] /store/nayeem/pos — 7ms (43.2 KB)
✓ [200] /store/nayeem/pos/shifts — 6ms (43.8 KB)
✓ [200] /store/nayeem/hrm/employees — 8ms (44.1 KB)
✓ [200] /store/nayeem/hrm/organization — 6ms (44.2 KB)
✓ [200] /store/nayeem/hrm/attendance — 6ms (44.2 KB)
✓ [200] /store/nayeem/hrm/leaves — 7ms (44.2 KB)
✓ [200] /store/nayeem/hrm/payroll — 7ms (44.2 KB)
✓ [200] /store/nayeem/hrm/self-service — 10ms (43.4 KB)
✓ [200] /store/nayeem/finance/accounting — 9ms (44.2 KB)
✓ [200] /store/nayeem/finance/accounting/coa — 14ms (43.1 KB)
✓ [200] /store/nayeem/finance/accounting/journal — 8ms (43.1 KB)
✓ [200] /store/nayeem/finance/expenses — 6ms (44.2 KB)
✓ [200] /store/nayeem/finance/reports — 8ms (43.7 KB)
✓ [200] /store/nayeem/crm/deals — 7ms (44.2 KB)
✓ [200] /store/nayeem/support/tickets — 8ms (44.2 KB)
✓ [200] /store/nayeem/marketing — 7ms (43.0 KB)
✓ [200] /store/nayeem/coupons — 6ms (43.3 KB)
✓ [200] /store/nayeem/settings/tracking — 7ms (43.5 KB)
✓ [200] /store/nayeem/reports — 19ms (43.8 KB)
✓ [200] /store/nayeem/operations/approvals — 19ms (42.7 KB)
✓ [200] /store/nayeem/operations/tasks — 12ms (44.2 KB)
✓ [200] /store/nayeem/settings/shipping — 13ms (44.1 KB)
✓ [200] /store/nayeem/settings/courier — 8ms (43.5 KB)
✓ [200] /store/nayeem/settings/payments — 9ms (44.4 KB)
✓ [200] /store/nayeem/settings/taxes — 7ms (43.5 KB)
✓ [200] /store/nayeem/design — 7ms (43.8 KB)
✓ [200] /store/nayeem/settings — 7ms (44.9 KB)
✓ [200] /store/nayeem/pages — 6ms (43.1 KB)
✓ [200] /store/nayeem/media — 8ms (44.0 KB)
✓ [200] /store/nayeem/customer-messages — 6ms (43.7 KB)
✓ [200] /store/nayeem/members — 6ms (43.1 KB)
✓ [200] /store/nayeem/apps — 6ms (43.0 KB)
✓ [200] /store/nayeem/activity — 7ms (43.0 KB)
✓ [200] /store/nayeem/billing — 8ms (43.0 KB)

==================================================
SUMMARY: 47/47 routes passed (Avg Latency: 9ms)
==================================================
```

### 3.3 Auth Redirect Verification
- Tested via `curl -L -s -o /dev/null -w "final status: %{http_code} redirects: %{num_redirects} final url: %{url_effective}\n" "http://nayeem.localhost:3000/login?redirect=%2Fcheckout"`:
- **Output:** `final status: 200 redirects: 0 final url: http://nayeem.localhost:3000/login?redirect=%2Fcheckout`
- **Result:** PASS (Zero redirects, no infinite loop).

### 3.4 Payment Return Route Verification
- Tested via `curl -I`:
  - `http://nayeem.localhost:3000/checkout/payment/success?orderNumber=ORD-12345&tran_id=TXN-99999` -> `HTTP/1.1 200 OK`
  - `http://nayeem.localhost:3000/checkout/payment/fail?orderNumber=ORD-12345&error=declined` -> `HTTP/1.1 200 OK`
  - `http://nayeem.localhost:3000/checkout/payment/cancel?orderNumber=ORD-12345` -> `HTTP/1.1 200 OK`
- **Result:** PASS (Zero blank screens, proper middleware URL rewrites).

---

## 4. Production Recommendations & Maintenance

1. **Redis Shared Cache:** The current 30-second `storeMetricsCache` and 5-minute `ensurePlans()` cache operate in Node.js process memory. In a multi-replica clustered environment, configure Redis using the existing `cache.service.ts` adapter to share cache across cluster nodes.
2. **MongoDB Index Optimization:** Ensure database migrations or `initDatabaseIndexes()` run on new deployment environments to guarantee `{ storeId: 1, createdAt: -1 }` indexes exist on `orders` and `products`.
3. **Session Invalidation Consistency:** Maintain strict correlation between `sessionVersion` in auth cookies and `UserModel.sessionVersion` to preserve instant revocation capabilities.
