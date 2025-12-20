# ✅ PRODUCTION LAUNCH CHECKLIST

**Status:** Ready for Deployment  
**Date:** December 20, 2025  
**Environment:** Railway Backend + Cloudflare Pages Frontend

---

## 🔒 Security Actions Completed

- [x] Deleted `backend/.env` (contained test secrets)
- [x] Deleted `deploy/.env` (contained test secrets)
- [x] Created `.gitignore` (prevents future secret leaks)
- [x] Generated new production secrets:
  - JWT_SECRET (64 hex chars)
  - ENCRYPTION_KEY (64 hex chars) 
  - DB_PASSWORD (32 hex chars)
- [x] Documented setup process in `RAILWAY-PRODUCTION-SETUP.md`
- [x] Created secure storage reminder in `PRODUCTION-SECRETS.txt`

---

## 📋 Remaining Tasks (IN ORDER)

### Phase 1: Railway Setup (5 min)

- [ ] **Login to Railway Dashboard**
  - URL: https://railway.app
  - Go to your Parkipal project

- [ ] **Create PostgreSQL Service**
  - Click "Add Service" → PostgreSQL
  - Wait for database to initialize
  - Copy the `DATABASE_URL` from variables

- [ ] **Set Environment Variables**
  - Go to Variables section
  - Add all variables from `PRODUCTION-SECRETS.txt`:
    ```
    NODE_ENV=production
    PORT=3000
    JWT_SECRET=159f414289a6e6f1d5f2d4f1b7a86b476216cadc63964832bf6318db08da8887
    ENCRYPTION_KEY=ea4b88306013c25fbf16f411916db991e72a07df39ff4b6b9ac661185b37cc80
    DATABASE_URL=<paste-your-railway-postgres-url>
    ALLOWED_ORIGINS=https://parkipal.com,https://www.parkipal.com
    MAX_BODY_MB=10
    RATE_LIMIT_WINDOW_MS=60000
    RATE_LIMIT_MAX=120
    ```

### Phase 2: Backend Deployment (5 min)

- [ ] **Deploy Backend Service**
  - Connect `backend/` folder to Railway
  - Railway will auto-detect `package.json` and run `npm start`
  - Watch for these log lines:
    ```
    [STARTUP] Loading environment variables...
    [DB] Connected to PostgreSQL, creating schema...
    [SERVER] Parkinson's Pal API server running on port 3000
    ```

- [ ] **Verify Health Endpoint**
  - Get your Railway domain (e.g., `parkipal-api.up.railway.app`)
  - Test: `curl https://parkipal-api.up.railway.app/api/health`
  - Expected: `{"status":"ok","timestamp":"..."}`

### Phase 3: Frontend Deployment (5 min)

- [ ] **Deploy to Cloudflare Pages**
  - Connect your Git repository
  - Build settings:
    - Framework: None
    - Build command: (empty)
    - Output directory: `/`
  - Deploy

- [ ] **Configure Cloudflare Domain**
  - Add DNS A record for `parkipal.com` pointing to your IP/server
  - Enable HTTPS (automatic via Cloudflare)
  - Pages will be available at `https://parkipal.com`

### Phase 4: Integration Testing (10 min)

- [ ] **Test Frontend → Backend Connection**
  - Open `https://parkipal.com` in browser
  - Create new account
  - Verify JWT token returned in browser console
  - Check that data can be fetched from API

- [ ] **Test Encryption**
  - Upload a document
  - Verify it's encrypted in database
  - Download and verify decryption works

- [ ] **Test Rate Limiting**
  - Make rapid requests to `/api/health`
  - After 120 requests/min, should get 429 status code

- [ ] **Test CORS**
  - Verify no "CORS error" in browser console
  - API requests should succeed from Cloudflare domain

### Phase 5: Security Hardening (5 min)

- [ ] **Enable Cloudflare Security**
  - Enable "Web Application Firewall"
  - Set rate limiting on Pages
  - Enable DDoS protection

- [ ] **Monitor Logs**
  - Set up error alerts in Railway
  - Subscribe to Cloudflare notifications

- [ ] **Backup Database**
  - Configure Railway automated backups
  - Test restore process

---

## 🚨 Immediate Actions

### TODAY:
1. Store secrets securely (1Password, Bitwarden, or similar)
2. Delete `PRODUCTION-SECRETS.txt` from this folder after secrets are set
3. Never share these secrets via email/Slack
4. Complete Phase 1 & 2 above

### DO NOT:
- ❌ Commit `.env` files to Git (now ignored by .gitignore)
- ❌ Share secrets in chat or email
- ❌ Use old/test credentials
- ❌ Deploy without setting `NODE_ENV=production`
- ❌ Forget to set `ALLOWED_ORIGINS` to your actual domain

---

## 📞 Support Resources

- **Railway Docs:** https://docs.railway.app
- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages
- **PostgreSQL Connection:** https://docs.railway.app/guides/postgres

---

## Files Modified

```
✓ backend/.env → DELETED
✓ deploy/.env → DELETED
✓ .gitignore → CREATED
✓ PRODUCTION-SECRETS.txt → CREATED
✓ RAILWAY-PRODUCTION-SETUP.md → CREATED
✓ PRODUCTION-LAUNCH-CHECKLIST.md → CREATED (this file)
```

---

## Timeline

- **Now:** Setup Railway & deploy backend
- **+15 min:** Setup Cloudflare Pages & deploy frontend
- **+30 min:** Run integration tests
- **+45 min:** Go live 🚀

Good luck! You're almost there.
