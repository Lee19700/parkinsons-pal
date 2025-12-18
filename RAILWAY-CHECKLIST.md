# Railway Deployment Checklist

## Before You Deploy

- [ ] Code is committed to GitHub (public or private repo that Railway can access)
- [ ] All API endpoints tested locally (or via existing Heroku instance if running)
- [ ] Database schema is up-to-date (`backend/db.js` has all tables)
- [ ] Frontend pages (index.html, login.html, etc.) are in repo root

## Railway Setup (5 minutes)

1. [ ] Visit https://railway.app and sign up (free account)
2. [ ] Authorize GitHub access
3. [ ] Select Parkinson's Pal repository
4. [ ] Railway auto-detects Node.js and creates a service
5. [ ] Add PostgreSQL service:
   - [ ] Click "Add Service" → "PostgreSQL"
   - [ ] Railway auto-creates `DATABASE_URL`

## Environment Variables (2 minutes)

Set these in Railway dashboard → Variables:

- [ ] `JWT_SECRET` = `8%,@w3W]}GH&L:QVbXM\$Ea09m</BgN`
- [ ] `ENCRYPTION_KEY` = `b29c590394fa2b36197724f6f84c7a4803592a4e79df945e3feb3c4aed7f5392`
- [ ] `ALLOWED_ORIGINS` = `https://[your-railway-app].up.railway.app` (or custom domain)
- [ ] `NODE_ENV` = `production`
- [ ] DO NOT set `DB_URL` or `DATABASE_URL` (Railway auto-sets it)

## Deploy (2 minutes)

Option A: **Via Railway Dashboard**
- [ ] Click "Deploy" button in dashboard

Option B: **Via Git Push**
```bash
git add .
git commit -m "Deploy to Railway"
git push origin main
```

## Verify Deployment (3 minutes)

- [ ] Wait for build to complete (watch logs in Railway dashboard)
- [ ] Test health endpoint:
  ```bash
  curl https://[your-railway-domain].up.railway.app/api/health
  ```
  Expected: `{"status":"ok","timestamp":"..."}`

- [ ] Visit app in browser:
  ```
  https://[your-railway-domain].up.railway.app
  ```
  Expected: See login page

- [ ] Test login with new account
- [ ] Test one feature (e.g., add a medication)
- [ ] Check logs for errors: Railway dashboard → Logs

## Optional: Custom Domain

- [ ] Buy domain (e.g., parkipal.com)
- [ ] In Railway: Dashboard → Settings → Domains → Add Custom Domain
- [ ] Update `ALLOWED_ORIGINS` to new domain
- [ ] Wait for DNS to propagate (5-30 min)

## Post-Deployment

- [ ] Monitor logs for errors
- [ ] Invite beta users to test
- [ ] Set up email alerts in Railway for failures
- [ ] Document your Railway project URL for your team

## Rollback (If Needed)

If something breaks after deployment:
1. [ ] Go to Railway dashboard → Deployments
2. [ ] Find last stable deployment
3. [ ] Click "Rollback"

## Total Time: ~15 minutes

Need help? See [RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md)
