# Comprehensive Testing Guide

## Overview

This guide covers all testing procedures for WorkforceAutomated production deployment.

## 1. Health Check

```bash
curl https://workforceautomated.com/api/health
# Expected: {"status":"ok","timestamp":"...","version":"1.0.0"}
```

## 2. Authentication Testing

### GitHub OAuth Flow
1. Visit https://workforceautomated.com
2. Click **Login with GitHub**
3. Authorize the application on GitHub
4. Verify redirect to dashboard
5. Verify user profile is populated (name, email, avatar)

### JWT Token Validation
```bash
# Login and get token
TOKEN=$(curl -s -X POST https://workforceautomated.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"provider":"github"}' | jq -r '.token')

# Test authenticated endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://workforceautomated.com/api/user/profile
```

## 3. Encryption Feature Testing

### Zero-Knowledge Encryption (AES-256-GCM)
1. Log in to the application
2. Navigate to **Settings → Encryption**
3. Click **Generate Encryption Keys**
4. Verify recovery key is displayed (save it securely)
5. Encrypt a test document
6. Verify the document is encrypted
7. Decrypt using the same key
8. Verify original content is restored

### NaCl Encryption
1. Navigate to **Settings → Encryption → Advanced**
2. Generate NaCl key pair
3. Test encrypt/decrypt cycle

## 4. DRASS Disaster Recovery Testing

1. Navigate to **Settings → Backups**
2. Click **Create Backup**
3. Verify backup appears in list with timestamp
4. Verify backup is encrypted (lock icon)
5. Test restore:
   - Click **Restore** on a backup
   - Confirm restore operation
   - Verify data is restored correctly

## 5. Payment Processing Testing

### Test Mode (Current)
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/28)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

1. Visit https://workforceautomated.com/pricing
2. Select a plan
3. Click **Subscribe**
4. Enter test card details
5. Verify payment success message
6. Verify subscription is active in dashboard
7. Check Stripe dashboard for payment record

### Webhook Testing
```bash
# Verify webhook endpoint is accessible
curl -X POST https://workforceautomated.com/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{}' 
# Expected: 400 (missing Stripe signature - confirms endpoint exists)
```

## 6. Email Notification Testing

### Password Reset Flow
1. Visit https://workforceautomated.com/login
2. Click **Forgot Password**
3. Enter your email address
4. Check inbox for reset email
5. Click reset link
6. Set new password
7. Log in with new password

### Security Alert Email
1. Attempt 5 failed logins
2. Verify security alert email is received

## 7. Security Audit Dashboard Testing

1. Log in as admin
2. Navigate to **Settings → Security Audit**
3. Verify the following are logged:
   - Successful login
   - Failed login attempts
   - Encryption key generation
   - Backup creation
4. Verify timestamps are accurate
5. Verify IP addresses are recorded

## 8. Landing Page Testing

1. Visit https://workforceautomated.com (logged out)
2. Verify landing page loads correctly
3. Verify security visuals are displayed
4. Verify pricing section is visible
5. Verify CTA buttons work
6. Test on mobile viewport (375px width)
7. Test on tablet viewport (768px width)

## 9. API Endpoint Testing

```bash
BASE=https://workforceautomated.com/api

# Health
curl $BASE/health

# Auth
curl $BASE/auth/github  # Should redirect to GitHub

# Protected endpoint (without token)
curl $BASE/user/profile
# Expected: 401 Unauthorized

# Stripe webhook
curl -X POST $BASE/stripe/webhook
# Expected: 400 (no signature)
```

## 10. Browser Console Check

1. Open https://workforceautomated.com in Chrome
2. Open DevTools (F12) → Console tab
3. Verify **zero JavaScript errors** on page load
4. Navigate through all pages
5. Verify no errors appear

## Production Checklist

| Test | Expected Result | Status |
|---|---|---|
| Health check | `{"status":"ok"}` | |
| Landing page loads | 200 OK, no JS errors | |
| GitHub OAuth | Successful login + redirect | |
| Encryption key generation | Keys generated, recovery key shown | |
| Backup creation | Backup appears in list | |
| Test payment | Payment success, subscription active | |
| Password reset email | Email received with link | |
| Security audit logs | Events logged correctly | |
| Mobile responsive | Layout correct on 375px | |
| No console errors | Zero errors in DevTools | |

## Automated E2E Tests

The repository includes `e2e_test.py` for automated testing:

```bash
cd /path/to/workforceautomated
python3 e2e_test.py --url https://workforceautomated.com
```
