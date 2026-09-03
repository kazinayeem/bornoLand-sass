<p align="center">
  <img src="https://img.shields.io/badge/BornoLand-Multi--Tenant%20Business%20OS-2563eb?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0zIDloMTgiLz48cGF0aCBkPSJNMyAxNWgxOCIvPjxwYXRoIGQ9Ik0zIDNoMTh2MThIM1oiLz48L3N2Zz4=" />
</p>

<h1 align="center">BornoLand</h1>

<p align="center">
  <strong>Multi-tenant Business Operating System — Ecommerce, POS, Inventory, HRM, Accounting, CRM, and Storefront in one platform.</strong>
</p>

<p align="center">
  <a href="#installation">Installation</a> ·
  <a href="#local-development">Development</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#environment-variables">Environment</a> ·
  <a href="#roadmap">Roadmap</a>
</p>

---

## Introduction

**BornoLand** is an open-source, production-oriented **Multi-Tenant Business Operating System (BOS)** built for [Bornosoft](https://bornosoft.site). It lets operators run a **multi-tenant SaaS** where each **workspace** (tenant) can create and manage multiple **stores**, each with its own subdomain storefront, admin dashboard, product catalog, orders, POS, inventory, HRM, accounting, CRM, support, and visual page builder.

The codebase is a **pnpm + Turborepo monorepo** with two deployable applications:

| App | Package | Default port | Responsibility |
|-----|---------|--------------|----------------|
| **Web** | `@bornoland/web` | `3000` | Next.js 15 UI — marketing site, auth, workspace dashboard, store admin, builder, storefront |
| **API** | `@bornoland/api` | `4000` | Express 5 REST API — auth, tenancy, commerce, operations, HRM, finance, billing, media |

Data is persisted in **MongoDB** via **Mongoose**. The web app talks to the API through **RTK Query** (with cookie-based sessions) and Next.js rewrites for `/api/*`.

---

## Platform Architecture

```
BornoLand Platform
│
├── Web Application (Next.js 15)
│   ├── SaaS Landing & Marketing Pages
│   ├── Authentication (Login, Register, OAuth)
│   ├── Workspace Dashboard (Stores, Billing, Team, Activity)
│   ├── Store Management (Products, Orders, POS, Inventory, HRM, Finance, CRM, Support)
│   ├── Visual Page Builder (Drag & Drop, Sections, Templates)
│   ├── Super Admin Portal (Users, Stores, Plans, Analytics, Audit)
│   └── Public Storefront (ISR, Products, Cart, Checkout, Account)
│
├── API (Express 5)
│   ├── Authentication & Session Management
│   ├── Tenant & Store Resolution
│   ├── Commerce APIs (Products, Orders, Cart, Customers)
│   ├── Operations APIs (POS, Inventory, Warehouses, Purchasing)
│   ├── People APIs (HRM, Attendance, Leaves, Payroll)
│   ├── Finance APIs (Accounting, Journal, Expenses, Reports)
│   ├── Growth APIs (CRM, Support, Operations, Marketing)
│   ├── Content APIs (CMS, Builder, Pages, Navigation, Themes)
│   ├── Platform APIs (Subscriptions, Features, Billing, Audit)
│   └── Integrations (Couriers, Payments, Email, AI)
│
└── Database (MongoDB + Mongoose)
    └── Tenant-scoped collections with compound indexes
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Monorepo** | pnpm workspaces + Turborepo | pnpm 9.12.0, Turbo 2.3.3 |
| **Language** | TypeScript | 5.8.3 |
| **Frontend** | Next.js (App Router) | 15.3.3 |
| **UI Library** | React | 19.1.0 |
| **Styling** | Tailwind CSS | 4.1.11 |
| **UI Components** | Radix UI (Dialog, Select, Tabs, etc.) | Multiple |
| **Icons** | Lucide React | 0.539.0 |
| **Animation** | Framer Motion | 12.23.12 |
| **State Management** | Redux Toolkit + RTK Query | 2.12.0 |
| **Local State** | Zustand | 5.0.7 |
| **Forms** | React Hook Form + Zod | 7.62.0, 4.1.5 |
| **Rich Text** | TipTap | 3.23.6 |
| **Drag & Drop** | @dnd-kit | 6.3.1 |
| **Charts** | Recharts | 3.8.1 |
| **Toasts** | Sonner | 2.0.7 |
| **Data Tables** | TanStack Table + Virtual | 8, 3 |
| **Backend** | Express | 5.1.0 |
| **Database** | MongoDB + Mongoose | 8.16.4 |
| **Cache** | Redis (ioredis) | 5.7.0 |
| **Auth (frontend)** | jose | 6.1.0 |
| **Auth (backend)** | jsonwebtoken + bcryptjs | 9.0.2, 2.4.3 |
| **Media** | Sharp, Multer, Cloudinary, AWS S3 | 0.35.2, 2.2.0 |
| **Payments** | Stripe, SSLCommerz | 18.5.0, 1.2.0 |
| **Email** | Nodemailer | 7.0.13 |
| **PDF** | PDFKit | 0.19.1 |
| **QR Codes** | QRCode | 1.5.4 |
| **Logging** | Pino + Pino-HTTP | 9.8.0, 10.5.0 |
| **Security** | Helmet, CORS, rate-limit | 8.1.0 |
| **Build** | tsup (API), Next.js (Web) | 8.5.0 |
| **Containerization** | Docker + Docker Compose | Latest |
| **CI/CD** | GitHub Actions | Lint + Typecheck |
| **Node.js** | 22 | .nvmrc |

---

## Monorepo Structure

```
bornoland/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router routes (200+ pages)
│   │   │   ├── components/     # UI, builder, storefront, admin, workspace (663 files)
│   │   │   ├── redux/          # RTK Query APIs (44) + slices (16)
│   │   │   ├── lib/            # URLs, sections, server fetch helpers
│   │   │   ├── middleware.ts   # Auth + subdomain routing
│   │   │   ├── providers/      # Tenant, store context
│   │   │   └── store/          # Redux store config
│   │   ├── Dockerfile
│   │   └── package.json
│   └── api/                    # Express 5 backend
│       ├── src/
│       │   ├── modules/        # 45 domain modules
│       │   ├── common/         # Middleware, DB, utils, cache
│       │   ├── bootstrap/      # Safe migrations + default seeds
│       │   └── seed/           # Database seed scripts
│       ├── uploads/            # Local media storage (dev)
│       ├── Dockerfile
│       └── package.json
├── docs/                       # Architecture & audit documentation
├── audit/                      # Performance & QA audit reports
├── scripts/                    # Verification & QA scripts
├── .github/workflows/ci.yml   # GitHub Actions CI
├── docker-compose.yml          # Production Docker stack
├── package.json                # Root scripts (turbo + concurrently)
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── DESIGN.md                   # Design system specification
└── .env.example                # Environment variable template
```

> **Note:** `packages/*` is referenced in `tsconfig.base.json` and `pnpm-workspace.yaml` but **is not present in the repository**. Shared code currently lives inside each app.

---

## Multi-Tenancy

### How It Works

BornoLand uses a **dual-layer tenant model**:

| Concept | Description |
|---------|-------------|
| **Tenant (Workspace)** | Top-level entity. Owns stores, billing, team. Identified by `tenantId`. |
| **Store** | Belongs to a tenant. Has its own subdomain, products, orders, POS, HRM, finance. Identified by `storeId` + `slug`. |

### Tenant Resolution

1. **Subdomain detection** — `apps/web/src/middleware.ts` extracts store slug from `Host` header (e.g., `nayeem.bornosoft.site` → store `nayeem`)
2. **Storefront rewrite** — `{slug}.localhost:3000` → internal route `/site/{slug}/*`
3. **API tenancy** — `subdomainDetector` middleware attaches `req.subdomain`; store-scoped routes use `storeId` path params
4. **Custom domain** — Plan flag + resolver hooks (DNS provisioning UI not yet implemented)

### Tenant-Scoped Database

All operational queries include `{ storeId: storeOid(storeId) }`. Compound unique indexes enforce per-store uniqueness (e.g., `{ storeId, sku }`). Cross-tenant access is structurally disallowed.

### Routing Separation

| Surface | Route | Auth | Rendering |
|---------|-------|------|-----------|
| Public Storefront | `/site/[tenant]/*` | No | ISR (60s revalidation) |
| Merchant Workspace | `/store/[storeSlug]/*` | Yes | SSR (force-dynamic) |
| Super Admin | `/admin/dashboard/*` | Yes (super_admin) | SSR |
| Auth | `/login`, `/register`, etc. | No | SSR layout gates |
| Marketing | `/`, `/about`, `/pricing`, etc. | No | Static/SSR |

---

## Authentication & Authorization

### Authentication

BornoLand uses a **custom JWT session system** (not NextAuth).

| Feature | Implementation |
|---------|---------------|
| **Login** | `POST /auth/login` → API signs JWT → `bornoland.session` httpOnly cookie |
| **Registration** | `POST /auth/register` → Creates tenant + user + team member + subscription |
| **Session Read (Web)** | Middleware verifies cookie with `jose` |
| **Session Read (API)** | `requireAuth` reads Bearer token or session cookie |
| **Google OAuth** | `GET /auth/google` → callback sets session cookie |
| **Password Reset** | `POST /auth/forgot-password` → email with token → `POST /auth/reset-password` |
| **Email Verification** | `POST /auth/verify-email` → token-based verification |
| **Token Refresh** | `POST /auth/refresh` → rotates refresh token, issues new access token |
| **Remember Me** | 30-day refresh token (vs 7-day default) |
| **Reuse Detection** | Revoked token reuse → all tokens in family revoked |

### Authorization Pipeline

```
Authentication (Bearer JWT / Session Cookie)
    │
    ▼
Tenant Association (Store Membership)
    │
    ▼
Subscription Plan Check (Active / Trial)
    │
    ▼
Module Entitlement (Plan Feature Flags)
    │
    ▼
Granular Member Role & Permissions
    │
    ▼
Tenant-Scoped Resource Execution
```

### Roles

| Role | Description | Scope |
|------|-------------|-------|
| `super_admin` | Platform-wide access | Global |
| `owner` | Full store access, cannot be demoted | Store |
| `admin` | Broad module access | Store |
| `manager` | Module-level management | Store |
| `staff` | Limited operational access | Store |
| `cashier` | POS-only access | Store |
| `viewer` | Read-only access | Store |

### Permissions

22 modules × 7 actions = **154 permission keys** in format `module:action`:

**Modules:** `products`, `categories`, `inventory`, `warehouse`, `procurement`, `pos`, `orders`, `customers`, `coupons`, `reviews`, `pages`, `media`, `analytics`, `settings`, `members`, `billing`, `marketing`, `shipping`, `payments`, `reports`, `hrm`, `finance`

**Actions:** `read`, `create`, `update`, `delete`, `export`, `manage`, `refund`

### Guard Components (Web)

`RequireAuth`, `RequireWorkspace`, `RequireStore`, `RequireSubscription`, `RequirePermission`, `RequireStorePermission`, `RequireFeature`, `RequirePlan`, `RequireRole`

---

## Module System

### Commerce

| Module | Status | Description |
|--------|--------|-------------|
| Products | 🟢 Implemented | CRUD, variants, options, pricing, SEO, images, publish workflow |
| Categories | 🟢 Implemented | Hierarchical, store-scoped, reorderable |
| Brands | 🟢 Implemented | CRUD, media sync, product brand updates |
| Collections | 🟢 Implemented | Product grouping, feature-gated |
| Orders | 🟢 Implemented | Creation, management, status tracking, refunds |
| Customers | 🟢 Implemented | Profiles, addresses, unified customer 360 |
| Coupons | 🟢 Implemented | Percentage/fixed/free-shipping/buy-x-get-y, validation, usage limits |
| Reviews | 🟢 Implemented | CRUD, moderation (approve/reject), verified purchase, rating aggregation |
| Cart & Wishlist | 🟢 Implemented | Session-based cart, wishlist, checkout |
| Incomplete Orders | 🟢 Implemented | Abandoned cart tracking |

### Operations

| Module | Status | Description |
|--------|--------|-------------|
| POS Terminal | 🟢 Implemented | Product search, barcode, cart, variants, payment methods, order creation |
| POS Shifts | 🟢 Implemented | Opening float, tender breakdown, drawer count, variance audit |
| Inventory Stock | 🟢 Implemented | Stock tracking, thresholds, multi-warehouse |
| Stock Ledger | 🟢 Implemented | StockLog model — PURCHASE, SALE, POS_SALE, WASTE, DAMAGE, TRANSFER, ADJUSTMENT |
| Waste & Loss | 🟢 Implemented | Damage/spoilage tracking, reason codes, loss valuation |
| Warehouses | 🟢 Implemented | Facility management, manager assignments, storage codes |
| Purchasing | 🟢 Implemented | Purchase orders, goods receiving, accounts payable |
| Suppliers | 🟢 Implemented | Vendor directory, contact details, payment terms |

### People (HRM)

| Module | Status | Description |
|--------|--------|-------------|
| Employee Directory | 🟢 Implemented | Profiles, departments, designations, salary structure |
| Departments & Designations | 🟢 Implemented | Organizational hierarchy |
| Attendance | 🟢 Implemented | Clock-in/out, late minutes, overtime calculation |
| Shifts | 🟢 Implemented | Work shifts with start/end time, grace period |
| Leaves | 🟢 Implemented | Types (casual/sick/annual/unpaid), approval workflow |
| Payroll | 🟢 Implemented | Monthly runs, payslip generation (PS-YYYYMM-XXXX), auto journal posting |
| Self-Service Portal | 🟢 Implemented | Employee view own attendance, leaves, payslips |

### Finance

| Module | Status | Description |
|--------|--------|-------------|
| Chart of Accounts (COA) | 🟢 Implemented | Account codes, types (asset/liability/equity/revenue/cogs/expense) |
| Double-Entry Journal | 🟢 Implemented | Balanced entries (∑Debits = ∑Credits), immutability |
| Expenses | 🟢 Implemented | Category, amount, payment method, auto-journal posting |
| Trial Balance | 🟢 Implemented | Debit/credit verification across all accounts |
| Profit & Loss | 🟢 Implemented | Revenue - COGS - Expenses = Net Profit |
| Balance Sheet | 🟢 Implemented | Assets = Liabilities + Equity |

### Growth

| Module | Status | Description |
|--------|--------|-------------|
| CRM Deals Pipeline | 🟢 Implemented | Kanban board, stages (lead → won/lost), deal value |
| Customer Support | 🟢 Implemented | Tickets, message threads, priority, assignment, status |
| Operations Tasks | 🟢 Implemented | Multi-step approvals, task queue, inspection matrix |

### Marketing & Analytics

| Module | Status | Description |
|--------|--------|-------------|
| Campaigns | 🟢 Implemented | CRUD, types (discount/flash_sale/banner/announcement), feature-gated |
| Tracking Pixels | 🟡 Partial | Feature flags (meta_pixel, tiktok_pixel, google_analytics) — UI not built |
| Analytics Tracking | 🟢 Implemented | PageView, VisitorSession, TrafficSource with 90-day TTL |
| Analytics Dashboard | 🟢 Implemented | Stats, charts, traffic sources, devices, conversion funnel, live visitors |
| Reports API | 🟢 Implemented | Sales, inventory, coupons, tax, refund aggregations |
| Reports UI | 🟡 Partial | Shell page exists, charts not built |

### Shipping & Logistics

| Module | Status | Description |
|--------|--------|-------------|
| Shipping Zones | 🟢 Implemented | Zones, methods (flat_rate/free/weight_based/price_based/local_pickup) |
| Courier Integrations | 🟢 Implemented | 5 providers: Pathao, RedX, Steadfast, Paperfly, Sundarban |
| Shipment Tracking | 🟢 Implemented | Auto-create, auto-sync (5-min cron), status normalization |
| Delivery Zones | 🟢 Implemented | Area-based delivery configuration |

### Content & Website

| Module | Status | Description |
|--------|--------|-------------|
| Visual Page Builder | 🟢 Implemented | Drag & drop, 40+ section types, device preview, publish/draft |
| CMS Pages | 🟢 Implemented | Per-store pages, TipTap rich text editor, slug-based routing |
| FAQs | 🟢 Implemented | CRUD, reorder, store-scoped |
| Media Library | 🟢 Implemented | Upload (local/S3/Cloudinary), folders, rename, reference tracking, storage quotas |
| Themes & Templates | 🟢 Implemented | 10 ecommerce templates, store theme assignment |
| Navigation/Menus | 🟢 Implemented | Nested menu structures, multiple locations, sortable |
| Store Pages | 🟢 Implemented | Page versioning, preview, publishing workflow |
| Global Sections | 🟢 Implemented | Reusable sections for the builder |
| SEO | 🟢 Implemented | Per-route metadata, canonical URLs, robots, sitemap, Open Graph |

### System

| Module | Status | Description |
|--------|--------|-------------|
| Subscriptions & Plans | 🟢 Implemented | Free/Starter/Business/Enterprise tiers, trial support |
| Feature Gates | 🟢 Implemented | 51 features, boolean/limit/tier types, server-side enforcement |
| Invoices | 🟢 Implemented | PDFKit generation, QR verification, timeline audit |
| Billing Cron | 🟢 Implemented | Hourly trial/subscription expiry processing |
| Audit Logs | 🟢 Implemented | Immutable, actor/store/workspace/action, CSV/JSON export |
| Team Members | 🟡 Partial | RBAC, roles, permissions — invite button disabled |
| Email System | 🟢 Implemented | SMTP config, templates, branding, queue with retry, logs |
| Notifications | 🟢 Implemented | In-app, billing, contact form, newsletter |
| Platform Settings | 🟢 Implemented | Singleton config (currency, fees, trials, payment methods) |
| AI Shop Builder | 🟢 Implemented | Content generation via Agent Router API |
| Locations | 🟢 Implemented | Bangladesh administrative divisions (static data) |

---

## Route Map

### SaaS Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/login`, `/register` | Authentication |
| `/forgot-password`, `/reset-password/[token]` | Password recovery |
| `/verify-email/[token]` | Email verification |
| `/invite/[token]` | Team invitation |
| `/about`, `/blog`, `/contact`, `/docs`, `/faq`, `/privacy`, `/refund`, `/support`, `/terms` | Marketing pages |

### Workspace Dashboard

| Route | Purpose |
|-------|---------|
| `/dashboard` | Stores list, overview |
| `/dashboard/stores` | Store management |
| `/dashboard/stores/create` | Create new store |
| `/dashboard/billing` | Billing & subscription |
| `/dashboard/team` | Team members |
| `/dashboard/activity` | Audit activity |
| `/dashboard/notifications` | Notifications |
| `/dashboard/settings` | Account settings |
| `/dashboard/builder/[storeId]` | Store builder access |

### Store Management (`/store/[storeSlug]/`)

| Route | Purpose |
|-------|---------|
| `/dashboard` | Store overview |
| `/products`, `/products/new` | Product management |
| `/orders`, `/orders/incomplete` | Order management |
| `/customers` | Customer directory |
| `/categories` | Category management |
| `/coupons` | Coupon management |
| `/reviews` | Review moderation |
| `/media` | Media library |
| `/pages` | Store pages |
| `/cms`, `/cms/[slug]`, `/cms/faqs` | CMS content |
| `/pos`, `/pos/shifts` | Point of Sale |
| `/inventory`, `/inventory/waste`, `/inventory/purchasing`, `/inventory/ledger`, `/inventory/suppliers`, `/inventory/warehouses` | Inventory management |
| `/hrm/employees`, `/hrm/attendance`, `/hrm/leaves`, `/hrm/payroll`, `/hrm/organization`, `/hrm/self-service` | HRM |
| `/finance/accounting`, `/finance/accounting/coa`, `/finance/accounting/journal`, `/finance/expenses`, `/finance/reports` | Finance & Accounting |
| `/crm/deals` | CRM pipeline |
| `/support/tickets` | Support desk |
| `/operations/tasks`, `/operations/approvals` | Operations |
| `/marketing` | Marketing campaigns |
| `/analytics`, `/analytics/live`, `/analytics/visitors`, `/analytics/countries`, `/analytics/cities`, `/analytics/devices`, `/analytics/browsers`, `/analytics/referrers`, `/analytics/traffic-sources`, `/analytics/conversion` | Analytics |
| `/reports` | Reports |
| `/billing` | Store billing |
| `/settings/*` | Store settings (checkout, contact, courier, invoice, localization, notifications, payments, shipping, taxes, tracking) |
| `/appearance/*` | Appearance (branding, domain, SEO, theme) |
| `/members` | Store members |
| `/builder`, `/builder/[pageSlug]` | Page builder |
| `/activity` | Store activity |

### Public Storefront (`/site/[tenant]/`)

| Route | Purpose |
|-------|---------|
| `/` | Home page |
| `/shop`, `/products`, `/products/[slug]` | Product catalog |
| `/categories`, `/category/[...slug]` | Category browsing |
| `/cart` | Shopping cart |
| `/checkout`, `/checkout/success`, `/checkout/failed` | Checkout flow |
| `/checkout/payment`, `/checkout/payment/success`, `/checkout/payment/fail` | Payment flow |
| `/account`, `/account/login`, `/account/register` | Customer account |
| `/account/orders`, `/account/addresses`, `/account/wishlist` | Account sections |
| `/orders`, `/orders/[id]` | Order history |
| `/order-tracking` | Order tracking |
| `/search` | Search |
| `/about`, `/contact`, `/faq`, `/privacy`, `/terms`, `/returns`, `/size-guide`, `/shipping` | Content pages |
| `/brand/[slug]` | Brand pages |

### Super Admin (`/admin/dashboard/`)

| Route | Purpose |
|-------|---------|
| `/admin/dashboard` | Platform overview |
| `/admin/dashboard/stores` | Store management |
| `/admin/dashboard/users` | User management |
| `/admin/dashboard/plans` | Plan management |
| `/admin/dashboard/subscriptions` | Subscription management |
| `/admin/dashboard/invoices` | Invoice management |
| `/admin/dashboard/orders` | Order oversight |
| `/admin/dashboard/products` | Product oversight |
| `/admin/dashboard/payments` | Payment management |
| `/admin/dashboard/analytics` | Platform analytics |
| `/admin/dashboard/audit-center` | Audit log center |
| `/admin/dashboard/features` | Feature management |
| `/admin/dashboard/settings` | Platform settings |
| `/admin/dashboard/storage` | Storage analytics |
| `/admin/dashboard/activity` | Platform activity |
| `/admin/dashboard/security` | Security settings |
| `/admin/dashboard/templates` | Template management |

---

## Feature Matrix

| Module | Feature | Status |
|--------|---------|--------|
| **Commerce** | Products & Variants | 🟢 Implemented |
| | Categories | 🟢 Implemented |
| | Brands | 🟢 Implemented |
| | Collections | 🟢 Implemented |
| | Orders | 🟢 Implemented |
| | Customers | 🟢 Implemented |
| | Cart & Checkout | 🟢 Implemented |
| | Coupons | 🟢 Implemented |
| | Reviews | 🟢 Implemented |
| | Incomplete Orders | 🟢 Implemented |
| **POS** | Terminal (Barcode, Search, Cart) | 🟢 Implemented |
| | Shifts & Float Reconciliation | 🟢 Implemented |
| | Multiple Payment Methods | 🟢 Implemented |
| **Inventory** | Stock Tracking | 🟢 Implemented |
| | Stock Movement Ledger | 🟢 Implemented |
| | Waste & Loss Tracker | 🟢 Implemented |
| | Warehouses | 🟢 Implemented |
| | Purchase Orders | 🟢 Implemented |
| | Suppliers | 🟢 Implemented |
| **HRM** | Employee Directory | 🟢 Implemented |
| | Departments & Designations | 🟢 Implemented |
| | Attendance & Shifts | 🟢 Implemented |
| | Leave Management | 🟢 Implemented |
| | Payroll Engine | 🟢 Implemented |
| | Employee Self-Service | 🟢 Implemented |
| **Finance** | Chart of Accounts | 🟢 Implemented |
| | Double-Entry Journal | 🟢 Implemented |
| | Expense Management | 🟢 Implemented |
| | Trial Balance | 🟢 Implemented |
| | Profit & Loss | 🟢 Implemented |
| | Balance Sheet | 🟢 Implemented |
| **CRM** | Deals Pipeline (Kanban) | 🟢 Implemented |
| | Customer 360 | 🟢 Implemented |
| **Support** | Ticket System | 🟢 Implemented |
| | Message Threads | 🟢 Implemented |
| **Operations** | Task Management | 🟢 Implemented |
| | Multi-Step Approvals | 🟢 Implemented |
| **Marketing** | Campaigns | 🟢 Implemented |
| | Tracking Pixels | 🟡 Partial |
| **Analytics** | Page View Tracking | 🟢 Implemented |
| | Visitor Sessions | 🟢 Implemented |
| | Traffic Sources | 🟢 Implemented |
| | Conversion Funnel | 🟢 Implemented |
| | Live Visitors | 🟢 Implemented |
| | Dashboard Charts | 🟢 Implemented |
| **Shipping** | Shipping Zones | 🟢 Implemented |
| | Courier Integrations (5) | 🟢 Implemented |
| | Shipment Tracking | 🟢 Implemented |
| **Content** | Visual Page Builder | 🟢 Implemented |
| | CMS Pages + FAQs | 🟢 Implemented |
| | Media Library | 🟢 Implemented |
| | Themes & Templates | 🟢 Implemented |
| | Navigation Menus | 🟢 Implemented |
| | Store Pages (Versioned) | 🟢 Implemented |
| | SEO (Metadata, Sitemap, OG) | 🟢 Implemented |
| **System** | Subscriptions & Plans | 🟢 Implemented |
| | Feature Gates (51 features) | 🟢 Implemented |
| | Invoices (PDF + QR) | 🟢 Implemented |
| | Audit Logs | 🟢 Implemented |
| | Email System (SMTP) | 🟢 Implemented |
| | In-App Notifications | 🟢 Implemented |
| | Team RBAC | 🟡 Partial |
| | Custom Domain | 🟡 Partial |
| | Reports UI | 🟡 Partial |
| | Marketing UI | 🟡 Partial |
| **Platform** | Super Admin Dashboard | 🟢 Implemented |
| | Platform Settings | 🟢 Implemented |
| | AI Shop Builder | 🟢 Implemented |
| | Bangladesh Locations | 🟢 Implemented |
| **Integrations** | Google OAuth | 🟢 Implemented |
| | SSLCommerz (Sandbox) | 🟢 Implemented |
| | Stripe (Partial) | 🟡 Partial |
| | Redis Caching | 🟡 Partial |
| | Cloudinary / S3 | 🟢 Implemented |
| | 5 Courier Providers | 🟢 Implemented |
| **Planned** | Apps Marketplace | 🔵 Planned |
| | AI Page Generation | 🔵 Planned |
| | Two-Factor Authentication | 🔵 Planned |
| | Live Payment Gateway | 🔵 Planned |

---

## Product & Catalog System

### Products
- **Model:** `Product` — `storeId`, `name`, `slug`, `description`, `buyingPrice`, `sellingPrice`, `sku`, `barcode`, `stock`, `stockThreshold`, `categoryId`, `brandId`, `images[]`, `isActive`, `seo*`
- **Variants:** Independent SKUs with own price, stock, barcode, attributes (size, color, storage)
- **Options:** `ProductOption` (e.g., "Color", "Size") → `ProductOptionValue` (e.g., "Red", "XL")
- **Variant Models:** `VariantPrice`, `VariantInventory`, `VariantImage`
- **Indexes:** `{storeId, slug}` unique, `{storeId, sku}` unique, `{storeId, categoryId}`, `{storeId, isActive}`

### Categories
- **Model:** `Category` — `storeId`, `name`, `slug`, `description`, `parentId`, `image`, `isActive`, `sortOrder`, `seo*`
- Hierarchical (parent-child), reorderable

### Brands
- **Model:** `Brand` — `storeId`, `name`, `slug`, `description`, `logoUrl`, `bannerUrl`, `website`, `active`, `featured`, `sortOrder`, `seo*`
- Media reference sync, product brand updates on name change

### Buying Price Protection
Buying/cost prices are **internal-only** — concealed from public storefronts, non-admin cashiers, and unauthorized staff roles via serializer-level filtering.

---

## Inventory Architecture

### Stock Movement Ledger (Source of Truth)

```
StockLog Model
├── PURCHASE     → Stock Increase (+)
├── SALE         → Stock Decrease (-)
├── POS_SALE     → Stock Decrease (-)
├── WASTE        → Stock Decrease (-)
├── DAMAGE       → Stock Decrease (-)
├── TRANSFER_IN  → Stock Increase (+)
├── TRANSFER_OUT → Stock Decrease (-)
└── ADJUSTMENT   → Stock Adjustment (+/-)
```

### Warehouse Flow
```
Purchase Order → Receive Goods → Stock Increase → Stock Log (PURCHASE) → Accounts Payable Voucher
```

### Waste Flow
```
Waste/Loss Report → Stock Decrease → Stock Log (WASTE) → Loss Valuation → Expense Account
```

---

## POS

### Implemented Capabilities
- Product search by name, SKU, barcode
- Variant selection (size, color, etc.)
- Cart management (add, remove, quantity)
- Customer association
- Multiple payment methods (Cash, Card, Mobile Banking, COD)
- Order creation with stock deduction
- Receipt/invoice generation
- POS shifts with opening float
- Drawer count and variance auditing
- Shift close with tender breakdown

### Known Limitations
- POS is frontend-only modal (uses order/inventory APIs, no dedicated backend POS module)

---

## HRM

### Implemented Features
- **Employee Directory:** Profiles with department, designation, salary, joining date, status
- **Departments & Designations:** Organizational hierarchy
- **Attendance:** Daily clock-in/out, late minutes, overtime calculation
- **Shifts:** Work shifts with start/end time, grace period
- **Leaves:** Types (casual/sick/annual/unpaid), approval workflow, manager remarks
- **Payroll:** Monthly runs with basic, allowances, overtime, tax, PF, unpaid leaves, net pay
- **Payslips:** Generated as `PS-YYYYMM-XXXX` with PDF support
- **Self-Service:** Employees view own attendance, leaves, payslips, profile

### Payroll Formula
```
Net Salary = (Basic + Allowances + Overtime) - (Tax + PF + Unpaid Leaves)
```

---

## Accounting

### Implemented Features
- **Chart of Accounts (COA):** Account codes, types (asset/liability/equity/revenue/cogs/expense), running balance
- **Double-Entry Journal:** Balanced entries (∑Debits = ∑Credits), immutability once posted
- **Expenses:** Category, amount, payment method, auto-journal posting
- **Financial Reports:**
  - Trial Balance — Debit/credit equality verification
  - Profit & Loss — Revenue - COGS - Expenses = Net Profit
  - Balance Sheet — Assets = Liabilities + Equity

### Auto-Journal Posting
- Expense vouchers → General Ledger
- Payroll runs → Salary Expense voucher
- Purchase orders → Accounts Payable

---

## CRM / Support / Marketing

### CRM
- **Deals Pipeline:** Kanban board with stages (lead → contacted → proposal_sent → negotiation → won/lost)
- **Deal Value Tracking:** Expected close date, notes, customer link
- **Customer 360:** Aggregates orders, POS transactions, lifetime spend, CRM deals, support tickets

### Support
- **Tickets:** Subject, status (open/in_progress/resolved/closed), priority, assignment
- **Message Threads:** Threaded conversation history per ticket

### Marketing
- **Campaigns:** CRUD with types (discount/flash_sale/banner/announcement), date ranges, product targeting
- **Tracking Pixels:** Feature flags for Meta Pixel, TikTok Pixel, Google Analytics (UI not built)

---

## Website Builder / Storefront

### Builder
- **Section Registry:** 40+ section types (heroes, product grids, testimonials, countdown, etc.)
- **Editor:** Drag-and-drop with properties panel, device preview (mobile/tablet/desktop)
- **Media Integration:** `BuilderMediaField` picks from media library
- **Publish Flow:** Draft → Publish → ISR revalidation for storefront
- **Global Sections:** Reusable across pages

### Storefront
- **ISR Rendering:** 60-second revalidation with on-demand tag revalidation on publish
- **Product Pages:** Dynamic `[slug]` routing, SEO metadata, Open Graph
- **Cart & Checkout:** Session-based, multiple payment methods
- **Customer Account:** Profile, orders, addresses, wishlist, notifications

---

## Performance Architecture

### Rendering Strategy

| Surface | Strategy |
|---------|----------|
| Public Storefront (`/site/[tenant]/*`) | ISR (60s) + on-demand revalidation |
| Store/Workspace/Admin Dashboards | SSR (force-dynamic) |
| Builder, CMS Editor, Media Library | CSR (client components) |
| Auth Flows | SSR layout gates |

### Optimizations
- **Next.js 15 Server Components** — Heavy layout resolution on server
- **Shared Vendor Chunks** — Common modules (Radix UI, Lucide, RTK Query) centralized (~104 kB)
- **Dynamic Header Stabilization** — `ResizeObserver` updates `--store-header-height` CSS variable (CLS < 0.05)
- **MongoDB Compound Indexes** — High-selectivity tenant-scoped indexes
- **Server-Side Aggregations** — Financial/inventory analytics computed on database cluster
- **RTK Query Tag Invalidation** — Granular cache invalidation per module
- **Sharp Image Thumbnails** — Reduced media payload
- **Package Import Optimization** — `optimizePackageImports` for lucide, recharts, framer-motion, sonner, radix UI

### Benchmarks (Verified)

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Storefront Home TTFB | 280ms | 65ms | 76.79% |
| Store Dashboard TTFB | 420ms | 115ms | 72.62% |
| FCP | 1.42s | 0.48s | -66.20% |
| LCP | 2.85s | 0.92s | -67.72% |
| CLS | 0.18 | 0.012 | -93.33% |
| Shared JS | 210 kB | 104 kB | -50.48% |

> Source: `audit/before-after-performance.md`

---

## Database

### MongoDB Collections (Key Models)

| Domain | Collections |
|--------|-------------|
| **Commerce** | `Product`, `ProductVariant`, `Category`, `Brand`, `Collection`, `Order`, `Customer`, `Coupon`, `Review` |
| **Operations** | `PosShift`, `StockLog`, `WasteLog`, `InventoryWarehouse`, `InventorySupplier`, `InventoryPurchaseOrder` |
| **People** | `HrmEmployee`, `HrmDepartment`, `HrmDesignation`, `HrmShift`, `HrmAttendance`, `HrmLeave`, `HrmPayroll` |
| **Finance** | `AccountingAccount`, `AccountingJournalEntry`, `AccountingExpense` |
| **Growth** | `CrmDeal`, `SupportTicket`, `OperationTask` |
| **Marketing** | `Campaign`, `PageView`, `VisitorSession`, `TrafficSource`, `DailyAnalytic`, `MonthlyAnalytic` |
| **Shipping** | `ShippingZone`, `StoreCourier` |
| **Content** | `StorePage`, `PageHistory`, `PageVersion`, `CmsPage`, `Faq`, `Navigation`, `MenuItem`, `BuilderTemplate`, `GlobalSection`, `Template` |
| **Platform** | `Store`, `Tenant`, `User`, `TeamMember`, `StoreMember`, `Subscription`, `StoreSubscription`, `Invoice`, `Plan`, `Feature`, `PlanFeature`, `FeatureTier`, `FeatureLimit`, `FeatureGroup`, `StoreUsage`, `PlatformSettings`, `RefreshToken`, `VerificationToken`, `Notification`, `BillingNotification`, `Contact`, `Newsletter` |

### Indexing Strategy
- Compound multi-tenant indexes: `{ storeId: 1, createdAt: -1 }`
- Unique constraints: `{ storeId, slug }`, `{ storeId, sku }`, `{ storeId, code }`
- TTL indexes: Analytics (90-day), RefreshToken (auto-delete)

---

## API Architecture

### Middleware Pipeline (Global)

```
1. helmet              — Security headers (CSP, etc.)
2. cors                — CORS allow-list + pattern matching
3. express.json        — JSON body parsing (1mb limit)
4. express.urlencoded  — URL-encoded parsing
5. globalRateLimit     — 100 req/min per IP
6. subdomainDetector   — Resolves store slug from Host/x-store-slug
7. pino-http           — Structured logging
8. requestId           — UUID + X-Request-Id header
9. (route-specific)    — Auth, permissions, feature gates
10. notFoundHandler    — 404 fallback
11. errorHandler       — Global error catcher
```

### Rate Limits

| Limit | Window | Max Requests |
|-------|--------|--------------|
| Global | 1 min | 100 |
| Auth | 1 min | 10 |
| Write | 1 min | 30 |
| Sensitive Write | 1 min | 10 |
| Analytics Track | 1 min | 60 |
| Newsletter/Contact | 1 min | 5 |

### API Mount Points

```
/auth  /tenants  /stores  /products  /orders  /cart  /customer
/cms  /builder  /templates  /plans  /subscriptions  /billing
/admin  /public  /features  /audit  /subscription-payments  /invoices
/notifications  /payment-methods  /delivery-zones  /categories
/newsletter  /contact  /wishlist  /pages  /store-pages
/global-sections  /builder-templates  /preview  /navigation
/analytics  /admin/analytics  /reports  /ai  /brands
/locations  /email  /stores (email routes)
/ (team routes — /stores/:storeId/members, /invite/:token)
```

---

## Payments

### Implemented Providers

| Provider | Status | Flow |
|----------|--------|------|
| **SSLCommerz** | 🟢 Sandbox | Initialization → Redirect → Success/Failure/Cancel → IPN → Verification |
| **Stripe** | 🟡 Partial | Provider enum exists, live gateway integration incomplete |
| **Manual Approval** | 🟢 Implemented | Merchant uploads proof → Super-admin approves → Invoice + activation |

### Payment Verification
- SSLCommerz: Backend cryptographic signature verification + server-to-server transaction inquiry
- Manual: Admin review of uploaded payment proof

---

## Courier / Shipping

### Courier Providers (5)

| Provider | Status |
|----------|--------|
| Pathao | 🟢 Implemented |
| RedX | 🟢 Implemented |
| Steadfast | 🟢 Implemented |
| Paperfly | 🟢 Implemented |
| Sundarban | 🟢 Implemented |

### Features
- Provider factory pattern with `ICourierProvider` interface
- Credentials encrypted at rest (AES-GCM)
- Auto-create shipment on order confirm (retry, max 3 attempts)
- Auto-sync tracking via cron (5-min interval)
- Status normalization from provider-specific to canonical statuses
- Order status sync from shipment status
- Audit logging for all mutations

---

## Reporting & Analytics

### Analytics Dashboard
- **Stats:** Today/yesterday/week/month/year visitor metrics
- **Charts:** Daily/monthly/hourly visitor trends
- **Traffic Sources:** Source, type, medium, campaign tracking
- **Devices:** Browser, OS, device breakdown
- **Top Content:** Products, categories, pages, search queries
- **Live Visitors:** Active sessions (5-min window)
- **Conversion Funnel:** Sessions → Product Views → Cart → Checkout → Orders
- **Geographic:** Country and city analytics

### Reports
- **Sales Reports:** Daily/weekly/monthly breakdown, by channel
- **Inventory Reports:** Stock movement audit, valuation, waste summary
- **HR Reports:** Attendance summary, overtime, leaves, payroll disbursement
- **Financial Reports:** Trial Balance, P&L, Balance Sheet
- **Platform Reports:** Revenue, stores, subscriptions, payments (super_admin)

---

## PDF / Print System

### Implemented Documents
- **Invoices:** PDFKit-based with header, FROM/BILL TO, line items, totals, QR code, watermark
- **Payslips:** Generated during payroll runs
- **Reports:** Financial statements (Trial Balance, P&L, Balance Sheet)

### Approach
- PDFKit for PDF generation
- QRCode for invoice verification
- Watermark on every page (PAID/PENDING/FAILED/CANCELLED)
- Inter font family loaded from assets/fonts

---

## Seed / Demo Data

### Seed Commands

```bash
# Full seed (super_admin, demo tenant, templates, products)
pnpm --filter @bornoland/api seed

# Products only (for existing "nayeem" store)
pnpm --filter @bornoland/api seed:products

# Full nayeem store (50 products, 20 customers, 50 orders, 80 reviews)
pnpm --filter @bornoland/api seed:nayeem
```

### What Gets Seeded
- **Super Admin:** From `DEFAULT_SUPER_ADMIN_EMAIL` env (or `admin@bornoland.com`)
- **Demo Tenant:** `demo.bornoland.com` with free plan
- **Demo User:** `demo@bornoland.com` / `Demo@123`
- **10 Templates:** Fashion, Electronics, Furniture, Cosmetic, Minimal, Luxury, Modern, Sneakers, Gadget, Dark
- **50 Products:** With variants (colors, sizes, storage), SKU prefix `NAY-`, idempotent
- **Safe Migration:** Features, plans, plan-features, storage plans, platform settings

### Nayeem Product Seed
- **Target Store:** `6a5737692f76b860979ef38f`
- **Products:** 50 with variants
- **SKU Prefix:** `NAY-`
- **Idempotent:** Skips when 50+ seeded products exist (unless `FORCE_NAYEEM_PRODUCTS=true`)
- **Non-destructive:** Only creates categories + products + variants

---

## Development Setup

### Prerequisites

- **Node.js:** 22 (see `.nvmrc`)
- **pnpm:** 9.12.0
- **MongoDB:** 6+ (or MongoDB Atlas)
- **Redis:** Optional (ioredis with in-memory fallback)

### Installation

```bash
git clone <repository-url>
cd bornoland
pnpm install
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET at minimum
```

### Start Development

```bash
# Start both apps
pnpm dev

# Or individually
pnpm --filter @bornoland/web dev
pnpm --filter @bornoland/api dev
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:4000 |
| API Health | http://localhost:4000/health |
| Storefront | http://{store-slug}.localhost:3000 |

### Database Setup

```bash
# Seed database (creates super_admin, demo tenant, templates, products)
pnpm --filter @bornoland/api seed

# Run safe migration (plans, features, platform settings)
pnpm --filter @bornoland/api migrate
```

---

## Environment Variables

Copy the root template and fill in secrets:

```bash
cp .env.example .env
```

### Core Variables

| Variable | App | Description | Required |
|----------|-----|-------------|----------|
| `MONGODB_URI` | API | MongoDB connection string | Yes |
| `JWT_SECRET` | Both | Session signing secret | Yes (production) |
| `API_URL` | Web (server) | Internal API base URL | Yes |
| `NEXT_PUBLIC_API_URL` | Web (client) | Browser-facing API URL | Yes |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Web | Tenant routing domain | Yes |
| `NEXT_PUBLIC_PROTOCOL` | Web | `http` or `https` | Yes |
| `ROOT_DOMAIN` | API | Subdomain parsing + CORS | Yes |
| `WILDCARD_DOMAIN` | API | Cookie domain in production | Optional |
| `ENCRYPTION_KEY` | API | Data encryption key | Yes |
| `SESSION_COOKIE_NAME` | Both | Default: `bornoland.session` | Optional |
| `STORAGE_PROVIDER` | API | `local` (default) or `s3` | Optional |
| `GOOGLE_CLIENT_ID` | API | Google OAuth | Optional |
| `GOOGLE_CLIENT_SECRET` | API | Google OAuth | Optional |
| `SMTP_HOST` | API | Email server | Optional |
| `STRIPE_SECRET_KEY` | API | Stripe payments | Optional |
| `SSL_COMMERZ_STORE_ID` | API | SSLCommerz (Bangladesh) | Optional |
| `REDIS_URL` | API | Redis cache | Optional |
| `DEFAULT_SUPER_ADMIN_EMAIL` | API | Seed super-admin account | Optional |

### Docker / Production

```bash
cp .env.production.example .env.production
# Edit .env.production with production values
```

In Docker Compose:
- `NEXT_PUBLIC_API_URL=/api` (same-origin, Next.js rewrites to backend)
- `API_URL=http://backend:4000` (container DNS name)
- `MONGODB_URI=mongodb+srv://...` (MongoDB Atlas only)

---

## Build / Test / Lint

### Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all workspace dependencies |
| `pnpm dev` | Start web + API in development |
| `pnpm build` | Production build (all apps via Turbo) |
| `pnpm start` | Start production servers |
| `pnpm lint` | ESLint across apps |
| `pnpm typecheck` | TypeScript check across apps |
| `pnpm format` | Prettier write |
| `pnpm clean` | Remove build artifacts |

### Per-App

```bash
pnpm --filter @bornoland/web build
pnpm --filter @bornoland/web start
pnpm --filter @bornoland/api build
pnpm --filter @bornoland/api start
```

### Build Status

| Component | Command | Result |
|-----------|---------|--------|
| Backend API | `pnpm --filter @bornoland/api build` | ✅ PASS |
| Frontend Web | `pnpm --filter @bornoland/web build` | ✅ PASS (200+ routes) |

---

## Docker / Production

### Docker Compose

```bash
# Build and start
cp .env.production.example .env.production
# Edit .env.production with production values
pnpm docker:build
pnpm docker:up

# Or manually
docker compose --env-file .env.production build
docker compose --env-file .env.production up -d
```

### Services

| Service | Port | Health Check |
|---------|------|--------------|
| `backend` (API) | 4000 | `wget -qO- http://127.0.0.1:4000/health` |
| `frontend` (Web) | 3000 | `wget -qO- http://127.0.0.1:3000/` |

### Production Deployment

| Component | Suggestion |
|-----------|------------|
| Web | Vercel, Railway, or container on port 3000 |
| API | Railway, Fly.io, or container on port 4000 |
| Database | MongoDB Atlas (required for Docker) |
| Media | S3-compatible bucket (`STORAGE_PROVIDER=s3`) |
| DNS | Wildcard `*.bornosoft.site` → web; `api.bornosoft.site` → API |
| Cache | Redis (optional, in-memory fallback available) |

---

## Security

### Implemented Controls

| Control | Implementation |
|---------|---------------|
| **Authentication** | JWT session cookies (httpOnly, secure, SameSite) |
| **Authorization** | 6-tier pipeline: Auth → Tenant → Subscription → Feature → Permission → Resource |
| **Tenant Isolation** | All queries scoped by `storeId` / `tenantId` |
| **Input Validation** | Zod schemas on all API endpoints |
| **NoSQL Injection** | Mongoose schema casting, sanitized ObjectId converters |
| **CSRF Protection** | SameSite cookies, CORS allow-list |
| **CSP** | Helmet Content Security Policy headers |
| **Secure Cookies** | httpOnly, secure (production), SameSite (strict/lax) |
| **Rate Limiting** | 6-tier rate limits (global, auth, write, sensitive, analytics, newsletter) |
| **Payment Verification** | SSLCommerz cryptographic signature + server-to-server inquiry |
| **Audit Logs** | Immutable, actor/store/workspace/action tracking |
| **Sensitive Data Shielding** | Buying prices, supplier costs, salaries hidden from unauthorized roles |
| **Secret Management** | Environment variables, never committed to repo |

### Security Reminders
- Set a strong `JWT_SECRET` in production
- Never commit `.env` files with secrets
- Use MongoDB Atlas with IP allowlisting
- Enable `STORAGE_PROVIDER=s3` for production media
- Rotate `ENCRYPTION_KEY` periodically

---

## Testing

### Test Files (11 total)

| File | Module | Type |
|------|--------|------|
| `apps/api/src/modules/payments/__tests__/sslcommerz-callback-matrix.test.ts` | Payments | Integration |
| `apps/api/src/modules/payments/__tests__/sslcommerz.test.ts` | Payments | Integration |
| `apps/api/src/modules/locations/__tests__/location.test.ts` | Locations | Unit |
| `apps/api/src/modules/customers/__tests__/customer-auth-flow.test.ts` | Customers | Integration |
| `apps/api/src/modules/team/__tests__/modular-rbac-entitlement.test.ts` | RBAC | Integration |
| `apps/api/src/modules/stores/__tests__/tenant-resolver-performance.test.ts` | Tenant | Performance |
| `apps/api/src/modules/stores/__tests__/builder-publish-revalidation.test.ts` | Builder | Integration |
| `apps/api/src/modules/orders/__tests__/order-creation-performance.test.ts` | Orders | Performance |
| `apps/web/src/redux/slices/__tests__/cart-slice.test.ts` | Cart | Unit |
| `apps/web/src/lib/server/__tests__/tenant-metadata.test.ts` | Tenant | Unit |
| `apps/web/src/lib/server/__tests__/tenant-resolver-audit.test.ts` | Tenant | Audit |

### QA Scripts

| Script | Purpose |
|--------|---------|
| `scripts/verify-sidebar-navigation.ts` | 15 tests covering module registry, RBAC, bilingual labels |
| `scripts/qa-hrm-accounting-live.ts` | HRM/accounting live QA |
| `scripts/verify-print-pdf.ts` | Print/PDF verification |
| `scripts/verify-employee-identity-rbac.ts` | Employee identity RBAC verification |

> **Note:** No test framework configuration files found. Tests may use framework defaults.

---

## Documentation Index

### Root-Level Docs

| File | Description |
|------|-------------|
| `README.md` | This file |
| `DESIGN.md` | Design system specification (Nordic Yellow) |
| `ROUTE_AUDIT.md` | Master routing audit — 30+ routes verified |
| `UI_RESPONSIVE_AUDIT.md` | Responsive UI audit — 320px to 2560px |
| `BORNOLAND_SYSTEM_AUDIT.md` | Full system architecture audit |

### `docs/` Directory

| File | Description |
|------|-------------|
| `architecture.md` | System architecture overview |
| `business-flows.md` | Business workflow documentation |
| `data-model.md` | Database schema documentation |
| `identity-access-architecture.md` | Auth/RBAC architecture |
| `module-map.md` | Module inventory map |
| `performance.md` | Performance guidelines |
| `permissions.md` | Permission system documentation |
| `reporting.md` | Reporting features |
| `security.md` | Security documentation |
| `testing.md` | Testing strategy |
| `bornoland-platform-architecture.md` | Platform architecture |
| `bornoland-platform-audit.md` | Platform audit report |
| `bornoland-master-system-report.md` | Master system report (45 sections) |
| `bornoland-system-inventory.json` | Structured system inventory |

### `audit/` Directory

| File | Description |
|------|-------------|
| `BORNOLAND-FULL-AUDIT.md` | Complete codebase audit |
| `before-after-performance.md` | Performance benchmarks |
| `dashboard-before-after.md` | Dashboard redesign |
| `landing-page-before-after.md` | Landing page redesign |
| `hrm-accounting-live-qa-report.md` | HRM/accounting QA |
| `print-pdf-audit.md` | Print/PDF features |
| `member-employee-access-audit.md` | Member/employee access |

### Mobile App

| File | Description |
|------|-------------|
| `mobileapp/README.md` | Mobile app documentation |
| `mobileapp/AGENTS.md` | Agent instructions |
| `mobileapp/docs/` | Screen maps, feature mapping, audits |

---

## Project Status

### Current Status

🟢 **Core platform operational**

| Area | Status |
|------|--------|
| Web build | ✅ Passing (200+ routes) |
| API build | ✅ Passing (45 modules) |
| Route health | ✅ 30+ routes verified healthy |
| Database | ✅ MongoDB + Mongoose |
| Authentication | ✅ JWT + OAuth |
| Commerce | ✅ Products, orders, cart, checkout |
| POS | ✅ Terminal, shifts, reconciliation |
| Inventory | ✅ Stock, warehouses, suppliers, purchasing |
| HRM | ✅ Employees, attendance, leaves, payroll |
| Accounting | ✅ COA, journal, expenses, financial reports |
| CRM | ✅ Deals pipeline |
| Support | ✅ Tickets, message threads |
| Operations | ✅ Tasks, approvals |
| Analytics | ✅ Tracking, dashboard, conversion funnel |
| Builder | ✅ Drag & drop, sections, publish |
| Storefront | ✅ ISR, products, cart, checkout |

### Known Issues

| Issue | Severity | Description |
|-------|----------|-------------|
| Reports UI | Medium | API ready, charts not built |
| Marketing UI | Medium | API ready, campaigns UI incomplete |
| Team Invites | Medium | RBAC works, invite button disabled |
| Custom Domain | Low | Plan flag + resolver hooks, no DNS UI |
| Test Coverage | Medium | Only 11 test files, no framework config |
| Shared Packages | Low | `packages/*` referenced but not present |
| Redis Caching | Low | ioredis in deps, implementation unclear |

### Production Readiness

**Production readiness: pending final verification**

- ✅ Build passes
- ✅ Core modules functional
- ✅ Tenant isolation verified
- ✅ Security controls implemented
- ⚠️ Test coverage minimal
- ⚠️ No CI/CD pipeline (lint + typecheck only)
- ⚠️ Some features partial (reports UI, marketing UI, team invites)

---

## Roadmap

### Current (Implemented)

- Multi-tenant workspace + store model
- Subdomain storefront routing
- Full commerce core (products, variants, orders, cart, checkout)
- POS with shifts and reconciliation
- Inventory with stock ledger, warehouses, suppliers, purchasing
- HRM with employees, attendance, leaves, payroll
- Accounting with COA, journal, expenses, financial reports
- CRM deals pipeline
- Support ticket system
- Operations task management
- Visual page builder with section registry
- CMS + FAQs + media library
- Plans, feature gates, subscription payment approval
- Super-admin platform console
- Enterprise audit log system
- 5 courier integrations (Pathao, RedX, Steadfast, Paperfly, Sundarban)
- Analytics tracking and dashboard
- Email system with SMTP, templates, branding
- In-app notifications
- AI shop builder

### In Progress

- Reports dashboard UI (API ready)
- Marketing campaigns UI (API ready)
- Team member invites
- Custom domain DNS provisioning
- Broader audit instrumentation

### Planned

- Apps / extensions marketplace
- AI-assisted page and product content generation
- Two-factor authentication
- Live Stripe / SSLCommerz checkout integration
- Advanced automation rules
- Multi-vendor marketplace store type
- Shared `packages/ui` and `packages/types` libraries
- GitHub Actions CI/CD (build + test)
- Mobile app (Expo — separate repository)

---

## UX / Design System

### Nordic Yellow Standard

| Element | Value |
|---------|-------|
| **Primary Action** | `#003399` (Blue) |
| **Primary Hover** | `#002B80` |
| **Secondary / Accent** | `#FFDA1A` (Yellow) |
| **Accent Text** | `#111111` (never yellow on white) |
| **Background** | `#F5F5F5` |
| **Surface** | `#FFFFFF` |
| **Border** | `#DFDFDF` |
| **Neutral** | `#767676` |

### Design Tokens

| Token | Value |
|-------|-------|
| Element Radius | 4px |
| Panel Radius | 8px |
| Modal Radius | 12px |
| Touch Target | 44px minimum |
| Elevation Level 1 | `0 1px 3px rgba(17,17,17,0.06)` |
| Elevation Level 3 (Modals) | Stacked shadows |

### Responsive Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Wide | ≥ 1440px | Full layout, 4-up pricing |
| Desktop | 1024–1440px | Default max-width |
| Tablet | 768–1023px | 2-up pricing, hamburger nav |
| Mobile | < 768px | 1-up pricing, collapsed nav |

---

## Contributing

### Guidelines

1. **Branch Naming:** `feat/your-feature`, `fix/bug-description`, `refactor/module-name`
2. **Code Style:** TypeScript strict mode, Prettier formatting
3. **Component Conventions:** Follow existing patterns in `apps/web/src/components/`
4. **API Conventions:** Follow existing patterns in `apps/api/src/modules/`
5. **Tenant Safety:** Always scope queries by `storeId` / `tenantId`
6. **Database Safety:** Use `runSafeMigration()` for schema changes — never overwrite production data
7. **Testing:** Run `pnpm typecheck` and `pnpm lint` before opening a PR
8. **Secrets:** Never commit `.env` files, API keys, or credentials
9. **Documentation:** Update README if adding new modules or significant features

### Before Submitting a PR

```bash
pnpm typecheck    # Ensure no type errors
pnpm lint         # Ensure no lint errors
pnpm build        # Ensure production build passes
```

---

## Non-Negotiable Architecture Rules

1. **Multi-tenant isolation is mandatory** — All database queries must include `storeId` or `tenantId`
2. **Backend authorization is mandatory** — UI visibility is NOT the security boundary
3. **Do not expose buying price publicly** — Internal cost data must be filtered at the serializer level
4. **Do not create duplicate domain systems** — Product is the canonical product entity across POS, storefront, and inventory
5. **Inventory ledger is authoritative** — StockLog model is the source of truth for stock movements
6. **Financial records must remain auditable** — Journal entries are immutable once posted
7. **Do not bypass business services** — Always use service layer, never direct model manipulation
8. **Avoid destructive migrations** — Use `$setOnInsert` patterns, never overwrite production customizations
9. **Do not commit secrets** — Environment variables only, never hardcoded credentials
10. **Preserve existing functionality** — Changes must not break established business flows
11. **Prefer shared components** — Reuse UI primitives from `components/ui/`
12. **Avoid unnecessary client-side rendering** — Use Server Components where possible

---

## License

No `LICENSE` file is present in the repository. Contact the maintainers for licensing terms before redistribution.

---

## Credits

Built by the **Bornosoft** team.

| | |
|---|---|
| **Product** | BornoLand |
| **Stack** | Next.js · Express · MongoDB · TypeScript |
| **Domain** | [bornosoft.site](https://bornosoft.site) |
