# 🚀 Deploy to Railway Now (15 Minutes)

Everything is ready. Follow these exact steps to go live.

## Step 1: Push to GitHub (1 min)

```bash
cd "c:\Users\leeto\OneDrive\New folder\OneDrive\Desktop\Parkipal project"
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

## Step 2: Sign Up on Railway (2 min)

1. Go to <https://railway.app>
2. Click "Start Project"
3. Choose "Deploy from GitHub"
4. Authorize GitHub
5. Select your **Parkipal project** repo

## Step 3: Railway Auto-Setup (2 min)

Railway detects Node.js automatically. You'll see:

- ✅ Your app detected
- ✅ Build started

While it builds, proceed to Step 4.

## Step 4: Add PostgreSQL (1 min)

In your Railway project dashboard:
1. Click "+ Add Service"
2. Choose "PostgreSQL"
3. Railway creates it automatically

## Step 5: Set Environment Variables (2 min)

In Railway dashboard, click your app → "Variables" tab, add these **5 variables exactly:**

```
JWT_SECRET
8%,@w3W]}GH&L:QVbXM\$Ea09m</BgN

ENCRYPTION_KEY
b29c590394fa2b36197724f6f84c7a4803592a4e79df945e3feb3c4aed7f5392

ALLOWED_ORIGINS
https://[parkipal-com-DOMAIN].up.railway.app

NODE_ENV
production
```

**Where to find your Railway domain:**
- Dashboard → Your app service → click it → see "Public URL" at top

**Copy that URL into ALLOWED_ORIGINS like:**
```
https://parkinsons-pal-abc123.up.railway.app
```

## Step 6: Deploy (1 min)

Click the **Deploy** button in the dashboard, or:

```bash
git push origin main
```

Railway auto-deploys when you push.

## Step 7: Wait & Watch Logs (3 min)

1. Click "Deployments" tab
2. Watch the build progress (takes 1-3 min)
3. Look for green checkmark (✅ deployment successful)

If you see a red ❌, click it to see error logs.

## Step 8: Test Your App (2 min)

1. Click your app service → "Public URL"
2. Visit it in browser:
   ```
   https://[your-railway-domain].up.railway.app
   ```
3. You should see the **Parkinson's Pal login page**

## Step 9: Test an API Call (1 min)

In your browser console or terminal, test:

```bash
curl https://[your-railway-domain].up.railway.app/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-12-18T..."}
```

## Step 10: Create an Account & Test

1. Click "Register" on login page
2. Create a test account
3. Log in
4. Add a medication
5. Verify it saves

## 🎉 Done!

Your app is **live** at `https://[your-railway-domain].up.railway.app`

---

## If Something Goes Wrong

### 502 Bad Gateway
- Check logs: Dashboard → Logs tab
- Verify `ENCRYPTION_KEY` is 64 hex characters
- Verify `JWT_SECRET` is set

### App not loading (white screen)
- Check browser console for errors (F12)
- Check Railway logs for backend errors

### Database not connecting
- Verify PostgreSQL service is running (Dashboard shows it)
- Don't manually set `DB_URL` (Railway auto-sets `DATABASE_URL`)

### Login page not loading (404)
- Check that `ALLOWED_ORIGINS` is set to your exact Railway domain
- Check backend logs: `Dashboard → app service → Logs`

### Still stuck?
See [RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md) for detailed troubleshooting

---

## Next: Custom Domain (Optional, 10 min)

Want `parkipal.com` instead of `[random].up.railway.app`?

1. Buy a domain (namecheap.com, godaddy.com, etc.)
2. In Railway: Dashboard → Settings → Domains → Add Domain
3. Update DNS at your registrar (Railway shows instructions)
4. Update `ALLOWED_ORIGINS` to `https://parkipal.com`
5. Done (SSL cert auto-generated)

---

**You're 15 minutes away from going live.** Start with Step 1 now.
