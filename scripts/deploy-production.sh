#!/usr/bin/env bash
# ==============================================================================
# BornoLand Production Off-EC2 Deployment Reference & Local Release Builder
#
# ROOT ARCHITECTURAL RULE:
# EC2 MUST NEVER COMPILE THE APPLICATION (no tsup, esbuild, next build, pnpm build).
# All builds and TypeScript checking happen on GitHub Actions runner.
# EC2 only receives the self-contained deployment artifact and performs
# atomic release symlinking, Nginx validation, PM2 reload, and health checks.
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "=================================================="
echo "🚀 BornoLand Release Artifact Builder"
echo "Root: $ROOT_DIR"
echo "=================================================="

# 1. Typecheck and build API
echo "📦 1. Building Express API..."
pnpm --filter @bornoland/api build

# 2. Build Web Next.js standalone
echo "📦 2. Building Next.js Web (standalone)..."
pnpm --filter @bornoland/web build

# 3. Package staging artifact
echo "📦 3. Packaging production artifact..."
ARTIFACT_DIR="${1:-dist-release}"
rm -rf "$ARTIFACT_DIR"
mkdir -p "$ARTIFACT_DIR/apps/api" "$ARTIFACT_DIR/apps/web" "$ARTIFACT_DIR/nginx"

# API production dependencies
pnpm --filter @bornoland/api deploy --prod "$ARTIFACT_DIR/apps/api"
cp -r apps/api/dist "$ARTIFACT_DIR/apps/api/"
mkdir -p "$ARTIFACT_DIR/apps/api/uploads"

# Web standalone + static assets
cp -r apps/web/.next/standalone/* "$ARTIFACT_DIR/apps/web/"
cp -r apps/web/.next/static "$ARTIFACT_DIR/apps/web/apps/web/.next/static"
cp -r apps/web/public "$ARTIFACT_DIR/apps/web/apps/web/public"
echo "require('./apps/web/server.js');" > "$ARTIFACT_DIR/apps/web/server.js"

# PM2 Ecosystem & Nginx
cp ecosystem.config.cjs "$ARTIFACT_DIR/"
cp nginx/bornosoft.site.conf "$ARTIFACT_DIR/nginx/"

echo "=================================================="
echo "✅ Release artifact packaged in: $ARTIFACT_DIR"
echo "Ready for atomic deployment onto EC2."
echo "=================================================="
