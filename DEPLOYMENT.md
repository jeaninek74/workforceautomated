# WorkforceAutomated Deployment Guide

## Railway Deployment Setup

### Prerequisites
- Railway account (https://railway.app)
- GitHub account with access to jeanynek74/workforceautomated
- Custom domain: workforceautomated.com
- Stripe account for payments

### Step 1: Connect GitHub to Railway

1. Go to https://railway.app
2. Sign in with your GitHub account
3. Create a new project
4. Select "Deploy from GitHub repo"
5. Select `jeanynek74/workforceautomated`
6. Railway will automatically detect the project structure

### Step 2: Configure Environment Variables

In Railway dashboard, set these environment variables:

```
# Database
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/workforceautomated

# Server
NODE_ENV=production
PORT=3001
APP_SECRET=[generate-secure-random-string]

# Frontend
FRONTEND_URL=https://workforceautomated.com
VITE_API_URL=https://api.workforceautomated.com

# Stripe
STRIPE_SECRET_KEY=sk_live_[your_key]
STRIPE_WEBHOOK_SECRET=whsec_[your_secret]
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_[your_key]

# Email Service
SENDGRID_API_KEY=SG.[your_key]
EMAIL_FROM=noreply@workforceautomated.com

# Security
SESSION_SECRET=[generate-secure-random-string]
ENCRYPTION_KEY=[generate-secure-random-string]
```

### Step 3: Set Up PostgreSQL Database

1. In Railway dashboard, add a PostgreSQL service
2. Copy the DATABASE_URL from the PostgreSQL service
3. Paste it into the environment variables

### Step 4: Configure Custom Domain

1. In Railway dashboard, go to your project settings
2. Under "Domains", add `workforceautomated.com`
3. Railway will provide DNS records to add
4. Update your domain registrar's DNS settings:
   - Add CNAME record pointing to Railway's domain
   - Or add A record with Railway's IP

### Step 5: Enable Auto-Deployment

1. In Railway dashboard, enable "Auto Deploy" for the main branch
2. Any push to main will automatically trigger deployment
3. GitHub Actions workflow will run tests before deployment

### Step 6: Database Migrations

After deployment, run migrations:

```bash
# SSH into Railway container
railway run npm run migrate

# Or use Railway CLI
railway run "cd backend && npm run db:push"
```

### Step 7: Verify Deployment

1. Visit https://workforceautomated.com
2. Test user registration and login
3. Verify security features:
   - Encryption key generation
   - Recovery key creation
   - Backup functionality
   - Audit logs

## Monitoring & Logs

### View Logs
```bash
railway logs
```

### Monitor Performance
- Railway Dashboard shows CPU, Memory, Network usage
- Check application logs for errors

### Troubleshooting

**Build Fails:**
- Check GitHub Actions logs
- Verify environment variables are set
- Ensure database is accessible

**Application Crashes:**
- Check Railway logs
- Verify database connection string
- Check for missing environment variables

**Domain Not Working:**
- Verify DNS records are correct
- Wait 24-48 hours for DNS propagation
- Check SSL certificate status

## Rollback

If deployment fails:
1. Go to Railway dashboard
2. Select the previous successful deployment
3. Click "Redeploy"

## Support

For Railway support: https://railway.app/support
For application issues: Check logs and GitHub issues
