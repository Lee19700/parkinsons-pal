# Deploy Parkinson's Pal to Railway

Railway is a modern platform for deploying full-stack applications. This guide covers deploying Parkinson's Pal (frontend + backend + database) as a unified service.

## What You'll Get

- ✅ Full app running on a single Railway domain (e.g., `parkinsons-pal-prod.up.railway.app`)
- ✅ PostgreSQL database automatically provisioned
- ✅ Automatic HTTPS/SSL
- ✅ Git-based deployments (push → live)
- ✅ Easy environment variable management
- ✅ ~$5-15/month for a small app

## Prerequisites

- GitHub account (repository must be public or private with Railway access)
- Railway account (sign up free at https://railway.app)
- Git installed locally

## Step-by-Step Deployment

### 1. Push Code to GitHub

If you haven't already:

```bash
cd "c:\Users\leeto\OneDrive\New folder\OneDrive\Desktop\Parkipal project"
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Sign Up / Login to Railway

1. Visit https://railway.app
2. Click "Start Project"
3. Choose "Deploy from GitHub repo"

### 3. Connect GitHub Repository

1. Authorize Railway to access your GitHub account
2. Select the Parkinson's Pal repository
3. Railway will automatically detect Node.js as the runtime

### 4. Configure Database

Railway auto-detects PostgreSQL is needed (from your `backend/server.js` and `backend/db.js`):

1. In the Railway dashboard, click "Add Service"
2. Select "PostgreSQL"
3. Railway creates `DATABASE_URL` automatically and injects it into your environment

### 5. Set Environment Variables

In the Railway dashboard, go to your project and set these variables in the **Variables** tab:

```
JWT_SECRET=8%,@w3W]}GH&L:QVbXM\$Ea09m</BgN
ENCRYPTION_KEY=b29c590394fa2b36197724f6f84c7a4803592a4e79df945e3feb3c4aed7f5392
ALLOWED_ORIGINS=https://your-railway-app-url.up.railway.app
NODE_ENV=production
```

**Note:** Railway automatically provides `DATABASE_URL`. Do NOT set `DB_URL` — it's auto-set.

### 6. Deploy

1. Click the "Deploy" button, or simply push to your main branch:
   ```bash
   git push origin main
   ```
2. Railway auto-deploys and shows logs in the dashboard
3. Wait for the deployment to complete (usually 2-5 minutes)

### 7. Verify Deployment

1. Go to the Railway project dashboard
2. Find your app service and click it
3. Copy the public URL (e.g., `parkinsons-pal-prod.up.railway.app`)
4. Test the health endpoint:
   ```bash
   curl https://parkinsons-pal-prod.up.railway.app/api/health
   ```
   Expected response: `{"status":"ok","timestamp":"2025-12-18T..."}` 

5. Visit the main app:
   ```
   https://parkinsons-pal-prod.up.railway.app
   ```
   You should see the login page.

## Custom Domain (Optional)

To use your own domain (e.g., `parkipal.com`):

1. In Railway dashboard, go to "Settings" → "Domains"
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `parkipal.com`)
4. Update your domain registrar's DNS to point to Railway's nameservers
5. Railway provisions HTTPS automatically via Let's Encrypt

## Environment Variables Reference

| Variable | Value | Notes |
|----------|-------|-------|
| `JWT_SECRET` | Your secret key (32+ chars) | Used to sign JWT tokens |
| `ENCRYPTION_KEY` | 64-char hex string | AES-256 encryption key for sensitive data |
| `ALLOWED_ORIGINS` | Your app URL | CORS origin; must match your domain exactly |
| `NODE_ENV` | `production` | Enables optimizations |
| `DATABASE_URL` | Auto-set by Railway | Do not override |
| `PORT` | Auto-set to 3000 | Do not override |

## Updating the App

After deployment, any push to your main branch triggers a new deployment:

```bash
git add .
git commit -m "Fix login bug"
git push origin main
```

Railway automatically rebuilds and redeploys within 2-5 minutes.

## Rollback

If a deployment breaks:

1. Go to Railway dashboard → Deployments
2. Find the last stable deployment
3. Click "Rollback"

## Troubleshooting

### 502 Bad Gateway
- Check logs: Railway dashboard → Logs
- Verify `ENCRYPTION_KEY` is exactly 64 hex characters
- Verify `JWT_SECRET` is set to a non-empty value

### Database Connection Failed
- Railway automatically provides `DATABASE_URL`
- Ensure you are NOT setting `DB_URL` manually (it will override the auto-set one)
- Check that PostgreSQL service is running in Railway dashboard

### Login page not found (404)
- Ensure your app URL is set correctly in `ALLOWED_ORIGINS`
- The app serves `index.html` for all non-API routes

### CORS Error
- `ALLOWED_ORIGINS` must match your Railway domain exactly (including protocol: `https://`)
- If using a custom domain, update `ALLOWED_ORIGINS` to that domain

## Monitoring & Logs

In the Railway dashboard:
- **Logs**: See real-time server logs
- **Metrics**: Monitor CPU, memory, request count
- **Deployments**: View past deployments and rollback if needed

## Local Testing Before Deployment

To test locally:

```bash
cd backend
npm install
export DATABASE_URL=postgres://localhost/parkipal_test
export JWT_SECRET=test-secret-key
export ENCRYPTION_KEY=b29c590394fa2b36197724f6f84c7a4803592a4e79df945e3feb3c4aed7f5392
npm start
```

Then open http://localhost:3000

## Backup & Restore

Railway PostgreSQL includes automatic daily backups. To restore:

1. Go to Railway dashboard → PostgreSQL service
2. Click "Backups"
3. Select a backup and click "Restore"

## Cost Estimate

- **Hobby tier** (free): 500 hours/month for compute + 5GB PostgreSQL
- **Typical app**: ~$5-15/month with pay-as-you-go pricing

See https://railway.app/pricing for details.

## Next Steps

1. Set up email notifications for deployment failures
2. Add custom domain for a professional URL
3. Enable authentication for Parkinson's Pal (already implemented)
4. Share with users and monitor logs for issues

## Support

- Railway Docs: https://docs.railway.app
- GitHub Issues: Create an issue in your repo
- Railway Support: https://railway.app/help

---

**Ready to deploy?** Go to https://railway.app and click "Start Project" →  "Deploy from GitHub"
