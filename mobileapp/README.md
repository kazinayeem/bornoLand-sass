# Bornoland Mobile

Expo SDK 57 mobile workspace for Bornoland merchants. It mirrors the website's store-management information architecture while adapting it for touch, small screens, pull-to-refresh, native forms, and bottom navigation.

## Run locally

1. Copy `.env.example` to `.env` and use a LAN-reachable API URL when testing on a physical phone.
2. Start the API from the repository root.
3. From this folder, run `npm start`, `npm run ios`, or `npm run android`.

`localhost` works in the iOS simulator. Android Emulator normally uses `http://10.0.2.2:4000`. A physical device needs the development computer's LAN address.

## Included flows

- Email login, registration, forgot-password, logout, secure session bootstrap, and real Demo User/Admin authentication through `/auth/login`.
- Store switching and store creation.
- Dashboard revenue/order/product summaries, chart, recent orders, and quick actions.
- Product search/filtering plus create/edit validation.
- Order search/filtering, detail, customer/address/payment data, and fulfilment status updates.
- Categories, inventory, customers, analytics, coupons, reviews, CMS, pages, media, builder, themes, reports, branding, domains, SEO, delivery zones, payment methods, navigation, settings, notifications, activity, billing, and support entry points.
- Responsive cards, empty states, errors, skeletons, status badges, Android hardware-back handling, safe-area layout, and pull-to-refresh.

## Architecture

```text
src/
  components/       Shared native UI and application chrome
  context/          Session, store, server data, and navigation state
  data/             Read-only product-tour fixtures
  lib/              Fetch client, cache, formatting
  navigation/       Auth/app boundary and screen routing
  screens/          Feature screens
  types/            API and domain types
```

The API client uses the same REST contracts and `x-app-source` convention as the web application. GET responses receive a short in-memory cache; mutations invalidate the cache. Access tokens, session metadata, and the authenticated profile are persisted with Expo SecureStore and removed on logout.

Demo access matches the website implementation: both buttons call the normal login service with `rememberMe: true`; the user path sends `loginType: "user"` and opens the merchant dashboard, while the admin path sends `loginType: "admin"` and opens the Platform Dashboard. The backend continues to own the rotating HttpOnly refresh-token cookie.

## Validation

```bash
npx tsc --noEmit
npx expo config --type public
npx expo export --platform android --output-dir /tmp/bornoland-mobile-export
```

See `docs/WEBSITE_AUDIT.md`, `docs/FEATURE_MAPPING.md`, and `docs/SCREEN_MAP.md` for source audit and parity mapping.
