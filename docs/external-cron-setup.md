# External Cron Service Setup

## Overview

Due to Vercel Hobby plan limitations (daily cron jobs only), we use an external free cron service to trigger prayer notifications every 5 minutes.

## Setup Instructions

### Option 1: Cron-job.org (Recommended)

**Free Tier Limits:**
- Up to 50 cron jobs
- 1-minute minimum interval
- HTTPS support
- Email notifications on failures

**Setup Steps:**

1. **Create Account:**
   - Go to https://cron-job.org/en/signup/
   - Sign up with email (free account)

2. **Create Cron Job:**
   - Dashboard → "Create cronjob"
   - **Title:** `Ramadan Companion - Prayer Notifications`
   - **URL:** `https://your-app.vercel.app/api/push/schedule`
   - **Schedule:** Every 5 minutes
     - Pattern: `*/5 * * * *`
   - **Request Method:** POST
   - **Advanced Settings:**
     - Add Header: `Authorization: Bearer YOUR_CRON_SECRET`
     - Timeout: 30 seconds
   - **Notifications:**
     - Enable email on failure (optional)

3. **Configure Authorization Header:**
   ```
   Key: Authorization
   Value: Bearer YOUR_CRON_SECRET
   ```
   (Use the same `CRON_SECRET` from your `.env.local` and Vercel environment variables)

4. **Test:**
   - Click "Execute now" to test immediately
   - Check execution history for success/errors
   - Verify notifications arrive on your phone

---

### Option 2: EasyCron

**Free Tier Limits:**
- Up to 5 cron jobs
- 20-minute minimum interval on free tier ⚠️

**Setup Steps:**

1. Go to https://www.easycron.com/user/register
2. Create free account
3. Add new cron job:
   - **URL:** `https://your-app.vercel.app/api/push/schedule`
   - **Cron Expression:** `*/20 * * * *` (every 20 minutes - free tier limit)
   - **HTTP Method:** POST
   - **HTTP Header:** `Authorization: Bearer YOUR_CRON_SECRET`

**Note:** Free tier only supports 20-minute intervals, which would result in up to 20-minute delay for notifications.

---

### Option 3: GitHub Actions (Free, No Account Needed)

**Free Tier Limits:**
- Unlimited for public repos
- 2000 minutes/month for private repos

**Setup Steps:**

1. Create `.github/workflows/cron-notifications.yml` in your repo:

```yaml
name: Prayer Notifications Cron

on:
  schedule:
    # Every 5 minutes
    - cron: '*/5 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  trigger-notifications:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Notification API
        run: |
          curl -X POST https://your-app.vercel.app/api/push/schedule \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

2. Add `CRON_SECRET` to GitHub Secrets:
   - Repo Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `CRON_SECRET`
   - Value: (your cron secret)

**Note:** GitHub Actions cron is reliable but can have 5-10 minute delays during high traffic.

---

## Current Configuration

**Active Service:** TBD (user must configure)

**Endpoint:** `https://ramadan-companion.vercel.app/api/push/schedule`

**Schedule:** Every 5 minutes (`*/5 * * * *`)

**Authentication:** Bearer token (CRON_SECRET)

**Expected Response:**
```json
{
  "success": true,
  "results": {
    "total": 10,
    "success": 8,
    "failed": 0,
    "skipped": 2
  }
}
```

**Timezone Handling:**
- **Automatic detection:** Timezone is calculated from each user's lat/lng coordinates using `geo-tz` library
- **No manual configuration:** Users don't need to set timezone manually
- **Travel-aware:** If user travels to a new timezone, notifications automatically adjust
- **Example:** User in NYC (40.7128, -74.0060) → timezone detected as "America/New_York" → notifications sent at local NYC times, not UTC

---

## Monitoring & Debugging

### Check if Cron is Running

1. **Check external cron service dashboard** for execution history
2. **Check Vercel function logs:**
   - Vercel Dashboard → Project → Logs
   - Filter by `/api/push/schedule`
3. **Manual test:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/push/schedule \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     -H "Content-Type: application/json"
   ```

### Common Issues

**Issue:** No notifications being sent
- **Check:** Cron service execution history (is it running?)
- **Check:** Vercel function logs (are requests reaching the API?)
- **Check:** Authorization header (is CRON_SECRET correct?)

**Issue:** Authentication failures
- **Fix:** Verify `CRON_SECRET` matches in:
  1. External cron service header
  2. Vercel environment variables
  3. Local `.env.local` (for testing)

**Issue:** Timeout errors
- **Cause:** Function takes too long (30s+ on Hobby plan)
- **Fix:** Check for slow queries, reduce user batch size, optimize prayer time calculations

---

## Future Improvements

### When Ready to Upgrade:

**Vercel Pro ($20/month):**
- Native cron support (no external service needed)
- More reliable (no third-party dependency)
- Better integration with Vercel functions
- To enable: Add cron back to `vercel.json` after upgrading

**Trigger.dev (Free Tier Available):**
- Dynamic job scheduling (exact-minute precision)
- Better error handling and retries
- Job management dashboard
- See: https://trigger.dev

---

## Recommended Choice

**For most users: Cron-job.org**
- Free 5-minute intervals
- Reliable
- Easy setup
- Good monitoring dashboard

