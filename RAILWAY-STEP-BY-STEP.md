# 🎯 Your Step-by-Step Railway Deployment Guide

**Everything is tested and ready. Follow these steps exactly.**

---

## STEP 1: Open Railway (Right Now)

Go to: **https://railway.app**

You should see a page that looks like:
```
┌─────────────────────────────┐
│   Railway                    │
│   Start Project              │
│   [Deploy from GitHub]       │
└─────────────────────────────┘
```

---

## STEP 2: Create a Railway Account

If you don't have one:
1. Click "Sign Up" or "Start Project"
2. Choose "Sign up with GitHub" (easiest)
3. Authorize Railway to access GitHub
4. Done ✅

If you already have Railway:
- Log in with GitHub

---

## STEP 3: Deploy from GitHub

After login, you'll see options:
- Click **"Deploy from GitHub repo"** or **"Create a New Project"**
- Then select **"GitHub"**

---

## STEP 4: Select Your Repository

Railway will ask "Which repo?"

1. Find and click: **`Lee19700/parkinsons-pal`**
   (or whatever your repo name is)
2. Click "Deploy"

**What happens next:**
- Railway auto-detects Node.js ✅
- Build starts automatically
- You'll see a dashboard

---

## STEP 5: Add PostgreSQL Service

While it's building, add the database:

1. In your Railway dashboard, look for a **"+"** button or **"Add Service"** button
2. Click it
3. Choose **"PostgreSQL"** from the list
4. Railway automatically provisions it

**What happens:**
- A PostgreSQL service appears in your dashboard
- `DATABASE_URL` is auto-created (Railway injects it)
- You don't need to do anything else

---

## STEP 6: Set Environment Variables

This is the MOST IMPORTANT step.

1. Click on your **"app"** service in the dashboard (not PostgreSQL)
2. Go to the **"Variables"** tab
3. You'll see a text area or form to add variables

**Add these 4 variables exactly:**

### Variable 1: JWT_SECRET
```
Name: JWT_SECRET
Value: 8%,@w3W]}GH&L:QVbXM\$Ea09m</BgN
```
(Copy and paste exactly)

