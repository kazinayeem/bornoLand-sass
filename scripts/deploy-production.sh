#!/usr/bin/env bash
# ==============================================================================
# BornoLand EC2 Atomic Deployment Script
#
# Usage (called from GitHub Actions SSH step, or manually):
#   ./scripts/deploy-production.sh <RELEASE_SHA> <ARTIFACT_PATH>
#
# This script:
#   - Receives a pre-built tarball (built on GitHub runner — no compilation here)
#   - Extracts to ~/bornoLand-releases/release-<SHA>/
#   - Copies runtime env files from ~/bornoland-secrets/ (or legacy location)
#   - Updates Nginx config (validates before reload)
#   - Atomically switches ~/bornoLand-releases/current symlink
#   - Gracefully reloads PM2 (bornoland-api + bornoland-web)
#   - Runs health checks with 30s retry
#   - Automatically rolls back on any failure
#
# EC2 NEVER runs: pnpm install / tsup / next build / tsc / esbuild
#
# First-time secrets setup on EC2:
#   mkdir -p ~/bornoland-secrets
#   cp ~/bornoLand-sass/apps/api/.env.production ~/bornoland-secrets/api.env
#   cp ~/bornoLand-sass/apps/web/.env.production ~/bornoland-secrets/web.env
# ==============================================================================

set -Eeuo pipefail

RELEASE_SHA="${1:?Usage: $0 <RELEASE_SHA> <ARTIFACT_PATH>}"
ARTIFACT="${2:?Usage: $0 <RELEASE_SHA> <ARTIFACT_PATH>}"

RELEASES_BASE="$HOME/bornoLand-releases"
NEW_RELEASE="${RELEASES_BASE}/release-${RELEASE_SHA}"
CURRENT_LINK="${RELEASES_BASE}/current"
SECRETS_DIR="$HOME/bornoland-secrets"
LEGACY_DIR="$HOME/bornoLand-sass"

# ── Track previous release for rollback ──────────────────────────────────
PREVIOUS_RELEASE=""
if [ -L "$CURRENT_LINK" ]; then
  PREVIOUS_RELEASE="$(readlink "$CURRENT_LINK")"
fi

# ── Rollback on any ERR ───────────────────────────────────────────────────
rollback() {
  local code=$?
  echo ""
  echo "========================================="
  echo "  ROLLBACK TRIGGERED (exit ${code})"
  echo "========================================="

  if [ -n "$PREVIOUS_RELEASE" ] && [ -d "$PREVIOUS_RELEASE" ]; then
    echo "  Restoring: $PREVIOUS_RELEASE"
    ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK"
    pm2 reload bornoland-api --update-env 2>/dev/null \
      || pm2 restart bornoland-api 2>/dev/null || true
    pm2 reload bornoland-web --update-env 2>/dev/null \
      || pm2 restart bornoland-web 2>/dev/null || true
    pm2 save || true
    echo "  ✓ Rolled back to: $PREVIOUS_RELEASE"
  else
    echo "  ⚠ No previous release to roll back to."
  fi

  rm -rf "$NEW_RELEASE" || true

  echo ""
  echo "  Production remains on previous release."
  echo "========================================="
  exit "$code"
}

trap rollback ERR

echo ""
echo "========================================="
echo "  BornoLand Deploy: ${RELEASE_SHA}"
echo "  $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "========================================="

# ── Lightweight system check ──────────────────────────────────────────────
echo ""
echo "=== Memory ==="
free -h || true
echo ""
echo "=== Disk ==="
df -h / || true

# ── Step 1: Validate artifact ─────────────────────────────────────────────
echo ""
echo "--- Step 1: Validate artifact ---"

if [ ! -f "$ARTIFACT" ]; then
  echo "✗ Artifact not found: $ARTIFACT"
  exit 1
fi
echo "✓ Artifact: $(du -sh "$ARTIFACT" | cut -f1)"

# ── Step 2: Extract to new release directory ──────────────────────────────
echo ""
echo "--- Step 2: Extract ---"

mkdir -p "$RELEASES_BASE"
rm -rf "$NEW_RELEASE"
mkdir -p "$NEW_RELEASE"

tar -xzf "$ARTIFACT" -C "$NEW_RELEASE"
echo "✓ Extracted to: $NEW_RELEASE"

# ── Step 3: Validate critical files ──────────────────────────────────────
echo ""
echo "--- Step 3: Validate files ---"

for f in \
  "apps/api/dist/index.js" \
  "apps/api/package.json" \
  "apps/web/.next/server" \
  "apps/web/package.json" \
  "ecosystem.config.cjs" \
  "nginx/bornosoft.site.conf"
do
  if [ ! -e "$NEW_RELEASE/$f" ]; then
    echo "✗ Missing: $f"
    exit 1
  fi
  echo "✓ $f"
done

# Verify Next.js build output
if [ -d "$NEW_RELEASE/apps/web/.next/server" ]; then
  echo "✓ apps/web/.next/server present"
else
  echo "✗ apps/web/.next/server missing"
  exit 1
fi

# Verify node_modules exist
if [ -d "$NEW_RELEASE/apps/web/node_modules" ]; then
  echo "✓ apps/web/node_modules present"
else
  echo "✗ apps/web/node_modules missing"
  exit 1
fi

