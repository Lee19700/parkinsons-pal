# Railway Deployment: Visual Quick Guide

## Before vs After

### Before (Scattered Setup)
```
parkipal.com (Frontend)        api.parkipal.com (Backend)
    ↓                                ↓
Cloudflare Pages          Heroku / DigitalOcean
    ↓                                ↓
CDN serves HTML              Database elsewhere
```
❌ Complex, separate deployments, CORS issues, multiple providers

---

### After (Unified on Railway)
```
parkinsons-pal.up.railway.app
    ↓
Express Server
├── GET  /                → Serve index.html
├── GET  /medications.html → Serve file
├── POST /api/auth/login  → Database query
├── GET  /api/medications → Database query
└── All API routes
    ↓
PostgreSQL Database
```
✅ Simple, one domain, one provider, managed for you

---

## 5-Minute Railway Deployment

```
1. git push origin main
         ↓
2. https://railway.app (Sign up)
         ↓
3. Deploy from GitHub (select repo)
         ↓
4. Add PostgreSQL (click "+ Add Service")
         ↓
5. Set 5 environment variables:
   - JWT_SECRET
   - ENCRYPTION_KEY
   - ALLOWED_ORIGINS
   - NODE_ENV
   - (DATABASE_URL auto-set)
         ↓
6. Click Deploy
         ↓
7. Wait 2-3 min for build
         ↓
8. ✅ Live! Visit your Railway domain
```

---

## Environment Variables at a Glance

| Var | What | Where to Get |
|-----|------|-------------|
| `JWT_SECRET` | Token signing key | `8%,@w3W]}GH&L:QVbXM\$Ea09m</BgN` (copy) |
| `ENCRYPTION_KEY` | Crypto key (64 hex) | `b29c590394fa2b36197724f6f84c7a4...` (copy) |
| `ALLOWED_ORIGINS` | Your app URL | `https://[your-railroad-url].up.railway.app` (get from Railway) |
| `NODE_ENV` | Mode | `production` (type) |
| `DATABASE_URL` | ⚠️ AUTO | Railway provides it, don't set |

---

## Key Changes Made

### 1. API Client
```javascript
// OLD: https://api.parkipal.com/api
// NEW: https://parkinsons-pal.up.railway.app/api
// ✓ Same domain, simpler!
```

### 2. Express Server
```javascript
// NEW: Serve static files from parent directory
app.use(express.static(parentPath))

// NEW: SPA fallback (routes work)
app.get('*', (req, res) => sendFile('index.html'))

// Result: Single server, both frontend + backend
```

---

## Testing Checklist

After Railway deployment:

```
✓ Visit app in browser
  https://[your-railway-domain].up.railway.app

✓ Test API health
  curl https://[your-railway-domain].up.railway.app/api/health
  Expected: {"status":"ok","timestamp":"..."}

✓ Create account
  Click Register, fill form, submit

✓ Log in
  Use credentials from registration

✓ Add medication
  Medications page → Add → Save

✓ Check database
  Data should persist after refresh
```

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| 502 Bad Gateway | Check logs; verify `ENCRYPTION_KEY` is 64 hex chars |
| Can't create account | Check `JWT_SECRET` is set |
| Login page won't load | Verify `ALLOWED_ORIGINS` matches your Railway domain exactly |
| Database connection error | Don't set `DB_URL`; Railway auto-sets `DATABASE_URL` |
| Losing data after refresh | Likely a CORS error; check browser console |
| Build fails | Check logs → show error message |

---

## Files to Reference

**Quick Start (READ FIRST):**
- 📄 [DEPLOY-NOW.md](DEPLOY-NOW.md)

**Reference:**
- 📄 [RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md)
- 📄 [RAILWAY-CHECKLIST.md](RAILWAY-CHECKLIST.md)

**Setup Complete:**
- 📄 [RAILWAY-READY.md](RAILWAY-READY.md) ← You are here

---

## Network Flow (Technical)

```
User Browser
    ↓ HTTPS
Railroad Load Balancer
    ↓ (internal)
Your Express Server (Node.js)
    ├─ If path = /api/* → Route to API handler
    │  ↓
    │  PostgreSQL Query
    │  ↓
    │  Return JSON
    │
    └─ If path = /* → Serve static file or index.html
       ↓
       Return HTML/CSS/JS to browser
```

---

## One-Click Diagram

```
        Git Push
           ↓
    GitHub repo
           ↓
   Railway webhook
           ↓
    npm install
           ↓
    Build Docker image
           ↓
    Start Express server
           ↓
    Create/use PostgreSQL
           ↓
    ✅ LIVE
```

---

## Success Criteria

You'll know it worked when:

✅ App loads at Railway domain  
✅ Login page visible  
✅ Can create new account  
✅ Can log in  
✅ Can add/edit data  
✅ Data persists after refresh  
✅ API health check returns `{"status":"ok"}`  

---

## Cost at a Glance

```
Hobby tier:
├─ 500 hours/month compute (free)
├─ 5GB database (free)
└─ Cost: $0

Standard usage (typical app):
├─ ~50 hours/month compute (≈$3)
├─ Database (≈$5-12/month)
└─ Cost: $8-15/month
```

---

## Next Steps

1. ✅ You're reading this
2. 👉 Read [DEPLOY-NOW.md](DEPLOY-NOW.md)
3. 👉 Push to GitHub
4. 👉 Deploy on Railway
5. 🎉 Live!

**Time from now: ~20 minutes**
