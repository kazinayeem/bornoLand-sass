# syntax=docker/dockerfile:1

############################################
# Backend (Express) — pnpm monorepo package
# Build context MUST be the repository root
############################################

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat \
  && corepack enable

# ── Install + build in one stage (pnpm store stays consistent) ──
FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --frozen-lockfile --filter @bornoland/api...

COPY apps/api ./apps/api
RUN pnpm --filter @bornoland/api build \
  && pnpm --filter @bornoland/api deploy --prod --legacy /deploy

# ── Minimal production image ──
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000

RUN apk add --no-cache libc6-compat wget \
  && addgroup -S bornoland \
  && adduser -S bornoland -G bornoland

# `pnpm deploy` produces a portable package with prod node_modules + dist
COPY --from=builder --chown=bornoland:bornoland /deploy ./

USER bornoland
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/health >/dev/null || exit 1

CMD ["node", "dist/index.js"]
