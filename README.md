# BornoLand

BornoLand is a production-ready SaaS architecture for building AI-powered, multi-tenant landing pages for Bornosoft. The stack is intentionally split into a Next.js 15 web app and a separate Express API so the frontend can stay optimized for UX, subdomain routing, and Auth.js while the backend scales independently for billing, AI generation, analytics, and tenant-aware data services.

## Why this structure

- Next.js 15 App Router keeps the marketing site, auth flows, dashboard, and builder in one high-performance React surface.
- Express.js gives the backend a clean service boundary for tenant-aware APIs, billing webhooks, background jobs, and AI orchestration.
- MongoDB Atlas with Mongoose is a strong fit for flexible landing-page documents and tenant-scoped content models.
- Auth.js / NextAuth v5 handles Google OAuth and credentials login with a JWT session strategy that is refresh-safe for a dashboard-heavy SaaS.
- Redis adds caching, rate limiting, job coordination, and subdomain lookup acceleration.

## MVP-first strategy

1. Ship tenant onboarding, auth, dashboard shell, and a basic landing-page builder.
2. Add publish flow, custom domains, and SEO controls.
3. Introduce billing, analytics, templates, and team roles.
4. Expand AI generation, marketplace primitives, and automation.

## Monorepo layout

```txt
apps/
  web/
  api/

packages/
  ui/
  types/
  config/

docs/
```

## Installation

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Required packages for this auth system:

```bash
pnpm add next-auth @auth/mongodb-adapter mongoose bcryptjs zod react-hook-form lucide-react sonner jose dotenv nodemailer
pnpm add -D tailwindcss @tailwindcss/postcss postcss typescript tsx @types/node @types/react @types/react-dom @types/nodemailer
```

`pnpm dev` now uses `concurrently` to run both apps in one terminal:

- `apps/web` on the Next.js dev server.
- `apps/api` on the Express API dev server.

If you want to run them separately:

```bash
pnpm --filter @bornoland/web dev
pnpm --filter @bornoland/api dev
```

## Dependency categories

- Frontend: next, react, react-dom, tailwindcss, shadcn/ui, framer-motion, zustand, react-hook-form, zod, axios.
- Backend: express, mongoose, ioredis, cors, helmet, pino, multer, sharp.
- Auth: next-auth, @auth/mongodb-adapter or custom adapter path, bcryptjs, jsonwebtoken.
- Payments: stripe, sslcommerz.
- Tooling: typescript, turbo, eslint, prettier, vitest, tsx, dotenv, husky, lint-staged.

## Architecture docs

- [Detailed architecture](docs/architecture.md)

## Production notes

- Keep tenantId on every business collection and require it in every query path.
- Prefer soft delete for user-generated content and version landing pages before publish.
- Use middleware-based subdomain parsing in web and strict tenant resolution in API.
- Sign all internal webhooks and never trust a tenantId sent directly by the browser.

## Auth system files

- [auth config](apps/web/src/auth.ts)
- [middleware](apps/web/middleware.ts)
- [login form](apps/web/src/components/auth/login-form.tsx)
- [register form](apps/web/src/components/auth/register-form.tsx)
- [Google button](apps/web/src/components/auth/google-button.tsx)
- [quick login button](apps/web/src/components/auth/quick-login-button.tsx)
- [user schema](apps/web/src/models/user.model.ts)
- [seed script](apps/web/src/seed/seed.ts)