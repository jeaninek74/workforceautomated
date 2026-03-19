# SendGrid Email Setup Guide

## Overview

WorkforceAutomated uses SendGrid for transactional email delivery including:
- Password reset emails
- Account verification
- Security alerts
- Backup notifications

## Step 1: Create SendGrid Account

1. Go to https://sendgrid.com and create a free account
2. Verify your email address
3. Complete the sender identity verification

## Step 2: Verify Sender Domain

1. In SendGrid dashboard, go to **Settings → Sender Authentication**
2. Click **Authenticate Your Domain**
3. Select your DNS provider (Cloudflare)
4. Enter domain: `workforceautomated.com`
5. SendGrid will provide DNS records to add in Cloudflare:

| Type | Name | Value |
|---|---|---|
| CNAME | `em1234.workforceautomated.com` | `u1234567.wl.sendgrid.net` |
| CNAME | `s1._domainkey.workforceautomated.com` | `s1.domainkey.u1234567.wl.sendgrid.net` |
| CNAME | `s2._domainkey.workforceautomated.com` | `s2.domainkey.u1234567.wl.sendgrid.net` |

6. Add these records in Cloudflare DNS with **Proxy Status: DNS only** (grey cloud)
7. Return to SendGrid and click **Verify**

## Step 3: Create API Key

1. Go to **Settings → API Keys**
2. Click **Create API Key**
3. Name: `WorkforceAutomated Production`
4. Permissions: **Restricted Access** → Mail Send: Full Access
5. Click **Create & View**
6. **Copy the key immediately** — it will only be shown once

## Step 4: Add to Railway

```bash
# Via Railway API (replace YOUR_KEY with actual SendGrid API key):
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
```

Add this in Railway dashboard → workforceautomated-app → Variables tab.

## Step 5: Test Email Delivery

```bash
curl -X POST https://workforceautomated.com/api/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com"}'
```

## Email Templates Used

| Template | Trigger | From |
|---|---|---|
| Password Reset | `/api/auth/forgot-password` | noreply@workforceautomated.com |
| Welcome Email | New user registration | noreply@workforceautomated.com |
| Security Alert | Failed login attempts | noreply@workforceautomated.com |
| Backup Complete | Successful backup | noreply@workforceautomated.com |

## Troubleshooting

- **Emails not sending:** Verify `SENDGRID_API_KEY` is set in Railway
- **Emails in spam:** Complete domain authentication in Step 2
- **Bounces:** Check SendGrid Activity Feed for error details
