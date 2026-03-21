# Stripe Live Mode Setup Guide

## Current Status

WorkforceAutomated is currently configured with **Stripe Test Mode** keys. Follow this guide to switch to live mode for real payments.

## Step 1: Complete Stripe KYC Verification

1. Go to https://dashboard.stripe.com
2. Click **Activate your account**
3. Complete the business verification:
   - Business type and details
   - Owner information
   - Bank account for payouts
   - Identity verification (government ID)
4. Wait for Stripe approval (usually 1-2 business days)

## Step 2: Get Live API Keys

1. In Stripe dashboard, ensure you are in **Live mode** (toggle top-left)
2. Go to **Developers → API Keys**
3. Copy:
   - **Publishable key:** `pk_live_...`
   - **Secret key:** `sk_live_...`

## Step 3: Configure Stripe Webhook

1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://workforceautomated.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret:** `whsec_...`

## Step 4: Update Railway Environment Variables

Replace test keys with live keys in Railway:

```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
```

Update via Railway dashboard → workforceautomated-app → Variables.

## Step 5: Test Live Payment

1. Visit https://workforceautomated.com
2. Select a paid plan
3. Complete checkout with a real card
4. Verify payment appears in Stripe dashboard
5. Verify webhook events are received

## Pricing Plans Configured

| Plan | Price | Stripe Price ID |
|---|---|---|
| Basic | $9.99/month | `price_basic_monthly` |
| Professional | $29.99/month | `price_pro_monthly` |
| Enterprise | $99.99/month | `price_enterprise_monthly` |

## Test Cards (Test Mode Only)

| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0002` | Card declined |

## Troubleshooting

- **Webhook not receiving events:** Check the endpoint URL and ensure Railway is running
- **Payment declined:** Verify live keys are set (not test keys)
- **Webhook signature mismatch:** Ensure `STRIPE_WEBHOOK_SECRET` matches the live webhook signing secret
