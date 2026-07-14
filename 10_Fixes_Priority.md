# Priority Fixes List

**Project:** BornoLand  
**Audit Date:** July 14, 2026  
**Prepared by:** Principal Architect Review

---

## CRITICAL — Fix This Week

| # | Area | Issue | Fix |
|---|------|-------|-----|
| 1 | **Security** | JWT secret `"testtst"` committed to repo | Rotate immediately. Use env-only. Add `.env` to `.gitignore`. |
| 2 | **Security** | IDOR: Products, delivery zones, payment methods, analytics — no ownership check | Add `requireStoreAccess` middleware. Every query must filter by `{ storeId, userId }`. |
| 3 | **Security** | No CSRF protection | Set `sameSite: strict`. Add CSRF token validation. |
| 4 | **Security** | Hardcoded JWT fallback `"bornoland-customer-secret"` | Remove default. Crash if env var is missing. |
| 5 | **Database** | No text indexes — product/customer search = full collection scan | Add text indexes on Product (name, description, tags) and Customer (name, email). |
| 6 | **Database** | Missing TTL on VerificationToken, VisitorSession, PageView | Add `expireAfterSeconds` to prevent unbounded growth. |
| 7 | **Database** | Float for currency across 16 models | Convert to integer cents. Prevent floating-point tax errors. |
| 8 | **Backend** | Auto-approval in checkout callback | ✅ **FIXED** — now requires manual admin approval. |
| 9 | **Backend** | Hardcoded JWT fallback removed | Must verify in staging. |

---

## HIGH — Fix This Sprint

| # | Area | Issue | Fix |
|---|------|-------|-----|
| 10 | **Redux** | 8+ slices duplicate RTK Query data | Remove `user-slice`, `order-slice`, `plan-slice`. Merge store slices. |
| 11 | **Redux** | No optimistic updates | Add to cart, order status, product mutations. |
| 12 | **Redux** | No selector memoization | Add `createSelector` to all slices. |
| 13 | **Redux** | Broad tag invalidation | Replace string tags with `{ type, id }` scoped tags. |
| 14 | **API** | Unify response format | ~40% of endpoints use raw `response.json()` instead of `sendSuccess`. |
| 15 | **API** | Missing Zod validation on ~40% of endpoints | Delivery zones, payment methods, builder pages, FAQs, newsletter. |
| 16 | **API** | Bug: `resolveProductBySlug` passes slug as ObjectId | Fix to pass store ObjectId. |
| 17 | **API** | Add pagination to products, customers, categories APIs | `page`, `limit`, `sort`, `search` params. |
| 18 | **Database** | Embedded `variants` array in Product | Move to standalone `ProductVariant` collection. |
| 19 | **Database** | Missing compound indexes for date queries | Coupon, Campaign, Order, DailyAnalytic. |
| 20 | **Database** | MongoDB pool size = 10 | Increase to 50-100. |
| 21 | **UI/UX** | No error states on ANY page | Every page must show `<ErrorState>` with retry on API failure. |
| 22 | **UI/UX** | Fake chart data (Math.random) in admin dashboard | Replace with empty state. |
| 23 | **UI/UX** | Loading spinners instead of skeletons (15+ pages) | Replace with `CardSkeleton`, `TableSkeleton`, `StatCardSkeleton`. |
| 24 | **Performance** | No Redis caching | Start with subdomain→store cache (1hr TTL). |
| 25 | **Performance** | Synchronous analytics writes | Queue via BullMQ. Batch writes. |
| 26 | **Performance** | Image optimization pipeline missing | WebP conversion, responsive thumbnails. |
| 27 | **Performance** | Billing cron not distributed | Replace `setInterval` with BullMQ recurring job + Redlock. |

---

## MEDIUM — Next Sprint

