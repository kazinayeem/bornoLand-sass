# UX Report

---

## Critical User Experience Issues

### 1. No Loading Skeleton on Any Store Page
Every store admin page shows a `<Loader2>` spinner. When navigating between pages, users see a hard flash from spinner → content.

**Fix:** Replace with `Skeleton` components that match the final layout (card grid, table rows, stat cards).

### 2. No Error Recovery on Any Page
If an API call fails, users see a permanent spinner. No retry button, no error message, no guidance.

**Fix:** Every page must render `<ErrorState>` on `isError` with a "Try Again" button that calls `refetch()`.

### 3. "Coming Soon" Pages Show Blank Screen
`/reviews`, `/marketing` render `{null}`. User clicks a nav link and sees a white page with no explanation.

**Fix:** Show a branded placeholder with the feature name, description, and estimated availability.

### 4. Fake Chart Data in Admin Dashboard
`Math.random()` generates "growth data". Any admin user seeing this loses all trust in the platform.

**Fix:** Show "No data available yet" with illustration. Never generate fake data.

---

## Navigation Issues

### 5. No Global Store Switcher
Users must go to `/dashboard/stores` to switch stores. There's no dropdown showing the current store in the top nav.

**Impact:** Additional click per context switch. Confusion when working across stores.

### 6. No Breadcrumbs in Store Admin
Store admin pages lack breadcrumb navigation. Users can't tell where they are in the hierarchy.

**Fix:** Add breadcrumbs: `Dashboard > Store Name > Products > Product Name`

### 7. No Keyboard Shortcuts
Power users (store managers) would benefit from `G + S` (go to settings), `G + P` (go to products), `N` (new product), etc.

**Shopify Pattern:** Global command palette (`Cmd+K`) for navigation and actions.

---

## Form UX Issues

### 8. No Auto-Save in Builder
The page builder has `isDirty` tracking but no auto-save. Users can lose changes by navigating away.

### 9. No Confirmation Before Destructive Actions
Delete store, delete product, cancel order — no confirmation dialogs on many actions. Some use native `confirm()` which is jarring and unstyled.

### 10. Order Status Dropdown Fires Immediately
Selecting a value in the order status dropdown immediately updates the server. No "Are you sure?" and no undo.

---

## Empty State Issues

### 11. Inconsistent Empty States
- Products: ✅ Beautiful empty state with illustration
- Orders: ✅ Good empty state
- Categories: ❌ No empty state
- Coupons: ❌ Feature-gated but shows nothing
- CMS Pages: ❌ No empty state
- Reviews: ❌ Renders null

### 12. No Tutorial/Onboarding for New Stores
First-time store owners see an empty dashboard with no guidance on next steps.

**Fix:** Add a setup checklist: Create product → Add category → Upload logo → Configure payment → Launch store.

---

## Responsive UX Issues

### 13. Store Sidebar on Mobile
The store admin sidebar's mobile behavior needs verification — it may overlay or push content incorrectly.

### 14. Tables on Mobile
Some tables lack horizontal scroll on mobile. Users on phones see truncated columns.

---

## Summary of UX Improvements

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | No loading skeletons | High | Medium |
| 2 | No error recovery | **Critical** | Low |
| 3 | Coming soon renders null | Medium | Low |
| 4 | Fake chart data | **Critical** | Low |
| 5 | No store switcher | High | Medium |
| 6 | No breadcrumbs | Low | Low |
| 7 | No keyboard shortcuts | Low | High |
| 8 | No auto-save builder | Medium | Medium |
| 9 | No confirmation dialogs | High | Low |
| 10 | Inline order status change | Medium | Low |
| 11 | Inconsistent empty states | Medium | Low |
| 12 | No onboarding | Low | Medium |
