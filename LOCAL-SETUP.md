# Local Setup Instructions

## Prerequisites
- Node.js 14+ installed
- PostgreSQL installed and running

## Database Setup (One-time)

### Step 1: Create the database
```bash
# Connect to PostgreSQL as admin user
psql -U postgres

# Inside psql:
CREATE DATABASE parkinsons_pal;
\q
```

### Step 2: Verify connection
```bash
# Test the connection string
psql -U postgres -d parkinsons_pal -c "SELECT NOW();"
```

If you see the current timestamp, database is ready!

## Application Setup

### Step 1: Install dependencies (if not already done)
```bash
cd backend
npm install
```

### Step 2: Configure environment
File: `backend/.env` is already configured for local development:
- Database: `postgres://postgres:postgres@localhost:5432/parkinsons_pal`
- JWT Secret: Already set
- Encryption Key: Already set
- Email: Disabled (EMAIL_DISABLED=true)

### Step 3: Start the server
```bash
cd backend
npm run dev
```

You should see:
```
[STARTUP] Loading environment variables...
[DB] Initializing database connection...
[DB] Connected to PostgreSQL, creating schema...
[DB] Schema created, database ready
[EMAIL] Initializing email service...
[EMAIL] No email configuration found.
[SERVER] Parkinson's Pal API server running on port 3000
```

## Testing the API

### Test 1: Health Check
```bash
curl http://localhost:3000/api/health
```
Response: `{ "status": "ok", "timestamp": "2025-12-23T..." }`

### Test 2: Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test1234"}'
```
Response: `{ "ok": true, "token": "eyJhbGciOi...", "user": {...} }`

### Test 3: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test1234"}'
```

### Test 4: Password Reset Request
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'
```
Response: `{ "ok": true, "message": "If user exists, reset email would be sent" }`

(Email disabled in dev mode, so no actual email sent)

### Test 5: Test Password Validation
Try with weak password:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"baduser","password":"weak"}'
```
Response: `{ "error": "Password must be at least 8 characters" }`

## Viewing Server Logs

The server logs all important events:
- `[STARTUP]` - Server initialization
- `[DB]` - Database operations
- `[EMAIL]` - Email service events
- `[SERVER]` - Server runtime events
- `[AUTH]` - Authentication events

## Troubleshooting

### "Cannot connect to PostgreSQL"
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Make sure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in .env is correct
- Verify database exists: `psql -U postgres -l`

### "Database does not exist"
```
error: database "parkinsons_pal" does not exist
```
- Create it: `psql -U postgres -c "CREATE DATABASE parkinsons_pal;"`

### "Port 3000 already in use"
```
Error: listen EADDRINUSE :::3000
```
- Kill the process: `Get-Process node | Stop-Process` (PowerShell)
- Or change PORT in .env

### "Module not found" errors
```
Cannot find module 'nodemailer'
```
- Install dependencies: `npm install`

## Testing Email (Optional)

To test actual email sending locally:

### Option A: Gmail (Recommended)
1. Go to https://myaccount.google.com/apppasswords
2. Enable 2-Step Verification first
3. Generate App Password for "Mail" on "Windows Computer"
4. Copy the 16-character password

Add to `backend/.env`:
```
EMAIL_DISABLED=false
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
```

5. Restart server: `npm run dev`
6. Test password reset: emails will actually be sent!

### Option B: SendGrid
1. Sign up free at https://sendgrid.com
2. Create API key at https://app.sendgrid.com/settings/api_keys
3. Add to `backend/.env`:
```
EMAIL_DISABLED=false
SENDGRID_API_KEY=SG.your-api-key-here
EMAIL_FROM=noreply@test.com
```
4. Restart server

## Next Steps

1. ✅ Start the server: `npm run dev`
2. ✅ Test health endpoint: `curl http://localhost:3000/api/health`
3. ✅ Register a user: Follow Test 2 above
4. ✅ Test password reset flow
5. ✅ Test frontend at http://localhost:3000 (serves static HTML)
6. ✅ Ready to deploy to production!

## Files Modified

- `.env` - Environment configuration (database, JWT, encryption)
- `backend/server.js` - Main API server with auth endpoints
- `backend/email.js` - Email service module
- `backend/db.js` - Database adapter with password reset table
- `reset-password.html` - Password reset form for frontend
- `api-client.js` - Frontend API wrapper with reset methods

## Full Test Flow (Start to Finish)

```bash
# 1. Terminal 1: Start the backend server
cd backend
npm run dev

# 2. Terminal 2: Run tests
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123"}'

# Save the token from response, use below:
TOKEN="eyJhbGciOi..."

# Login with that user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123"}'

# Request password reset
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'

# Access authenticated endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/user/profile
```

---

**Ready to test locally!** Questions? Check the troubleshooting section above.
