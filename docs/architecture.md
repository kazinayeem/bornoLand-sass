# BornoLand Architecture

## 1. Folder structure

```txt
apps/
  web/
    middleware.ts
    next.config.ts
    src/
      app/
        (marketing)/
        (auth)/
        (dashboard)/
        api/
      components/
      lib/
      styles/
  api/
    src/
      config/
      middleware/
      models/
      routes/
      services/
      types/

packages/
  ui/
  types/
  config/
```

## 2. Technology choices

### Frontend

- Next.js 15 App Router: modern server components, nested layouts, route groups, and streaming.
- TypeScript: type-safe shared contracts and safer refactors.
- Tailwind CSS + shadcn/ui: fast design system composition with low CSS overhead.
- Framer Motion: targeted animations for builder and onboarding experiences.
- Zustand: lightweight local/global state for editor state, selection, and publish modal flow.
- React Hook Form + Zod: reliable form handling and schema validation.
- Axios: request layer with interceptors for tenant-aware headers and auth refresh.

### Backend

- Express.js: clear API boundary for multi-tenant operations and webhooks.
- Mongoose: pragmatic schema modeling and tenant-scoped queries.
- Redis: caching, rate limiting, queues, and ephemeral publish locks.

### Auth

- Auth.js / NextAuth v5: Google OAuth, credentials login, and JWT sessions.
- Role-based access control: owner, admin, editor, analyst, viewer.
- Middleware route protection: dashboard, admin, billing, and builder access checks.

### Infrastructure

- MongoDB Atlas: primary database.
- Cloudinary: media storage and optimization.
- Stripe + SSLCommerz: global and Bangladesh-first payment coverage.
- Vercel: web deployment.
- Render or VPS: API deployment.
- Cloudflare: wildcard DNS, SSL, and proxying for subdomains.

## 3. Multi-tenant data model

Every tenant-owned collection should include:

- tenantId: string
- createdBy: ObjectId
- updatedBy: ObjectId
- deletedAt: Date | null
- status: active | archived | deleted

Isolation rules:

- Always scope reads and writes by tenantId.
- Resolve tenant from subdomain, custom domain, or authenticated session.
- Reject cross-tenant access even if a user is authenticated.

## 4. Core collections

- User: identity, auth providers, roles, global status.
- Tenant: workspace, branding, domain config, billing state.
- TenantMember: user-to-tenant membership and permissions.
- Project: a landing-page workspace inside a tenant.
- Page: editable page entity with published and draft versions.
- PageVersion: immutable builder snapshots.
- Asset: Cloudinary or storage metadata.
- Template: reusable starting point for pages.
- AuditLog: tenant events and security trail.
- BillingPlan and Subscription: payment state.
- AnalyticsEvent: performance and conversion events.

## 5. Routing model

- Marketing site: root domain.
- Auth pages: root domain login and callback routes.
- Dashboard: protected routes under /dashboard.
- Builder: protected routes under /builder.
- Public published pages: tenant subdomains or custom domains.

## 6. Publish flow

1. User edits a draft page in the builder.
2. Builder saves draft changes and creates a version snapshot.
3. Publish job validates SEO, assets, and tenant permissions.
4. Published payload is stored with a unique slug and timestamp.
5. Middleware resolves the subdomain and serves the active page version.

## 7. Security model

- Use CSRF-safe auth flows and signed cookies.
- Use rate limiting on login, publish, and billing endpoints.
- Verify webhook signatures from Stripe and SSLCommerz.
- Require RBAC middleware on every dashboard/admin route.
- Validate input with Zod at the API boundary.

## 8. Deployment strategy

- Web on Vercel with edge middleware for subdomain routing.
- API on Render or VPS with autoscaling and worker support.
- MongoDB Atlas for managed storage and backups.
- Cloudflare for wildcard DNS and proxy SSL.
- Redis as a managed service or self-hosted container depending on phase.

