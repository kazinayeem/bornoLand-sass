# Database Schema Review

**66 models audited | ~120+ index gaps | 16 float-for-currency issues | 4 missing TTL indexes | 0 text indexes**

---

## Critical: Missing Text Indexes

**Zero text indexes exist** except on AuditLog. Every search across these entities is a full collection scan:

| Model | Search Fields | Impact |
|-------|---------------|--------|
| **Product** | name, description, tags | Products page unusable at 10k+ products |
| **Customer** | name, email | Customer search unusable |
| **User** | name, email | Admin user search unusable |
| **CMS Page** | title, slug | CMS search unusable |
| **MediaFile** | originalName, displayName | Media search unusable |

**Fix:** Add these immediately:
```ts
productSchema.index({ name: "text", description: "text", tags: "text" }, { weights: { name: 10, tags: 5, description: 1 } });
customerSchema.index({ name: "text", email: "text" });
```

---

## Critical: Missing TTL Indexes

| Model | Field | Issue |
|-------|-------|-------|
| **VerificationToken** | `expires` | Index exists but NO `expireAfterSeconds`. Tokens accumulate forever. |
| **Cart** | `updatedAt` | No TTL for abandoned cart cleanup |
| **VisitorSession** | `createdAt` | High-volume analytics collection, no auto-purge |
| **PageView** | `createdAt` | Fastest-growing collection, no auto-purge |

**Fix:**
```ts
verificationTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 604800 }); // 7 days
visitorSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
pageViewModelSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
```

---

## Critical: Float for Currency (16 models)

`type: Number` for monetary values in Product, Order, Invoice, SubscriptionPayment, Plan, ShippingMethod, VariantPrice, etc.

**Risk:** `0.1 + 0.2 !== 0.3` in JavaScript. Tax/discount calculations will have floating-point errors.

**Fix:** Use integer cents: `priceCents: { type: Number, required: true }`. Multiply all user-facing prices by 100 on input, divide by 100 on display.

---

## High: Embedded `variants` Array in Product

Product has an embedded `variants: [{...}]` array. Products with 500+ variants (e.g., t-shirt by size/color) will hit the 16MB document limit.

**Fix:** The `ProductVariant` model already exists as a separate collection. **Remove the embedded `variants` array** from Product and use only the standalone model with `productId` reference.

---

## High: Missing Compound Indexes for Date-Range Queries

| Model | Missing Index | Why Critical |
|-------|--------------|--------------|
| **Coupon** | `{storeId:1, status:1, startsAt:1, expiresAt:1}` | Checked on EVERY order — currently full scan |
| **Campaign** | `{storeId:1, status:1, startsAt:1, endsAt:1}` | Checked on marketing evaluation |
| **StoreSubscription** | `{expireDate:1}` partial `{status:"active"}` | Billing cron checks this hourly |
| **Order** | `{storeId:1, createdAt:-1}` | Most common query pattern for order listing |
| **DailyAnalytic** | `{storeId:1, year:1, month:1}` | Monthly rollup queries |

---

## High: Missing Sparse Indexes

| Model | Field | Issue |
|-------|-------|-------|
| **Store** | `subdomain` | Unique + sparse needed (already unique but should be explicit) |
| **Store** | `customDomain` | Unique + sparse — queried on every custom domain request |
| **Customer** | `lastLoginAt` | Queried for inactive customer reports |
| **User** | `lastLoginAt` | Same |
| **Cart** | `customerId` | Customer carts queried by customerId |

---

## Medium: Unbounded Array Risks

| Model | Array | Risk |
|-------|-------|------|
| **Product** | `variants` | **CRITICAL** — 16MB limit |
| **Product** | `relatedProductIds` | Can grow unbounded with manual additions |
| **Order** | `timeline` | Long-running orders with many status changes |
| **DailyAnalytic** | 15 array fields including `hourlyBreakdown` | Grows daily, potential 16MB for large stores |
| **Coupon** | `customerIds`, `productIds`, `categoryIds` | Can grow large for broad coupons |

---

## Medium: Inconsistent Field Naming

| Pattern | Inconsistency |
|---------|---------------|
| `isActive` vs `active` vs `published` | Collection: `isActive`, Category: `active`, CmsPage: `published` |
| `createdAt` auto vs manual | Some models manually set `createdAt` instead of using `timestamps: true` |
| `customerId` vs `userId` vs `uploaderId` | Inconsistent user reference naming |

---

## Medium: Plaintext SMTP Password

`PlatformSettings.smtpPass: String` — SMTP credential stored in plaintext in the main settings document. Any database read leaks the credential.

**Fix:** Store in environment variable or encrypted field. Never return in API responses (already excluded in admin settings route).

---

## Priority Fixes

| # | Fix | Severity | Effort |
|---|-----|----------|--------|
| 1 | Add text indexes for product/customer search | 🔴 Critical | 1 hour |
| 2 | Add TTL on VerificationToken, VisitorSession, PageView | 🔴 Critical | 1 hour |
| 3 | Convert currency to integer cents | 🔴 Critical | 3 days |
| 4 | Move embedded `variants` to separate collection | 🟠 High | 1 day |
| 5 | Add compound indexes for coupon/campaign date queries | 🟠 High | 2 hours |
| 6 | Add sparse indexes on subdomain/customDomain | 🟠 High | 1 hour |
| 7 | Standardize boolean naming convention | 🟡 Medium | 1 day |
| 8 | Encrypt SMTP password | 🟡 Medium | 2 hours |
| 9 | Standardize `timestamps: true` across all models | 🟡 Low | 1 day |
