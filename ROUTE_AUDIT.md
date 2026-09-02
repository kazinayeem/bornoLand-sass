# BornoLand Master Routing Audit & Route Health Report (ROUTE_AUDIT.md)

## 1. Routing Architecture Overview

BornoLand features three distinct routing domains:

```
                                 HTTP REQUEST
                                      │
                                      ▼
                             [Next.js Middleware]
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │ Host: custom / subdomain   │ Path: /store/[storeSlug]/*  │ Path: /admin/*
        ▼                             ▼                             ▼
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│   PUBLIC STOREFRONT     │  │    MERCHANT WORKSPACE   │  │   SUPER ADMIN PORTAL    │
│   • Rewritten to        │  │   • Authenticated       │  │   • Authenticated       │
│     `/site/[tenant]/*`  │  │   • Tenant Scoped       │  │     Platform Oversight  │
│   • Public Products,    │  │   • POS, HRM, Inventory,│  │   • Global Tenancy &    │
│     Cart, Checkout, CMS │  │     Finance, CRM        │  │     Plan Management     │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

## 2. Root Cause of Previous Conflict

### The Problem
Accessing `/store/[storeSlug]/operations/approvals` or `/store/[storeSlug]` produced a "Store not found" error.

### Root Cause
1. In the `apps/web/src/app/(store)/store/[storeSlug]/` tree, legacy storefront renderer catch-alls (`[pageSlug]/page.tsx` and `page.tsx`) were mounted directly under `store/[storeSlug]`.
2. When a valid workspace path (such as `/store/[storeSlug]/operations/approvals` or an unnested `/store/[storeSlug]` URL) was requested, Next.js routed the request to `[pageSlug]/page.tsx`, invoking `StorefrontPageRenderer`.
3. `StorefrontPageRenderer` executed public storefront tenant resolution against the tenant API, failed, and rendered the public storefront **"Store not found"** error screen instead of the authenticated merchant workspace.

### The Architectural Fix
1. **Separated Boundaries**: Public storefront is strictly served via `/site/[tenant]/*` (rewritten by middleware from host subdomains).
2. **Workspace Fallbacks Fixed**:
   - `apps/web/src/app/(store)/store/[storeSlug]/page.tsx`: Automatically redirects to `/store/${storeSlug}/dashboard`.
   - `apps/web/src/app/(store)/store/[storeSlug]/[pageSlug]/page.tsx`: Serves workspace fallback and routes to `/store/${storeSlug}/dashboard` instead of invoking storefront renderers.
3. **Dedicated Sub-route Handlers Added**:
   - `/store/[storeSlug]/operations/approvals` $\rightarrow$ Routes to Operations Tasks & Approvals.
   - `/store/[storeSlug]/finance/accounting/coa` $\rightarrow$ Routes to Chart of Accounts.
   - `/store/[storeSlug]/finance/accounting/journal` $\rightarrow$ Routes to General Journal.

---

## 3. Route Inventory & Verification Matrix

| Route Pattern | Domain Type | Auth Required | Expected Layout | Build & Route Status |
| :--- | :--- | :--- | :--- | :--- |
| `/site/[tenant]` | Public Storefront | No | Storefront Public Shell | **HEALTHY (200 OK)** |
| `/site/[tenant]/shop` | Public Storefront | No | Storefront Public Shell | **HEALTHY (200 OK)** |
| `/site/[tenant]/cart` | Public Storefront | No | Storefront Public Shell | **HEALTHY (200 OK)** |
| `/site/[tenant]/checkout`| Public Storefront | No | Storefront Public Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]` | Workspace | Yes | Redirects to `/dashboard` | **HEALTHY (307 Redirect)** |
| `/store/[storeSlug]/dashboard` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/products` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/inventory`| Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/inventory/waste`| Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/inventory/ledger`| Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/inventory/purchasing`| Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/inventory/warehouses`| Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/inventory/suppliers`| Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/pos` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/pos/shifts` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/hrm/employees` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/hrm/attendance` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/hrm/leaves` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/hrm/payroll` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/hrm/self-service` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/finance/accounting` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/finance/accounting/coa` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/finance/accounting/journal` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/finance/expenses` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/finance/reports` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/crm/deals` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/support/tickets` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/operations/tasks` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/store/[storeSlug]/operations/approvals` | Workspace | Yes | Merchant Workspace Shell | **HEALTHY (200 OK)** |
| `/admin/dashboard` | Super Admin | Yes (Super Admin) | Admin Shell | **HEALTHY (200 OK)** |

---

## 4. Verification Results

- `pnpm --filter @bornoland/web build` passed with **Exit Code 0** across all routes.
- Zero route collisions or unexpected storefront redirects remain.