| # | Area | Issue | Fix |
|---|------|-------|-----|
| 28 | **Redux** | Missing `providesTags` on 4+ query endpoints | Add to `getMediaFile`, `getStockHistory`, `getBillingConfig`, `getPlanPrice`. |
| 29 | **Redux** | `prepareHeaders` reads localStorage on every request | Cache token in variable. |
| 30 | **API** | MongoDB errors surface as 500 | Handle `CastError` (400), `ValidationError` (400), `DuplicationKey` (409) in error middleware. |
| 31 | **API** | Rate limit gaps on write endpoints | Add specific limits: product (30/min), order (10/min), media (10/min). |
| 32 | **API** | No CSRF on OAuth | Verify state parameter validation. |
| 33 | **Database** | Sparse indexes on subdomain/customDomain | Ensure `unique: true, sparse: true`. |
| 34 | **Database** | Plaintext SMTP password | Encrypt or move to env var. |
| 35 | **UI/UX** | Customers tab performance | Dedicated `/customers/:storeId` API with server-side search. |
| 36 | **UI/UX** | `confirm()` for delete actions | Replace with `ConfirmDialog` component. |
| 37 | **UI/UX** | Coming-soon pages render `null` | Show branded placeholder states. |
| 38 | **UI/UX** | No global store switcher | Add dropdown in top navbar. |
| 39 | **Security** | No email verification | Required before first store action. |
| 40 | **Security** | No password complexity rules | Minimum 8 chars, mixed case, special char. |
| 41 | **Security** | IP addresses as session IDs | Use UUID instead of IP. |

---

## LOW — Backlog / Never

### Should Do

| # | Area | Issue |
|---|------|-------|
| 42 | **Redux** | Deduplicate auth header utilities across 5 API files |
| 43 | **API** | Add request tracing middleware |
| 44 | **API** | Add compression middleware |
| 45 | **Database** | Standardize boolean naming (`isActive` vs `active` vs `published`) |
| 46 | **Database** | Standardize `timestamps: true` across all models |
| 47 | **Database** | Add proper soft-delete to Product, Customer, Coupon |
| 48 | **Performance** | Row virtualization in DataTable |
| 49 | **Performance** | Code splitting by route |
| 50 | **UI/UX** | Add breadcrumbs to store admin |
| 51 | **UI/UX** | Add keyboard shortcuts |
| 52 | **UI/UX** | Add auto-save to builder |
| 53 | **UI/UX** | Add onboarding checklist for new stores |

### Should NEVER Do

| Never Do | Why |
|----------|-----|
| Generate fake/chart data with `Math.random()` | Destroys user trust |
| Commit secrets/tokens to repo | Irreversible security exposure |
| Store passwords in plaintext | Compliance violation |
| Remove tenant isolation middleware | Multi-tenant data breach |
| Rewrite from scratch | Codebase is functional — fix the gaps, don't rebuild |
| Add features before fixing security | Foundation must be solid first |
| Use `any` types in new code | Erodes TypeScript benefits |
| Skip code review on API changes | Security risk |

---

## Effort Estimate

| Priority | Items | Estimated Time |
|----------|-------|----------------|
| Critical | 9 items | 1-2 weeks |
| High | 18 items | 3-4 weeks |
| Medium | 14 items | 2-3 weeks |
| Low | 12 items | 2-3 weeks |
| **Total** | **53 items** | **8-12 weeks** (2-3 developers) |

---

## Recommended First Week Sprint

1. **Rotate JWT secret, remove from .env** (0.5h)
2. **Add `requireStoreAccess` to delivery zones, payment methods, analytics** (1d)
3. **Fix hardcoded JWT fallback** (0.5h)
4. **Add CSRF protection** (1d)
5. **Add text indexes + TTL indexes** (2h)
6. **Fix auto-approval** ✅ Already done
7. **Add error states to top 5 pages** (1d)
8. **Remove `Math.random()` from admin dashboard** (0.5h)
9. **Fix billing overview/store cards** ✅ Already done
10. **Increase MongoDB pool size** (0.5h)

**Total: ~4-5 days for 1 developer. This addresses the most critical security, database, and UX issues.**
