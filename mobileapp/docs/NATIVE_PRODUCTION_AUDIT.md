# Native production-readiness audit

This report supplements `STRICT_PARITY_AUDIT.md`. It compares the production Next.js application, backend routes, and the Expo SDK 57 application. A row is only complete when UI, API, validation, permissions, business logic, navigation, loading, empty, success, and error behavior have been verified on iOS and Android.

Status legend: ✅ implemented, ⚠ partial, ❌ missing, ⛔ unavailable in the production website/backend.

## Executive result

- Web baseline: 124 pages, 67 layouts, 289 shared components, 33 client API modules, 68 backend route files, and more than 350 handlers.
- Mobile baseline: 18 rendered screen families, a manual stack/tab navigator, one global application context, a shared API client, secure authentication storage, and a small shared UI system.
- Production conclusion: the mobile application is not yet a complete replacement for the website. Authentication, workspace/store entry, dashboard basics, billing reads, coupon CRUD, media management, profile/security, catalog reads, and order basics exist. Builder, complete catalog/order CRUD, CMS/pages, customer storefront, checkout, notifications/audit, reports, configuration CRUD, and the super-admin suite remain incomplete.
- Data integrity: mobile contains no mock API, fabricated dashboard dataset, or alternate authentication business logic.

## Phase 1 — feature parity matrix