### Variable 2: ENCRYPTION_KEY
```
Name: ENCRYPTION_KEY
Value: b29c590394fa2b36197724f6f84c7a4803592a4e79df945e3feb3c4aed7f5392
```
(Copy and paste exactly - it's 64 characters)

### Variable 3: NODE_ENV
```
Name: NODE_ENV
Value: production
```

### Variable 4: ALLOWED_ORIGINS

This one is tricky - you need to find your Railway domain:

1. Click on your "app" service
2. Look at the top - you should see a **"Public URL"** or **"Domain"**
3. It looks like: `parkinsons-pal-abc123.up.railway.app`
4. Copy that entire URL

Then add the variable:
```
Name: ALLOWED_ORIGINS
Value: https://[PASTE-YOUR-DOMAIN-HERE].up.railway.app
```

**Example:** If your domain is `parkinsons-pal-abc123.up.railway.app`, then:
```
Name: ALLOWED_ORIGINS
Value: https://parkinsons-pal-abc123.up.railway.app
```

**Don't set DATABASE_URL** - Railway auto-sets it. Don't touch it.

---

## STEP 7: Click Deploy

After setting all 4 variables:

1. Look for a **"Deploy"** button in the dashboard
2. Click it
3. A build process starts (watch the logs)

**What you'll see:**
- "Building..." message
- Progress updates in the logs
- Eventually: ✅ "Deployment successful"

This takes **2-5 minutes**.

---

## STEP 8: Wait for Green Checkmark

In your Railway dashboard:
- You should see a **✅ green checkmark** next to your deployment
- If you see ❌ red, click on it to see error logs

**If build fails:**
- Check the logs (click the red error)
- Usually it's a variable name typo
- Fix and try deploying again

---

## STEP 9: Get Your Public URL

When deployment succeeds:

1. Click on your "app" service
2. At the top, copy the **"Public URL"** (or "Domain")
3. It looks like: `parkinsons-pal-xyz123.up.railway.app`

---

## STEP 10: Test in Browser

Open a new tab and visit:
```
https://[YOUR-RAILWAY-DOMAIN].up.railway.app
```

**You should see:**
- The Parkinson's Pal **login page** ✅

If you see a blank page or error:
- Check browser console (F12)
- Check Railway logs

---

## STEP 11: Create a Test Account

1. Click "Register" on the login page
2. Fill in:
   - Username: `testuser`
   - Password: `Test123!Pass`
3. Click "Register"
4. You should see "Account created successfully" ✅

---

## STEP 12: Log In

1. Use the credentials you just created
2. Click "Login"
3. You should be redirected to the **Dashboard** ✅

---

## STEP 13: Test a Feature

Let's verify the database works:

1. Go to **"Medications"** page
2. Click **"Add Medication"**
3. Fill in:
   - Name: `Test Med`
   - Dosage: `5mg`
   - Times: `Morning`
4. Click "Save"
5. You should see it appear in the list ✅

---

## STEP 14: Refresh the Page

Verify data persists:

1. Press **F5** to refresh the page
2. You should still see your test medication
3. If it's gone, there's a database issue

---

## STEP 15: Test API Endpoint

In a terminal, run:
```bash
curl https://[YOUR-DOMAIN].up.railway.app/api/health
```

You should see:
```json
{"status":"ok","timestamp":"2025-12-18T..."}
```

---

## 🎉 YOU'RE LIVE!

Your app is now running on Railway at:
```
https://[YOUR-RAILWAY-DOMAIN].up.railway.app
```

### What just happened:
✅ Frontend loaded (index.html, etc.)  
✅ Backend API running  
✅ PostgreSQL database connected  
✅ Users can register and login  
✅ Data persists  
✅ Encryption working  
✅ Everything on HTTPS  

---

## Next Steps (Optional)

### Add a Custom Domain
If you want `parkipal.com` instead of `parkinsons-pal-xyz.up.railway.app`:

1. Buy a domain (namecheap.com, godaddy.com, etc.)
2. In Railway: Dashboard → Settings → Domains → Add Domain
3. Follow Railway's DNS instructions
4. Update `ALLOWED_ORIGINS` to your new domain
5. Wait 5-30 minutes for DNS to propagate

### Monitor Your App
- Check logs: Dashboard → Logs tab
- View metrics: Dashboard → Metrics tab
- Set up alerts: Dashboard → Settings

### Share with Users
Your app is ready for real users! Give them:
```
https://[YOUR-RAILWAY-DOMAIN].up.railway.app
```

---

## If Something Goes Wrong

### 502 Bad Gateway
- Check Railway logs (Dashboard → Logs)
- Verify `ENCRYPTION_KEY` is exactly 64 characters
- Verify `JWT_SECRET` is not empty

### Login page won't load
- Check browser console (F12) for errors
- Verify `ALLOWED_ORIGINS` matches your exact domain
- Check Railway logs

### Can't create account
- Check browser console for error message
- Check Railway logs
- Verify `JWT_SECRET` is set

### Data doesn't save
- Check browser console (F12)
- Check Railway logs
- Verify PostgreSQL service is running (appears in dashboard)

### Still stuck?
- Go back and check every variable spelling
- Redeploy by pushing a new commit:
  ```bash
  git commit --allow-empty -m "Redeploy"
  git push origin main
  ```

---

## Summary

| Step | Action | Time |
|------|--------|------|
| 1-3 | Sign up & select repo | 2 min |
| 4-5 | Add PostgreSQL | 1 min |
| 6 | Set environment variables | 2 min |
| 7-8 | Deploy & wait | 3-5 min |
| 9-15 | Test & verify | 3 min |
| **Total** | **All done!** | **~15 min** |

---

## You're Ready!

Follow steps 1-15 above. If you get stuck on any step, check the "If Something Goes Wrong" section.

**Go to https://railway.app now and start Step 1.**
