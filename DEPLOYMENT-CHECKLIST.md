# ✅ PARKIPAL RAILWAY DEPLOYMENT CHECKLIST

**Track your progress through deployment**

---

## 📋 PRE-DEPLOYMENT (Complete ✅)

- [x] Backend fixed and working locally
- [x] PostgreSQL running in Docker
- [x] All code committed to GitHub
- [x] Procfile configured
- [x] Docker setup finalized
- [x] Test suite created

---

## 🚀 DEPLOYMENT PHASE

### Create Railway Account
- [ ] Visit https://railway.app
- [ ] Click "Sign up with GitHub"
- [ ] Authorize Railway to access GitHub
- [ ] Account created and logged in

### Deploy Application
- [ ] Click "Create New Project"
- [ ] Select "Deploy from GitHub"
- [ ] Find and select "Lee19700/parkinsons-pal"
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete (watch progress indicator)
- [ ] See "Deployment successful" message

**Save your Railway domain here:**
```
https://_____________________________________.up.railway.app
                    (fill this in from Railway)
```

### Add PostgreSQL Database
- [ ] In Railway dashboard, go to your project
- [ ] Click "+ Add Service"
- [ ] Select "Database" → "PostgreSQL"
- [ ] Wait for database to initialize
- [ ] Verify it shows in "Services"

### Configure Environment Variables
In your **parkinsons-pal-backend** service Variables tab:

- [ ] Add `NODE_ENV` = `production`
- [ ] Add `JWT_SECRET` = `8%,@w3W]}GH&L:QVbXM\$Ea09m</BgN`
- [ ] Add `ENCRYPTION_KEY` = `b29c590394fa2b36197724f6f84c7a4803592a4e79df945e3feb3c4aed7f5392`
- [ ] Add `ALLOWED_ORIGINS` = `https://YOUR_RAILWAY_DOMAIN.up.railway.app`

### Redeploy
- [ ] Click "Redeploy" button
- [ ] Wait for deployment (green checkmark appears)
- [ ] See "Deployment successful"

---

## 🧪 TESTING PHASE

### Prerequisites
- [ ] Have your Railway domain ready
- [ ] PowerShell available on your computer
- [ ] Can access https://YOUR_DOMAIN.up.railway.app

### Run Automated Tests
Open PowerShell and run:
```powershell
cd "path\to\Parkipal project"
.\test-railway-deployment.ps1 -RailwayDomain "your-domain.up.railway.app"
```

- [ ] Tests start running
- [ ] All 10 tests pass ✅
- [ ] See "ALL TESTS PASSED" message

### Manual Testing (Optional but Recommended)
1. [ ] Open browser to your Railway domain
2. [ ] Create a new account
   - Username: `testuser1`
   - Password: `Test@123456`
3. [ ] Log in successfully
4. [ ] Add a medication
   - Name: "Test Med"
   - Dosage: "10mg"
   - Times: "Morning"
5. [ ] Check medication appears in list
6. [ ] Add a symptom log
   - Tremor: 1
   - Mood: 4
7. [ ] Check symptom appears in list
8. [ ] Add vital signs
   - BP: 120/80
   - HR: 72
9. [ ] Check vitals appear in list
10. [ ] **Refresh the page** - all data should still be there!
11. [ ] Log out
12. [ ] Log back in with same credentials
13. [ ] Verify all your data is still there (persistence test)

---

## ✨ PRODUCTION READINESS

- [ ] All automated tests passing
- [ ] Manual testing successful
- [ ] Data persists across refreshes
- [ ] Data persists across login/logout
- [ ] Can create multiple users
- [ ] Each user sees only their data
- [ ] No errors in Railway logs
- [ ] HTTPS working (browser shows 🔒)

---

## 🎯 FINAL CHECKLIST

- [ ] Deployment complete
- [ ] Tests passing
- [ ] Ready to share with users
- [ ] Domain works without errors
- [ ] All features tested and working
- [ ] Ready for production use

---

## 🚨 ISSUE TRACKER

If something doesn't work, fill this in:

**Issue 1:**
- What failed: _________________________________
- When it happened: _________________________________
- Error message: _________________________________
- Solution tried: _________________________________
- Status: [  ] Resolved [  ] Pending

**Issue 2:**
- What failed: _________________________________
- When it happened: _________________________________
- Error message: _________________________________
- Solution tried: _________________________________
- Status: [  ] Resolved [  ] Pending

**Issue 3:**
- What failed: _________________________________
- When it happened: _________________________________
- Error message: _________________________________
- Solution tried: _________________________________
- Status: [  ] Resolved [  ] Pending

---

## 📞 GETTING HELP

If tests fail:
1. Check Railway logs:
   - Go to your project
   - Click on "parkinsons-pal-backend" service
   - Click "Logs" tab
   - Look for error messages

2. Common issues:
   - **"Failed to connect to database"** → Database may not be started
   - **"CORS error"** → Check ALLOWED_ORIGINS variable
   - **"Invalid token"** → Check JWT_SECRET variable
   - **"Permission denied"** → Check PostgreSQL credentials

3. Reference docs:
   - RAILWAY-DEPLOYMENT-GUIDE.md
   - SECURITY.md
   - backend/SETUP-WINDOWS.md

---

**Status: READY FOR DEPLOYMENT** ✅

Start with "Create Railway Account" above!
