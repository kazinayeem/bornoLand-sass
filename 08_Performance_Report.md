# Performance Report

---

## Critical Issues

### 1. No Query-Level Pagination on Products/Customers
All products and customers are loaded client-side then filtered/sorted/paginated. With 1M products, this will crash the browser.

**Fix:** Server-side pagination via `page`, `limit`, `sort`, `search` query params. Add compound indexes to support sort operations.

### 2. No Database Caching Layer
Redis container is configured in `docker-compose.yml` but **never used** in application code. Every API request hits MongoDB directly. No cache for:
- Subdomain → Store resolution (queried on every request)
- Product listings (queried on every page load)
- Plan/feature lookups (queried on every CRUD operation)

**Fix:** Integrate Redis with `ioredis`. Cache subdomain→store mapping (1hr TTL), product listings (5min TTL), plan data (1hr TTL).

### 3. MongoDB Connection Pool: `maxPoolSize: 10`
**File:** `connection.ts:21` — For 100k stores with even modest concurrent traffic, 10 connections will exhaust immediately under load.

**Fix:** Increase to 50-100. Monitor with `mongoose.connection.getClient().topology?.connections()`.

### 4. No Image Optimization Pipeline
Sharp is installed but unused. Images are uploaded at full resolution. No:
- WebP conversion
- Thumbnail generation
- Responsive srcsets
- CDN caching

**Comparison:** Shopify resizes every uploaded image to 10+ variants automatically. This accounts for 40%+ bandwidth savings.

**Fix:** Implement a post-upload pipeline: resize to 5 sizes (100px, 300px, 600px, 1200px, original), convert to WebP, store in S3 + CDN.

---

## High Issues

### 5. No CDN for Media Assets
Images are served directly from the Express `/uploads` static directory or from the S3 bucket. No CDN in front.

**Fix:** Put Cloudflare/Bunny.net/CloudFront in front of all media URLs. Cache with 1yr max-age + fingerprinting.

### 6. Serial Billing Cron
`billing-cron.service.ts` uses `setInterval` in a single process. With 3+ pods, all run the cron simultaneously. No distributed lock.

**Fix:** Use BullMQ (backed by Redis) for scheduled jobs, or implement Redlock for distributed locking. Only one pod should process billing.

### 7. Synchronous Analytics Writes
Page views, visitor sessions, and events are written directly to MongoDB on every request. At scale, this overwhelms the primary.

**Fix:** Queue analytics writes via BullMQ. Batch-insert every 5 seconds or every 100 events.

### 8. No Virtualized Lists
All tables render every row in the DOM. `DataTable` doesn't use `react-window` or `@tanstack/react-virtual`. With 1000+ products in a table, DOM has 1000+ `<tr>` elements.

**Fix:** Integrate `@tanstack/react-virtual` with DataTable for row virtualization.

---

## Medium Issues

### 9. No Code Splitting by Route
The entire Redux store (26 API files + 18 slices) is loaded on initial page load. Tree-shaking is impossible with the monolithic `baseApi`.

**Fix:** Lazy-load API slices. Split reducers for admin-only pages.

### 10. `localStorage` Reads on Every Request
`base-api.ts:14-18` reads `localStorage.getItem("customer_token")` on every API request. Synchronous but unnecessary.

**Fix:** Cache token in a module variable, update on login/logout.

### 11. No Compression Middleware
Express responses are uncompressed. Enable `compression` middleware for JSON API responses.

### 12. No ISR for Storefront Pages
Storefront uses SSR with `revalidate = 60` on some pages, but product detail and category pages have no ISR configuration.

**Fix:** Add `revalidate` to all storefront pages. Use `generateStaticParams` for high-traffic products.

---

## Bundle Size Observations

| Metric | Estimate | Concern |
|--------|----------|---------|
| Redux reducers | 28 (10 API + 18 slice) | High for initial load |
| UI components | ~80+ (includes Radix, shadcn) | Moderate |
| Charts (Recharts) | ~150KB | Loaded on every page even if unused |
| Builder (TipTap + dnd-kit) | ~200KB | Only needed on builder page |

**Fix:** Dynamic import for charts (`next/dynamic` with `ssr: false`). Load builder JS only on builder routes.

---

## Priority Actions

| # | Fix | Impact | Effort |
|---|-----|--------|--------|
| 1 | Server-side pagination for products/customers | 🔴 High | 2 days |
| 2 | Integrate Redis caching (subdomain→store) | 🔴 High | 1 day |
| 3 | Increase MongoDB pool size | 🔴 High | 0.5 day |
| 4 | Add image optimization pipeline | 🟠 High | 3 days |
| 5 | Distributed billing cron | 🟠 High | 1 day |
| 6 | Async analytics writes via queue | 🟠 High | 2 days |
| 7 | CDN for media assets | 🟠 Medium | 0.5 day |
| 8 | Row virtualization in DataTable | 🟠 Medium | 1 day |
| 9 | Compression middleware | 🟡 Low | 0.5 day |
