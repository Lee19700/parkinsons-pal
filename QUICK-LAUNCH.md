# Quick Reference: Production Launch

## 30-Minute Pre-Launch Checklist

### Step 1: Generate Secrets (5 min)
```bash
# In any Node.js environment, run:
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```
Copy output and save securely.

### Step 2: Choose Email Provider (5 min)

**Option A: SendGrid** (Easiest)
1. Go to https://sendgrid.com → Sign up (free tier available)
2. Create API key at https://app.sendgrid.com/settings/api_keys
3. Copy the key

**Option B: Gmail** (Cheapest)
1. Enable 2-Step Verification at https://myaccount.google.com/security
2. Create App Password at https://myaccount.google.com/apppasswords
3. Copy the 16-character password

**Option C: AWS SES**
1. Set up AWS account
2. Verify sender email in SES console
3. Create IAM user with SES permissions

### Step 3: Set Environment Variables (5 min)
In your deployment platform (Railway, Heroku, Docker):
```
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<your-generated-secret>
ENCRYPTION_KEY=<your-generated-64-hex>
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
APP_URL=https://yourdomain.com
EMAIL_FROM=noreply@yourdomain.com

# Choose ONE:
# SendGrid
SENDGRID_API_KEY=SG.xxxxx

# Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# AWS SES
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

### Step 4: Deploy & Test (10 min)
```bash
# For Railway: Push to GitHub, auto-deploys
# For Docker: docker build -t app . && docker run -e ... app
# For Heroku: git push heroku main

# Test health:
curl https://yourdomain.com/api/health

# Test registration:
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test1234"}'

# Test password reset:
curl -X POST https://yourdomain.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"username":"test"}'
# Should send email
```

## What You Get ✅

### Security
- 24-hour JWT tokens (not 7 days)
- Strong password requirements (8+ chars, uppercase, lowercase, numbers)
- Login rate limiting (5 attempts per 15 min)
- Secure password reset (1-hour tokens, single-use)
- AES-256-GCM encryption for documents
- Parameterized queries (no SQL injection)
- CORS protection

### Features
- User registration & login
- Password recovery by email
- User profile management
- All CRUD operations (medications, symptoms, vitals, etc)
- Doctor/caregiver access grants
- Document encryption
- Access logging

### Infrastructure
- PostgreSQL database
- JWT authentication
- Rate limiting
- Email service (configurable)
- Error handling & logging
- Health check endpoint

## Emergency: Troubleshooting

### Users can't login
```
→ Check: DATABASE_URL is correct and database is running
→ Restart server (changes take 30 seconds)
```

### Password reset emails not sending
```
→ Check: EMAIL_HOST/EMAIL_USER/EMAIL_PASSWORD are set
→ Check: Gmail users use App Password (not regular password)
→ Check: SendGrid API key is valid
→ Check: Server logs for [EMAIL] messages
```

### "Invalid token" error after deploying
```
→ Check: JWT_SECRET hasn't changed (causes token mismatch)
→ Users may need to log in again
```

### Database connection failing
```
→ Check: DATABASE_URL format is correct
→ Check: Database server is running and accessible
→ Check: Firewall allows database port (usually 5432)
```

## Key Files

| File | Purpose |
|------|---------|
| `backend/server.js` | Main API server (auth, endpoints) |
| `backend/email.js` | Email service (password reset) |
| `backend/db.js` | Database adapter (PostgreSQL) |
| `reset-password.html` | Password reset form for users |
| `api-client.js` | Frontend API wrapper |
| `backend/EMAIL-SETUP.md` | Email configuration guide |
| `LAUNCH-CHECKLIST.md` | Full deployment guide |
| `PRODUCTION-READY.md` | Complete implementation summary |

## Monitoring

After deployment, check:
- [ ] `/api/health` returns `{ status: 'ok' }`
- [ ] Users can register successfully
- [ ] Passwords are validated (weak passwords rejected)
- [ ] Password reset emails arrive
- [ ] Login with new password works
- [ ] Server logs show no errors

## Post-Launch

Within 24 hours:
1. Monitor error logs (should be 0)
2. Check database backups working
3. Review email delivery metrics
4. Test password reset from customer account

Within 1 week:
1. Get user feedback
2. Fix any issues found
3. Set up automated monitoring
4. Document your setup

## Support Resources

- **Email Issues**: See `backend/EMAIL-SETUP.md`
- **Deployment**: See `LAUNCH-CHECKLIST.md`
- **Full Details**: See `PRODUCTION-READY.md`
- **API Docs**: See individual route files in `backend/routes/`

---

**You're ready to go live! 🚀**

Last verified: December 23, 2025
All systems operational ✅
