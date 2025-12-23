# Quick Deploy to Production - 15 Minute Checklist

Use this checklist to deploy your Parkinson's Pal application to production in ~15 minutes.

## Pre-Deployment (5 minutes)

- [ ] **Verify Local Works**
  ```bash
  cd backend
  npm run dev
  ```
  Check console shows: `[SERVER] Parkinson's Pal API server running on port 3000`

- [ ] **Test All Features Locally**
  - [ ] Registration works
  - [ ] Login works
  - [ ] Forgot password shows form
  - [ ] Can enter username in forgot form

- [ ] **Have Credentials Ready**
  - [ ] JWT Secret (32+ random chars)
  - [ ] Encryption Key (64 hex chars)
  - [ ] Email API key (SendGrid / Gmail / AWS)
  - [ ] Domain name (if using custom domain)

---

## Database Setup (3 minutes)

### Using Railway (Recommended)

1. **Create Free Account**
   - Go to https://railway.app
   - Sign up with GitHub
   - Authorize repository access

2. **Create PostgreSQL**
   - Click "New Project"
   - Add Service → PostgreSQL
   - Set password (save it!)
   - View Variables → Copy `DATABASE_URL`

**Database URL looks like:**
```
postgresql://postgres:password123@db.railway.app:5432/railway
```

---

## Email Setup (2 minutes)

### Using SendGrid (Recommended)

1. **Create Free Account**
   - Go to https://sendgrid.com
   - Sign up (free tier: 100 emails/day)

2. **Generate API Key**
   - Settings → API Keys
   - Create API Key
   - Name: "Parkinsons Pal"
   - Copy key: `SG.abc123...`

**Environment variables needed:**
```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_key_here
EMAIL_FROM=noreply@yourdomain.com
```

---

## Deploy App (5 minutes)

### Using Railway

1. **Connect Repository**
   - In Railway: New Service → GitHub Repo
   - Select your Parkinsons Pal repo
   - Set Root Directory: `backend/`

2. **Add Environment Variables**
   - Click "Variables" in Railway dashboard
   - Add each variable:
     ```
     DATABASE_URL=postgresql://postgres:xxx@db.railway.app:5432/railway
     JWT_SECRET=<your-32-char-random-string>
     ENCRYPTION_KEY=<your-64-hex-chars>
     NODE_ENV=production
     SENDGRID_API_KEY=SG.your_key
     EMAIL_FROM=noreply@yourdomain.com
     EMAIL_FROM_NAME=Parkinson's Pal
     EMAIL_DISABLED=false
     APP_URL=https://parkinsonspal-abc123.railway.app
     ALLOWED_ORIGINS=https://parkinsonspal-abc123.railway.app
     ```
   - Click Deploy

3. **Wait for Deployment**
   - Watch logs for: `[SERVER] Parkinson's Pal API server running on port 3000`
   - Takes ~2-3 minutes

---

## Verify Deployment (Optional, but recommended - 3 minutes)

### Test Endpoints

**1. Health Check**
```bash
curl https://your-railway-app-url/api/health
```
Expected:
```json
{"status":"ok","timestamp":"2025-12-23T..."}
```

**2. Test Registration**
```bash
curl -X POST https://your-railway-app-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"test123",
    "password":"Test@1234",
    "display_name":"Test User"
  }'
```
Expected:
```json
{"ok":true,"token":"eyJhbGciOiJIUzI1NiIs..."}
```

**3. Test Forgot Password**
```bash
curl -X POST https://your-railway-app-url/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"username":"test123"}'
```
Expected:
```json
{"ok":true,"message":"Password reset email sent"}
```

**4. Check Email**
- Wait 30 seconds
- Check your email inbox (and spam folder)
- Should receive password reset link
- Click link → set new password
- Verify success message

---

## Connect Frontend (Optional)

If deploying frontend to Vercel/Netlify:

### Frontend Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to vercel.com
   - Import repository
   - Framework: Next.js (or None)
   - Deploy

3. **Update Backend CORS**
   - In Railway: Add to `ALLOWED_ORIGINS`:
     ```
     ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,https://parkinsonspal-xxx.railway.app
     ```

---

## Going Live with Custom Domain (Optional)

### Add Custom Domain to Railway

1. **In Railway Dashboard**
   - Settings → Custom Domain
   - Enter your domain (e.g., parkinsonspal.com)
   - Add DNS record shown

2. **In Domain Registrar**
   - Point domain to Railway's CNAME
   - Wait 24 hours for DNS to propagate

3. **Update Environment Variables**
   ```
   APP_URL=https://parkinsonspal.com
   ALLOWED_ORIGINS=https://parkinsonspal.com,https://www.parkinsonspal.com
   ```

4. **Redeploy**
   - Railway automatically detects domain change
   - SSL certificate auto-provisioned

---

## Post-Deployment Checklist

✅ **Immediate** (Do now)
- [ ] App loads without errors
- [ ] Registration works
- [ ] Login works
- [ ] Forgot password sends email
- [ ] Password reset works

✅ **Today**
- [ ] Set up automated backups (Railway does this automatically)
- [ ] Test on mobile device
- [ ] Share link with beta users

✅ **This Week**
- [ ] Monitor error logs daily
- [ ] Check email delivery metrics
- [ ] Test with real users
- [ ] Gather feedback

✅ **Before Full Launch**
- [ ] Security audit (see PRODUCTION-ENVIRONMENT-SETUP.md)
- [ ] Load testing (simulate 100+ users)
- [ ] Backup/restore procedure test
- [ ] Update ALLOWED_ORIGINS if needed

---

## Troubleshooting

### App won't start
- Check logs in Railway
- Verify DATABASE_URL is correct
- Ensure all required variables are set

### Database connection fails
- Verify DATABASE_URL in Railway Variables
- Check database is accessible
- Test connection: `psql <DATABASE_URL>`

### Emails not sending
- Verify SENDGRID_API_KEY is correct
- Check EMAIL_DISABLED=false
- Review SendGrid dashboard for bounces/errors

### CORS errors in browser
- Verify frontend URL in ALLOWED_ORIGINS
- Ensure no trailing slashes
- Clear browser cache and hard-reload

---

## Done! 🎉

Your Parkinson's Pal application is now live in production!

- **API Endpoint**: https://your-app-url/api/
- **Health Check**: https://your-app-url/api/health
- **Frontend**: Deploy separately or serve from backend static folder

### Next Steps
1. Monitor logs daily for errors
2. Test password reset flow weekly
3. Backup database monthly
4. Update dependencies quarterly

For detailed setup: See PRODUCTION-ENVIRONMENT-SETUP.md
For email configuration: See EMAIL-PROVIDER-SETUP.md
For security checklist: See LAUNCH-CHECKLIST.md

Questions? Check the docs or reach out! ✨
