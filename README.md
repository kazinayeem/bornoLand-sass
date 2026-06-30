<p align="center">
  <img src="https://img.shields.io/badge/BornoLand-Multi--Tenant%20Commerce-2563eb?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0zIDloMTgiLz48cGF0aCBkPSJNMyAxNWgxOCIvPjxwYXRoIGQ9Ik0zIDNoMTh2MThIM1oiLz48L3N2Zz4=" />
</p>

<h1 align="center">BornoLand</h1>

<p align="center">
  <strong>Multi-tenant ecommerce SaaS — workspaces, stores, visual builder, and storefront in one platform.</strong>
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

**BornoLand** is an open-source, production-oriented commerce platform built for [Bornosoft](https://bornosoft.site). It lets operators run a **multi-tenant SaaS** where each **workspace** (tenant) can create and manage multiple **stores**, each with its own subdomain storefront, admin dashboard, product catalog, orders, CMS, media library, and visual page builder.

The codebase is a **pnpm + Turborepo monorepo** with two deployable applications:

| App | Package | Default port | Responsibility |
|-----|---------|--------------|----------------|
| **Web** | `@bornoland/web` | `3000` | Next.js 15 UI — marketing site, auth, workspace dashboard, store admin, builder, storefront |
| **API** | `@bornoland/api` | `4000` | Express 5 REST API — auth, tenancy, commerce, billing, media, audit logs |

Data is persisted in **MongoDB** via **Mongoose**. The web app talks to the API through **RTK Query** (with cookie-based sessions) and Next.js rewrites for `/api/*`.

---

## Why BornoLand

- **True multi-tenancy** — workspaces, stores, and subdomain storefronts with middleware-based routing.
- **Split frontend/backend** — Next.js optimizes UX, SEO, and ISR; Express owns business logic and scales independently.
- **Plan-driven feature gates** — limits and tiers enforced server-side, not only in the UI.
- **Visual commerce** — drag-and-drop page builder, theme templates, and a full product/order stack.
- **Operations-ready** — super-admin console, subscription billing workflow, storage analytics, and enterprise audit logs.
- **Bangladesh-first payments** — bKash, Nagad, Rocket, bank transfer, and COD alongside Stripe/SSLCommerz provider enums.

---

## Features

### Feature matrix

| Area | Status | Notes |
|------|--------|-------|
| Authentication (email/password) | ✅ | Register, login, logout, forgot/reset password |
| Google OAuth | ✅ | API routes `/auth/google` + callback |
| JWT session cookies | ✅ | `bornoland.session` cookie; middleware verifies with `jose` |
| Multi-tenant workspaces | ✅ | `Tenant` model + workspace dashboard |
| Multi-store per workspace | ✅ | Create, archive, delete, branding, settings |
| Subdomain storefronts | ✅ | `{slug}.localhost:3000` (dev) / `{slug}.bornosoft.site` (prod) |
| Super Admin dashboard | ✅ | Users, stores, plans, payments, analytics, audit center |
| Store dashboard | ✅ | `/store/:storeSlug/*` shell |
| Visual page builder | ✅ | Sections registry, publish, draft, device preview |
| Theme / templates | ✅ | Template model + store theme assignment |
| CMS pages | ✅ | Per-store pages + TipTap rich text editor |
| FAQs | ✅ | CRUD + reorder |
| Media library | ✅ | Upload, folders, rename, replace, usage tracking |
| Storage limits | ✅ | Per-plan quotas; local disk or S3 provider |
| Products | ✅ | CRUD, duplicate, publish, SEO fields |
| Product variants | ✅ | Options, variants, inventory, pricing |
| Categories | ✅ | Store-scoped category tree |
| Inventory | ✅ | Stock tracking API + dashboard tab |
| Orders | ✅ | Store + platform views; status, payment, refunds |
| Cart & checkout | ✅ | Storefront cart; COD + mobile banking methods |
| Customers | ✅ | Store customer records |
| Coupons | ✅ | Feature-gated by plan |
| Reviews | ✅ | API + store module (plan-gated) |
| Collections | ✅ | API module |
| Shipping & delivery zones | ✅ | Zones + shipping rules |
| Tax | ✅ | Tax classes + calculation hooks |
| Subscriptions & plans | ✅ | Free → Enterprise tiers; trial support |
| Feature gates | ✅ | `requireFeatureAccess` middleware + UI gates |
| Subscription payments | ✅ | Manual approval workflow (screenshot/upload) |
| Invoices | ✅ | Generated on payment approval |
| Billing notifications | ✅ | In-app notification model |
| Billing cron | ✅ | Scheduled expiry/trial jobs on API boot |
| Audit logs | ✅ | Immutable logs; admin / workspace / store views |
| Reports API | ✅ | Sales, inventory, coupons, tax, refunds aggregations |
| Reports UI | 🚧 | Shell page; API wired, charts not built |
| Marketing API | ✅ | Campaign CRUD behind feature gate |
| Marketing UI | 🚧 | Shell page; campaigns UI incomplete |
| Team invites | 🚧 | Team page exists; invite button disabled |
| Custom domain | 🚧 | Plan flag + resolver hooks; no DNS provisioning UI |
| Apps marketplace | 📅 | Sidebar link marked Coming Soon |
| AI page generation | 📅 | Not implemented |
| Redis caching | 📅 | `ioredis` in dependencies; not used in code |
| Stripe / SSLCommerz live checkout | 📅 | Provider enums exist; live gateway integration incomplete |
| 2FA | 📅 | Audit action constant only |
| Shared `packages/*` libs | 📅 | Referenced in tsconfig/Dockerfile; directory not present |

**Legend:** ✅ Implemented · 🚧 Partial · 📅 Planned / not started

---

## Screenshots

> Placeholder — add screenshots of the workspace dashboard, store builder, storefront, and super-admin audit center.

```
docs/screenshots/
  workspace-dashboard.png   (TODO)
  store-builder.png         (TODO)
  storefront.png              (TODO)
  admin-audit-center.png      (TODO)
```

---

## Architecture

### High-level diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Browser / Customer                               │
└─────────────────────────────────────────────────────────────────────────┘
         │                                    │
         │  app.bornosoft.site                │  {store}.bornosoft.site
         │  (dashboard, admin, builder)       │  (ISR storefront)
         ▼                                    ▼
┌─────────────────────┐              ┌─────────────────────┐
│   Next.js 15 (web)  │   REST/RTK   │   Next.js middleware │
│   App Router        │◄────────────►│   subdomain rewrite │
│   Redux + RTK Query │   cookies    │   → /site/[tenant] │
└──────────┬──────────┘              └─────────────────────┘
           │ /api/* rewrite
           ▼
┌─────────────────────┐       ┌─────────────────────┐
│  Express 5 (api)    │◄─────►│  MongoDB (Mongoose) │
│  Modular routes     │       │  Tenant-scoped docs │
│  Feature middleware │       └─────────────────────┘
└──────────┬──────────┘
           │ optional
           ▼
┌─────────────────────┐
│  Local disk / S3    │
│  (media uploads)    │
└─────────────────────┘
```

### Rendering strategy (web)

Documented in `apps/web/src/lib/server/rendering-config.ts`:

| Surface | Strategy |
|---------|----------|
| Public storefront (`/site/[tenant]/*`) | **ISR** (`revalidate: 60`) + on-demand tag revalidation |
| Store / workspace / admin dashboards | **SSR** (`force-dynamic`) |
| Builder, CMS editor, media library | **CSR** (client components; heavy editors dynamically loaded) |
| Auth flows | SSR layout gates; post-login `router.push` + `refresh` |

### Multi-tenant routing

1. **Subdomain detection** — `apps/web/src/middleware.ts` uses `extractSubdomainFromHost()` from `lib/urls.ts` (env-driven root domain).
2. **Storefront rewrite** — `nayeem.localhost:3000` → internal route `/site/nayeem/*`.
3. **App route guard** — `/dashboard`, `/store`, `/admin` on a subdomain redirect to the base app origin.
4. **API tenancy** — `subdomainDetector` middleware attaches `req.subdomain`; store-scoped routes use `storeId` path params.

### URL configuration

All public URLs are built from environment variables — never hardcoded:

```ts
// apps/web/src/lib/urls.ts
getStoreUrl("nayeem")   // → http://nayeem.localhost:3000  (development)
getStoreUrl("nayeem")   // → https://nayeem.bornosoft.site (production)
getAdminUrl()           // → https://bornosoft.site/admin
getWorkspaceUrl()       // → https://bornosoft.site/dashboard
```

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Monorepo | pnpm workspaces, Turborepo |
| Language | TypeScript 5.8 |
| Frontend framework | Next.js 15.3 (App Router), React 19 |
| Styling | Tailwind CSS 4, class-variance-authority |
| UI primitives | Radix UI (`@radix-ui/react-slot`), Lucide icons |
| Animation | Framer Motion |
| State (server data) | Redux Toolkit + RTK Query |
| State (builder preview) | Zustand (`editor-store`) |
| Forms | React Hook Form + Zod |
| Rich text | TipTap |
| Drag and drop | `@dnd-kit` |
| Charts | Recharts |
| Toasts | Sonner |
| Backend | Express 5, Zod validation |
| Database | MongoDB + Mongoose 8 |
| Auth | bcryptjs, jsonwebtoken, jose (middleware) |
| Media processing | Sharp, Multer |
| Object storage | Local filesystem (default) or AWS S3 |
| Payments (deps) | Stripe SDK (partial), manual approval flow live |
| Logging | Pino |
| Security headers | Helmet |
| Containerization | Docker (per-app Dockerfiles) |

---

## Monorepo structure

```
bornoland/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router routes
│   │   │   ├── components/     # UI, builder, storefront, admin, workspace
│   │   │   ├── redux/          # RTK Query APIs + slices
│   │   │   ├── lib/            # URLs, sections, server fetch helpers
│   │   │   ├── middleware.ts   # Auth + subdomain routing
│   │   │   ├── providers/      # Tenant, store context
│   │   │   └── stores/         # Zustand (builder editor)
│   │   ├── .env.development
│   │   ├── .env.production
│   │   └── Dockerfile
│   └── api/                    # Express 5 backend
│       ├── src/
│       │   ├── modules/        # Domain modules (see below)
│       │   ├── bootstrap/      # Safe migrations + default seeds
│       │   ├── common/         # Middleware, DB, utils
│       │   └── seed/           # Database seed CLI
│       ├── uploads/            # Local media storage (dev)
│       └── Dockerfile
├── .env.example                # Root environment template
├── package.json                # Root scripts (turbo + concurrently)
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

> **Note:** `packages/ui`, `packages/types`, and `packages/config` are referenced in `tsconfig.base.json` and Dockerfiles but **are not present in the repository**. Shared code currently lives inside each app.

---

## Web application routes

| Route group | Path prefix | Purpose |
|-------------|-------------|---------|
| Marketing | `/` | Landing page |
| Auth | `/login`, `/register`, … | Credentials + OAuth redirect |
| Workspace | `/dashboard/*` | Stores list, billing, team, activity |
| Store admin | `/store/[storeSlug]/*` | Products, orders, CMS, builder, media, … |
| Super Admin | `/admin/dashboard/*` | Platform operations, audit center |
| Storefront | `/site/[tenant]/*` | Public shop (rewritten from subdomain) |
| Storefront (alt) | `/products/[slug]` | Product detail via subdomain host header |

---

## API modules

All modules live under `apps/api/src/modules/`:

| Module | Responsibility |
|--------|----------------|
| `auth` | Register, login, logout, password reset, Google OAuth |
| `workspaces` | Tenant CRUD |
| `stores` | Store lifecycle, branding, settings, sliders, store orders |
| `products` | Products + variants (options, inventory, pricing) |
| `categories` | Category tree |
| `orders` | Order creation and management |
| `cart` / `wishlist` | Session cart and wishlist |
| `customers` | Customer profiles and addresses |
| `coupons` | Discount codes |
| `reviews` | Product reviews |
| `collections` | Product collections |
| `inventory` | Stock operations |
| `cms` | CMS pages, FAQs, public tenant resolution |
| `builder` | Visual builder pages (sections, publish) |
| `themes` | Store templates |
| `media` | Upload, storage quotas, S3/local providers |
| `shipping` / `delivery` / `tax` | Fulfillment configuration |
| `payments` | Store payment methods + subscription payment approval |
| `subscriptions` | Plans, billing, invoices, store subscriptions |
| `plans` | Plan CRUD and pricing |
| `features` | Feature definitions, tiers, limits, plan matrix |
| `marketing` | Campaigns (API) |
| `reports` | Sales/inventory/tax report aggregations |
| `audit` | Immutable audit log recording and queries |
| `settings` | Super-admin routes (analytics, suspend users/stores) |
| `notifications` | Newsletter, contact, billing notifications |

### API mount points (`apps/api/src/app.ts`)

```
/auth  /tenants  /stores  /products  /orders  /cart  /customer
/cms  /builder  /templates  /plans  /subscriptions  /billing
/admin  /public  /features  /audit  /subscription-payments  /invoices
/notifications  /payment-methods  /delivery-zones  /categories
/newsletter  /contact  /wishlist  /pages
```

---

## Authentication

BornoLand uses a **custom JWT session** — not NextAuth.

| Step | Implementation |
|------|----------------|
| Login | `POST /auth/login` → API signs JWT → `bornoland.session` httpOnly cookie |
| Session read (web) | Middleware verifies cookie with `jose` |
| Session read (API) | `requireAuth` reads Bearer token or session cookie |
| Roles | `super_admin`, `owner`, `admin`, `editor`, `analyst`, `viewer` |
| Super Admin gate | `requireRole("super_admin")` on `/admin/*` API routes |
| Google OAuth | `GET /auth/google` → callback sets session cookie |

**Guards (web):** `require-auth`, `require-role`, `require-feature`, `require-subscription`, `require-workspace`, `require-permission` components under `components/guards/`.

---

## Store system

Each **store** belongs to a **tenant** (workspace) and has:

- Unique `slug` and `subdomain`
- Plan assignment (`free`, `starter`, `growth`, `business`, `enterprise`)
- Billing/subscription status (`trial`, `active`, `past_due`, …)
- Branding (logo, favicon, colors) with media library integration
- Store types: `ecommerce`, `portfolio`, `restaurant`, … (`marketplace` type exists but is **disabled**)

**Store lifecycle:** create → trial → subscribe → active → (suspend | archive | delete)

---

## Builder

- **Section registry** — 40+ section types in `apps/web/src/lib/section-registry.ts` (heroes, product grids, testimonials, countdown, etc.)
- **Editor** — `builder-editor.tsx` with properties panel, drag-and-drop sections, device preview (mobile/tablet/desktop)
- **Media integration** — `BuilderMediaField` picks from the media library (stores `mediaId` + URL)
- **API** — `builder` module: save draft, publish page, create/delete pages
- **Revalidation** — publish triggers Next.js cache tag revalidation for the storefront

---

## CMS

- Per-store pages addressed by slug (`/cms/:storeId/pages/:slug`)
- TipTap-based rich text editor (`cms-page-editor.tsx`, `rich-text-editor.tsx`)
- FAQ management with sort order
- Public pages served at `/public/page/:slug` and rendered in storefront via `CmsPageView`

---

## Media library

- Upload to **local disk** (`apps/api/uploads`) or **AWS S3** (`STORAGE_PROVIDER=s3`)
- Image processing with **Sharp** (thumbnails, metadata)
- Reference tracking — knows which products/pages use each file
- Plan-based **storage quotas** enforced in `media-storage.service.ts`
- Super-admin **platform storage** analytics and per-store overrides

---

## Product management

- Full product editor with tabs: general, pricing, inventory, shipping, SEO, advanced
- **Variants** — options (size, color), per-variant price/stock/SKU/images
- **Categories** — hierarchical, store-scoped
- **Publish workflow** — draft/active; ISR revalidation on publish
- Demo product seeding on store creation

---

## Subscription system

| Concept | Model / service |
|---------|-----------------|
| Workspace subscription | `Subscription` (tenant-level, provider enum) |
| Store subscription | `StoreSubscription` + trial fields on `Store` |
| Plans | `Plan` with pricing durations (monthly → lifetime) |
| Payment flow | Merchant uploads proof → super-admin approves → invoice + activation |
| Cron | `billing-cron.service.ts` — trial/expiry processing |
| Notifications | `BillingNotification` model |

---

## Feature gates

Features are defined in the database and assigned per plan via `PlanFeature` + `FeatureTier` + `FeatureLimit`.

- **Server enforcement:** `requireFeatureAccess("cms")` middleware
- **Client enforcement:** `FeatureGate`, `EcommerceModuleShell`, sidebar lock icons
- **Usage counters:** `StoreUsage` tracks products, storage, pages, etc.
- **Defaults:** `apps/api/src/bootstrap/defaults/plan-feature.defaults.ts` (safe migration inserts without overwriting admin edits)

---

## Audit logs

Enterprise-grade immutable audit trail (`apps/api/src/modules/audit/`):

- Records actor, store, workspace, action, module, entity, old/new values, IP, device, session
- **Retention** by plan tier (90d → unlimited)
- **Views:** Super Admin Audit Center, workspace Activity, store Activity
- **Export:** CSV, JSON (+ client-side Excel/PDF)
- Integrated into auth, products, stores, orders, builder, CMS, media, and admin actions

---

## Database design

MongoDB collections (Mongoose models) include:

`User`, `Tenant`, `TeamMember`, `Store`, `Product`, `ProductVariant`, `Category`, `Order`, `Customer`, `Cart`, `Coupon`, `Review`, `Collection`, `Page` (builder), `CmsPage`, `Faq`, `MediaFile`, `StorageUsage`, `Plan`, `Feature`, `PlanFeature`, `StoreSubscription`, `Subscription`, `SubscriptionPayment`, `Invoice`, `AuditLog`, `Template`, `PlatformSettings`, and more.

**Conventions:**

- `tenantId` on workspace-scoped documents
- `storeId` on commerce documents
- Soft status fields (`active`, `suspended`, `archived`, …)
- Safe bootstrap via `runSafeMigration()` — inserts defaults with `$setOnInsert`, never overwrites production customizations

---

## State management

| Concern | Tool |
|---------|------|
| API data fetching/caching | RTK Query (`baseApi` + 20+ injected endpoints) |
| Auth session | `auth-slice` + cookie |
| Current store context | `current-store-slice` + `StoreProvider` |
| Cart / wishlist | Redux slices (persisted per session) |
| Builder canvas state | `builder-slice`, `preview-slice` |
| Builder editor UI | Zustand `editor-store` |
| UI chrome | `ui-slice` (sidebar collapse, mobile nav) |

---

## Environment variables

Copy the root template and fill in secrets:

```bash
cp .env.example .env
```

### Core variables

| Variable | App | Description |
|----------|-----|-------------|
| `MONGODB_URI` | API | MongoDB connection string |
| `JWT_SECRET` | Both | Session signing secret (**required in production**) |
| `API_URL` | Web (server) | Internal API base URL |
| `NEXT_PUBLIC_API_URL` | Web (client) | Browser-facing API URL |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Web | `localhost:3000` or `bornosoft.site` |
| `NEXT_PUBLIC_PROTOCOL` | Web | `http` or `https` |
| `ROOT_DOMAIN` | API | Subdomain parsing + CORS patterns |
| `WEB_URL` / `APP_URL` | API | Redirect targets (OAuth, emails) |
| `SESSION_COOKIE_NAME` | Both | Default: `bornoland.session` |
| `WILDCARD_DOMAIN` | API | Cookie domain in production (e.g. `.bornosoft.site`) |
| `STORAGE_PROVIDER` | API | `local` (default) or `s3` |
| `AWS_S3_BUCKET` | API | Required when `STORAGE_PROVIDER=s3` |
| `GOOGLE_CLIENT_ID/SECRET` | API | Google OAuth |
| `SMTP_*` / `EMAIL_FROM` | API | Transactional email |
| `STRIPE_SECRET_KEY` | API | Stripe (not fully wired) |
| `DEFAULT_SUPER_ADMIN_EMAIL` | API | Seed super-admin account |

### Per-app env files

| File | Loaded when |
|------|-------------|
| `apps/web/.env.development` | `next dev` |
| `apps/web/.env.production` | `next build` / `next start` |
| `.env` (repo root) | API via `dotenv` + shared secrets |

---

## Installation

**Prerequisites:** Node.js 20+, pnpm 9+, MongoDB 6+

```bash
git clone <repository-url>
cd bornoland
pnpm install
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET at minimum
```

---

## Local development

Start **both** apps with one command:

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:4000 |
| API health | http://localhost:4000/health |
| Storefront example | http://{store-slug}.localhost:3000 |

Run individually:

```bash
pnpm --filter @bornoland/web dev
pnpm --filter @bornoland/api dev
```

### Database seed

```bash
pnpm --filter @bornoland/api seed
```

Creates default plans/features, a super-admin (from env), and a demo tenant/user when missing.

### Safe migration (plans, features, platform settings)

```bash
pnpm --filter @bornoland/api migrate
```

---

## Production build

```bash
pnpm build      # turbo run build (web + api)
pnpm start      # concurrently starts both production servers
```

Per-app:

```bash
pnpm --filter @bornoland/web build
pnpm --filter @bornoland/web start

pnpm --filter @bornoland/api build
pnpm --filter @bornoland/api start
```

Set production environment variables (see `.env.example` comments and `apps/web/.env.production`).

---

## Docker

Dockerfiles exist for each app:

```bash
# API
docker build -f apps/api/Dockerfile -t bornoland-api .
docker run -p 4000:4000 --env-file .env bornoland-api

# Web
docker build -f apps/web/Dockerfile -t bornoland-web .
docker run -p 3000:3000 --env-file .env bornoland-web
```

> Docker build stages reference `packages/*` paths that are not in the repo. You may need to adjust Dockerfiles or add shared packages before CI/CD image builds succeed.

There is **no `docker-compose.yml`** in the repository today.

---

## Deployment

Typical production layout:

| Component | Suggestion |
|-----------|------------|
| Web | Vercel, Railway, or container on port 3000 |
| API | Railway, Fly.io, or container on port 4000 |
| Database | MongoDB Atlas |
| Media | S3-compatible bucket (`STORAGE_PROVIDER=s3`) |
| DNS | Wildcard `*.bornosoft.site` → web; `api.bornosoft.site` → API |

Configure:

```env
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ROOT_DOMAIN=bornosoft.site
NEXT_PUBLIC_PROTOCOL=https
WEB_URL=https://bornosoft.site
API_URL=https://api.bornosoft.site
ROOT_DOMAIN=bornosoft.site
WILDCARD_DOMAIN=.bornosoft.site
```

---

## Running with Turbo

```bash
pnpm build       # turbo run build
pnpm lint        # turbo run lint
pnpm typecheck   # turbo run typecheck
pnpm clean       # turbo run clean
```

`turbo.json` caches build outputs (`.next/`, `dist/`). Dev tasks are marked `persistent` and skip cache.

---

## Commands reference

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all workspace dependencies |
| `pnpm dev` | Start web + API in development |
| `pnpm build` | Production build (all apps) |
| `pnpm start` | Start production servers |
| `pnpm lint` | ESLint across apps |
| `pnpm typecheck` | TypeScript check across apps |
| `pnpm format` | Prettier write |
| `pnpm clean` | Remove build artifacts |
| `pnpm --filter @bornoland/api seed` | Seed database |
| `pnpm --filter @bornoland/api migrate` | Run safe platform migration |

---

## Security

- **httpOnly** session cookies; `secure` in production
- **Helmet** security headers on API
- **CORS** allowlist + subdomain regex patterns
- **Role-based** API middleware (`requireAuth`, `requireRole`)
- **Feature gates** prevent bypassing plan limits server-side
- **Audit logs** are immutable from store-owner APIs
- **Tenant isolation** — queries scoped by `storeId` / `tenantId`
- **Media path validation** — resolved paths must stay inside upload root
- Set a strong `JWT_SECRET` and never commit `.env` files

---

## Performance

- Storefront **ISR** (60s) with on-demand revalidation on publish
- `unstable_cache` + React `cache()` for server-side store/tenant fetches
- RTK Query tag invalidation minimizes redundant API calls
- Sharp image thumbnails reduce media payload
- MongoDB indexes on audit logs, stores, products (by slug, tenant, store)

---

## SEO

- Per-route `generateMetadata` helpers (`lib/server/page-metadata.ts`)
- Canonical URLs via `getAppOrigin()` / `getTenantCanonicalUrl()`
- `robots.ts` and `sitemap.ts` generated from env-driven origins
- Storefront product pages support Open Graph images
- Store-level SEO settings in appearance → SEO

---

## Roadmap

### Completed

- Multi-tenant workspace + store model
- Subdomain storefront routing
- Full commerce core (products, variants, orders, cart, checkout)
- Visual page builder with section registry
- CMS + FAQs + media library
- Plans, feature gates, subscription payment approval
- Super-admin platform console
- Enterprise audit log system
- Environment-driven URL utilities
- ISR/SSR rendering split

### In progress

- Reports dashboard UI (API ready)
- Marketing campaigns UI (API ready)
- Team member invites
- Custom domain DNS provisioning
- Broader audit instrumentation (coupons, subscriptions, team)

### Planned

- Live Stripe / SSLCommerz checkout integration
- Redis caching and rate limiting
- AI-assisted page and product content generation
- Apps / extensions marketplace
- Multi-vendor marketplace store type
- Two-factor authentication
- `docker-compose` for local full stack
- Shared `packages/ui` and `packages/types` libraries
- GitHub Actions CI/CD workflows

---

## Contributing

Contributions are welcome. Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Run `pnpm typecheck` and `pnpm lint` before opening a PR
4. Keep changes scoped — match existing module patterns under `apps/api/src/modules/` and `apps/web/src/`

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
