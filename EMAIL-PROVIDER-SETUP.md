# Email Provider Configuration for Parkinson's Pal

Your application is ready to send password reset emails. Choose your preferred email provider and follow the setup steps below.

## Option 1: SendGrid (Recommended - Free Tier Available)

**Advantages:**
- Most reliable for production
- Free tier: 100 emails/day
- Simple API key setup
- Excellent deliverability

### Setup Steps:

1. **Create SendGrid Account**
   - Visit: https://sendgrid.com/
   - Sign up for free account
   - Verify your email

2. **Create API Key**
   - Go to Settings → API Keys (https://app.sendgrid.com/settings/api_keys)
   - Click "Create API Key"
   - Name: `Parkinsons Pal Production`
   - Permissions: Full Access (or Mail Send only)
   - Copy the API key

3. **Update .env File**
   ```
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.your_api_key_here_123456789
   EMAIL_FROM=noreply@yourapp.com
   EMAIL_FROM_NAME=Parkinson's Pal
   ```

4. **Test Email**
   - In terminal, run:
     ```bash
     cd backend
     curl -X POST http://localhost:3000/api/auth/forgot-password \
       -H "Content-Type: application/json" \
       -d '{"username":"testuser"}'
     ```
   - Check your email

---

## Option 2: Gmail SMTP (Free, But Requires App Password)

**Advantages:**
- Free
- Widely recognized
- Good for small-scale use

### Setup Steps:

1. **Enable 2-Factor Authentication**
   - Go to myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password**
   - Go to myaccount.google.com/apppasswords
   - Select: Mail → Windows Computer (or your platform)
   - Generate password (16-character code)
   - Copy the password

3. **Update .env File**
   ```
   EMAIL_PROVIDER=smtp
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=your.email@gmail.com
   EMAIL_FROM_NAME=Parkinson's Pal
   ```

4. **Test Email**
   - Restart server: `npm run dev`
   - Use curl command from Option 1
   - Email should arrive in seconds

---

## Option 3: AWS SES (Free Tier, But More Setup)

**Advantages:**
- Part of AWS ecosystem
- Scalable to millions of emails
- Free tier: 62,000 emails/month

### Setup Steps:

1. **Create AWS Account**
   - Go to aws.amazon.com
   - Create free account (requires credit card)

2. **Verify Email in SES**
   - Go to AWS Console → SES → Email Addresses
   - Add email address (e.g., noreply@yourdomain.com)
   - Click verification link in email from AWS
   - Status should show "Verified"

3. **Create IAM User with SES Permissions**
   - Go to IAM → Users → Create User
   - Name: `parkinsonspal-ses`
   - Attach policy: `AmazonSesSendingAccess`
   - Create access key
   - Copy Access Key ID and Secret Access Key

4. **Update .env File**
   ```
   EMAIL_PROVIDER=aws-ses
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=Parkinson's Pal
   ```

---

## Option 4: Custom SMTP Server

**Advantages:**
- Use any SMTP server (Office 365, Outlook, etc.)
- Full control

### Setup Example (Office 365):

```
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your.email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your.email@outlook.com
EMAIL_FROM_NAME=Parkinson's Pal
```

---

## Development vs Production

### Development Mode (Current)
```
EMAIL_DISABLED=true
```
- Emails are NOT sent
- Reset links printed to console instead
- Good for testing without email account

### Production Mode
```
EMAIL_DISABLED=false
NODE_ENV=production
```
- Emails are actually sent
- Requires EMAIL_PROVIDER and credentials configured
- Monitor email deliverability

---

## Test Your Email Setup

### 1. Manual Test via API

```bash
# Request password reset
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'

# Look for:
# Dev mode: Reset link printed to console
# Prod mode: Email sent to user's inbox
```

### 2. Check Server Logs

Watch your `npm run dev` terminal for:
```
[EMAIL] Password reset email sent to user@example.com
[EMAIL] Reset URL: http://localhost:3000/reset-password.html?token=abc123...
```

### 3. Verify Email Arrives

- Check user's inbox (and spam folder)
- Click reset link
- Enter new password
- Confirm reset success message

---

## Troubleshooting

### "Email not sent"
1. Verify EMAIL_PROVIDER is set correctly
2. Check API key/password is valid
3. Ensure EMAIL_FROM is correct format
4. Check NODE_ENV (should not be "development" if using real provider)

### "Auth failed" / "Invalid credentials"
1. Double-check API key or password
2. Test credentials outside the app (SendGrid UI, Gmail, AWS console)
3. Ensure no typos in .env

### "Email marked as spam"
1. SendGrid: Configure SPF/DKIM records (highest priority)
2. Use domain-specific email address (not @gmail.com for business)
3. Add unsubscribe link (future enhancement)

### "Rate limit exceeded"
- Free tier has limits:
  - SendGrid: 100/day
  - Gmail: 100/24 hours (approx)
  - AWS SES: 200/second
- Upgrade plan or implement request queueing

---

## Production Recommendations

### Best Practice Setup:
```
EMAIL_PROVIDER=sendgrid          # Most reliable
SENDGRID_API_KEY=SG.xxx...       # From SendGrid console
EMAIL_FROM=noreply@yourdomain.com # Use your domain
EMAIL_FROM_NAME=Parkinson's Pal  # Professional name
NODE_ENV=production              # Enable production mode
```

### Security:
- ✅ Never commit .env to git
- ✅ Use environment variables in production
- ✅ Regenerate API keys if accidentally exposed
- ✅ Monitor email logs for suspicious activity

### Monitoring:
- Track email delivery rates
- Monitor bounce/complaint rates
- Alert on provider errors
- Consider email logging service (e.g., SendGrid activity)

---

## Next Steps

1. Choose your email provider (SendGrid recommended)
2. Complete setup steps above
3. Update backend/.env file
4. Restart server: `npm run dev`
5. Test with curl or password reset form
6. Verify email arrives in inbox
7. Deploy to production when ready

## Getting Help

- **SendGrid Support**: sendgrid.com/contact
- **Gmail Help**: support.google.com/mail
- **AWS Support**: console.aws.amazon.com/support
- **Check server logs**: `npm run dev` terminal

Once configured, your users can reset passwords anytime! 🎉
