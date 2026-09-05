#!/usr/bin/env bash
# ==============================================================================
# BornoLand EC2 Deployment Script
#
# Self-bootstrapping: automatically installs nvm, Node 22, pnpm 9.12.0
# if missing. Then runs the standard deployment.
#
# Simple git-based deployment:
#   bootstrap → git pull → install → build → nginx → pm2 restart → health checks
#
# Usage:
#   ./scripts/deploy-production.sh
#
# EC2 repository: ~/bornoLand-sass
# ==============================================================================

set -Eeuo pipefail

REPO_DIR="$HOME/bornoLand-sass"
ECOSYSTEM="$REPO_DIR/ecosystem.config.cjs"

echo ""
echo "========================================="
echo "  BornoLand Deploy"
echo "  $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "========================================="

# ── BOOTSTRAP: nvm, Node 22, pnpm 9.12.0 ───────────────────────────────
# Self-healing: install automatically if missing. Never fail because tools are absent.

export NVM_DIR="$HOME/.nvm"

# 1. Bootstrap nvm
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo ""
  echo "--- Bootstrapping nvm ---"
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    echo "FATAL: nvm installation failed — $NVM_DIR/nvm.sh still missing"
    exit 1
  fi
  echo "✓ nvm installed"
fi

. "$NVM_DIR/nvm.sh"

if ! command -v nvm &>/dev/null; then
  echo "FATAL: nvm loaded but 'nvm' command not found"
  exit 1
fi

# 2. Bootstrap Node 22
NODE_BEFORE=$(node --version 2>/dev/null || echo "none")
echo "Node before activation: $NODE_BEFORE"

if ! nvm ls 22 &>/dev/null; then
  echo "--- Installing Node 22 ---"
  nvm install 22
fi

nvm use 22
nvm alias default 22
hash -r

NODE_AFTER=$(node --version)
echo "Node after activation:  $NODE_AFTER"

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" != "22" ]; then
  echo ""
  echo "FATAL: Node 22 is required, found $(node --version)"
  exit 1
fi

# 3. Bootstrap pnpm 9.12.0
PNPM_BEFORE=$(pnpm --version 2>/dev/null || echo "none")
echo "pnpm before activation: $PNPM_BEFORE"

# Try corepack first
if command -v corepack &>/dev/null; then
  corepack enable
  corepack prepare pnpm@9.12.0 --activate
  hash -r
fi

# Verify via corepack, fall back to npm global install
PNPM_CHECK=$(corepack pnpm --version 2>/dev/null || echo "")
if [ "$PNPM_CHECK" != "9.12.0" ]; then
  echo "--- Installing pnpm 9.12.0 via npm ---"
  npm install -g pnpm@9.12.0
  hash -r
fi

PNPM_AFTER=$(pnpm --version)
echo "pnpm after activation:  $PNPM_AFTER"

if [ "$PNPM_AFTER" != "9.12.0" ]; then
  echo ""
  echo "FATAL: pnpm 9.12.0 is required, found $PNPM_AFTER"
  exit 1
fi

# ── Runtime version verification ────────────────────────────────────────
echo ""
echo "========================================="
echo "  RUNTIME VERSIONS"
echo "========================================="
echo "node --version: $(node --version)"
echo "pnpm --version: $(pnpm --version)"
echo "node path:      $(command -v node)"
echo "pnpm path:      $(command -v pnpm)"
echo "node execPath:  $(node -p 'process.execPath')"
echo "========================================="

# Hard gate — do NOT proceed if versions are wrong
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" != "22" ]; then
  echo "FATAL: node version is not 22.x — aborting"
  exit 1
fi
PNPM_VERSION="$(pnpm --version)"
if [ "$PNPM_VERSION" != "9.12.0" ]; then
  echo "FATAL: pnpm version is not 9.12.0 — aborting"
  exit 1
fi

# ── 1. Git pull ──────────────────────────────────────────────────────────
echo ""
echo "--- Step 1: Git pull ---"
cd "$REPO_DIR"
git fetch origin main
git checkout main
git reset --hard origin/main
echo "✓ Code updated to $(git rev-parse --short HEAD)"

# ── 2. Install dependencies ──────────────────────────────────────────────
echo ""
echo "--- Step 2: Install dependencies ---"
pnpm install --frozen-lockfile
echo "✓ Dependencies installed"

# ── 3. Stop PM2 processes (free memory for build) ────────────────────────
echo ""
echo "--- Step 3: Stop PM2 processes ---"
pm2 stop bornoland-api bornoland-web 2>/dev/null || true
echo "✓ PM2 processes stopped"

# Build failure recovery — restore PM2 if build fails
build_failed() {
  local code=$?
  echo ""
  echo "========================================="
  echo "  BUILD FAILED (exit ${code})"
  echo "  Restoring PM2 processes..."
  echo "========================================="
  pm2 restart bornoland-api --update-env 2>/dev/null || true
  pm2 restart bornoland-web --update-env 2>/dev/null || true
  pm2 save || true
  echo "✓ PM2 processes restored"
  echo "========================================="
  exit "$code"
}

trap build_failed ERR

# ── 4. Test esbuild binary (before real build) ──────────────────────────
echo ""
echo "--- Step 4: Verify esbuild ---"
cd "$REPO_DIR/apps/api"

