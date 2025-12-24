# Railway Deployment Guide - Fixed Build Issue

## What Was Fixed

The Railpack error occurred because Railway couldn't detect your app configuration. We've now added:

1. **`railway.json`** - Explicit Railway configuration
2. **Updated `Procfile`** - Direct node command instead of bash script
3. **Updated `package.json`** - Simplified start script
4. **`.railwayignore`** - Excludes unnecessary frontend files from backend deployment

---

## Deployment Steps

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "Fix: Add Railway configuration for proper build detection"
git push origin main
```

### Step 2: Deploy to Railway

#### Option A: GitHub Integration (Recommended)
1. Go to https://railway.app/dashboard
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `Lee19700/parkinsons-pal`
4. Railway will auto-detect `package.json` and build

#### Option B: Railway CLI
```bash
cd your-project-folder
npm install -g @railway/cli
railway login
railway link  # Link to your project
railway up
```

### Step 3: Configure Environment Variables

In Railway Dashboard → Variables:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=<your-secure-secret>
ENCRYPTION_KEY=<64-hex-chars>
ALLOWED_ORIGINS=https://parkipal.com,https://www.parkipal.com
MAX_BODY_MB=10
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
DATABASE_URL=<Railway PostgreSQL URL>
APP_URL=https://parkipal.com
EMAIL_DISABLED=true
```

### Step 4: Add PostgreSQL Service

In Railway Dashboard:
1. Click "Add Service" → PostgreSQL
2. Wait for it to initialize
3. Copy `DATABASE_URL` from the PostgreSQL service variables
4. Add it to your app's variables

### Step 5: Verify Deployment

Wait 2-3 minutes for build, then test:

```bash
curl https://<your-railway-domain>.railway.app/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-12-24T..."}
```

---

## Build Process (What Railway Will Do)

1. **Detect:** Railway sees `package.json` at root
2. **Install:** Runs `npm install`
3. **Build:** Runs `npm run build` (which installs backend dependencies)
4. **Start:** Runs `npm start` (which executes `node backend/server.js`)

---

## Troubleshooting

### "Cannot find module 'pg'"
- Railway may not have run `npm install` in backend
- The `postinstall` hook should fix this automatically
- If it fails, manually run: `npm run build` in Railway logs

### Database connection fails
- Verify `DATABASE_URL` is set in Railway variables
- Check the PostgreSQL service is running
- Look at application logs in Railway dashboard

### Port error
- Railway automatically assigns a PORT via environment variable
- Don't hardcode port 3000; the server reads from `process.env.PORT || 3000` ✓

### CORS errors
- Update `ALLOWED_ORIGINS` to match your frontend domain
- Currently set to `https://parkipal.com`

---

## What's Different from Before

| Item | Before | Now |
|------|--------|-----|
| Start command | `bash start.sh` | `node backend/server.js` |
| Railway config | None (auto-detect failed) | `railway.json` (explicit) |
| Root package.json start | Complex with cd | Direct `node backend/server.js` |
| Files deployed | Everything | Only necessary files (via .railwayignore) |

---

## Next Steps After Deployment

1. ✅ Verify `/api/health` returns `{"status":"ok"}`
2. ✅ Test registration at your frontend URL
3. ✅ Verify JWT token is returned
4. ✅ Test database operations (medications, symptoms, etc.)
5. ✅ Set up email provider (SendGrid, AWS SES, or SMTP) if needed
6. ✅ Deploy frontend to Cloudflare Pages or Netlify

---

## Questions?

- Railway Docs: https://docs.railway.app
- Node.js Best Practices: https://railway.app/docs/guides/nodejs
- Database Setup: https://railway.app/docs/databases/postgresql
