# Website audit

Audit source: `apps/web/src`, `apps/api/src`, and the supplied product screenshots. This inventory separates the three website surfaces because they have different users and permissions.

## Surface inventory

### Marketing and account acquisition

- Landing page: hero, trust bar, features, builder preview, product management, analytics, growth sections, integrations, testimonials, pricing, FAQ, CTA, header, and footer.
- Workspace auth: login, register, forgot password, reset password, email verification, unauthorized state, and Google OAuth start/callback.
- Admin auth uses a distinct login type and role boundary.

### Merchant workspace

- Workspace dashboard: account, security, stores, archived stores, create store, activity, notifications, billing, subscription, help, team, and global analytics.
- Store workspace: dashboard, products, product create/edit/duplicate, categories, inventory, orders, customers, reviews, coupons, CMS pages/FAQ, page management, media, builder, theme, marketing, apps, analytics and reports, branding, domain, SEO, settings, activity, and billing.
- Store shell behavior: store identity/status/plan, trial banner, storage usage, feature locks, collapsed desktop sidebar, mobile drawer, error state, loading state, and store-not-found state.
- Analytics routes: overview, visitors, live visitors, traffic sources, devices, browsers, countries, cities, pages, referrers, campaigns, conversion, and reports.
- Builder routes: page selection, section library, layers, templates, theme, products/media panels, properties, responsive preview, save/publish, clear/reset, duplication, archive/restore, import/export, and history/version restore.

### Customer storefront

- Tenant home and custom page rendering.
- Shop, categories, category detail, product detail, product variants, reviews, wishlist, and search/filter/sort.
- Cart, checkout, delivery zone, payment method, order creation, orders list/detail, account login/register.
- Informational content: about, contact, FAQ, privacy, returns, shipping, size guide, and terms.

### Platform administration

- Platform overview, analytics, stores and store detail drawer, users, workspaces, products, orders, payments, subscriptions, invoices, plans and feature matrix, templates, storage, audit center, and settings.
- Privileged actions: activate/suspend/delete, plan override, trial/subscription mutation, usage resets/recalculation, storage cleanup, payment review, invoice status/token/email, and platform payment configuration.

## Shared component inventory

- Navigation: store/workspace/admin shells, sidebars, tabs, breadcrumbs, mobile drawers, protected route/session boundaries, role/plan/feature/permission/subscription/store/workspace guards.
- Feedback: loaders, skeleton grids, trial/plan/coming-soon banners, status badges, toasts, confirmation dialogs, empty/error/not-found states.
- Data display: cards, tables, pagination, search, filters, date ranges, stat cards, charts, usage meters, media grids, order/customer/product detail panels.
- Forms: text/password/rich text, selects, switches, media picker/upload, product option/variant editor, category editor, delivery/payment configuration, brand/theme controls, and plan builder.
- Builder: command palette, toolbar, sidebar, layers, section library, section/repeater editors, media/page/product/template/theme panels, and page preview.

## Navigation and permissions

- Workspace and store routes require an active user session. The API accepts a bearer access token and also supports refresh/session cookies.
- Store access resolves by slug, then validates membership/ownership. Feature navigation is controlled by plan feature access and can be locked or marked coming soon.
- Admin routes require admin login/role. Customer routes use a separate customer token and store/tenant context.
- Deep link candidates include password reset, email verification, invoice verification, store/product/page URLs, and order detail.
- Back behavior must preserve form state and guard unsaved builder/editor work.

## State transitions and feedback

- Auth: bootstrapping → unauthenticated/authenticated; login/register loading → success/error; access expiry → refresh or logout.
- Lists: initial skeleton → content/empty/error; filters/search/pagination → refetch; mutation → optimistic or invalidated refetch.
- Stores: trial/active/past due/cancelled/paused; publish state and new-order allowance are distinct.
- Products: draft/active/inactive/archived; simple/variable/digital/service/downloadable; variant active/draft/out-of-stock/archived/hidden.
- Orders: pending → processing → shipped → delivered, with cancellation/refund paths; payment status changes independently.
- Pages/content: draft/published/scheduled/archived/deleted, with version history and restore.
- Media: upload/import → processing/ready/error; delete may be blocked by usage unless forced.
- Offline/mobile: cached reads may remain visible; writes must fail explicitly and never silently queue payment, inventory, or order-status changes.

## API inventory by domain

| Domain | Main routes | Auth | Mobile strategy |
|---|---|---|---|
| Auth/profile | `/auth/*`, `/profile/*` | Mixed | Bearer token, refresh/session bootstrap, secure persistence |
| Stores | `/stores/*`, branding, settings, sliders | User | Cache current store; invalidate on mutation |
| Catalog | `/products/*`, `/categories/*`, collections | Store member | Paginated/cached lists; explicit mutation feedback |
| Inventory | `/stores/:id/inventory/*` | Store member + feature | Never queue offline stock writes |
| Orders | `/stores/:id/orders/*`, `/orders/*` | Merchant/customer | Separate merchant and customer flows |
| Customers | `/customer/*` plus order customer data | Customer/merchant | Separate customer credential scope |
| Promotions | coupons, reviews, marketing | Store member + feature | Plan gate and coming-soon states |
| Content | `/cms/*`, `/store-pages/*`, `/builder/*`, `/global-sections/*`, `/navigation/*` | Store member + feature | Draft-safe editing and publish confirmation |
| Media | `/stores/:id/media/*` | Store member + quota | Native picker/upload, progress, usage checks |
| Analytics/reports | `/analytics/*`, `/reports/*` | Store member + feature | Time-based cache and pull-to-refresh |
| Checkout setup | payment methods, delivery zones, shipping, tax | Store member | Validate active/default configuration |
| Billing | plans, subscriptions, invoices, subscription payments, notifications | User/admin | No optimistic payment state |
| Admin | `/admin/*`, storage, feature catalog, audit | Admin | Role-isolated navigation and destructive confirms |

Every JSON request carries `Content-Type: application/json`; authenticated mobile requests send `Authorization: Bearer <access token>` and `x-app-source: bornoland-mobile`. The web API timeout is 15 seconds and the mobile client matches it. HTTP and API-envelope failures are surfaced through one error type.

## Visual language

- Website base: white surfaces over `#f8f9fb`, fine neutral borders, blue/indigo feature color, black store/admin emphasis, compact status pills, 12–18px radii, restrained shadows.
- Mobile adaptation: 44–50px touch targets, bottom tabs for frequent destinations, grouped More menu, vertical cards instead of wide tables, native keyboard handling, pull-to-refresh, and persistent context in the header.
- Supplied screenshots confirm Bornoland blue branding, dashboard metric cards, merchant sidebar hierarchy, CMS content cards, and a light editorial storefront.

## Current mobile delivery boundary

This implementation targets the merchant workspace—the operational surface represented by the dashboard screenshots and store sidebar. Customer storefront and platform-admin interfaces remain web surfaces; their routes and contracts are audited above so they can be added as separately permissioned mobile route groups without mixing credentials or navigation.