echo "esbuild package version: $(node -p "require('esbuild/package.json').version")"
echo "esbuild --version:       $(pnpm exec esbuild --version)"
echo "esbuild binary:          $(readlink -f ./node_modules/.bin/esbuild 2>/dev/null || echo 'not found')"
echo "esbuild binary type:     $(file "$(readlink -f ./node_modules/.bin/esbuild 2>/dev/null || echo /dev/null)" 2>/dev/null || echo 'not found')"

# Tiny esbuild build test
cat > /tmp/esbuild-test.ts <<'EOF'
export const test = 1
EOF

pnpm exec esbuild /tmp/esbuild-test.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --outfile=/tmp/esbuild-test.js

node /tmp/esbuild-test.js
echo "✓ Tiny esbuild test passed"

# ── 5. Build API ─────────────────────────────────────────────────────────
echo ""
echo "--- Step 5: Build API ---"

# Capture OOM events around the build
echo "OOM check before build:"
dmesg -T 2>/dev/null | tail -50 | grep -i -E "oom|out of memory|killed process" || echo "  (none found)"

cd "$REPO_DIR"
/usr/bin/time -v pnpm --filter @bornoland/api build 2>&1 || {
  echo ""
  echo "=== OOM check after build failure ==="
  dmesg -T 2>/dev/null | tail -50 | grep -i -E "oom|out of memory|killed process" || echo "  (none found)"
  echo ""
  echo "=== Memory state ==="
  free -h 2>/dev/null || true
  swapon --show 2>/dev/null || true
  exit 1
}

echo "OOM check after build:"
dmesg -T 2>/dev/null | tail -50 | grep -i -E "oom|out of memory|killed process" || echo "  (none found)"
echo "✓ API built"

# ── 6. Build Web ─────────────────────────────────────────────────────────
echo ""
echo "--- Step 6: Build Web ---"
pnpm --filter @bornoland/web build
echo "✓ Web built"

# Remove build failure trap — builds succeeded
trap - ERR

# ── 7. Nginx ─────────────────────────────────────────────────────────────
echo ""
echo "--- Step 7: Nginx ---"

NGINX_CONF="/etc/nginx/sites-available/bornosoft.site"
NGINX_BACKUP="${NGINX_CONF}.bak"

# Check SSL certs exist
for cert in \
  "/etc/letsencrypt/live/bornosoft.site/fullchain.pem" \
  "/etc/letsencrypt/live/bornosoft.site/privkey.pem"
do
  if ! sudo test -f "$cert"; then
    echo "✗ SSL file missing: $cert"
    exit 1
  fi
done
echo "✓ SSL certificates present"

# Backup current config
[ -f "$NGINX_CONF" ] && sudo cp "$NGINX_CONF" "$NGINX_BACKUP"

# Install new config
sudo cp "$REPO_DIR/nginx/bornosoft.site.conf" "$NGINX_CONF"
sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/bornosoft.site
[ -L /etc/nginx/sites-enabled/default ] && sudo rm -f /etc/nginx/sites-enabled/default

if sudo nginx -t 2>&1; then
  echo "✓ Nginx config valid"
  sudo systemctl reload nginx
  sudo rm -f "$NGINX_BACKUP"
else
  echo "✗ Nginx config invalid — restoring backup"
  [ -f "$NGINX_BACKUP" ] && sudo cp "$NGINX_BACKUP" "$NGINX_CONF" && sudo nginx -t || true
  exit 1
fi

# ── 8. PM2 restart ───────────────────────────────────────────────────────
echo ""
echo "--- Step 8: PM2 restart ---"
pm2 restart bornoland-api --update-env
pm2 restart bornoland-web --update-env
pm2 save
echo ""
pm2 status

# ── 9. Health checks ─────────────────────────────────────────────────────
echo ""
echo "--- Step 9: Health checks ---"
sleep 3

health_check() {
  local name="$1"
  local url="$2"
  local max=30
  local i=1

  printf "  %-42s " "${name}..."
  while [ $i -le $max ]; do
    if curl -fsS --max-time 5 "$url" > /dev/null 2>&1; then
      echo "✓ OK (${i}s)"
      return 0
    fi
    sleep 1
    i=$((i + 1))
  done
  echo "✗ FAILED after ${max}s"
  return 1
}

FAILED=0
health_check "API  http://127.0.0.1:4000/" "http://127.0.0.1:4000/" || FAILED=1
health_check "Web  http://127.0.0.1:3000/" "http://127.0.0.1:3000/" || FAILED=1
health_check "HTTPS bornosoft.site" "https://bornosoft.site/" || FAILED=1
health_check "HTTPS nayeem.bornosoft.site" "https://nayeem.bornosoft.site/" || FAILED=1

if [ "$FAILED" -ne 0 ]; then
  echo ""
  echo "=== PM2 status ==="
  pm2 status
  echo ""
  echo "=== API logs ==="
  pm2 logs bornoland-api --lines 40 --nostream 2>/dev/null || true
  echo ""
  echo "=== Web logs ==="
  pm2 logs bornoland-web --lines 40 --nostream 2>/dev/null || true
  echo ""
  echo "=== Nginx errors ==="
  sudo tail -n 30 /var/log/nginx/error.log 2>/dev/null || true
  exit 1
fi

echo ""
echo "========================================="
echo "  DEPLOYMENT SUCCESS"
echo "  $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "========================================="
echo "  Commit: $(git rev-parse --short HEAD)"
echo "  Node:   $(node --version)"
echo "  pnpm:   $(pnpm --version)"
echo "  API:    http://127.0.0.1:4000/"
echo "  Web:    http://127.0.0.1:3000/"
echo ""
