# Production Environment Setup Guide

This guide helps you prepare your Parkinson's Pal application for production deployment.

## Overview

Production environment differs from development in several critical ways:

| Aspect | Development | Production |
|--------|-------------|-----------|
| Database | Local Docker | Cloud (Railway/Heroku/AWS) |
| Emails | Disabled | SendGrid/AWS SES |
| Debug Logs | Verbose | Limited |
| Node Environment | `development` | `production` |
| JWT Secret | Test value | Strong random 32+ chars |
| Encryption Key | Test value | Strong random 64 hex chars |
| ALLOWED_ORIGINS | `localhost:3000` | Your domain(s) |
| App URL | `http://localhost:3000` | `https://yourdomain.com` |

---

## Step 1: Generate Secure Credentials

### JWT Secret (32+ random characters)

**On Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | % {[byte](Get-Random -Max 256)})) | Out-String
```

**On Linux/Mac:**
```bash
openssl rand -base64 32
```

**Example output:**
```
aB3kL9mP7qW2xC6nR4vT8yU1zD5eF0gH+jI=
```

### Encryption Key (64 random hex characters)

**On Windows PowerShell:**
```powershell
-join (1..64 | % {'{0:x}' -f (Get-Random -Max 16)})
```

**On Linux/Mac:**
```bash
openssl rand -hex 32
```

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

## Step 2: Database Setup

### Option A: Railway (Recommended - Easiest)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - New Project → Add Service → PostgreSQL
   - Set password
   - Copy `DATABASE_URL` from Variables tab

3. **Deploy Server**
   - New Service → GitHub Repo
   - Select your Parkinsons Pal repo
   - Root directory: `backend/`
   - Add environment variables (see Step 4)

### Option B: Heroku

1. **Create Heroku Account**
   - Go to https://heroku.com
   - Create new app

2. **Add PostgreSQL Database**
   - Resources → Add-ons → Heroku Postgres
   - Choose Hobby tier (free)
   - Copy `DATABASE_URL` from Config Vars

3. **Deploy**
   - Install Heroku CLI
   - Run: `heroku login` and `git push heroku main`

### Option C: AWS RDS (More Control)

1. **Create RDS Instance**
   - Go to AWS Console → RDS
   - Create database → PostgreSQL
   - Copy connection string: `postgresql://user:pass@host:5432/db`

---

## Step 3: Email Provider Setup

Choose ONE email provider (see EMAIL-PROVIDER-SETUP.md for details):

### SendGrid (Recommended)
1. Sign up: https://sendgrid.com/
2. Create API key
3. Add to environment:
   ```
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.your_key_here
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=Parkinson's Pal
   ```

### Gmail SMTP
1. Enable 2FA: myaccount.google.com/security
2. Create app password: myaccount.google.com/apppasswords
3. Add to environment:
   ```
   EMAIL_PROVIDER=smtp
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=16-char-app-password
   EMAIL_FROM=your.email@gmail.com
   ```

---

## Step 4: Environment Variables

Create production `.env` file with these variables:

```bash
# ===== Database =====
DATABASE_URL=postgresql://user:password@host:5432/parkinsons_pal
# Example: postgresql://postgres:abc123@db.railway.app:5432/railway

# ===== Server =====
NODE_ENV=production
PORT=3000

# ===== Security =====
JWT_SECRET=aB3kL9mP7qW2xC6nR4vT8yU1zD5eF0gH+jI=
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# ===== CORS =====
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# ===== Email =====
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Parkinson's Pal
EMAIL_DISABLED=false

# ===== Application =====
APP_URL=https://yourdomain.com
```

### Important Notes:

1. **DATABASE_URL**: Connection string from Railway/Heroku/AWS
2. **JWT_SECRET**: Use generated 32+ char random string (no spaces)
3. **ENCRYPTION_KEY**: Use generated 64 hex char random string
4. **ALLOWED_ORIGINS**: Your production domain(s) - comma-separated, no spaces
5. **SENDGRID_API_KEY**: From SendGrid API keys dashboard
6. **APP_URL**: Full HTTPS URL without trailing slash
7. **EMAIL_DISABLED**: Must be `false` to send emails in production

---

## Step 5: Domain Configuration

If using custom domain:

