# Railway Production Deployment - Environment Setup

## Generated Secrets (Save These Securely)

```
JWT_SECRET=159f414289a6e6f1d5f2d4f1b7a86b476216cadc63964832bf6318db08da8887
ENCRYPTION_KEY=ea4b88306013c25fbf16f411916db991e72a07df39ff4b6b9ac661185b37cc80
DB_PASSWORD=88e29ac63a341f8a14403ab240ebe5b3
```

**IMPORTANT:** Store these in a password manager (1Password, Bitwarden, etc.). Do NOT commit to git.

---

## Step 1: Set Up Railway PostgreSQL

1. Go to [Railway.app Dashboard](https://railway.app)
2. Create a new **PostgreSQL** service
3. Note the generated `DATABASE_URL` (you'll need it)

---

## Step 2: Configure Backend Environment Variables

In your Railway project, go to **Variables** and set:

```
NODE_ENV=production
PORT=3000

JWT_SECRET=159f414289a6e6f1d5f2d4f1b7a86b476216cadc63964832bf6318db08da8887
ENCRYPTION_KEY=ea4b88306013c25fbf16f411916db991e72a07df39ff4b6b9ac661185b37cc80

DATABASE_URL=<paste-from-railway-postgres-service>

ALLOWED_ORIGINS=https://parkipal.com,https://www.parkipal.com
MAX_BODY_MB=10
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
```

---

## Step 3: Deploy to Railway

```bash
# Install Railway CLI (if not already installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Deploy
railway up
```

---

## Step 4: Verify Deployment

1. Check Railway logs:
   ```
   railway logs
   ```
   
   Look for:
   ```
   [STARTUP] Loading environment variables...
   [DB] Connected to PostgreSQL, creating schema...
   [SERVER] Parkinson's Pal API server running on port 3000
   ```

2. Test health endpoint:
   ```
   curl https://your-railway-domain/api/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-12-20T..."
   }
   ```

3. Test registration (from Cloudflare frontend):
   - Navigate to login page
   - Create new account
   - Verify JWT token is returned

---

## Step 5: Configure Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Create new Pages project
3. Connect to your Git repository
4. Build settings:
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: `/` (root)
5. Deploy

---

## Security Checklist

- [x] Local .env files removed
- [x] New secrets generated
- [x] .gitignore created
- [ ] Secrets set in Railway dashboard
- [ ] PostgreSQL deployed on Railway
- [ ] Backend deployed to Railway
- [ ] Cloudflare Pages connected
- [ ] Health check endpoint responding
- [ ] Authentication working end-to-end
- [ ] Rate limiting active
- [ ] Encryption keys validated at startup

---

## Cleanup

✅ **Completed:**
- Deleted `backend/.env`
- Deleted `deploy/.env`
- Created `.gitignore`
- Generated new production secrets
- Documented setup steps

⚠️ **Local System:**
The old secrets above are now only in Railway logs (if previously deployed). If you had them deployed before, rotate them immediately in Railway dashboard.

---

## Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Verify all env vars are set: `railway variables`
3. Test database connection: `railway shell` then `psql $DATABASE_URL`
4. Check Cloudflare Pages build logs