## 9. MVP sequence

1. Auth, tenant onboarding, dashboard shell.
2. Builder canvas, theme customization, draft save.
3. Publish, subdomain routing, and SEO settings.
4. Billing, roles, analytics, and templates.
5. AI generation, marketplace, and advanced automations.

## 10. Dynamic subdomain routing

The public site should resolve in this order:

1. Custom domain lookup.
2. Tenant subdomain lookup.
3. Session tenant fallback for authenticated dashboard links.

Example resolution contract:

```ts
type TenantResolution = {
  tenantKey: string | null;
  source: "subdomain" | "custom-domain" | "session" | "none";
};
```

The web middleware rewrites `tenant.example.com` to an internal public route such as `/site/tenant`. That keeps the public site render path simple while still giving each tenant its own branded hostname.

## 11. Cloudflare wildcard configuration

Cloudflare should proxy the root and wildcard records:

- `@` -> Vercel web frontend.
- `*` -> Vercel web frontend.
- `api` -> Render or VPS API.
- `assets` -> Cloudinary or a CDN origin if needed.

Recommended settings:

- SSL/TLS mode: Full (strict).
- Always use HTTPS: enabled.
- Wildcard DNS: enabled for `*.bornoland.com`.
- Page rules or transform rules: preserve host headers for tenant routing.

## 12. Next.js middleware setup

Middleware responsibilities should stay narrow:

- Protect authenticated dashboard, builder, and admin routes.
- Resolve subdomains and rewrite public tenant pages.
- Keep the public marketing pages on the apex domain.
- Avoid heavy database calls in middleware; use session or cache lookups only.

Example flow:

```ts
export default auth((request) => {
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedRoute && !request.auth?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
});
```

## 13. API architecture

Suggested API layers:

- Routes: request parsing and HTTP responses.
- Controllers: orchestration and response shaping.
- Services: business logic, publish flow, billing, AI, and domain checks.
- Models: Mongoose schemas.
- Middleware: auth, tenant scope, rate limiting, webhook verification.
- Validators: Zod schemas for input contracts.

Example route groups:

- `/auth` for login and identity operations.
- `/tenants` for tenant metadata.
- `/pages` for builder and publish actions.
- `/billing` for Stripe and SSLCommerz events.
- `/analytics` for page and funnel metrics.

## 14. SaaS multi-tenant structure

Each tenant should have a dedicated workspace boundary:

- One tenant can own many projects.
- One project can own many pages.
- Members belong to a tenant through a membership model.
- Feature access is controlled by both plan and role.

Tenant isolation rules:

- Query filters always include `tenantId`.
- Ownership checks compare the authenticated tenant with the route tenant.
- Publish and billing actions must be signed and revalidated server-side.

## 15. Builder architecture

The builder should be split into small, composable surfaces:

- Canvas renderer: displays the current page state.
- Block library: drag-and-drop content blocks.
- Inspector panel: edits block-level settings.
- Theme panel: colors, fonts, spacing, and button styles.
- SEO panel: metadata, indexing, social previews.
- Publish panel: environment, slug, and deployment status.

State management approach:

- Zustand for editor state and selection.
- React Hook Form for settings forms.
- Zod schemas for page, theme, and publish validation.

## 16. Dashboard architecture

The dashboard should use a route-group shell with nested layouts:

- `/dashboard` for overview.
- `/dashboard/pages` for page list.
- `/dashboard/builder/[pageId]` for editing.
- `/dashboard/analytics` for conversion and traffic.
- `/dashboard/billing` for plan and payment state.
- `/dashboard/team` for collaboration.
- `/admin` for global platform controls.

Layout rules:

- Shared sidebar and topbar live in the dashboard layout.
- Sensitive sections should check both auth and role.
- Tenant switchers should be available when a user belongs to multiple workspaces.

## 17. Deployment guide

### Web deployment on Vercel

