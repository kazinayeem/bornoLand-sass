FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/config/package.json ./packages/config/package.json
RUN pnpm install --frozen-lockfile=false

FROM base AS builder
COPY . .
RUN pnpm --filter @bornoland/api build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 4000
CMD ["pnpm", "--filter", "@bornoland/api", "start"]