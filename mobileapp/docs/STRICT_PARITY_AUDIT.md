# Strict mobile parity audit

This is the controlling checklist for the Bornoland mobile application. A feature is not complete unless all eight checks pass against the production website source:

| Check | Required evidence |
|---|---|
| Same UI | Screen, actions, modal/drawer states, responsive content hierarchy |
| Same API | Same route, method, payload, headers, response envelope, invalidation |
| Same validation | Web and backend field rules, limits, enum values, cross-field checks |
| Same permission | Authentication, role, tenant/store access, plan feature, usage limit |
| Same business logic | Status transitions, totals, quotas, side effects, audit behavior |
| Same navigation | Entry points, protected paths, redirects, back/deep-link behavior |
| Same loading state | Initial, refresh, mutation, upload/progress, pagination states |
| Same error state | API message, field error, conflicts, not-found, offline/retry states |

Status values are `NOT STARTED`, `PARTIAL`, `BLOCKED BY WEBSITE`, or `VERIFIED`. Placeholder rendering and static example data can never be `VERIFIED`.

## Source inventory

- 124 Next.js pages and 67 layouts.
- 289 shared web components.
- 33 RTK Query API modules.
- 68 backend route/router files with more than 350 handlers.
- Four protected application surfaces: workspace owner, store merchant, customer storefront, and super-admin.
- Three unauthenticated surfaces: marketing, workspace authentication, and invoice verification.

## Web route inventory

### Authentication and public platform

- `/`, `/login`, `/register`, `/forgot-password`, `/reset-password/[token]`, `/verify-email/[token]`, `/unauthorized`.
- `/admin/login`, `/invoices/verify/[token]`, `/products/[slug]`.

### Workspace owner

- `/dashboard`, `/dashboard/account`, `/dashboard/security`, `/dashboard/activity`, `/dashboard/notifications`.
- `/dashboard/stores`, `/dashboard/stores/create`, `/dashboard/create-store`, `/dashboard/stores/archived`, `/dashboard/stores/[storeId]`, `/dashboard/stores/[storeId]/products`.
- `/dashboard/products`, `/dashboard/categories`, `/dashboard/orders`, `/dashboard/theme`.
- `/dashboard/settings`, `/dashboard/settings/delivery`, `/dashboard/settings/payment`.
- `/dashboard/billing`, `/dashboard/subscription`, `/dashboard/team`, `/dashboard/help`.
- `/dashboard/analytics/visitors`, `/dashboard/analytics/live`, `/dashboard/analytics/sources`, `/dashboard/analytics/reports`.
- `/dashboard/cms`, `/dashboard/cms/faqs`, `/dashboard/cms/[slug]`.
- `/dashboard/builder/[storeId]`, `/dashboard/builder/[storeId]/[pageParam]`.

### Store merchant

- `/store/[storeSlug]/dashboard`, `/products`, `/products/new`, `/products/[productId]/edit`, `/products/[productId]/duplicate`.
- `/categories`, `/inventory`, `/orders`, `/customers`, `/reviews`, `/coupons`.
- `/cms`, `/cms/faqs`, `/cms/[slug]`, `/pages`, `/media`.
- `/builder`, `/builder/[pageSlug]`, `/theme`, `/appearance/theme`, `/appearance/branding`, `/appearance/domain`, `/appearance/seo`.
- `/analytics`, `/analytics/visitors`, `/analytics/live`, `/analytics/traffic-sources`, `/analytics/devices`, `/analytics/browsers`, `/analytics/countries`, `/analytics/cities`, `/analytics/pages`, `/analytics/referrers`, `/analytics/campaigns`, `/analytics/conversion`, `/analytics/reports`.
- `/reports`, `/marketing`, `/apps`, `/settings`, `/activity`, `/billing`, `/billing/payment-gateway-mock`.
- `/store/[storeSlug]`, `/store/[storeSlug]/[pageSlug]` storefront renderer entries.

### Customer storefront

- `/site/[tenant]`, `/shop`, `/categories`, `/category/[slug]`, `/products/[slug]`.
- `/cart`, `/checkout`, `/orders`, `/orders/[id]`.
- `/account`, `/account/login`, `/account/register`.
- `/about`, `/contact`, `/faq`, `/privacy`, `/returns`, `/shipping`, `/size-guide`, `/terms`.

### Super-admin

- `/admin/dashboard`, `/analytics`, `/audit-center`, `/features`, `/invoices`, `/orders`, `/payments`.
- `/plans`, `/plans/[planId]`, `/platform`, `/products`, `/settings`, `/storage`, `/stores`.
- `/subscriptions`, `/templates`, `/users`, `/workspaces`.

## Client API operation inventory