| Feature | Web location | Mobile location | Status | Missing UI | Missing API/logic/validation | Priority |
|---|---|---|---|---|---|---|
| Login, register, forgot password | `/login`, `/register`, `/forgot-password` | `AuthScreen` | ⚠ | Reset-password and verify-email token screens | Token-route navigation and complete web validation comparison | P0 |
| Demo user/admin login | Web login form | `AuthScreen` | ✅ source parity | Native runtime comparison | Live backend E2E confirmation | P0 |
| Workspace dashboard | `/dashboard` | `DashboardScreen` workspace state | ⚠ | Some web cards/actions remain compacted | Storage summary and team action | P1 |
| Multi-store selection | `/dashboard/stores` | `StoresScreen` | ⚠ | Detail drawer, archived stores, delete/restore | Store update/delete/archive/restore APIs and validators | P0 |
| Store creation | `/dashboard/stores/create` | `StoresScreen` create state | ⚠ | Full plan/category/onboarding workflow | Complete create schema and server field errors | P0 |
| Store dashboard | `/store/[slug]/dashboard` | `DashboardScreen` store state | ⚠ | Subscription health, storage and richer quick actions | Full dashboard/report response parity | P1 |
| Account/profile | `/dashboard/account` | `AccountDetailsScreen` | ⚠ | Avatar upload/remove | Avatar multipart API and response refresh | P1 |
| Security/sessions | `/dashboard/security` | `SecurityScreen` | ⚠ | Individual-session revoke if supported | Runtime session revocation verification | P1 |
| Activity/audit | workspace/store activity routes | generic `ModuleScreen` | ❌ | Filters, pagination, export, details | Audit query/export routes, permissions, errors | P1 |
| Notifications | `/dashboard/notifications` | generic `ModuleScreen` | ❌ | Unread states, actions, delete/clear | Count/read/read-all/delete/clear mutations | P1 |
| Products | store product routes | `ProductsScreen`, `ProductFormScreen` | ⚠ | Most editor tabs, bulk actions, duplicate | Full product schema, scheduled/digital/relations validation | P0 |
| Product variants | product editor variant tabs | absent | ❌ | Options, variants, images, generation/sync | Variant CRUD/generate/bulk routes and plan limits | P0 |
| Categories | `/categories` | `CategoriesScreen` | ⚠ | Create/edit/delete/reorder | CRUD validation, media selection, feature limits | P0 |
| Collections | website collection APIs | absent | ❌ | Entire native module | Collection CRUD and feature gates | P1 |
| Inventory | `/inventory` | `InventoryScreen` | ⚠ | Adjustments, bulk edit, history, analytics, archive | Inventory mutations, reason validation, limits | P0 |
| Merchant orders | `/orders`, detail flows | `OrdersScreen`, `OrderDetailScreen` | ⚠ | Filters/pagination, notes, refund, payment state | Status/payment/note/refund mutations and rules | P0 |
| Customers | `/customers` | `CustomersScreen` | ⚠ | Customer details and reports | Current mobile derives customers from orders | P0 |
| Reviews | `/reviews` website state | `ModuleScreen` coming-soon | ✅ current web state | None until web feature exists | No production CRUD currently exists | P3 |
| Coupons | `/coupons` | `CouponsScreen` | ⚠ | Native runtime polish | CRUD, feature gate, and schema implemented; live E2E pending | P1 |
| CMS pages and FAQ | `/cms`, `/cms/faqs` | generic `ModuleScreen` | ❌ | Editors, FAQ CRUD/reorder, publish feedback | CMS page and FAQ operations/validation | P0 |
| Store pages | `/pages` | generic `ModuleScreen` | ❌ | Lifecycle, settings, preview, history, trash | 34 page lifecycle operations and conflict logic | P0 |
| Page builder | `/builder/*` | generic `ModuleScreen` | ❌ | Canvas, section library, layers, properties, dialogs | Save/publish/templates/global sections/history/navigation | P0 |
| Undo/redo/history | builder | absent | ❌ | Global header/body/footer history UI | Snapshot middleware-equivalent native state | P0 |
| Media library | `/media` | `MediaLibraryScreen` | ⚠ | Native runtime and large-list virtualization | API operations implemented; upload/storage E2E pending | P0 |
| Themes/branding | theme and appearance routes | generic `ModuleScreen` | ❌ | Theme picker/editor, logo/branding forms | Apply theme, branding/settings upload APIs | P1 |
| Navigation/header/footer | navigation builder | generic `ModuleScreen` | ❌ | Menu editor, reorder, usage/conflict UI | Menu/item CRUD, reorder, header/footer settings | P0 |
| Analytics | analytics route family | `AnalyticsScreen` | ⚠ | All detailed source/device/geo/content views | Date-range/query parity, live and aggregation routes | P1 |
| Reports/import/export | `/reports` and report APIs | generic `ModuleScreen` | ❌ | Report tabs, export progress, import feedback | Report endpoints and export/import operations | P1 |
| Delivery/shipping/taxes | settings routes | generic readers or absent | ❌ | Complete zone/class/method forms | Delivery, shipping, tax CRUD and validators | P0 |
| Store payment methods | payment settings | generic `ModuleScreen` | ❌ | Method forms/reorder/state | Payment-method CRUD and checkout rules | P0 |
| Workspace billing | `/dashboard/billing` | `BillingScreen` workspace state | ⚠ | Live E2E polish | Store/plan mapping implemented | P1 |
| Store billing | `/store/[slug]/billing` | `BillingScreen` store state | ⚠ | Pay-now submission and renewal workflows | Checkout/payment submission, screenshot, callback | P0 |
| Invoices/payment history | billing tabs | `BillingScreen` tabs | ⚠ | Invoice detail/PDF and payment form | PDF authenticated download and submission mutation | P1 |
| Customer storefront | `/site/[tenant]/*` | absent | ❌ | Home/shop/category/product/content/account | Public/storefront API and tenant navigation | P0 |
| Cart/wishlist/checkout | storefront routes | absent | ❌ | Complete native commerce flow | Cart, wishlist, delivery, tax, coupon, order/payment logic | P0 |
| Customer orders/account | storefront account routes | absent | ❌ | Login/register/order history/detail | Customer auth/session and order APIs | P0 |
| Super-admin | `/admin/*` | `AdminDashboardScreen` only | ❌ | Users/stores/plans/features/storage/invoices/payments/templates | Almost all admin CRUD, role guards and validation | P0 |
| OTP, brands CRUD, blog, forms, API keys, webhooks, custom domains, chat, AI | feature flags/marketing only | absent/coming-soon | ⛔ | No production web workflow to reproduce | No production CRUD endpoints | Blocked by website |

## Phase 2 — UI/UX review

### Improvements implemented

