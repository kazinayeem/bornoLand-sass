# Redux/RTK Query Architecture Review

## Score: 4/10

---

## Critical: State Duplication (8+ slices duplicate RTK Query cache)

| Data | RTK Query | Duplicated In |
|------|-----------|---------------|
| User/Session | `useMeQuery` | `auth-slice`, `user-slice` |
| Customer | `useGetMeQuery` | `customer-slice` |
| Cart | `useGetCartQuery` | `cart-slice` |
| Orders | `useGetOrdersQuery` | `order-slice` |
| Stores | `useGetMyStoresQuery` | `stores-slice`, `store-slice`, `current-store-slice` |
| Store Settings | `useGetStoreSettingsQuery` | `store-settings-slice` |
| Plans | `useGetPlansQuery` | `plan-slice` |

**This is the #1 architectural problem.** 8-10 slices could be eliminated. RTK Query already provides:
- Cached data
- Loading/error states
- Automatic refetching
- Cache invalidation

**Fix:** Remove `user-slice`, `order-slice`, `plan-slice` entirely. Merge `stores-slice`, `store-slice`, `current-store-slice` into one thin slice that stores ONLY UI state (drawer open/close, active store ID for context switching).

---

## Critical: Zero Selector Memoization

Not a single slice uses `createSelector`. Every `useAppSelector` call creates a new inline function that re-evaluates on every render.

```tsx
// ❌ Current pattern — re-evaluates on every render
const storeId = useAppSelector((state) => state.currentStore.storeId);

// ✅ Fixed with memoized selector
const selectStoreId = (state: RootState) => state.currentStore.storeId;
const storeId = useAppSelector(selectStoreId);
```

**Fix:** Add `createSelector` for all derived/transformed data. Wrap selectors in `useAppSelector` consistently.

---

## High: No Optimistic Updates (Zero Mutations)

Zero mutations use `onQueryStarted` with `queryFulfilled` for optimistic updates. This means:
- Adding to cart: user waits for server response
- Deleting a product: brief delay before removal
- Updating order status: no instant UI feedback

**Fix:**
```tsx
updateProduct: builder.mutation({
  query: ({ id, ...patch }) => ({ url: `/products/${id}`, method: "PATCH", body: patch }),
  async onQueryStarted({ id, storeId, ...patch }, { dispatch, queryFulfilled }) {
    const patchResult = dispatch(
      api.util.updateQueryData('getProducts', storeId, (draft) => {
        const product = draft.data.products.find((p) => p._id === id);
        if (product) Object.assign(product, patch);
      })
    );
    try { await queryFulfilled; } catch { patchResult.undo(); }
  },
})
```

**Priority:** Cart, Orders, Products (highest traffic user-facing mutations).

---

## High: Weak Pagination Support

| API File | Pagination | Status |
|----------|------------|--------|
| `media-api.ts` | ✅ page, limit, search, folder, fileType | Good |
| `store-order-api.ts` | ✅ page, limit, status | Good |
| `inventory-api.ts` | ✅ Params-based | Good |
| `audit-api.ts` | ✅ page, limit, search, filters | Good |
| `product-api.ts` | ❌ Missing | **Critical** |
| `category-api.ts` | ❌ Missing | High |
| `customer-api.ts` | ❌ Missing | High |
| `order-api.ts` | ❌ Missing | High |
| `coupon-api.ts` | ❌ Missing | Medium |
| `analytics-api.ts` | ❌ Missing | Medium |

**Fix:** Add `page`, `limit`, `search`, `sort`, `filters` params to all list endpoints. Pass them as query params.

---

## High: Broad Tag Invalidation

Many mutations use `"Stores"`, `"Orders"`, `"Dashboard"` as plain strings, invalidating ALL cached data of that type:

```tsx
// ❌ Invalidates ALL stores
invalidatesTags: ["Stores"]

// ✅ Only invalidates the specific store + list
invalidatesTags: [
  { type: "Stores", id: "LIST" },
  { type: "Stores", id: storeId }
]
```

**Fix:** Use tag families consistently:
- `{ type: "Products", id: "LIST" }` for list queries
- `{ type: "Products", id: productId }` for individual queries
- Mutations invalidate the specific ID + the LIST tag

---

## Medium: Missing Tags on Queries

| Query | Missing Tags |
|-------|-------------|
| `getMediaFile` | No `providesTags` |
| `getStockHistory` | No `providesTags` |
| `getBillingConfig` | No `providesTags` |
| `getPlanPrice` | No `providesTags` |

**Fix:** Add proper `providesTags` to every query endpoint.

---

## Medium: `prepareHeaders` Reads localStorage on Every Request

```tsx
// base-api.ts:14-18 — executed on EVERY request
const token = localStorage.getItem("customer_token");
```

This is synchronous but unnecessary. The token should be read once on app initialization and stored in Redux or a module variable.

---

## Low: Duplicate Auth Header Utilities

`getSessionHeaders()` / `getAuthHeaders()` duplicated across:
- `cart-api.ts`
- `order-api.ts`
- `payment-api.ts`
- `delivery-api.ts`

**Fix:** Export from a single shared utility file.

---

## Low: `overrideExisting: true` in Analytics API

`analytics-api.ts:148` uses `overrideExisting: true` — indicates endpoint name collision. Find and fix the root cause.

---

## Priority Action Items

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1 | Eliminate state duplication (remove 8 slices) | 2 days | 🔴 Critical |
| 2 | Add optimistic updates to cart + orders | 1 day | 🔴 High |
| 3 | Add `createSelector` memoization | 1 day | 🔴 High |
| 4 | Fix tag invalidation (scoped IDs) | 1 day | 🔴 High |
| 5 | Add pagination to products/customers APIs | 2 days | 🟠 High |
| 6 | Add missing `providesTags` | 0.5 day | 🟠 Medium |
| 7 | Fix `prepareHeaders` localStorage reads | 0.5 day | 🟠 Medium |
| 8 | Deduplicate auth header utilities | 0.5 day | 🟡 Low |
