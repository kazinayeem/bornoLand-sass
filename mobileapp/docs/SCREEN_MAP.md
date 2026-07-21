# Screen map

| Screen | Purpose / source | Navigation | Edge and offline behavior |
|---|---|---|---|
| Splash | Bootstrap `/auth/me` | App launch | Network failure resolves to auth, never blocks forever |
| Login | Merchant authentication | Auth root | Email/password validation, timeout and API message |
| Register | Workspace/user creation | Login switch | Server uniqueness and password rules |
| Forgot password | Request email link | Login switch | Privacy-safe success response |
| Demo User login | Website demo user through `/auth/login` | Login quick access → Dashboard | Independent loading, shared errors/session persistence |
| Demo Admin login | Website super admin through `/auth/login` | Login quick access → Platform Dashboard | Admin `loginType`, role-isolated navigation |
| Platform Dashboard | Admin overview and analytics APIs | Demo/normal admin login | Pull-to-refresh, skeleton, retry state |
| Store selector | `/stores/my-stores` and current store | Header brand | Empty/create states; current selection remains explicit |
| Create store | `POST /stores/create` | Store selector | Slug validation and server conflict |
| Dashboard | Products/orders/store aggregates | Home tab | Pull-to-refresh; stale in-memory cache; demo banner |
| Products | `/products/:storeId` | Products tab | Search/filter, empty state, cached read |
| Product form | Product create/update | Product list/quick action | Required fields, numeric checks, API error |
| Orders | Merchant order list/analytics | Orders tab | Search/status filter, empty state, cached read |
| Order detail | Merchant order object | Order row | Missing order state; no offline status writes |
| Customers | Unique order customers | More → Customers | Empty/search states; dedicated endpoint not present |
| Categories | `/categories/:storeId` | More → Categories | Empty state and product counts |
| Inventory | Product stock + inventory routes | More → Inventory | Low/out health; mutations must be online |
| Analytics | Order/product overview | Analytics tab | Read-only local aggregate remains visible |
| More | Complete merchant IA | More tab | Grouped by commerce/storefront/growth/appearance/operations/workspace |
| Coupons | Store coupon CRUD endpoints and feature gate | More | Dedicated CRUD editor, validation, loading/error/empty states |
| Reviews | Store review endpoints/feature gate | More | Website currently exposes its coming-soon state |
| CMS/pages/builder | Content APIs | More | Loading skeleton, retry, API list; deep editor entry |
| Media/theme | Media/template APIs | More | Quota/upload or apply actions require online server |
| Reports/activity/billing | Report/audit/subscription APIs | More | Retry and empty states; server-authoritative values |
| Branding/domain/SEO | Store branding and feature state | More | Domain/SEO explicitly match website's coming-soon status |
| Delivery/payment/navigation | Store checkout/menu configuration APIs | More | Online-only mutations; secrets hidden |
| Settings | Store settings read/update | More | Defaults if read fails; mutation error |
| Notifications | Notification API | Header | Empty/error states; read-state actions to be expanded |
| Profile | Current session/store | Header avatar | Logout clears token/cache/store state |
| Help | Guide/support entry points | More/Profile | Static fallback remains available offline |

## Main navigation

```text
Auth boundary
└── Merchant app
    ├── Home
    ├── Orders
    │   └── Order detail
    ├── Products
    │   └── Product create/edit
    ├── Analytics
    └── More
        ├── Commerce
        ├── Storefront
        ├── Growth
        ├── Appearance
        ├── Operations
        └── Workspace
```

Android hardware back pops detail/form/module screens. Switching a bottom tab resets to that tab root. Header navigation opens store selection, notifications, and profile. The `bornoland://` scheme is reserved for reset, verification, product/page, and order deep links when Expo Router is enabled.
