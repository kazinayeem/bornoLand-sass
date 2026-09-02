# BornoLand Architecture Overview

## 1. System Topology & Philosophy

BornoLand is designed as an all-in-one multi-tenant **Business Operating System (BOS)** that unifies **Commerce, Operations, People (HRM), Finance, and Growth (CRM & Marketing)**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          BORNOLAND CLIENTS                             │
│   • Merchant Admin / POS Terminal (Next.js App Router)                 │
│   • Customer Storefronts / Multi-Tenant Subdomains                     │
│   • Super Admin SaaS Portal                                            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / WebSocket (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY / EXPRESS APP                       │
│   • Tenant Resolution Middleware (`x-store-id`, subdomains, domains)   │
│   • Auth & JWT Verification (`requireAuth`, Bearer tokens)             │
│   • Plan & Feature Entitlement Enforcement (`requireFeatureAccess`)    │
│   • Granular Member RBAC Verification (`requirePermissions`)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  COMMERCE & ORDERS   │ │   OPERATIONS & POS   │ │   PEOPLE & FINANCE   │
│  • Products/Variants │ │  • Stock Ledger/Logs │ │  • Employees / Depts │
│  • Orders / Checkout │ │  • POS Shifts/Drawer │ │  • Attendance/Leaves │
│  • Cart & Payments   │ │  • Warehouses / POs  │ │  • Double-Entry COA  │
│  • Shipping/Couriers │ │  • Suppliers & Waste │ │  • P&L, Balance Sheet│
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CANONICAL DATABASE (MONGODB)                         │
│   • Strict Tenant Scoping on All Collections (`storeId` Index)         │
│   • Compound Unique Constraints (e.g. `{ storeId, sku }`)              │
│   • Atomic Operations & Optimistic Concurrency Controls                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Monorepo Architecture

- `apps/api`: Node.js, Express, Mongoose, TypeScript backend service (`tsup` build).
- `apps/web`: Next.js 15 App Router, React 19, Redux Toolkit Query, Tailwind CSS v4, Nordic Yellow Design System.
- `packages/*`: Shared type contracts, utility libraries, and configuration.

---

## 3. Core Tenant Resolution & Isolation

- **Tenant Identification**: Every store owns a unique MongoDB `ObjectId` and URL `slug`.
- **Subdomain & Custom Domain Routing**: Middleware extracts store identifier and verifies active tenant subscription before allowing request dispatch.
- **Tenant Data Isolation**: All database queries must include `{ storeId: storeOid(storeId) }`. Direct cross-tenant access is structurally disallowed at controller and service layers.
