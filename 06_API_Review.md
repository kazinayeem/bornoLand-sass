# API Review

---

## RESTful Compliance: 60%

### Route Design Issues

| Issue | Example | Fix |
|-------|---------|-----|
| `/create` suffix on POST | `POST /stores/create`, `POST /products/:storeId/create` | `POST /stores`, `POST /products` (storeId in body or URL param) |
| Action URLs instead of state transitions | `PUT /admin/stores/:id/suspend` | `POST /admin/stores/:id/actions` with `{ action: "suspend" }` |
| Flat variant paths | `POST /products/:storeId/:id/variants` | Nest under products: `POST /products/:productId/variants` |
| Non-RESTful page paths | `GET /builder/page/:pageId` | `GET /builder/pages/:pageId` |
| StoreId in URL for all resources | `/products/:storeId` | `/stores/:storeId/products` (scope resources under stores) |

---

## Missing Features

### Pagination
Every list endpoint needs: `page`, `limit`, `sort`, `order`, `search`, `filters`

| Endpoint | Status |
|----------|--------|
| `GET /products/:storeId` | ❌ Missing |
| `GET /categories/:storeId` | ❌ Missing |
| `GET /stores` | ❌ Missing |
| `GET /users` | ❌ Missing |
| `GET /coupons/:storeId` | ❌ Missing |
| `GET /analytics/:storeId/*` | ❌ Missing |

### Response Envelope Inconsistency
```json
// ✅ sendSuccess/sendFailure (60%)
{ "success": true, "data": { "store": {...} }, "message": "Store created" }

// ❌ Raw response.json (40%)
{ "store": {...} }
{ "pages": [...] }
{ "data": { "stores": [...] } }
```

**Fix:** Create an API response middleware that wraps all responses automatically.

### HTTP Status Code Issues

| Endpoint | Current | Should Be |
|----------|---------|-----------|
| `GET /auth/me` when unauthenticated | 200 `{ session: null }` | 401 |
| `GET /products/item/:id` with invalid ID | 500 (CastError) | 400 |
| MongoDB duplicate key errors anywhere | 500 | 409 |
| Zod validation errors | 400 | ✅ Already correct |

---

## Rate Limiting Coverage

| Route Group | Rate Limited? | Limit |
|-------------|--------------|-------|
| `/auth/*` | ✅ | 10/min |
| `/newsletter/*` | ✅ | 5/min |
| `/contact/*` | ✅ | 5/min |
| `/analytics/track/*` | ✅ | 60/min |
| Global (all routes) | ✅ | 100/min |
| `/products/*` | ❌ Global only | 100/min |
| `/orders/*` | ❌ Global only | 100/min |
| `/stores/*` | ❌ Global only | 100/min |
| Cart/wishlist | ❌ Global only | 100/min |

**Fix:** Add specific rate limits to write-heavy endpoints: product CRUD (30/min), order creation (10/min), media upload (10/min).

---

## File Upload Issues

| Issue | Details |
|-------|---------|
| Memory storage | Files stored in memory before processing — can OOM for large files |
| No file type validation | Multer config should validate MIME types server-side |
| No file size limit per upload in middleware | Relies on `express.json({ limit: "1mb" })` but multer bypasses this |

---

## Priorities

1. Add pagination to products, categories, customers, coupons APIs
2. Standardize response format across all endpoints
3. Add rate limits to write-heavy endpoints
4. Fix HTTP status codes for auth/validation errors
5. Add file upload hardening
