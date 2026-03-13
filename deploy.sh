#!/bin/bash

# WorkforceAutomated Deployment Script
# This script automates deployment to Railway with Cloudflare DNS configuration

set -e

echo "🚀 WorkforceAutomated Deployment Script"
echo "========================================"

# Check for required environment variables
required_vars=("RAILWAY_TOKEN" "CLOUDFLARE_API_TOKEN" "GITHUB_TOKEN")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: $var environment variable not set"
    echo "Please set: export $var=your_token_here"
    exit 1
  fi
done

RAILWAY_API_URL="https://api.railway.app/graphql"
CLOUDFLARE_API_URL="https://api.cloudflare.com/client/v4"
DOMAIN="workforceautomated.com"
GITHUB_REPO="jeanynek74/workforceautomated"
PROJECT_NAME="workforceautomated"

echo ""
echo "📋 Configuration:"
echo "  Domain: $DOMAIN"
echo "  GitHub Repo: $GITHUB_REPO"
echo "  Project: $PROJECT_NAME"
echo ""

# Step 1: Create Railway Project
echo "1️⃣  Creating Railway Project..."
PROJECT_RESPONSE=$(curl -s -X POST "$RAILWAY_API_URL" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { projectCreate(input: {name: \"'$PROJECT_NAME'\"}) { project { id name } } }"
  }')

PROJECT_ID=$(echo "$PROJECT_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Failed to create Railway project"
  echo "Response: $PROJECT_RESPONSE"
  exit 1
fi

echo "✅ Project created: $PROJECT_ID"

# Step 2: Get Cloudflare Zone ID
echo ""
echo "2️⃣  Fetching Cloudflare Zone ID..."
ZONE_RESPONSE=$(curl -s -X GET "$CLOUDFLARE_API_URL/zones?name=$DOMAIN" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json")

ZONE_ID=$(echo "$ZONE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$ZONE_ID" ]; then
  echo "❌ Failed to get Cloudflare Zone ID"
  echo "Response: $ZONE_RESPONSE"
  exit 1
fi

echo "✅ Zone ID: $ZONE_ID"

# Step 3: Configure DNS
echo ""
echo "3️⃣  Configuring Cloudflare DNS..."
DNS_RESPONSE=$(curl -s -X POST "$CLOUDFLARE_API_URL/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CNAME",
    "name": "'$DOMAIN'",
    "content": "railway.app",
    "ttl": 3600,
    "proxied": true
  }')

if echo "$DNS_RESPONSE" | grep -q '"success":true'; then
  echo "✅ DNS record created successfully"
else
  echo "⚠️  DNS configuration response:"
  echo "$DNS_RESPONSE"
fi

# Step 4: Display next steps
echo ""
echo "✅ Deployment Configuration Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://railway.app/dashboard"
echo "2. Select project: $PROJECT_NAME"
echo "3. Add PostgreSQL service"
echo "4. Connect GitHub repo: $GITHUB_REPO"
echo "5. Set environment variables:"
echo "   - NODE_ENV=production"
echo "   - PORT=3001"
echo "   - APP_SECRET=workforce-automated-jwt-secret-2026"
echo "   - FRONTEND_URL=https://$DOMAIN"
echo "   - API_BASE_URL=https://api.$DOMAIN"
echo "   - VITE_API_URL=https://api.$DOMAIN"
echo "   - STRIPE_SECRET_KEY=[your_stripe_key]"
echo "   - STRIPE_WEBHOOK_SECRET=[your_webhook_secret]"
echo "   - VITE_STRIPE_PUBLISHABLE_KEY=[your_publishable_key]"
echo ""
echo "6. Enable auto-deploy for main branch"
echo "7. Run database migrations: railway run 'cd backend && npm run db:push'"
echo ""
echo "⏳ DNS propagation may take 24-48 hours"
echo ""
echo "🎉 Your application will be available at: https://$DOMAIN"

