# BornoLand Performance & Reliability Engineering

## 1. Database & Indexing Optimizations
- **Compound Multi-Tenant Indexes**: Every collection indexes `{ storeId: 1, createdAt: -1 }`, `{ storeId: 1, sku: 1 }`, `{ storeId: 1, status: 1 }` to eliminate table scans and slow queries.
- **Aggregation Pipelines**: High-volume financial reports, sales summaries, and attendance records are aggregated directly on MongoDB clusters using optimized projection pipelines instead of in-memory array iteration.
- **Lean Query Projections**: APIs project only required fields, excluding heavy embedded subdocuments during list operations.

---

## 2. Frontend & Next.js Bundle Architecture
- **Next.js 15 App Router with Server Components**: Heavy layout resolution and SEO metadata remain on the server, minimizing hydration overhead.
- **Shared Chunks Optimization**: Common modules (Radix UI primitives, Lucide icons, RTK query base client) are bundled into centralized vendor chunks (`shared JS ~104 kB`).
- **Dynamic Header Resizing**: Automatic `ResizeObserver` updates `--store-header-height` CSS variable dynamically to prevent layout shifts (CLS < 0.05).
- **Nordic Yellow Design Tokens**: Zero heavy animation libraries; native CSS custom properties and lightweight transitions ($150\text{ms}$ duration).

---

## 3. Caching & Invalidation
- **Tenant-Scoped RTK Query Tags**: Granular invalidation keys (`Inventory`, `POS`, `HRM`, `Accounting`, `CRM`, `Support`, `Operations`) ensure that updating a record in one module only refetches relevant slices.
