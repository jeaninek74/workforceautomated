# WorkforceAutomated — Railway Deployment Guide

## Prerequisites

- Railway account at https://railway.app
- Railway CLI installed: `curl -fsSL https://railway.app/install.sh | sh`
- Valid Railway API token from: https://railway.app/account/tokens

## 1. Authenticate

```bash
# Set your token (get from https://railway.app/account/tokens)
export RAILWAY_TOKEN=<your-token>

# Verify authentication
railway whoami
```

## 2. Initialize & Deploy

```bash
cd /home/ubuntu/workforceautomated

# Link to existing project or create new
railway init

# Deploy to production
railway up --detach
```

## 3. Set Environment Variables

```bash
# Required environment variables on Railway
railway variables set DATABASE_URL="<your-tidb-connection-string>"
railway variables set JWT_SECRET="<your-jwt-secret>"
railway variables set STRIPE_SECRET_KEY="<your-stripe-secret-key>"
railway variables set STRIPE_WEBHOOK_SECRET="<your-stripe-webhook-secret>"
railway variables set VITE_STRIPE_PUBLISHABLE_KEY="<your-stripe-publishable-key>"
```

## 4. Capture & Store Deployment Logs

```bash
# Run the log capture script
./scripts/capture-railway-logs.sh
```

## 5. Monitor Logs in Real-Time

```bash
# Stream live logs
railway logs --tail

# Save logs to file
railway logs > railway-logs/deployment-$(date +%Y%m%d-%H%M%S).log
```

## 6. Stripe Webhook Setup

After deployment, register the webhook in Stripe Dashboard:
- URL: `https://<your-railway-domain>/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`

## Build Configuration

The project uses:
- **Build command**: `pnpm build`
- **Start command**: `pnpm start`
- **Node version**: 22.x
- **Port**: Detected automatically via `PORT` env var

## railway.json (auto-generated on `railway init`)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "healthcheckPath": "/api/trpc/auth.me",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```
