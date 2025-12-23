# Production Launch Checklist - Parkinson's Pal

Your application is now ready for production with all security hardening implemented. Follow this checklist to launch safely.

## Pre-Launch Security Review ✓

- [x] **Password Validation** - 8+ chars, uppercase, lowercase, numbers required
- [x] **JWT Expiry** - Reduced to 24 hours (was 7 days)
- [x] **Login Rate Limiting** - 5 attempts per 15 minutes
- [x] **Password Reset** - Secure 1-hour tokens with email delivery
- [x] **Input Validation** - Username length (3-50), password length (8-128)
- [x] **Database** - Parameterized queries prevent SQL injection
- [x] **CORS** - Restricted by ALLOWED_ORIGINS environment variable
- [x] **Encryption** - AES-256-GCM for sensitive documents

## Environment Variables Checklist

Before deploying, ensure these are set in your `.env` or platform's environment:

### Required Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - 32+ random characters (NOT "change-this-secret-key")
- [ ] `ENCRYPTION_KEY` - 64 hex characters (32 bytes)
- [ ] `NODE_ENV=production`
- [ ] `ALLOWED_ORIGINS` - Your domain(s), comma-separated (e.g., `https://parkinsonspal.app,https://www.parkinsonspal.app`)

### Email Configuration (Choose One)
- [ ] **Option A - SendGrid (Recommended)**
  - `SENDGRID_API_KEY` - Your SendGrid API key
  - `EMAIL_FROM` - Sender email address
  
- [ ] **Option B - Generic SMTP**
  - `EMAIL_HOST` - SMTP server hostname
  - `EMAIL_PORT` - SMTP port (usually 587)
  - `EMAIL_USER` - Email account username
  - `EMAIL_PASSWORD` - Email account password
  - `EMAIL_SECURE` - false (for 587) or true (for 465)
  - `EMAIL_FROM` - Sender email address

- [ ] **Option C - AWS SES**
  - `AWS_REGION` - AWS region
  - `AWS_ACCESS_KEY_ID` - AWS access key
  - `AWS_SECRET_ACCESS_KEY` - AWS secret key
  - `EMAIL_FROM` - Verified sender email

### Optional Variables
- [ ] `PORT` - Server port (default: 3000)
- [ ] `APP_URL` - Your app URL for password reset links (e.g., https://parkinsonspal.app)
- [ ] `MAX_BODY_MB` - Max request body size (default: 10)

## Platform-Specific Guides

### For Railway
1. Create project at https://railway.app
2. Connect GitHub repository
3. Add environment variables in Railway dashboard:
   - Click "Variables" tab
   - Add `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, etc.
4. Deploy button will deploy automatically
5. Get your URL from Railway dashboard

### For Heroku (Legacy)
1. Install Heroku CLI
2. Run:
   ```bash
   heroku login
   heroku create your-app-name
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set ENCRYPTION_KEY=your-64-hex-chars
   heroku addons:create heroku-postgresql:hobby-dev
   git push heroku main
   ```

### For Docker (Your Own Server)
1. Build image: `docker build -t parkinsonspal .`
2. Run with environment variables:
   ```bash
   docker run -e DATABASE_URL=... -e JWT_SECRET=... -p 3000:3000 parkinsonspal
   ```
3. Use Caddy (included in `deploy/`) as reverse proxy with SSL

### For AWS
1. Use RDS for PostgreSQL database
2. Deploy on EC2, ECS, or Elastic Beanstalk
3. Use AWS Secrets Manager for sensitive values
4. Set up CloudFront CDN for static files
5. Enable Route 53 for DNS

## Steps to Deploy

### 1. Generate Strong Secrets
```bash
# Generate JWT_SECRET (run locally)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate ENCRYPTION_KEY (must be exactly 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Update Dependencies
```bash
cd backend
npm install
```

This adds `nodemailer` for email support.

### 3. Test Locally First
```bash
# Set test environment variables in .env
NODE_ENV=development npm run dev

# Test password reset (should not send email in dev mode)
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'
```

### 4. Set Production Environment Variables

Your chosen platform (Railway, Heroku, Docker):
```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=<your-generated-secret>
ENCRYPTION_KEY=<your-generated-key>
ALLOWED_ORIGINS=https://parkinsonspal.app
EMAIL_FROM=noreply@parkinsonspal.app
SENDGRID_API_KEY=<optional-if-using-sendgrid>
APP_URL=https://parkinsonspal.app
```

### 5. Deploy
- **Railway**: Push to GitHub, auto-deploys
- **Docker**: Build and push to registry, deploy
- **Heroku**: `git push heroku main`
- **AWS**: Use deployment tools for your chosen service

### 6. Verify Production Deployment

Test these endpoints:
```bash
# Health check
curl https://your-app.com/api/health

# Register new user
curl -X POST https://your-app.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"prodtest","password":"Test1234"}'

# Test password reset (should send email)
curl -X POST https://your-app.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"username":"prodtest"}'
```

## Post-Launch Monitoring

### Set Up Logging
Monitor these in production:
- Server startup logs
- Authentication errors (failed logins)
- Database connection issues
- Email delivery failures

### Database Backups
- Set up automated daily backups
- For PostgreSQL: use `pg_dump` or provider's backup service
- For Railway: automatic included
- Test restore procedure weekly

### Security Monitoring
- Monitor login attempts (429 errors = rate limit hitting)
- Check for unusual API access patterns
- Review access grants to patient data
- Keep Node.js and dependencies updated

### Performance Monitoring
- Monitor response times
- Track database query performance
- Set up alerts for high error rates

## Troubleshooting Production Issues

### "CORS error" when accessing from browser
- Check `ALLOWED_ORIGINS` includes your domain
- Must match exactly (including https:// and www)
- Restart server after changing

### "Password reset email not sending"
- Check email provider credentials in dashboard
- Verify sender email is verified in email service
- Check server logs for `[EMAIL]` messages
- Test with `EMAIL_DISABLED=false` in .env

### "Database connection failed"
- Verify `DATABASE_URL` format is correct
- Check database server is running and accessible
- Test connection locally before deploying
- Check network/firewall rules allow PostgreSQL port

### "Invalid or expired token" on login
- JWT_SECRET might have changed (users need to re-login)
- Check `NODE_ENV` is set to `production`
- Verify JWT_SECRET is same across all instances

## After Launch

1. **Monitor for 48 hours** - Check logs, test key features
2. **Enable backups** - Set up automated database backups
3. **Plan updates** - Document your deployment process
4. **Security patches** - Subscribe to Node.js/npm security alerts
5. **User feedback** - Monitor for reported issues

## Emergency Contacts

If something goes wrong:
1. Check server logs first
2. Verify environment variables are set
3. Review "Troubleshooting" section above
4. Database provider support (Railway/AWS/etc)
5. Node.js community forums

## Success Indicators

Your deployment is successful when:
- ✓ `/api/health` returns `{ status: 'ok' }`
- ✓ Users can register and login
- ✓ Password reset sends emails
- ✓ All data operations work (medications, symptoms, etc)
- ✓ No errors in server logs
- ✓ Response times are < 200ms

## Next: Frontend Enhancements

After confirming backend works, consider:
1. **Add password reset link** - Include in login page
2. **Enable email notifications** - For appointment reminders
3. **Add two-factor authentication** - For extra security
4. **Progressive web app** - Offline support
5. **Mobile app** - Native iOS/Android experience

---

**Deployment Date:** ________________
**Environment:** ________________
**Team Members:** ________________

Good luck with your launch! 🚀
