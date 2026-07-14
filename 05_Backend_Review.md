# Backend Review

---

## Architecture Score: 6/10

The API is modular and well-structured but has critical security gaps, inconsistent patterns, and missing validation across ~40% of endpoints.

---

## Critical Issues

### 1. IDOR in Product Retrieval
`GET /products/item/:id` returns any product by ID without checking store ownership. Any authenticated user can read any product in the system.

**File:** `product.controller.ts:22`

### 2. IDOR in Delivery Zones & Payment Methods
`GET /delivery-zones/store/:storeId` and `GET /payment-methods/store/:storeId` don't verify store ownership. Any authenticated user can CRUD any store's configuration.

**Fix:** Add `requireStoreAccess` middleware or `{ storeId, userId }` query filter.

### 3. IDOR in Analytics
`GET /analytics/:storeId/*` allows any authenticated user to view any store's analytics data.

### 4. Hardcoded Fallback JWT Secret
`customer.service.ts:6` — if `JWT_SECRET` env var is missing, falls back to `"bornoland-customer-secret"`. This is a hardcoded credential.

**Fix:** Crash on missing `JWT_SECRET`. Never use a default.

### 5. Public Tenant Endpoint Has No Auth
`GET /tenants/:tenantId` is completely open and returns tenant data.

---

## High Issues

### 6. Inconsistent Response Format
~40% of endpoints use raw `response.json()` instead of `sendSuccess`/`sendFailure`. Two response formats exist:

```json
// Pattern A (60% of endpoints) — ✅
{ "success": true, "data": { ... }, "message": "..." }

// Pattern B (40%) — ❌
{ "data": { ... } }
{ "pages": [...] }
```

**Affected:** `admin.route.ts`, `tenant.route.ts`, `page.route.ts`, `store-order.controller.ts`, `subscription.route.ts`

### 7. Missing Validation on ~40% of Endpoints
Delivery zones, payment methods, homepage sliders, builder pages, FAQs, newsletter, contact — all use inline if-checks instead of Zod schemas.

### 8. Bug in `resolveProductBySlugController`
`public.controller.ts:96` passes `storeSlug` as the store ObjectId. The `getProductBySlug` function expects a MongoDB ObjectId but receives a slug string. Product lookup silently fails.

### 9. No CSRF Protection
Cookie-based auth (`sameSite: lax`) allows GET-based CSRF. Should be `sameSite: strict` or CSRF tokens.

### 10. IP Addresses as Session Identifiers
`cart.controller.ts:21` uses `sess-${request.ip}` as fallback session ID, storing IP in the database. GDPR concern.

---

## Medium Issues

### 11. N+1 Queries
| Location | Issue |
|----------|-------|
| `order.service.ts:166` | Sequential stock decrement per item |
| `media.controller.ts` | `verifyStoreOwner` per request |
| `product.service.ts:99` | Variant summary per product |
| `category.service.ts:169` | Per-category update in loop |

### 12. No MongoDB Error Handling in Global Middleware
`CastError`, `ValidationError`, `DuplicateKeyError` all bubble up as 500. Should be 400 for validation, 409 for duplicates.

### 13. Plan Enforcement Gaps
Delivery zones, payment methods, store settings, homepage sliders have no feature/limit checks. Store owners on Free plan can access all features via these routes.

### 14. No Request Logging/Tracing
No request ID middleware, no response time logging, no structured logging beyond console.log.

---

## Low Issues

### 15. Admin Analytics Logic Inline in Route File
`admin.route.ts` has 80+ lines of analytics query logic. Should be in a controller.

### 16. `resolveStoreFromSubdomain` Swallows Errors
`subdomain.middleware.ts:64-66` — empty catch block. If DB is down, request proceeds with null store.

---

## Priority Fix List

| # | Fix | Severity | Effort |
|---|-----|----------|--------|
| 1 | Add store ownership checks to delivery/payment/analytics | 🔴 Critical | 1 day |
| 2 | Fix hardcoded JWT fallback | 🔴 Critical | 0.5 day |
| 3 | Unify response format (sendSuccess/sendFailure) | 🟠 High | 2 days |
| 4 | Add Zod validation to all unprotected endpoints | 🟠 High | 2 days |
| 5 | Fix product-by-slug bug | 🟠 High | 0.5 day |
| 6 | Add MongoDB error handling to error middleware | 🟠 Medium | 0.5 day |
| 7 | Plan enforcement for delivery/payment/settings | 🟠 Medium | 1 day |
| 8 | Add request tracing middleware | 🟡 Low | 0.5 day |