| Domain | Operations used by website |
|---|---|
| Auth | register, login, forgot/reset password, verify email, me, refresh, logout, Google OAuth |
| Profile/security | get/update profile, avatar upload/remove, change password, sessions, logout current/all sessions, activity pagination |
| Stores | create/read/update/delete, slug lookup, branding, logo/favicon removal, theme apply, settings, homepage sliders |
| Products | list/read/create/update/delete/duplicate; variant create/update/delete/sync/generate/bulk |
| Categories | list/read/create/update/delete/reorder |
| Collections | list/create/update/delete |
| Inventory | list/stats/analytics/history/adjust/bulk update/archive/delete |
| Orders | customer create/list/read; merchant list/read/status/payment-status/note/refund |
| Coupons | list/read/create/update/delete |
| Reviews | list/read/update/delete/moderate/reply according to store review routes |
| CMS | pages list/read/update; FAQ list/create/update/delete/reorder |
| Store pages | list/search/read/create/update/delete/duplicate/publish/unpublish/schedule/archive/restore/rename/draft/reorder/type/system/history/version restore/preview/export/import/trash restore |
| Builder | pages/read/home/save/update/publish/create/duplicate/rename/archive/restore/reset/delete/clear |
| Builder templates | list/read/create/from-page/update/delete/publish/duplicate/export/seed/import |
| Global sections | list/read/create/update/delete/publish/attach/detach/page usage |
| Navigation | menus/read/update, item CRUD/reorder, available pages, usage, header/footer settings |
| Media | list/detail/stats/usage/upload/import URL/rename/delete/bulk delete/replace/download |
| Themes | list/admin list/read/create/update/delete/apply |
| Analytics | stats/charts/sources/devices/top content/live/cities/conversion/aggregation and admin analytics |
| Reports | dashboard/revenue/orders/customers/products/categories/coupons/media/period summary |
| Checkout config | delivery-zone CRUD, payment-method CRUD, shipping-zone CRUD, tax-class CRUD |
| Notifications | list/count/read/read-all/delete/clear; contact and newsletter submission |
| Billing | plan pricing/checkout/callback, subscription, usage, invoices, subscription payment submission/review, platform payment methods |
| Audit | workspace/store/admin list and export; admin purge |
| Admin | platform analytics/finance/reports, store/user CRUD and status, plan/trial/subscription/overrides, storage, features, plans, templates, invoices, payments |

## Modal, drawer, dialog, and editor inventory

- Store management: store detail drawer, delete-store confirmation, archived/restore actions.
- Admin stores: detail drawer with overview, analytics, features, limits, media, plan, storage, subscription, trial, users, and destructive-action tabs.
- Products: general, media, inventory, shipping, SEO, advanced, variant, and action-bar editors; duplicate route.
- Builder: command palette, section library modal, section/repeater editor, properties panel, layers, floating section toolbar, clear/reset confirmations, page settings drawer, and navigation-conflict dialog.
- Media: picker, gallery picker, details modal, preview/lightbox, upload queue, delete/force-delete confirmation, and replacement selection.
- Storefront: cart drawer and product quick-view modal.
- Billing: subscription renewal modal and payment-gateway callback state.
- Shared: confirm dialog, modal, drawer, pagination, skeleton, empty state, toast, and form error feedback.

## Permission and business-rule inventory

- `requireAuth` protects workspace, merchant, billing, profile, pages, builder, media, catalog, and admin APIs.
- `requireRole("super_admin")` protects admin analytics, platform management, subscription review, feature catalog, and invoice administration.
- Store membership is enforced by store-access and tenant-scope middleware, not merely by hiding navigation.
- `requireFeatureAccess` gates categories, collections, products, product variants, inventory, coupons, media, shipping, marketing, navigation, page builder, and builder template limits.
- Feature access can be enabled, locked, coming soon, or limited by plan usage. Mobile must fetch `/features/stores/:storeId/access` before enabling mutations.
- Order fulfilment and payment status are independent. Refunds and notes are distinct mutations.
- Product validation includes five product types, scheduled state, SEO, digital assets, media IDs/URLs, related/upsell/cross-sell, shipping data, tags/brand/vendor/barcode, options, variants, and inventory rules.
- Builder history captures all body/header/footer section mutations. Undo/redo uses global snapshots, not server history alone.
- Media deletion checks references and requires explicit force behavior. Uploads respect feature access, storage suspension, file constraints, concurrency, cancellation, retry, and progress.
- Page lifecycle includes draft, published, scheduled, archived, soft-deleted, versioned, preview-token, import/export, and navigation-conflict behavior.

## Requested modules not implemented by the production website

These names exist only as plan limits/feature toggles or marketing copy; there is no production page plus CRUD API to reproduce. Building mobile-only behavior would violate the instruction to preserve website business logic and never invent APIs.

