#!/usr/bin/env bash
set -euo pipefail

# BornoLand Local Subdomain Setup Script
# Adds wildcard subdomain entries to /etc/hosts for local development
#
# Usage:
#   chmod +x scripts/setup-hosts.sh
#   sudo ./scripts/setup-hosts.sh
#
# This supports two approaches:
#   1. *.localhost.com  — requires /etc/hosts entries
#   2. *.lvh.me         — zero-config (lvh.me always resolves to 127.0.0.1)
#
# After running, visit:
#   http://test.localhost.com:3002
#   http://demo.localhost.com:3002
#   http://test.lvh.me:3002
#   http://demo.lvh.me:3002

HOSTS_FILE="/etc/hosts"
MARKER_START="# --- BORNOFOLK LOCAL SUBDOMAINS START ---"
MARKER_END="# --- BORNOFOLK LOCAL SUBDOMAINS END ---"

ENTRIES=(
  "127.0.0.1 test.localhost.com"
  "127.0.0.1 demo.localhost.com"
  "127.0.0.1 store.localhost.com"
  "127.0.0.1 app.localhost.com"
  "127.0.0.1 admin.localhost.com"
  "127.0.0.1 api.localhost.com"
  "::1 test.localhost.com"
  "::1 demo.localhost.com"
  "::1 store.localhost.com"
  "::1 app.localhost.com"
  "::1 admin.localhost.com"
  "::1 api.localhost.com"
)

if grep -q "$MARKER_START" "$HOSTS_FILE"; then
  echo "Updating existing BornoLand subdomain entries in $HOSTS_FILE..."
  sed -i '' "/$MARKER_START/,/$MARKER_END/d" "$HOSTS_FILE"
else
  echo "Appending BornoLand subdomain entries to $HOSTS_FILE..."
fi

{
  echo "$MARKER_START"
  for entry in "${ENTRIES[@]}"; do
    echo "$entry"
  done
  echo "$MARKER_END"
} >> "$HOSTS_FILE"

echo ""
echo "✅ Done! Added $((${#ENTRIES[@]})) entries."
echo ""
echo "You can now visit any of these URLs in your browser:"
echo ""
echo "  http://test.localhost.com:3002    → tenant 'test'"
echo "  http://demo.localhost.com:3002   → tenant 'demo'"
echo "  http://store.localhost.com:3002  → tenant 'store'"
echo ""
echo "Or use lvh.me (no config needed):"
echo ""
echo "  http://test.lvh.me:3002"
echo "  http://demo.lvh.me:3002"
echo ""
echo "Note: Next.js runs on port 3002 in this project."
echo "You MUST include the port when developing:"
echo "  test.localhost.com:3002"
echo ""
echo "To remove entries later, re-run this script or manually"
echo "delete the section between the markers in $HOSTS_FILE."
