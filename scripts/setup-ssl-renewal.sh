#!/usr/bin/env bash
# ==============================================================================
# One-time Setup Script for Automated Let's Encrypt Wildcard SSL Renewal
# For domain: bornosoft.site and *.bornosoft.site on Namecheap DNS
#
# Run on EC2:
#   sudo bash ~/bornoLand-sass/scripts/setup-ssl-renewal.sh
# ==============================================================================

set -euo pipefail

echo "========================================================"
echo " Setting up Automated Wildcard SSL Renewal (Namecheap) "
echo "========================================================"

# 1. Create hooks directory
echo "1. Installing DNS hook script to /etc/letsencrypt/hooks/..."
sudo mkdir -p /etc/letsencrypt/hooks
sudo cp ~/bornoLand-sass/scripts/namecheap-dns-hook.py /etc/letsencrypt/hooks/namecheap-dns-hook.py
sudo chmod 700 /etc/letsencrypt/hooks/namecheap-dns-hook.py
sudo chown root:root /etc/letsencrypt/hooks/namecheap-dns-hook.py

# 2. Setup credentials file template if not existing
CREDENTIALS_FILE="/etc/letsencrypt/namecheap.ini"
if [ ! -f "$CREDENTIALS_FILE" ]; then
  echo "2. Creating template credentials file at $CREDENTIALS_FILE..."
  sudo bash -c "cat > $CREDENTIALS_FILE" << 'EOF'
# Namecheap API Credentials for automated Let's Encrypt DNS-01 challenges
# Note: Whitelist your EC2 server public IP in Namecheap Profile > Tools > Namecheap API Access
namecheap_api_user = YOUR_NAMECHEAP_USERNAME
namecheap_api_key = YOUR_NAMECHEAP_API_KEY
namecheap_username = YOUR_NAMECHEAP_USERNAME
namecheap_client_ip = 3.111.51.117
propagation_seconds = 60
EOF
  sudo chmod 600 "$CREDENTIALS_FILE"
  sudo chown root:root "$CREDENTIALS_FILE"
  echo "  ✓ Created $CREDENTIALS_FILE (Permissions: 600, root:root)"
  echo "  ⚠️ IMPORTANT: Edit $CREDENTIALS_FILE and fill in your real Namecheap API credentials!"
else
  echo "2. Credentials file $CREDENTIALS_FILE already exists, preserving it."
  sudo chmod 600 "$CREDENTIALS_FILE"
  sudo chown root:root "$CREDENTIALS_FILE"
fi

# 3. Setup deploy hook to reload Nginx only after successful validation
echo "3. Creating renewal deploy hook at /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh..."
sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy
sudo bash -c 'cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh' << 'EOF'
#!/bin/sh
set -e

# Test Nginx configuration before reloading
if nginx -t >/dev/null 2>&1; then
    systemctl reload nginx
    echo "[$(date)] Certificate renewed. Nginx reloaded successfully."
else
    echo "[$(date)] ERROR: nginx -t failed after renewal! Nginx was NOT reloaded." >&2
    exit 1
fi
EOF
sudo chmod 750 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
sudo chown root:root /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
echo "  ✓ Deploy hook installed with safe validation logic"

# 4. Configure renewal config for bornosoft.site
RENEWAL_CONF="/etc/letsencrypt/renewal/bornosoft.site.conf"
if [ -f "$RENEWAL_CONF" ]; then
  echo "4. Updating renewal configuration in $RENEWAL_CONF..."
  # Check if hooks are already present
  if ! sudo grep -q "manual_auth_hook" "$RENEWAL_CONF"; then
    sudo sed -i '/\[renewalparams\]/a manual_auth_hook = /etc/letsencrypt/hooks/namecheap-dns-hook.py auth\nmanual_cleanup_hook = /etc/letsencrypt/hooks/namecheap-dns-hook.py cleanup' "$RENEWAL_CONF"
    echo "  ✓ Configured manual_auth_hook and manual_cleanup_hook in $RENEWAL_CONF"
  else
    echo "  ✓ Renewal hooks already registered in $RENEWAL_CONF"
  fi
else
  echo "  ! $RENEWAL_CONF not found. If you re-issue the certificate, include the hooks:"
  echo "    sudo certbot certonly --manual --preferred-challenges dns \\"
  echo "      --manual-auth-hook '/etc/letsencrypt/hooks/namecheap-dns-hook.py auth' \\"
  echo "      --manual-cleanup-hook '/etc/letsencrypt/hooks/namecheap-dns-hook.py cleanup' \\"
  echo "      -d bornosoft.site -d '*.bornosoft.site'"
fi

# 5. Verify systemd timer
echo "5. Verifying certbot systemd timer..."
if systemctl list-unit-files | grep -q certbot.timer; then
  sudo systemctl enable certbot.timer
  sudo systemctl start certbot.timer
  sudo systemctl status certbot.timer --no-pager || true
  echo "  ✓ certbot.timer is active and scheduled"
fi

echo ""
echo "========================================================"
echo " Setup complete!"
echo " Next step:"
echo " 1. Edit /etc/letsencrypt/namecheap.ini with your real Namecheap API key"
echo " 2. Whitelist your EC2 IP (3.111.51.117) in Namecheap API Access"
echo " 3. Run dry-run test: sudo certbot renew --dry-run"
echo "========================================================"