- Shared content now has a centered `760`-point maximum width for tablets while retaining phone padding.
- Compact controls now meet the 44-point minimum touch target.
- Header icon and account targets are 44 points.
- Inputs expose labels and error hints to assistive technologies; invalid inputs receive a visible error border.
- Errors use assertive accessibility announcements; field errors use polite announcements.
- Search clear and section actions have explicit roles, labels, and touch areas.
- Workspace and store navigation are visibly distinct. Login never silently enters the first store.
- The production website logo is used in authentication, splash, header, and app metadata.

### Remaining UI/UX inconsistencies

| Area | Finding | Required improvement | Priority |
|---|---|---|---|
| Icons | Text glyphs vary by platform font and do not match a professional icon set | Adopt one Expo-compatible vector/symbol system with fixed optical sizes | P1 |
| Typography | No loaded brand font or semantic type tokens | Add display/title/body/caption tokens with dynamic-type QA | P1 |
| Safe area | Core `SafeAreaView` does not provide the full flexibility needed for sheets and bottom navigation | Move to safe-area-context when dependency installation is available | P1 |
| Feedback | Success messages mix native alerts and inline notices | Add reusable toast/banner with accessibility announcement | P1 |
| Forms | Several long forms use raw option chips and ISO date text fields | Add native date picker, select sheet, segmented control and server-field errors | P1 |
| Sheets | Screen-local modal implementations duplicate layout | Create one accessible bottom-sheet/dialog primitive with focus and keyboard behavior | P1 |
| Empty states | Visual style is shared but messages/actions are inconsistent | Add domain-specific empty-state copy/action rules | P2 |
| Dark mode | Theme preference exists but UI is light-only | Implement semantic color themes without changing business logic | P2 |
| Localization | Hardcoded English UI strings | Introduce message catalog after website localization behavior exists | P2 |

## Phase 3 — animations

### Implemented

- Screen changes use a restrained 180 ms opacity/translate transition.
- Transitions honor the operating system Reduce Motion preference.
- Skeletons pulse with native-driver opacity animation and stop cleanly on unmount.
- Existing button presses use subtle opacity/scale feedback.

### Pending

- Reanimated 4.5 and Worklets are the selected Expo 57-compatible path, but package download was blocked by the execution environment. No unresolved imports were committed.
- Bottom-sheet spring motion, layout transitions, media fade/caching, accordion height, tab indicator, success/error micro-interactions, and gesture-driven builder interactions remain pending.
- Animation rule: no decorative infinite motion, no layout animation on large lists, and all motion must honor Reduce Motion.

## Phase 4 — performance audit

| Finding | Evidence | Remediation | Priority |
|---|---|---|---|
| Large screen files | Media screen exceeds 200 lines; several screens contain many subviews/styles | Split by feature into hooks, cards, sheets and typed API modules | P1 |
| Global context invalidation | AppContext exposes store, auth, navigation and domain arrays in one value | Split auth/navigation/workspace/store-data contexts or use selectors | P1 |
| Generic recursive data rendering | `ModuleScreen` recursively searches arbitrary API envelopes and stringifies objects for search | Remove it as each domain receives a typed screen | P0 |
| Non-virtualized grids | Media, billing and store lists render page arrays inside ScrollView | Use FlashList/FlatList with stable memoized rows and recycling keys | P1 |
| Image caching | React Native `Image` is used for network media | Move to Expo Image memory/disk cache when dependency is available | P1 |
| GET cache is coarse | Global 30-second Map; every mutation clears every cached response | Add tag/domain invalidation, request deduplication and stale-while-revalidate | P1 |
| Store entry fan-out | Products, orders, categories and feature access load together | Preserve parallel fetch, add cancellation and screen-level lazy queries | P2 |
| No offline model | Secure auth persists, domain data does not | Add last-known read cache and explicit offline/retry UI | P2 |
| Upload queue lifecycle | Active XHRs live in a screen hook | Cancel active uploads on store change/unmount and persist recoverable queue metadata | P1 |

## Phase 5 — code quality audit

