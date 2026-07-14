# Security Report

---

## Critical

### 1. IDOR: Product Retrieval (No Ownership Check)
`GET /products/item/:id` — any authenticated user can read any product by ID.

**Fix:** Add `StoreModel.findOne({ _id: storeId, userId })` check or filter by `{ storeId, userId }`.

### 2. IDOR: Delivery Zones & Payment Methods
`GET /delivery-zones/store/:storeId` and `GET /payment-methods/store/:storeId` — no ownership verification. Any auth user can CRUD any store's config.

### 3. IDOR: Analytics Data
`GET /analytics/:storeId/*` — any authenticated user can view any store's analytics.

### 4. Hardcoded JWT Fallback Secret
`customer.service.ts:6` — `process.env.JWT_SECRET ?? "bornoland-customer-secret"`. Hardcoded secret in source code. If env var is accidentally missing, the fallback is predictable.

**Fix:** Remove the fallback. Crash on missing `JWT_SECRET`.

### 5. No CSRF Protection
Cookie-based auth (`sameSite: "lax"`) is vulnerable to GET-based CSRF. An attacker can execute actions via `<img>` or `<link>` tags if the endpoint accepts GET.

**Fix:** Set `sameSite: "strict"` and implement CSRF token validation (double-submit cookie pattern).

### 6. JWT Secret in Source Control
The `.env` file contains `JWT_SECRET="testtst"` which was committed to the repo. Anyone with repo access can forge JWTs.

**Fix:** Rotate the secret immediately. Add `.env` to `.gitignore`. Use secrets manager in production.

---

## High

### 7. No Rate Limiting on Write Endpoints
Only `/auth`, `/newsletter`, `/contact`, and `/analytics/track` have specific rate limits. Products, orders, media upload, and all other write endpoints fall back to global 100/min.

**Fix:** Add specific limits: product CRUD (30/min), order create (10/min per store), media upload (10/min).

### 8. No Brute-Force Protection on Login
Auth rate limit (10/min) is global, not per-user. Attacker can try 10 different passwords per minute for a single user.

**Fix:** Rate limit per `{ email, IP }` combination. Lock account after 10 failed attempts for 15 minutes.

### 9. No Input Sanitization on Search
No blocking of MongoDB operators (`$where`, `$regex`, `$ne`, `$gt`) in user-supplied search inputs. Malicious queries could be injected if any endpoint passes user input directly into MongoDB query predicates.

**Fix:** Strip `$` prefix from all user-supplied query parameters. Use `allowDiskUse` and `maxTimeMS` on all queries.

### 10. No File Upload Validation
No MIME type verification on uploaded files. An attacker could upload a `.js` or `.php` file disguised as an image.

**Fix:** Validate MIME type server-side (not just `accept` attribute). Reject non-image MIME types for media uploads.

### 11. Missing Auth on Tenant Endpoint
`GET /tenants/:tenantId` is completely open. Leaks tenant configuration data.

---

## Medium

### 12. No User Email Verification
Accounts are fully active after registration. No email verification required. Enables fake account creation.

### 13. No Password Complexity Requirements
Registration form has no password strength validation (min length, special chars, etc.).

### 14. SMTP Password in Plaintext
Stored as `String` in `PlatformSettings` document. Any DB read leaks it.

### 15. `resolveStoreFromSubdomain` Silently Handles Errors
If DB lookup fails, error is swallowed and request proceeds with null store. Downstream code may expose unintended data.

### 16. IP Addresses Stored as Session IDs
`sess-${request.ip}` fallback stores IP in DB. GDPR: IP is personal data.

---

## Low

### 17. No HTTP Security Headers Audit
Helmet is used but CSP is disabled (`contentSecurityPolicy: false`). XSS protection relies on React's built-in escaping, which is good but defense-in-depth is better.

### 18. No `maxTimeMS` on MongoDB Queries
No query timeout on any MongoDB operation. A slow query can block the connection pool for 30+ seconds (socketTimeoutMS: 45,000).

---

## Priority Fix List

| # | Fix | Severity | Effort |
|---|-----|----------|--------|
| 1 | Rotate JWT secret, remove from .env | 🔴 Critical | 0.5 hour |
| 2 | Add store ownership checks to delivery/payment/analytics | 🔴 Critical | 1 day |
| 3 | Add CSRF protection | 🔴 Critical | 1 day |
| 4 | Fix product IDOR | 🔴 Critical | 0.5 day |
| 5 | Rate limit per-user login | 🟠 High | 1 day |
| 6 | Add per-endpoint rate limits | 🟠 High | 1 day |
| 7 | Validate uploaded file MIME types | 🟠 High | 0.5 day |
| 8 | Sanitize MongoDB query inputs | 🟠 High | 1 day |
| 9 | Add email verification requirement | 🟠 Medium | 2 days |
| 10 | Add password complexity rules | 🟠 Medium | 0.5 day |
| 11 | Encrypt SMTP password | 🟠 Medium | 0.5 day |
| 12 | Enable CSP in Helmet | 🟡 Low | 0.5 day |
