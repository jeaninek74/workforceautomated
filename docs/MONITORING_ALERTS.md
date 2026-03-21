# Monitoring & Alerts Setup Guide

## Overview

This guide covers setting up monitoring and alerting for WorkforceAutomated in production.

## Railway Built-in Monitoring

### View Real-Time Logs
1. Go to Railway dashboard → workforceautomated-app
2. Click **Logs** tab
3. Logs update in real-time

### Key Log Messages to Watch For

| Message | Meaning | Action |
|---|---|---|
| `Server running on port 3001` | App started successfully | None |
| `Database connected` | PostgreSQL connected | None |
| `OAuth initialized` | GitHub OAuth ready | None |
| `ERROR` | Application error | Investigate immediately |
| `FATAL` | Critical failure | Restart service |

### Railway Deployment Alerts

1. Go to Railway dashboard → **Settings → Notifications**
2. Add email/Slack notifications for:
   - Deployment failures
   - Service crashes
   - Build errors

## Uptime Monitoring (Recommended: UptimeRobot)

1. Go to https://uptimerobot.com (free tier available)
2. Click **Add New Monitor**
3. Configure:
   - Monitor Type: HTTPS
   - Friendly Name: WorkforceAutomated Production
   - URL: `https://workforceautomated.com/api/health`
   - Monitoring Interval: 5 minutes
4. Add alert contacts (email, SMS, Slack)

### Health Check Endpoint

```bash
GET https://workforceautomated.com/api/health
# Response: {"status":"ok","timestamp":"2026-03-19T...","version":"1.0.0"}
```

## Performance Monitoring

### Railway Metrics
- Go to Railway dashboard → workforceautomated-app → **Metrics**
- Monitor: CPU usage, Memory usage, Network I/O

### Alert Thresholds

| Metric | Warning | Critical |
|---|---|---|
| CPU Usage | > 70% | > 85% |
| Memory Usage | > 75% | > 90% |
| Response Time | > 1s | > 3s |
| Error Rate | > 1% | > 5% |

## Security Audit Logs

WorkforceAutomated has a built-in security audit dashboard:

1. Log in as admin
2. Navigate to **Settings → Security Audit**
3. View:
   - Login attempts (success/failure)
   - Encryption key operations
   - Backup creation/restoration
   - API access logs
   - Suspicious activity alerts

## Database Monitoring

```bash
# Check database connection via health endpoint
curl https://workforceautomated.com/api/health

# Monitor via Railway dashboard
# Railway → postgres-db → Metrics
```

## Backup Monitoring

- Automated backups run daily at 2:00 AM UTC
- Backup status visible in app: **Settings → Backups**
- Backup notifications sent via email (requires SendGrid setup)

## Incident Response

1. **Service Down:** Check Railway deployment status, review logs
2. **Database Error:** Verify `DATABASE_URL`, check postgres-db service status
3. **High Error Rate:** Review Railway logs, check recent deployments
4. **Security Breach:** Review audit logs, rotate JWT_SECRET and ENCRYPTION_KEY immediately
