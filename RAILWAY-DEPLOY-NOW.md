# 🚀 RAILWAY DEPLOYMENT - DO THIS NOW

## Step 1: Go to Railway.app and Create/Login to Account
- Go to: https://railway.app
- Click "Sign up with GitHub" (or login if you have account)
- Authorize Railway to access your GitHub

## Step 2: Create New Project
- Click "Create New Project" or "Deploy from GitHub repo"
- Select "GitHub"
- Choose: **Lee19700/parkinsons-pal**
- Click "Deploy Now"

⏳ **Railway will now build and deploy your app automatically!** (2-5 minutes)

## Step 3: Add PostgreSQL Database
After project is created:
1. Click on your "parkinsons-pal" project in dashboard
2. Click **"+ Add Service"**
3. Select **"Database"** → **"PostgreSQL"**
4. Railway will provision it automatically

## Step 4: Configure Environment Variables
Railway creates these automatically, but verify they're correct:

In your **parkinsons-pal-backend** service:
- Click "Variables" tab
- Add/verify these variables:

```
Name: NODE_ENV
Value: production

Name: JWT_SECRET  
Value: 8%,@w3W]}GH&L:QVbXM\$Ea09m</BgN

Name: ENCRYPTION_KEY
Value: b29c590394fa2b36197724f6f84c7a4803592a4e79df945e3feb3c4aed7f5392

Name: ALLOWED_ORIGINS
Value: https://<YOUR_RAILWAY_DOMAIN>.up.railway.app
```

**To find your Railway domain:**
- Click on "parkinsons-pal-backend" service
- Look for "Public URL" at top (looks like: `parkinsons-pal-abc123.up.railway.app`)
- Copy the full URL and use it above

## Step 5: Redeploy After Variables Set
- Click the "Redeploy" button
- Wait for green checkmark ✅ (2-3 minutes)

## Step 6: Test Your Deployment
Once deployment is complete:

```
1. Visit your Railway domain
2. Register a new account
3. Log in
4. Add a medication
5. Refresh the page
6. Medication data should still be there!
```

## 🔍 Troubleshooting

**If it says "Build Failed":**
- Click on the failed build
- Check the logs for errors
- Make sure Procfile exists in root directory
- Make sure backend/package.json has correct scripts

**If API won't connect:**
- Check that DATABASE_URL is automatically set by Railway's PostgreSQL
- Make sure ALLOWED_ORIGINS includes your Railway domain
- Check API logs in Railway dashboard

**If no data persists:**
- Check PostgreSQL is running (should show in Services)
- Check DATABASE_URL environment variable is set
- Check API logs for database connection errors

## 📋 Quick Reference

Your deployed app will be at:
```
https://<YOUR-RAILWAY-DOMAIN>.up.railway.app
```

Access Railway logs:
1. Go to your project
2. Click each service to see logs
3. Scroll through to find issues

---

**NEXT STEP:** Once deployed to Railway, you'll run automated tests to verify everything works!
