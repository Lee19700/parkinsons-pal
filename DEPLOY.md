# Deploy Commands - Copy & Paste Ready

## Prerequisites
1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Have a Heroku account: https://heroku.com
3. Have Git installed

## Full Deployment (Copy & Paste)

### Step 1: Login to Heroku
```powershell
heroku login
```
(Opens browser window - authorize and return to terminal)

### Step 2: Create Heroku App & Database
```powershell
# Navigate to project root
cd "c:\Users\leeto\OneDrive\New folder\OneDrive\Desktop\Parkipal project"

# Create app
heroku create parkinsons-pal

# Add PostgreSQL database
heroku addons:create heroku-postgresql:hobby-dev -a parkinsons-pal
```

### Step 3: Set Encryption Keys
```powershell
# Set JWT secret
heroku config:set JWT_SECRET="8%,@w3W]}GH&L:QVbXM\$Ea09m</BgN" -a parkinsons-pal

# Set encryption key
heroku config:set ENCRYPTION_KEY="b29c590394fa2b36197724f6f84c7a4803592a4e79df945e3feb3c4aed7f5392" -a parkinsons-pal

# Set environment
heroku config:set NODE_ENV="production" -a parkinsons-pal

# Set CORS origins (update with your domain)
heroku config:set ALLOWED_ORIGINS="https://parkinsons-pal.herokuapp.com" -a parkinsons-pal
```

### Step 4: Create Procfile in backend/
Create a file: `backend/Procfile` (no extension)

```
web: node server.js
```

### Step 5: Deploy
```powershell
# Stage all changes
git add .

# Commit
git commit -m "Add encryption and deployment files"

# Deploy to Heroku
git push heroku main
```

### Step 6: Verify Deployment
```powershell
# Check logs
heroku logs -a parkinsons-pal

# Test health endpoint
heroku open -a parkinsons-pal
# Will open: https://parkinsons-pal.herokuapp.com/
# Should show a health check or landing page

# Test API directly
$response = Invoke-WebRequest -Uri "https://parkinsons-pal.herokuapp.com/api/health"
$response.Content
```

## Frontend Deployment to Vercel (Recommended)

### Prerequisites
- Vercel account: https://vercel.com
- GitHub account with your code

### Step 1: Push to GitHub
```powershell
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit with encryption"

# Add remote (replace with your GitHub repo)
git remote add origin https://github.com/YOUR_USERNAME/parkinsons-pal.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Choose your GitHub repo
4. Set environment variable:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://parkinsons-pal.herokuapp.com/api`
5. Click "Deploy"

### Step 3: Update Frontend Configuration
Edit `api-client.js` line 2:
```javascript
const API_BASE_URL = 'https://parkinsons-pal.herokuapp.com/api';
```

## Alternative: Deploy Frontend to Netlify

### Step 1: Connect Repository
1. Go to https://netlify.com
2. "New site from Git"
3. Select GitHub and your repository

### Step 2: Configure Build
- Build command: (leave empty for static)
- Publish directory: `./` (root directory)

### Step 3: Set Environment Variables
Go to Site settings → Build & deploy → Environment:
```
API_BASE_URL=https://parkinsons-pal.herokuapp.com/api
```

## Test After Deployment

### Test Health
```powershell
$uri = "https://parkinsons-pal.herokuapp.com/api/health"
Invoke-WebRequest -Uri $uri | Select-Object -ExpandProperty Content
```

### Test Registration
```powershell
$body = @{
    username = "testuser123"
    password = "TestPassword@123"
} | ConvertTo-Json

$response = Invoke-WebRequest `
  -Uri "https://parkinsons-pal.herokuapp.com/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body

$response.Content | ConvertFrom-Json
```

### Verify Encryption
```powershell
# Check Heroku PostgreSQL
heroku pg:psql -a parkinsons-pal

# In PostgreSQL console:
SELECT id, encrypted_data FROM documents LIMIT 1;

# Should show JSON with: {"iv":"...", "authTag":"...", "encrypted":"..."}
```

## Troubleshooting

### App crashes after deployment
```powershell
# Check logs
heroku logs -a parkinsons-pal --tail

# Common issues:
# 1. ENCRYPTION_KEY not set → re-run config:set commands
# 2. Database not ready → wait 5 minutes and redeploy
# 3. Procfile missing → create backend/Procfile with content above
```

### Database connection fails
```powershell
# Check database status
heroku pg:info -a parkinsons-pal

# Reset database if needed
heroku pg:reset DATABASE -a parkinsons-pal
```

### CORS errors from frontend
```powershell
# Update allowed origins
heroku config:set ALLOWED_ORIGINS="https://your-frontend.domain" -a parkinsons-pal

# Verify update
heroku config -a parkinsons-pal | grep ALLOWED_ORIGINS
```

### Want to restart app
```powershell
heroku restart -a parkinsons-pal
```

### View all configuration
```powershell
heroku config -a parkinsons-pal
```

## Summary

✅ **Backend:** Deployed to `https://parkinsons-pal.herokuapp.com`
✅ **Encryption:** AES-256-GCM enabled
✅ **Database:** PostgreSQL on Heroku
✅ **Frontend:** Deployed to Vercel or Netlify
✅ **Security:** HTTPS + JWT + Bcrypt

## Next: Monitor Your App

```powershell
# View live logs
heroku logs -a parkinsons-pal --tail

# Check metrics
heroku metrics -a parkinsons-pal

# View database usage
heroku pg:info -a parkipsons-pal
```

## After Deployment Checklist

- [ ] Test health endpoint
- [ ] Test user registration
- [ ] Test login
- [ ] Test document upload
- [ ] Verify data in database is encrypted
- [ ] Test frontend connects to backend
- [ ] Set up custom domain (optional)
- [ ] Enable automatic backups
- [ ] Set up error monitoring
- [ ] Configure email alerts

---

**Your encrypted medical app is now live!** 🎉

Questions? See [DEPLOYMENT.md](DEPLOYMENT.md) and [SECURITY.md](SECURITY.md)