| Requested module | Production evidence | Audit status |
|---|---|---|
| OTP login | `otpLogin` plan toggle only; no auth route/controller | BLOCKED BY WEBSITE |
| Brands CRUD | Product `brand` string and plan limit only | BLOCKED BY WEBSITE |
| Blog/articles/tags CRUD | Plan flags/limits only; no routes/models/pages | BLOCKED BY WEBSITE |
| Form builder | Plan `forms` limit; only public contact submission exists | BLOCKED BY WEBSITE |
| Staff/roles/permissions CRUD | TeamMember model and static team page; no client/API CRUD | BLOCKED BY WEBSITE |
| Integrations marketplace | Coming-soon Apps page and feature flags only | BLOCKED BY WEBSITE |
| API key management | Plan limit/display metadata only | BLOCKED BY WEBSITE |
| Outbound webhooks | Billing webhook receiver only; no merchant CRUD | BLOCKED BY WEBSITE |
| Custom-domain management | Coming-soon domain page and feature flag only | BLOCKED BY WEBSITE |
| Support chat/live chat | Feature flag only | BLOCKED BY WEBSITE |
| AI content tools | Feature flag only | BLOCKED BY WEBSITE |
| Full multi-language content | Store language/locale settings only | BLOCKED BY WEBSITE |

## Current mobile gap report

No existing mobile domain is yet `VERIFIED` against all eight checks.

- `ModuleScreen` remains a temporary generic reader for unfinished domains, but no longer fabricates records or exposes inert actions. It must still be removed domain by domain.
- Dashboard and analytics charts now derive from the production API responses; native runtime comparison is still required before verification.
- Account details and security/session management now use the production profile routes. Category create and other incomplete CRUD workflows still need domain screens.
- Product editing covers only a small subset of the production product schema.
- Order detail lacks payment mutation, notes, refund, and server pagination/filter parity.
- Customers are derived from orders instead of the website's actual data/report behavior.
- Coupon CRUD now covers the production schema, feature gate, validation, loading, errors, and navigation; runtime API verification is pending.
- Media now has a dedicated production-API screen for folders, upload queue, URL import, search/filter/sort/pagination, grid/list selection, preview/details, rename, replace, copy/download, usage-aware delete, and bulk delete. Native picker packages are declared but could not be downloaded in the restricted environment, so the row remains partial.
- Builder, CMS, pages, navigation, billing, audit, notifications, reports, checkout configuration, and most admin screens are not implemented as complete feature screens.
- Customer storefront authentication, cart, wishlist, checkout, order history, and content routes are absent.
- Permission and feature-limit gates are not yet applied to every mobile action.

## Verification matrix

| Feature group | UI | API | Validation | Permission | Logic | Navigation | Loading | Error | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Workspace auth/session/demo login | ◐ | ✅ | ◐ | ✅ | ✅ | ✅ | ✅ | ✅ | PARTIAL |
| Profile/security/activity/notifications | ❌ | ◐ | ❌ | ◐ | ❌ | ◐ | ◐ | ◐ | PARTIAL |
| Store management/settings/branding | ❌ | ◐ | ❌ | ❌ | ❌ | ◐ | ◐ | ◐ | PARTIAL |
| Products/variants | ❌ | ◐ | ❌ | ❌ | ❌ | ◐ | ◐ | ◐ | PARTIAL |
| Categories/collections/inventory | ❌ | ◐ | ❌ | ❌ | ❌ | ◐ | ◐ | ◐ | PARTIAL |
| Merchant orders/customers/reviews | ❌ | ◐ | ❌ | ❌ | ❌ | ◐ | ◐ | ◐ | PARTIAL |
| Coupons | ◐ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PARTIAL |
| Shipping/taxes/payments | ❌ | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ | ❌ | NOT STARTED |
| CMS/pages/navigation | ❌ | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ | ❌ | NOT STARTED |
| Builder/templates/global sections | ❌ | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ | ❌ | NOT STARTED |
| Media/storage/upload manager | ◐ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PARTIAL |
| Analytics/reports/audit | ❌ | ◐ | n/a | ❌ | ❌ | ◐ | ◐ | ◐ | PARTIAL |
| Billing/subscriptions/invoices | ❌ | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ | ❌ | NOT STARTED |
| Customer storefront/cart/wishlist/checkout | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | NOT STARTED |
| Super-admin suite | ❌ | ◐ | ❌ | ✅ | ❌ | ◐ | ◐ | ◐ | PARTIAL |

`✅` means source-equivalent, `◐` means partial, and `❌` means missing. Rows are promoted to `VERIFIED` only after native runtime testing against the production-compatible API.