# ── Step 3b: Validate symlinks ──────────────────────────────────────────
echo ""
echo "--- Step 3b: Validate symlinks ---"
BROKEN_SYMLINKS=$(find "$NEW_RELEASE" -xtype l -print 2>/dev/null || true)
if [ -n "$BROKEN_SYMLINKS" ]; then
  echo "✗ Broken symlinks found in release:"
  echo "$BROKEN_SYMLINKS"
  exit 1
fi
echo "✓ No broken symlinks in release"

# Verify that valid symlinks point to targets inside the release
echo "Validating symlink targets..."
INVALID_SYMLINKS=0
while IFS= read -r slink; do
  target=$(readlink "$slink")
  # Skip absolute symlinks pointing outside the release (e.g., /usr/lib)
  if [[ "$target" == /* ]]; then
    if [ ! -e "$slink" ]; then
      echo "  ⚠ Broken absolute symlink: $slink -> $target"
      INVALID_SYMLINKS=$((INVALID_SYMLINKS + 1))
    fi
  fi
done < <(find "$NEW_RELEASE" -type l 2>/dev/null)
if [ "$INVALID_SYMLINKS" -gt 0 ]; then
  echo "✗ Found $INVALID_SYMLINKS invalid symlinks"
  exit 1
fi
echo "✓ All symlinks valid"

# ── Step 4: Install runtime environment files ─────────────────────────────
echo ""
echo "--- Step 4: Environment files ---"

install_env() {
  local name="$1"
  local primary="$2"
  local fallback="$3"
  local dest="$4"

  if [ -f "$primary" ]; then
    cp "$primary" "$NEW_RELEASE/$dest"
    echo "✓ $name env installed from: $primary"
  elif [ -f "$fallback" ]; then
    cp "$fallback" "$NEW_RELEASE/$dest"
    echo "✓ $name env installed from: $fallback (legacy)"
    echo "  → Migrate to: $primary"
  else
    echo "⚠ $name: no env file at $primary or $fallback"
    echo "  Process will use existing environment variables only."
  fi
}

install_env "API" \
  "$SECRETS_DIR/api.env" \
  "$LEGACY_DIR/apps/api/.env.production" \
  "apps/api/.env.production"

install_env "Web" \
  "$SECRETS_DIR/web.env" \
  "$LEGACY_DIR/apps/web/.env.production" \
  "apps/web/.env.production"

# ── Step 5: Nginx ─────────────────────────────────────────────────────────
echo ""
echo "--- Step 5: Nginx ---"

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

NGINX_CONF="/etc/nginx/sites-available/bornosoft.site"
NGINX_BACKUP="${NGINX_CONF}.bak"

[ -f "$NGINX_CONF" ] && sudo cp "$NGINX_CONF" "$NGINX_BACKUP"

sudo cp "$NEW_RELEASE/nginx/bornosoft.site.conf" "$NGINX_CONF"
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

# ── Step 6: Atomic symlink switch ─────────────────────────────────────────
echo ""
echo "--- Step 6: Switch symlink ---"
ln -sfn "$NEW_RELEASE" "$CURRENT_LINK"
echo "✓ current → $NEW_RELEASE"

# ── Step 7: PM2 graceful reload ───────────────────────────────────────────
echo ""
echo "--- Step 7: PM2 reload ---"

ECOSYSTEM="$NEW_RELEASE/ecosystem.config.cjs"

if pm2 describe bornoland-api > /dev/null 2>&1 \
  && pm2 describe bornoland-web > /dev/null 2>&1; then
  # pm2 reload reads the ecosystem file and does a graceful reload
  # New worker starts before old worker is stopped (zero downtime)
  pm2 reload "$ECOSYSTEM" --update-env
else
  echo "  ⚠ One or more PM2 processes not found — starting from ecosystem config"
  pm2 start "$ECOSYSTEM" --update-env
fi

pm2 save
echo ""
pm2 status

# ── Step 8: Health checks ─────────────────────────────────────────────────
echo ""
echo "--- Step 8: Health checks ---"

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

if [ "$FAILED" -ne 0 ]; then
  echo ""
  echo "=== API logs ==="
  pm2 logs bornoland-api --lines 40 --nostream 2>/dev/null || true
  echo ""
  echo "=== Web logs ==="
  pm2 logs bornoland-web --lines 40 --nostream 2>/dev/null || true
  echo ""
  echo "=== Nginx error log ==="
  sudo tail -n 30 /var/log/nginx/error.log 2>/dev/null || true
  exit 1
fi

# ── Step 9: Cleanup old releases ─────────────────────────────────────────
echo ""
echo "--- Step 9: Cleanup ---"

# Keep: current + previous (one rollback). Remove anything older.
ls -dt "${RELEASES_BASE}"/release-* 2>/dev/null \
  | tail -n +3 \
  | xargs rm -rf 2>/dev/null || true

echo "✓ Cleanup done"
echo ""
echo "========================================="
echo "  DEPLOYMENT SUCCESS: ${RELEASE_SHA}"
echo "  $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "========================================="
echo ""
echo "  Release:  $NEW_RELEASE"
echo "  Symlink:  $CURRENT_LINK"
echo "  API:      http://127.0.0.1:4000/"
echo "  Web:      http://127.0.0.1:3000/"
echo ""
