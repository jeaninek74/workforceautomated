# HTTPS / SSL Setup Guide

## Overview

WorkforceAutomated uses **Cloudflare** for SSL termination and **Railway** for hosting. SSL is automatically managed through this stack.

## Current SSL Configuration

| Layer | Provider | Status |
|---|---|---|
| Edge SSL (Browser → Cloudflare) | Cloudflare Universal SSL | Active |
| Origin SSL (Cloudflare → Railway) | Railway auto-TLS | Active |
| Certificate | Cloudflare managed | Auto-renewed |

## Cloudflare SSL Settings

1. Go to https://dash.cloudflare.com → workforceautomated.com
2. Navigate to **SSL/TLS → Overview**
3. Set encryption mode to **Full (strict)**
4. Enable **Always Use HTTPS**
5. Enable **HSTS** (HTTP Strict Transport Security):
   - Max Age: 6 months
   - Include subdomains: Yes
   - Preload: Yes (after confirming site is stable)

## Railway Domain Configuration

Railway automatically provisions TLS certificates for:
- `workforceautomated-app-production.up.railway.app` (auto-managed)
- `workforceautomated.com` (via Cloudflare proxy)

## DNS Records (Cloudflare)

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `@` | `workforceautomated-app-production.up.railway.app` | Proxied (orange) |
| CNAME | `www` | `workforceautomated.com` | Proxied (orange) |
| CNAME | `api` | `workforceautomated-app-production.up.railway.app` | Proxied (orange) |

## Verifying SSL

```bash
# Check SSL certificate
curl -vI https://workforceautomated.com 2>&1 | grep -E "SSL|TLS|certificate|expire"

# Check HTTPS redirect
curl -I http://workforceautomated.com
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://workforceautomated.com/

# Check HSTS header
curl -I https://workforceautomated.com | grep -i strict
# Should return: strict-transport-security: max-age=...
```

## Security Headers (Cloudflare Rules)

Add these security headers via Cloudflare Transform Rules:

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Troubleshooting

- **Mixed content warnings:** Ensure all API calls use `https://` URLs
- **Certificate errors:** Check Cloudflare SSL mode is set to "Full (strict)"
- **Redirect loops:** Disable "Always Use HTTPS" in Railway if Cloudflare already handles it
