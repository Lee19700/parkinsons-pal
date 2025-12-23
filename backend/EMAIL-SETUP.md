# Email Configuration Guide for Parkinson's Pal

This guide explains how to configure email functionality for password resets and welcome emails.

## Overview

The email service supports three configuration methods:
1. **Generic SMTP** (Gmail, Outlook, custom email servers)
2. **SendGrid** (recommended for production)
3. **AWS SES** (Amazon Simple Email Service)

## Setup Instructions

### Option 1: Generic SMTP (Easiest to Start)

#### Using Gmail:
1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
APP_URL=https://your-app-domain.com
```

#### Using Outlook/Microsoft:
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
APP_URL=https://your-app-domain.com
```

#### Using Custom SMTP Server:
```env
EMAIL_HOST=mail.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=username
EMAIL_PASSWORD=password
EMAIL_FROM=noreply@example.com
APP_URL=https://your-app-domain.com
```

### Option 2: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com
2. Create an API key: https://app.sendgrid.com/settings/api_keys
3. Add to `.env`:
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@parkinsonspal.app
APP_URL=https://your-app-domain.com
```

**SendGrid sends up to 100 emails/day for free**

### Option 3: AWS SES (For Large Scale)

1. Set up AWS account and verify sender email in SES console
2. Create IAM user with SES permissions
3. Add to `.env`:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
EMAIL_FROM=noreply@parkinsonspal.app
APP_URL=https://your-app-domain.com
```

## Development Mode

To disable email sending during development:
```env
EMAIL_DISABLED=true
```

When disabled, the app will log that emails would have been sent but won't actually send them.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EMAIL_HOST` | No* | SMTP server hostname |
| `EMAIL_PORT` | No | SMTP port (default: 587) |
| `EMAIL_USER` | No* | Email account username |
| `EMAIL_PASSWORD` | No* | Email account password |
| `EMAIL_SECURE` | No | Use SSL/TLS (true for port 465, false for 587) |
| `SENDGRID_API_KEY` | No* | SendGrid API key (alternative to SMTP) |
| `AWS_REGION` | No* | AWS region for SES |
| `AWS_ACCESS_KEY_ID` | No* | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | No* | AWS secret key |
| `EMAIL_FROM` | Yes | Sender email address |
| `APP_URL` | Yes | Your application URL (for reset links) |
| `EMAIL_DISABLED` | No | Set to 'true' to disable email (dev only) |

*At least one email method must be configured (SMTP OR SendGrid OR AWS SES)

## What Emails Are Sent

### Password Reset Email
- **When:** User requests password reset via `/api/auth/forgot-password`
- **Contains:** Reset link with token, expires in 1 hour
- **Template:** Professional HTML with fallback text

### Welcome Email (Optional)
- **When:** New user registers (currently not sent, but infrastructure ready)
- **Contains:** Welcome message with link to app

## Testing Your Configuration

### Using cURL to test password reset:
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'
```

### Check server logs:
```
[EMAIL] Password reset email sent to user@example.com
```

If you see an error, check:
1. Email credentials are correct
2. SMTP host/port are accessible from your server
3. Gmail requires App Passwords (not regular password)
4. SendGrid API key has correct permissions
5. AWS SES verified sender email

## Production Security Tips

1. **Never commit `.env` files** containing credentials
2. **Use environment variables** in production (Railway, Heroku, Docker, etc.)
3. **Verify sender email** in email provider (especially AWS SES)
4. **Monitor email deliverability** with provider dashboard
5. **Set up SPF/DKIM/DMARC** for your domain to prevent spoofing
6. **Use separate email addresses** for different environments (dev@, prod@)

## Troubleshooting

### Email not sending?
1. Check `[EMAIL]` log messages in server output
2. Verify credentials in `.env`
3. Check firewall/network allows outbound SMTP
4. Gmail users: use App Password, not regular password
5. Set `EMAIL_DISABLED=false` (or remove the variable)

### "Error: getaddrinfo ENOTFOUND"
- Email host is incorrect or unreachable
- Check hostname spelling
- Verify network connectivity to email server

### "Invalid login credentials"
- Email user/password incorrect
- Gmail: use 16-character App Password
- Try password reset with email provider

### "Failed to parse email address"
- EMAIL_FROM format invalid
- Should be like: `noreply@example.com`
- Cannot use: `John Doe <john@example.com>` (yet)

## File Locations

- **Email service module:** `backend/email.js`
- **Password reset endpoints:** `backend/server.js` (lines ~410-480)
- **Password reset table:** `backend/db.js` (schema)
- **Frontend reset form:** `reset-password.html` (needs to be created)

## Frontend Implementation

Create `reset-password.html` to let users reset their password:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Reset Password - Parkinson's Pal</title>
</head>
<body>
  <h1>Reset Your Password</h1>
  
  <form id="resetForm">
    <input type="password" id="newPassword" placeholder="New Password" required>
    <button type="submit">Reset Password</button>
  </form>

  <script src="api-client.js"></script>
  <script>
    document.getElementById('resetForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = new URLSearchParams(window.location.search).get('token');
      const newPassword = document.getElementById('newPassword').value;
      
      try {
        await window.PPApiClient.resetPassword(token, newPassword);
        alert('Password reset successful! Please log in.');
        window.location.href = 'login.html';
      } catch (error) {
        alert('Failed to reset password: ' + error.message);
      }
    });
  </script>
</body>
</html>
```

Add to `api-client.js`:
```javascript
async resetPassword(resetToken, newPassword) {
  return await apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ resetToken, newPassword })
  });
}
```

## Next Steps

1. Choose your email provider (SendGrid recommended for simplicity)
2. Get API key/SMTP credentials
3. Add to `.env` file
4. Restart server: `npm run dev`
5. Test with curl command above
6. Create reset-password.html frontend form
7. Monitor email logs in production

## Support

For issues with:
- **Gmail:** Check: https://support.google.com/accounts/answer/185833
- **SendGrid:** Check: https://docs.sendgrid.com/
- **AWS SES:** Check: https://docs.aws.amazon.com/ses/
- **Nodemailer:** Check: https://nodemailer.com/
