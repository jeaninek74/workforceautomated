# WorkforceAutomated - Railway Deployment Setup Guide

## Quick Start

### Step 1: Create Railway Project
1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `jeanynek74/workforceautomated`

### Step 2: Add PostgreSQL Database
1. In your Railway project, click "Add Service"
2. Select "PostgreSQL"
3. Railway will automatically create DATABASE_URL
4. Copy the DATABASE_URL value

### Step 3: Configure Environment Variables

In Railway Dashboard → Variables, add these environment variables:

```
NODE_ENV=production
PORT=3001
APP_SECRET=workforce-automated-jwt-secret-2026
FRONTEND_URL=https://workforceautomated.com
API_BASE_URL=https://api.workforceautomated.com
VITE_API_URL=https://api.workforceautomated.com
LOG_LEVEL=info
SESSION_SECRET=workforce-session-secret-2026
ENCRYPTION_KEY=workforce-encryption-key-2026
```

### Step 4: Add Stripe Configuration

From your Stripe account (https://dashboard.stripe.com):

**Test Keys (for development):**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your test secret key → STRIPE_SECRET_KEY
3. Copy your test publishable key → VITE_STRIPE_PUBLISHABLE_KEY
4. Go to Webhooks section → copy webhook secret → STRIPE_WEBHOOK_SECRET

**Live Keys (after KYC verification):**
- Go to https://dashboard.stripe.com/settings/keys
- Copy your live secret key and publishable key
- Update STRIPE_SECRET_KEY and VITE_STRIPE_PUBLISHABLE_KEY
- Get webhook secret from Webhooks section

### Step 5: Configure Custom Domain

1. In Railway Dashboard → Settings → Domains
2. Click "Add Custom Domain"
3. Enter: `workforceautomated.com`
4. Railway will provide DNS records

**Update your domain registrar:**
- Add CNAME record: `workforceautomated.com` → `[railway-domain]`
- Or add A record with Railway's IP address
- Wait 24-48 hours for DNS propagation

### Step 6: Enable Auto-Deployment

1. In Railway Dashboard → Deployments
2. Enable "Auto Deploy" for main branch
3. Any push to main will automatically deploy

### Step 7: Run Database Migrations

After first deployment:

```bash
# Using Railway CLI
railway run "cd backend && npm run db:push"

# Or SSH into container
railway shell
cd backend
npm run db:push
```

## Verification Checklist

- [ ] GitHub repository connected to Railway
- [ ] PostgreSQL database created
- [ ] All environment variables set
- [ ] Stripe keys configured
- [ ] Custom domain configured
- [ ] DNS records updated
- [ ] Auto-deploy enabled
- [ ] Database migrations completed
- [ ] Application deployed successfully
- [ ] https://workforceautomated.com is accessible

## Testing the Deployment

1. **Visit the site:** https://workforceautomated.com
2. **Test registration:** Create a new account
3. **Test login:** Sign in with your credentials
4. **Test encryption:** Go to Settings → Encryption
5. **Generate encryption key:** Click "Generate Encryption Key"
6. **Create recovery key:** Click "Generate New Recovery Key"
7. **View audit logs:** Go to Security → Audit Log

## Monitoring

### View Logs
```bash
railway logs
```

### Monitor Metrics
- Railway Dashboard shows CPU, Memory, Network
- Check application logs for errors

## Troubleshooting

### Build Fails
- Check GitHub Actions logs
- Verify all environment variables are set
- Ensure database connection works

### Application Crashes
- Check Railway logs: `railway logs`
- Verify DATABASE_URL is correct
- Check for missing environment variables

### Domain Not Working
- Verify DNS records are correct
- Wait 24-48 hours for DNS propagation
- Check SSL certificate status in Railway

### Database Connection Error
- Verify DATABASE_URL environment variable
- Check PostgreSQL service is running
- Ensure database credentials are correct

## Rollback

If deployment fails:
1. Go to Railway Dashboard → Deployments
2. Select previous successful deployment
3. Click "Redeploy"

## Support

- Railway Support: https://railway.app/support
- GitHub Issues: https://github.com/jeanynek74/workforceautomated/issues
- Stripe Support: https://support.stripe.com

## Next Steps

1. **Email Integration:** Set up SendGrid for password resets
2. **Monitoring:** Enable error tracking (Sentry, LogRocket)
3. **Analytics:** Add Google Analytics or Mixpanel
4. **Backups:** Configure automated database backups
5. **SSL:** Verify HTTPS is working correctly
