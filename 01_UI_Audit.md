# UI Audit Report

## Overall Score: 6.5/10

The codebase has a solid component foundation (`DataTable`, `Skeleton`, `EmptyState`, `Pagination`, `Modal`) but **inconsistent application** across pages. Auth/storefront are strong; workspace/store admin are weak.

---

## Critical Issues

### 1. Error States Missing on ALL Pages
Every page lacks a proper error state for failed API calls. Users see perpetual spinners or blank screens when APIs fail. The `ErrorState` component exists but is used **nowhere**.

**Fix:** Every page with RTK Query must check `isError` and render `<ErrorState>`:
```tsx
if (isError) return <ErrorState title="Failed to load" onRetry={refetch} />;
```

### 2. Fake Data in Admin Dashboard
`/admin/dashboard/page.tsx:156` uses `Math.random()` for the "Platform Growth" chart. This is embarrassing in production.

**Fix:** Show a proper empty/no-data state. Never generate random chart data.

### 3. Settings Tab Anti-Pattern
`settings-tab.tsx:30` uses `useState(() => { if(settings) {...} })` — this runs on **every render**, not just mount. Should be `useEffect`.

---

## High Issues

### 4. Spinner Overuse (15+ pages)
Most store shell pages show a full-page spinner instead of skeleton layouts. The `Skeleton` component has `CardSkeleton`, `TableSkeleton`, `StatCardSkeleton` variants — use them instead of `<Loader2>`.

### 5. Client-side Pagination
Products, Customers (derived from orders), Admin stores, Admin users — all load ALL data then filter/sort/paginate client-side. With 1000+ records this is catastrophic.

**Fix:** Server-side pagination via API query params (`page`, `limit`, `sort`, `search`, `filter`).

### 6. Customers Tab Performance
`customers-tab.tsx:27` loads max 500 orders then aggregates customers client-side. This means older customers are invisible and the computation is wasteful.

**Fix:** Dedicated `/customers/:storeId` API endpoint with server-side search + pagination.

### 7. `confirm()` for Delete Actions
Admin store delete (`admin/dashboard/stores/page.tsx:60`) and user delete use native `confirm()`. The `ConfirmDialog` component already exists — use it.

### 8. Coming Soon Pages Render `null`
Reviews (`reviews/page.tsx:28`) and Marketing (`marketing/page.tsx:28`) render `{null}`. User sees a blank page. Show a proper placeholder state instead.

---

## Medium Issues

### 9. No Form Validation on Settings Pages
Workspace settings and admin settings forms accept any input with zero validation. Auth forms use Zod + react-hook-form — replicate that pattern.

### 10. No Image Error Handlers
Product images in tables lack `onError` fallbacks. Broken images show as broken icons. Add `onError={(e) => { e.currentTarget.src = fallback }}` to every `<img>`.

### 11. Inline Status Dropdowns in Orders Tab
Changing order status via `<select>` fires immediately on change with no confirmation. Easy to accidentally change a status.

**Fix:** Require a confirmation step (modal or debounced action with undo).

### 12. Admin Settings Page Too Large
`admin/dashboard/settings/page.tsx` is 523 lines mixing platform settings, store overrides, homepage sliders. Split into separate pages/tabs.

---

## Low Issues

### 13. Missing Search on Key Pages
Categories, coupons, CMS pages have no search or filter functionality.

### 14. No Keyboard Navigation
`DataTable`, pagination, and modals lack proper keyboard accessibility (`Tab`, `Enter`, `Escape`).

### 15. Dashboard Settings Initial State Flash
Before `useEffect` syncs API data, the settings form shows wrong/empty values. Use `isLoading` check before rendering the form.

---

## Page-by-Page Scores

| Area | Avg Score |
|---|---|
| Auth Pages | 8.0/10 |
| Storefront Pages | 7.5/10 |
| Admin Pages | 6.5/10 |
| Store Admin (Shell) | 6.2/10 |
| Dashboard (Workspace) | 5.8/10 |
| **Overall** | **6.5/10** |
