# Merchant feature mapping

| Website feature | Purpose and business logic | API/state | Mobile equivalent | Priority / challenge |
|---|---|---|---|---|
| Session boundary | Load, login, register, reset, refresh, logout | `/auth/*`; access token + session | Auth/app boundary, SecureStore persistence, refresh retry, errors | P0; implemented |
| Demo login | Direct Demo User/Admin authentication with website credentials | `POST /auth/login`; `rememberMe: true`; user/admin `loginType` | Two loading buttons using the shared `signIn` path | P0; role-based redirect implemented |
| Admin redirect | Isolate platform operator navigation | `/admin/platform/overview`, `/admin/analytics` | Native Platform Dashboard without merchant tabs | P0; implemented |
| Store switcher | Select store membership context | `/stores/my-stores` | Store list and current-store state | P0; prevent cross-store cache leakage |
| Store creation | Create slug/subdomain and plan context | `POST /stores/create` | Validated native form | P0; uniqueness errors |
| Dashboard | Revenue, orders, products, conversion, recent activity | store/products/orders data | Metric cards, chart, quick actions, pull-to-refresh | P0; aggregate freshness |
| Products | Search, status, CRUD, variants, media | `/products/*` | Search/filter list and create/edit form | P0; variant editor remains a later dedicated form |
| Categories | Store taxonomy and ordering | `/categories/*` | Category cards and product counts | P1; drag reorder |
| Inventory | Stock totals, thresholds, history, bulk actions | inventory endpoints + products | Health summary and stock list | P0; never queue writes offline |
| Orders | Filters, detail, fulfilment, payment, notes/refund | `/stores/:id/orders/*` | Search/status filters, detail, fulfilment actions | P0; status/payment independence |
| Customers | Merchant customer insight | order customer data/reports | Deduplicated customer list and spend | P1; dedicated merchant endpoint absent |
| Reviews | Moderation and replies | `/stores/:id/reviews` | Plan-gated coming-soon state | P2; website marks coming soon |
| Coupons | Code/type/value/limits/dates | `/stores/:id/coupons` | Dedicated CRUD editor with feature gate and backend-equivalent validation | Source complete; native/API runtime verification pending |
| CMS | Policies and FAQ | `/cms/:id/*` | Content cards and API states | P1; rich text editor challenge |
| Pages | Lifecycle, publish, schedule, archive, versions | `/store-pages/*` | API-backed page list | P1; draft editor/history next |
| Builder | Section-based page composition | `/builder/*` | Page list and builder entry | P1; touch drag/drop and preview are high complexity |
| Media | Files, quotas, usage, import/replace/delete | media endpoints | API list and upload entry | P1; native picker/progress package pending |
| Theme | Browse/apply templates and theme settings | `/templates`, store theme | Theme list and apply entry | P1; storefront preview |
| Navigation | Header/footer menus and items | `/navigation/*` | Menu cards and edit entry | P1; nested reorder |
| Analytics | Stats, charts, sources, devices, geography, conversion | `/analytics/*` | Mobile overview, revenue chart, source bars | P1; many website subroutes collapse into drilldowns |
| Reports | Domain reports and summaries | `/reports/*` | API-backed report cards | P1; export/share |
| Branding | Logo/favicon/colors/identity | store branding endpoints | API-backed identity card | P1; image picker pending |
| Delivery | Areas, fees, thresholds | `/delivery-zones/*` | Zone list and create entry | P1; geographic validation |
| Payment methods | Checkout method configuration | `/payment-methods/*` | Method list and create entry | P0; secrets must never be logged |
| Settings | Currency, tax, locale, checkout, inventory defaults | store settings endpoints | Editable grouped native form | P0; server validation preserved |
| Billing | Subscription, usage, invoices, checkout | plans/subscriptions/invoices | Billing status cards | P1; payment state is server authoritative |
| Activity | Auditable workspace mutations | audit endpoints | Timeline-style data cards | P1; pagination/filtering |
| Notifications | Billing/store alerts and read state | `/notifications/*` | Alert list from header | P1; push notifications pending native package |
| Marketing/apps/domain/SEO | Feature-gated future modules | feature access | Explicit coming-soon screens | P2; mirrors website status |

Shared state lives in `AppContext`; network contracts live in `lib/api.ts`; domain types live in `types/domain.ts`; reusable interaction and feedback components live in `components/ui.tsx`. This keeps server behavior separate from presentation and allows replacement with Expo Router/TanStack Query without rewriting feature screens.