- ✅ Strict TypeScript is enabled.
- ✅ Authentication, secure storage, API errors, token recovery, and demo credentials are separated.
- ✅ Media has typed API/types/helpers and a queue hook.
- ⚠ Screen-local domain types should move to `features/<domain>` modules.
- ⚠ `AppContext` is over-responsible and should be split without changing API contracts.
- ⚠ Manual navigation lacks deep-link parsing, typed parameter maps, restoration, and route-level guards.
- ⚠ Repeated local modal, option-chip, notice and status helpers should become shared primitives.
- ❌ No unit, component, API-contract, or E2E test suite is configured.
- ❌ No lint/format script or CI mobile validation job is configured.

Recommended target structure:

```text
src/
  app/                 providers, navigation, route guards
  design-system/       tokens, primitives, feedback, motion
  features/<domain>/   api, types, validation, hooks, screens, components
  services/            API transport, secure session, cache, uploads
  test/                factories, API contracts, render helpers
```

## Phase 6 — design-system audit

| Token/component | Status | Notes |
|---|---|---|
| Color palette | ⚠ | Semantic light colors exist; dark/high-contrast variants missing |
| Spacing scale | ✅ | 4–32 point scale is consistently available |
| Radius | ✅ | Shared small/medium/large/extra-large/pill tokens |
| Shadows/elevation | ⚠ | One card shadow; modal/nav/elevated variants needed |
| Typography | ❌ | No semantic typography scale or font loading |
| Buttons | ⚠ | Four variants and loading/disabled semantics; icon-only primitive missing |
| Inputs | ⚠ | Shared text input and errors; select/date/file/OTP controls missing |
| Cards/badges | ✅ basic | Domain/card density variants still needed |
| Alerts/toasts | ❌ | Error card exists; reusable success/warning/info feedback missing |
| Skeletons | ✅ | Reduced-motion-aware native pulse implemented |
| Empty states | ✅ basic | Domain variants needed |
| Motion tokens | ⚠ | Screen/skeleton timing exists; centralized duration/easing tokens pending |

## Phase 7 — screen QA checklist

| Screen family | UI | API | Loading | Error | Empty | Success | Validation | Navigation | Permission | Accessibility | Performance |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Auth/demo | ⚠ | ✅ | ✅ | ✅ | n/a | ✅ | ⚠ | ✅ | ✅ | ⚠ | ✅ |
| Workspace dashboard/stores | ⚠ | ✅ | ✅ | ⚠ | ✅ | ⚠ | ⚠ | ✅ | ✅ | ⚠ | ⚠ |
| Store dashboard | ⚠ | ✅ | ✅ | ⚠ | ⚠ | n/a | n/a | ✅ | ⚠ | ⚠ | ⚠ |
| Profile/security | ⚠ | ✅ | ✅ | ✅ | ⚠ | ✅ | ✅ | ✅ | ✅ | ⚠ | ⚠ |
| Products/catalog/inventory | ❌ | ⚠ | ⚠ | ⚠ | ✅ | ⚠ | ❌ | ⚠ | ⚠ | ⚠ | ⚠ |
| Orders/customers | ❌ | ⚠ | ⚠ | ⚠ | ⚠ | ⚠ | ❌ | ⚠ | ⚠ | ⚠ | ⚠ |
| Coupons | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠ | ⚠ |
| Media | ⚠ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠ | ❌ |
| Billing | ⚠ | ⚠ | ✅ | ✅ | ✅ | n/a | n/a | ✅ | ✅ | ⚠ | ⚠ |
| Builder/CMS/pages/navigation | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠ | ❌ | ❌ | ❌ |
| Customer storefront/checkout | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Super-admin | ❌ | ⚠ | ⚠ | ⚠ | ⚠ | ⚠ | ❌ | ⚠ | ✅ | ❌ | ❌ |

## Release gates

The app must not be labeled production-complete until:

1. Every P0 parity row is implemented and tested against a production-compatible API.
2. Role, tenant, plan, limit, expired/suspended, and read-only states are tested.
3. iOS and Android builds pass login, restart restoration, upload, checkout/payment, builder, destructive CRUD, and logout scenarios.
4. Accessibility checks pass screen reader order, dynamic type, contrast, Reduce Motion, labels, and 44-point targets.
5. Large data sets pass list scrolling, memory, image cache, upload cancellation, and slow/offline network tests.
6. Unit, component, API-contract, and E2E tests are running in CI.
