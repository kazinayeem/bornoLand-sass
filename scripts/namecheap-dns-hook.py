#!/usr/bin/env python3
"""
Namecheap DNS-01 Authentication and Cleanup Hook for Certbot
Automates Let's Encrypt wildcard certificate renewals for bornosoft.site & *.bornosoft.site.

Usage:
  Auth:    namecheap-dns-hook.py auth
  Cleanup: namecheap-dns-hook.py cleanup

Environment Variables provided by Certbot:
  CERTBOT_DOMAIN:     The domain being authenticated (e.g. bornosoft.site)
  CERTBOT_VALIDATION: The validation string / ACME challenge token

Configuration File:
  /etc/letsencrypt/namecheap.ini
  Permissions: chmod 600 /etc/letsencrypt/namecheap.ini
  Content:
    namecheap_api_user = YOUR_USERNAME
    namecheap_api_key = YOUR_API_KEY
    namecheap_username = YOUR_USERNAME
    namecheap_client_ip = YOUR_SERVER_PUBLIC_IP (e.g. 3.111.51.117)
"""

import os
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

CONFIG_PATH = "/etc/letsencrypt/namecheap.ini"
API_URL = "https://api.namecheap.com/xml.response"
NS = {"nc": "http://api.namecheap.com/xml.response"}


def load_config():
    if not os.path.exists(CONFIG_PATH):
        sys.stderr.write(f"ERROR: Configuration file not found at {CONFIG_PATH}\n")
        sys.exit(1)

    config = {}
    with open(CONFIG_PATH, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            config[key.strip().lower()] = val.strip()

    required = ["namecheap_api_user", "namecheap_api_key", "namecheap_username", "namecheap_client_ip"]
    for req in required:
        if req not in config:
            sys.stderr.write(f"ERROR: Missing '{req}' in {CONFIG_PATH}\n")
            sys.exit(1)

    return config


def parse_domain(domain):
    # Split domain into SLD and TLD (e.g., bornosoft.site -> bornosoft, site)
    domain = domain.strip().lstrip("*.")
    parts = domain.split(".")
    if len(parts) < 2:
        sys.stderr.write(f"ERROR: Invalid domain '{domain}'\n")
        sys.exit(1)
    # SLD is second-to-last, TLD is last (supports standard TLDs)
    sld = parts[-2]
    tld = parts[-1]
    return sld, tld


def call_api(params):
    data = urllib.parse.urlencode(params).encode("utf-8")
    req = urllib.request.Request(API_URL, data=data)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            content = resp.read()
            root = ET.fromstring(content)
            status = root.attrib.get("Status")
            if status != "OK":
                errors = [e.text for e in root.findall(".//nc:Error", NS)]
                err_msg = "; ".join(filter(None, errors)) or "Unknown API error"
                sys.stderr.write(f"Namecheap API error: {err_msg}\n")
                sys.exit(1)
            return root
    except Exception as e:
        sys.stderr.write(f"HTTP request to Namecheap failed: {e}\n")
        sys.exit(1)


def get_hosts(config, sld, tld):
    params = {
        "ApiUser": config["namecheap_api_user"],
        "ApiKey": config["namecheap_api_key"],
        "UserName": config["namecheap_username"],
        "ClientIp": config["namecheap_client_ip"],
        "Command": "namecheap.domains.dns.getHosts",
        "SLD": sld,
        "TLD": tld,
    }
    root = call_api(params)
    hosts = []
    for host in root.findall(".//nc:host", NS):
        hosts.append({
            "name": host.attrib.get("Name", "@"),
            "type": host.attrib.get("Type", "A"),
            "address": host.attrib.get("Address", ""),
            "mxpref": host.attrib.get("MXPref", "10"),
            "ttl": host.attrib.get("TTL", "1800"),
        })
    return hosts


def set_hosts(config, sld, tld, hosts):
    params = {
        "ApiUser": config["namecheap_api_user"],
        "ApiKey": config["namecheap_api_key"],
        "UserName": config["namecheap_username"],
        "ClientIp": config["namecheap_client_ip"],
        "Command": "namecheap.domains.dns.setHosts",
        "SLD": sld,
        "TLD": tld,
    }
    for idx, host in enumerate(hosts, 1):
        params[f"HostName{idx}"] = host["name"]
        params[f"RecordType{idx}"] = host["type"]
        params[f"Address{idx}"] = host["address"]
        params[f"MXPref{idx}"] = host["mxpref"]
        params[f"TTL{idx}"] = host["ttl"]

    call_api(params)


def auth_hook():
    domain = os.environ.get("CERTBOT_DOMAIN")
    validation = os.environ.get("CERTBOT_VALIDATION")
    if not domain or not validation:
        sys.stderr.write("ERROR: CERTBOT_DOMAIN and CERTBOT_VALIDATION must be set\n")
        sys.exit(1)

    config = load_config()
    sld, tld = parse_domain(domain)
    print(f"[Namecheap DNS Auth] Adding ACME TXT record for {domain} (SLD={sld}, TLD={tld})...")

    hosts = get_hosts(config, sld, tld)

    # Check if record already exists
    exists = any(
        h["name"] == "_acme-challenge" and h["type"] == "TXT" and h["address"] == validation
        for h in hosts
    )
    if not exists:
        hosts.append({
            "name": "_acme-challenge",
            "type": "TXT",
            "address": validation,
            "mxpref": "10",
            "ttl": "60",
        })
        set_hosts(config, sld, tld, hosts)
        print("  ✓ Successfully added _acme-challenge TXT record via Namecheap API")
    else:
        print("  ✓ _acme-challenge TXT record already present")

    # Namecheap DNS propagation wait
    propagation_seconds = int(config.get("propagation_seconds", "60"))
    print(f"  Waiting {propagation_seconds}s for Namecheap DNS propagation...")
    time.sleep(propagation_seconds)
    print("  ✓ Ready for Let's Encrypt DNS verification")


def cleanup_hook():
    domain = os.environ.get("CERTBOT_DOMAIN")
    validation = os.environ.get("CERTBOT_VALIDATION")
    if not domain or not validation:
        sys.stderr.write("ERROR: CERTBOT_DOMAIN and CERTBOT_VALIDATION must be set\n")
        sys.exit(1)

    config = load_config()
    sld, tld = parse_domain(domain)
    print(f"[Namecheap DNS Cleanup] Removing ACME TXT record for {domain}...")

    hosts = get_hosts(config, sld, tld)
    initial_count = len(hosts)
    # Remove matching _acme-challenge record
    remaining = [
        h for h in hosts
        if not (h["name"] == "_acme-challenge" and h["type"] == "TXT" and h["address"] == validation)
    ]

    if len(remaining) < initial_count:
        set_hosts(config, sld, tld, remaining)
        print("  ✓ Successfully removed _acme-challenge TXT record")
    else:
        print("  ✓ No matching _acme-challenge TXT record to clean up")


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ("auth", "cleanup"):
        sys.stderr.write("Usage: namecheap-dns-hook.py [auth|cleanup]\n")
        sys.exit(1)

    action = sys.argv[1]
    if action == "auth":
        auth_hook()
    elif action == "cleanup":
        cleanup_hook()


if __name__ == "__main__":
    main()
