# Deploy WorkforceAutomated to Railway

Complete step-by-step guide to deploy to Railway with workforceautomated.com domain.

## Prerequisites

- Railway account (https://railway.app)
- GitHub account with access to jeanynek74/workforceautomated
- Cloudflare domain: workforceautomated.com
- Stripe account for payment processing

## Step 1: Create Railway Project

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Search for and select: `jeanynek74/workforceautomated`
5. Click "Deploy"

Railway will automatically detect the project structure and start building.

## Step 2: Add PostgreSQL Database

1. In your Railway project, click "Add Service"
2. Select "PostgreSQL"
3. Click "Add"
4. Railway will create a PostgreSQL instance
5. Copy the `DATABASE_URL` from the PostgreSQL service variables

## Step 3: Configure Environment Variables

1. In your Railway project, go to "Variables"
2. Add each of these environment variables:

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
SENDGRID_API_KEY=SG.[your_sendgrid_key]
EMAIL_FROM=noreply@workforceautomated.com
```

## Step 4: Add Stripe Configuration

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Test Secret Key**
3. In Railway Variables, add:
   ```
   STRIPE_SECRET_KEY=sk_test_[your_test_secret_key]
   ```

4. Copy your **Test Publishable Key**
5. In Railway Variables, add:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_[your_test_publishable_key]
   ```

6. Go to Webhooks section in Stripe
7. Copy the **Webhook Signing Secret**
8. In Railway Variables, add:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_[your_webhook_secret]
   ```

**After Stripe KYC Verification:**
- Replace test keys with live keys from https://dashboard.stripe.com/settings/keys

## Step 5: Configure Custom Domain

1. In Railway project, go to "Settings"
2. Under "Domains", click "Add Custom Domain"
3. Enter: `workforceautomated.com`
4. Railway will provide a CNAME target (e.g., `railway-xxx.up.railway.app`)
5. Note this CNAME value

## Step 6: Update Cloudflare DNS

1. Go to https://dash.cloudflare.com
2. Select domain: workforceautomated.com
3. Go to "DNS" → "Records"
4. Click "Add record"
5. Configure:
   - Type: CNAME
   - Name: workforceautomated.com
   - Content: [Railway CNAME from Step 5]
   - TTL: Auto
   - Proxy status: Proxied (orange cloud)
6. Click "Save"

**DNS Propagation:** Changes may take 24-48 hours to fully propagate

## Step 7: Enable Auto-Deployment

1. In Railway project, go to "Deployments"
2. Find the GitHub integration
3. Enable "Auto Deploy" for the `main` branch
4. Any future pushes to main will automatically deploy

## Step 8: Run Database Migrations

After the first successful deployment:

1. In Railway project, click "Shell" (or use Railway CLI)
2. Run:
   ```bash
   cd backend && npm run db:push
   ```

This will create all necessary database tables.

## Step 9: Verify Deployment

1. Visit https://workforceautomated.com
2. You should see the WorkforceAutomated landing page
3. Test the following:
   - **Registration:** Create a new account
   - **Login:** Sign in with your credentials
   - **Encryption:** Go to Settings → Encryption → Generate Key
   - **Recovery:** Go to Settings → Backups → Create Backup
   - **Audit Log:** Go to Security → Audit Log

## Troubleshooting

### Build Fails
- Check Railway build logs: "Deployments" → Click failed deployment
- Verify all environment variables are set
- Ensure database connection string is correct

### Application Crashes
- Check Railway logs: "Logs" tab
- Verify DATABASE_URL is set correctly
- Check for missing environment variables

### Domain Not Working
- Verify DNS records in Cloudflare
- Wait 24-48 hours for DNS propagation
- Check SSL certificate status in Railway

### Database Connection Error
- Verify DATABASE_URL environment variable
- Check PostgreSQL service is running
- Test connection: `railway run "psql $DATABASE_URL -c 'SELECT 1'"`

## Monitoring & Logs

### View Application Logs
```bash
railway logs
```

### Monitor Performance
- Railway Dashboard shows CPU, Memory, Network usage
- Check application logs for errors

### Database Backups
- Railway automatically backs up PostgreSQL
- Configure backup retention in PostgreSQL settings

## Rollback

If deployment fails:
1. Go to Railway "Deployments"
2. Select previous successful deployment
3. Click "Redeploy"

## Next Steps

1. **Email Service:** Set up SendGrid for password resets
2. **Monitoring:** Enable error tracking (Sentry, LogRocket)
3. **Analytics:** Add Google Analytics
4. **Backups:** Configure automated database backups
5. **SSL:** Verify HTTPS is working correctly

## Support

- Railway Documentation: https://docs.railway.app
- GitHub Issues: https://github.com/jeanynek74/workforceautomated/issues
- Stripe Support: https://support.stripe.com
- Cloudflare Support: https://support.cloudflare.com

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| NODE_ENV | Environment mode | production |
| PORT | Server port | 3001 |
| DATABASE_URL | PostgreSQL connection | postgresql://user:pass@host/db |
| APP_SECRET | JWT signing secret | your-secret-key |
| FRONTEND_URL | Frontend domain | https://workforceautomated.com |
| STRIPE_SECRET_KEY | Stripe API key | sk_test_... |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret | whsec_... |
| VITE_STRIPE_PUBLISHABLE_KEY | Stripe public key | pk_test_... |
| SENDGRID_API_KEY | SendGrid API key | SG.... |
| ENCRYPTION_KEY | Data encryption key | your-encryption-key |
