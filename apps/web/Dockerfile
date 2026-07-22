# syntax=docker/dockerfile:1

############################################
# Frontend (Next.js) — pnpm monorepo package
# Build context MUST be the repository root
# Requires next.config.ts → output: "standalone"
############################################

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat \
  && corepack enable

# ── Install + build ──
FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --frozen-lockfile --filter @bornoland/web...

COPY apps/web ./apps/web

# NEXT_PUBLIC_* + API_URL are consumed at build time (client bundle + rewrites)
ARG NODE_ENV=production
ARG NEXT_PUBLIC_APP_ENV=production
ARG NEXT_PUBLIC_PROTOCOL=http
ARG NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_APP_NAME=BornoLand
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_ASSET_URL=http://localhost:3000
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
ARG NEXT_PUBLIC_DEFAULT_CURRENCY=BDT
ARG NEXT_PUBLIC_DEFAULT_LOCALE=en
ARG NEXT_PUBLIC_ENABLE_SUBDOMAIN=true
ARG NEXT_PUBLIC_ENABLE_AI=true
ARG NEXT_PUBLIC_ENABLE_ANALYTICS=true
ARG NEXT_PUBLIC_ENABLE_BUILDER=true
ARG NEXT_PUBLIC_DEFAULT_TENANT=
ARG NEXT_PUBLIC_PLATFORM_HOSTS=
ARG API_URL=http://backend:4000

ENV NODE_ENV=$NODE_ENV \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV \
    NEXT_PUBLIC_PROTOCOL=$NEXT_PUBLIC_PROTOCOL \
    NEXT_PUBLIC_ROOT_DOMAIN=$NEXT_PUBLIC_ROOT_DOMAIN \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_ASSET_URL=$NEXT_PUBLIC_ASSET_URL \
    NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL \
    NEXT_PUBLIC_DEFAULT_CURRENCY=$NEXT_PUBLIC_DEFAULT_CURRENCY \
    NEXT_PUBLIC_DEFAULT_LOCALE=$NEXT_PUBLIC_DEFAULT_LOCALE \
    NEXT_PUBLIC_ENABLE_SUBDOMAIN=$NEXT_PUBLIC_ENABLE_SUBDOMAIN \
    NEXT_PUBLIC_ENABLE_AI=$NEXT_PUBLIC_ENABLE_AI \
    NEXT_PUBLIC_ENABLE_ANALYTICS=$NEXT_PUBLIC_ENABLE_ANALYTICS \
    NEXT_PUBLIC_ENABLE_BUILDER=$NEXT_PUBLIC_ENABLE_BUILDER \
    NEXT_PUBLIC_DEFAULT_TENANT=$NEXT_PUBLIC_DEFAULT_TENANT \
    NEXT_PUBLIC_PLATFORM_HOSTS=$NEXT_PUBLIC_PLATFORM_HOSTS \
    API_URL=$API_URL

RUN pnpm --filter @bornoland/web build

# ── Minimal production image ──
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat wget \
  && addgroup -S bornoland \
  && adduser -S bornoland -G bornoland

COPY --from=builder --chown=bornoland:bornoland /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=bornoland:bornoland /app/apps/web/.next/standalone ./
COPY --from=builder --chown=bornoland:bornoland /app/apps/web/.next/static ./apps/web/.next/static

USER bornoland
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1

CMD ["node", "apps/web/server.js"]