- Connect the `apps/web` project to Vercel.
- Set the root and wildcard domains in Vercel and Cloudflare.
- Configure environment variables for Auth.js, MongoDB, and API URLs.
- Use preview deployments for staging changes.

### API deployment on Render or VPS

- Deploy `apps/api` as a separate service.
- Expose `/health` for uptime checks.
- Add Redis and MongoDB connection strings in the environment.
- Use process managers or container orchestration for resilience.

### Database deployment

- Use MongoDB Atlas.
- Enable backups, indexes, and network allowlists.
- Use separate collections for tenants, pages, subscriptions, and audit logs.

## 18. Environment variables

Required environment groups:

- App identity: `APP_NAME`, `APP_URL`, `ROOT_DOMAIN`.
- Auth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- Database: `MONGODB_URI`, `MONGODB_DB`.
- Payments: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SSL_COMMERZ_STORE_ID`, `SSL_COMMERZ_STORE_PASSWORD`.
- Storage: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Cache: `REDIS_URL`, `REDIS_TOKEN`.
- Security: `JWT_SECRET`, cookie names, and domain settings.

## 19. Docker setup

Use Docker for local MongoDB and Redis, not for the main production web app unless your team prefers containerized deployments.

```yaml
services:
  redis:
    image: redis:7-alpine
  mongodb:
    image: mongo:7
```

## 20. CI/CD setup

Recommended pipeline stages:

1. Install dependencies.
2. Typecheck and lint.
3. Run unit and integration tests.
4. Build web and API packages.
5. Deploy web to Vercel and API to Render or VPS.
6. Run database migration or index-check jobs if needed.

Suggested branch model:

- `main` for production.
- `develop` for integration.
- feature branches for new work.

## 21. Security best practices

- Hash passwords with a strong algorithm and salt rounds.
- Enforce request validation on every public route.
- Rate-limit auth, publish, and webhook routes.
- Sign and verify billing webhooks.
- Use least-privilege API keys.
- Log tenant, actor, and action for auditability.

## 22. Performance optimization

- Cache tenant lookups and page metadata in Redis.
- Store published page snapshots separately from draft state.
- Use streaming and server components for read-heavy surfaces.
- Load large builder assets lazily.
- Prefer indexed queries on `tenantId`, `slug`, and `status`.

## 23. Redis caching setup

Recommended Redis keys:

- `tenant:subdomain:{subdomain}` -> tenant metadata.
- `page:published:{tenantId}:{slug}` -> rendered page payload.
- `rate:login:{ip}` -> login attempts.
- `lock:publish:{pageId}` -> publish lock to avoid double publishes.

Use Redis for:

- Subdomain resolution.
- Publish locks.
- Rate limiting.
- Session adjunct metadata if needed.

## 24. Role permission system

Roles should map to capabilities, not just labels.

- Owner: everything in the tenant.
- Admin: tenant operations minus some billing controls.
- Editor: page editing and publishing.
- Analyst: reporting only.
- Viewer: read-only access.

Permission checks should occur in both UI and API. UI checks improve UX, but the API is the source of truth.

## 25. Professional coding standards

- Use TypeScript everywhere.
- Prefer explicit domain names over generic helper names.
- Keep validation schemas next to the route or domain service they protect.
- Avoid tenant leakage in shared helpers.
- Keep components small and composable.
- Name files by domain, not by technical layer only.
- Version all public contracts in shared packages when the API expands.

## 26. Example publish system

The publish system should save immutable snapshots so a live tenant page is not coupled to the latest draft.

Suggested behavior:

- Draft edits update `draftData`.
- Publish copies `draftData` into `publishedData`.
- Publish updates `publishStatus`, `publishedAt`, and `publishedBy`.
- Public rendering reads only `publishedData`.

This pattern matches the mental model of tools like Webflow, Framer, and Carrd while staying compatible with a SaaS multi-tenant backend.