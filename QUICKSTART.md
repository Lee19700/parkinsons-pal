# Quick Start: Deploying Parkinson's Pal with Encryption

## ✅ What's Ready

Your application now has:
- **End-to-end encryption** (AES-256-GCM)
- **Secure authentication** (JWT + bcrypt)
- **Encrypted medical data** storage
- **Generated encryption keys**
- **Production-ready backend**

## 🚀 Deploy in 3 Steps (Heroku Recommended)

### Step 1: Install Heroku CLI
Download from: https://devcenter.heroku.com/articles/heroku-cli

```powershell
heroku --version  # Verify installation
```

### Step 2: Deploy Backend

```powershell
# Login to Heroku
heroku login

# Navigate to project
cd "c:\Users\leeto\OneDrive\New folder\OneDrive\Desktop\Parkipal project"

# Create Heroku app
heroku create parkinsons-pal

# Add PostgreSQL database
heroku addons:create heroku-postgresql:hobby-dev -a parkinsons-pal

# Set encryption keys
heroku config:set JWT_SECRET="8%,@w3W]}GH&L:QVbXM\$Ea09m</BgN" -a parkinsons-pal
heroku config:set ENCRYPTION_KEY="b29c590394fa2b36197724f6f84c7a4803592a4e79df945e3feb3c4aed7f5392" -a parkinsons-pal
heroku config:set ALLOWED_ORIGINS="https://parkinsons-pal.herokuapp.com" -a parkinsons-pal
heroku config:set NODE_ENV="production" -a parkinsons-pal

# Deploy
git push heroku main
```

### Step 3: Deploy Frontend

Update your frontend to point to the deployed backend:

Edit [api-client.js](api-client.js) line 2:
```javascript
const API_BASE_URL = 'https://parkinsons-pal.herokuapp.com/api';
```

Deploy frontend to:
- **Vercel** (recommended): https://vercel.com
- **Netlify**: https://netlify.com
- **GitHub Pages**: (static hosting)

## 🔐 Security Configuration

Your encryption keys are:
```
JWT_SECRET: 8%,@w3W]}GH&L:QVbXM\$Ea09m</BgN
ENCRYPTION_KEY: b29c590394fa2b36197724f6f84c7a4803592a4e79df945e3feb3c4aed7f5392
```

⚠️ **IMPORTANT:**
- Keep these values SECRET
- Never commit to version control
- Store in secure vault for backup
- Rotate periodically in production

## 📋 Configuration Files

Your app is configured with:
- ✅ `backend/.env` - Local environment variables
- ✅ `backend/encryption.js` - AES-256-GCM encryption
- ✅ `encryption-client.js` - Client-side encryption
- ✅ `backend/docker-compose.yml` - Database setup
- ✅ `DEPLOYMENT.md` - Detailed deployment guide
- ✅ `SECURITY.md` - Security implementation details

## 🧪 Test After Deployment

Once deployed to Heroku:

```powershell
# Test health check
curl https://parkinsons-pal.herokuapp.com/api/health

# Test registration
$body = @{
    username = "testuser"
    password = "TestPassword123"
} | ConvertTo-Json

curl -X POST https://parkinsons-pal.herokuapp.com/api/auth/register `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

## 📊 What's Encrypted

The following data is now encrypted:
- Medical documents (filename, content, metadata)
- Medications
- Symptoms
- Vital signs
- Fluid intake
- Food/diet records
- Exercise logs
- Appointments
- Medical history

## 🎯 Next Steps

1. ✅ Install Heroku CLI
2. ✅ Create Heroku account
3. ✅ Run deployment commands above
4. ✅ Test health endpoint
5. ✅ Update frontend API_BASE_URL
6. ✅ Deploy frontend
7. ✅ Test end-to-end encryption

## ❓ Troubleshooting

**"ENCRYPTION_KEY must be exactly 32 bytes"**
- The key is already generated correctly (64 hex chars = 32 bytes)
- Verify it in `backend/.env`

**"Database connection refused"**
- Heroku PostgreSQL takes 5-10 seconds to provision
- Wait a minute and retry deployment

**"CORS error in frontend"**
- Update ALLOWED_ORIGINS to include your frontend domain
- Run: `heroku config:set ALLOWED_ORIGINS="https://yourdomain.com,https://parkinsons-pal.herokuapp.com" -a parkinsons-pal`

## 📞 Support

For detailed information:
- See [DEPLOYMENT.md](DEPLOYMENT.md) for all deployment options
- See [SECURITY.md](SECURITY.md) for security details
- See [backend/ENCRYPTION-SETUP.md](backend/ENCRYPTION-SETUP.md) for encryption setup

---

**Your Parkinson's Pal app is now encrypted and ready for production! 🎉**