### Update DNS Records
1. Go to domain registrar (GoDaddy, Namecheap, etc.)
2. Point domain to hosting provider:
   - **Railway**: Use CNAME from Dashboard
   - **Heroku**: Add Heroku domain via app settings
   - **AWS**: Use Route 53 or ALIAS records

### Update ALLOWED_ORIGINS
```
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Update APP_URL
```
APP_URL=https://yourdomain.com
```

### Enable HTTPS
- Railway: Automatic SSL
- Heroku: Automatic with custom domain
- AWS: Use CloudFront + ACM certificate

---

## Step 6: Deployment Verification

After deploying, verify these endpoints:

### Health Check
```bash
curl https://yourdomain.com/api/health
```
Expected response:
```json
{"status":"ok","timestamp":"2025-12-23T..."}
```

### Registration
```bash
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "password":"Test@12345",
    "display_name":"Test User"
  }'
```
Expected: `{"ok":true,"token":"eyJhbG..."}`

### Forgot Password
```bash
curl -X POST https://yourdomain.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'
```
Expected: `{"ok":true,"message":"Password reset email sent"}`

### Check Email
- Verify email arrived in testuser's inbox
- Click reset link
- Set new password
- Confirm password reset successful

---

## Step 7: Security Checklist

Before going live, verify:

- [ ] DATABASE_URL uses secure password (32+ chars)
- [ ] JWT_SECRET is random 32+ characters
- [ ] ENCRYPTION_KEY is random 64 hex characters
- [ ] ALLOWED_ORIGINS matches your domain(s)
- [ ] EMAIL_PROVIDER is configured (not EMAIL_DISABLED=true)
- [ ] NODE_ENV=production (not development)
- [ ] HTTPS enabled (all traffic is encrypted)
- [ ] .env file NOT committed to Git
- [ ] Database backups enabled (Railway/Heroku backup settings)
- [ ] Server logs monitored (check email delivery, errors)
- [ ] Rate limiting enabled (default: 120 req/min globally, 5 login attempts/15min)
- [ ] CORS properly configured (no wildcards in ALLOWED_ORIGINS)

---

## Step 8: Post-Deployment Monitoring

### Daily Tasks
- Check error logs
- Monitor email delivery
- Review user signups
- Test password reset flow weekly

### Weekly Tasks
- Review database backups
- Check rate limit metrics
- Monitor disk space
- Verify HTTPS certificate validity

### Monthly Tasks
- Rotate JWT_SECRET if exposed
- Review access logs for suspicious activity
- Test disaster recovery procedures
- Update dependencies for security patches

---

## Production-Ready Environment Template

```bash
# Copy this to your production .env file and fill in values

NODE_ENV=production
PORT=3000

# Database (from Railway/Heroku/AWS)
DATABASE_URL=postgresql://user:password@host:5432/db

# Security (generate new values!)
JWT_SECRET=<32-char-random-string>
ENCRYPTION_KEY=<64-char-hex-random-string>

# CORS (update to your domain)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (choose one: sendgrid, smtp, or aws-ses)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.<your-key>
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Parkinson's Pal
EMAIL_DISABLED=false

# Application
APP_URL=https://yourdomain.com
```

---

## Troubleshooting

### Database Connection Error
1. Verify DATABASE_URL is correct
2. Check credentials in connection string
3. Ensure database accepts connections from app's IP
4. Test with psql: `psql <DATABASE_URL>`

### Emails Not Sending
1. Verify EMAIL_PROVIDER and credentials
2. Check SENDGRID_API_KEY/EMAIL_PASSWORD
3. Review server logs for error messages
4. Test API key in provider's dashboard

### CORS Errors
1. Verify frontend URL in ALLOWED_ORIGINS
2. Ensure no trailing slashes
3. Check for typos in domain
4. Restart server after changing CORS

### SSL Certificate Error
1. Force HTTPS in browser
2. Wait 24h for DNS propagation
3. Check domain DNS records
4. Renew certificate if expired

---

## Getting Help

**For Railway issues**: https://railway.app/docs
**For Heroku issues**: https://devcenter.heroku.com/
**For AWS issues**: https://docs.aws.amazon.com/
**For email issues**: See EMAIL-PROVIDER-SETUP.md

---

Your Parkinson's Pal application is now ready for production! 🚀

Questions? Check LAUNCH-CHECKLIST.md for additional pre-launch tasks.
