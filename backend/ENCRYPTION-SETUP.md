# Parkinson's Pal - Encryption Setup Guide

## Overview
This application now includes **end-to-end encryption** for all medical data:
- ✅ Server-side AES-256-GCM encryption at rest
- ✅ Client-side encryption before transmission  
- ✅ JWT-based authentication with secure tokens
- ✅ Password hashing with bcrypt
- ✅ Database encryption support

## Environment Variables Required

### Generate Encryption Keys

**On Windows PowerShell:**
```powershell
# Generate 32-byte (256-bit) encryption key
$key = [System.BitConverter]::ToString($(1..32 | ForEach-Object { Get-Random -Maximum 256 }))
$key = $key -replace '-', ''
Write-Host "ENCRYPTION_KEY=$key"
```

**On macOS/Linux:**
```bash
# Generate 32-byte encryption key (64 hex characters)
openssl rand -hex 32
```

### .env Configuration

Create a `.env` file in the `backend/` directory:

```env
# Database
DB_URL=postgresql://user:password@localhost:5432/parkinsonspal

# Server
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=your-very-secure-random-string-at-least-32-chars
ENCRYPTION_KEY=<generated-hex-key-from-above>

# CORS - Update with your domain
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# File uploads
MAX_BODY_MB=10
```

## Important Security Notes

1. **ENCRYPTION_KEY must be:**
   - 64 hexadecimal characters (32 bytes)
   - Stored securely in environment variables
   - NEVER committed to version control
   - Backed up securely

2. **JWT_SECRET must be:**
   - At least 32 characters
   - Unique per deployment
   - Changed regularly

3. **Database Connection:**
   - Use strong passwords
   - Enable SSL/TLS for database connections
   - Restrict database access to backend servers only

4. **Deployment:**
   - Always use HTTPS/TLS in production
   - Use a reverse proxy (Caddy, nginx) with SSL certificates
   - Enable HSTS headers
   - Implement rate limiting on authentication endpoints

## Running the Application

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Start production server:**
   ```bash
   npm start
   ```

## Encryption Details

### AES-256-GCM
- Algorithm: AES with 256-bit key
- Mode: Galois/Counter Mode (GCM) for authenticated encryption
- Authentication tag ensures data integrity
- Random IV (Initialization Vector) for each encryption

### Protected Data
The following sensitive information is now encrypted:
- Medical documents (at rest + metadata encrypted)
- Medication data (via encrypted_data field)
- Symptom records
- Vital signs
- Fluid intake logs
- Food/diet information
- Exercise records
- Appointments
- Medical history

## Compliance

This configuration supports:
- HIPAA compliance (with proper TLS setup)
- GDPR data protection requirements
- PIPEDA (Canada)
- LGPD (Brazil)

## Testing Encryption

To verify encryption is working:

1. Add medical data through the app
2. Query the database directly:
   ```sql
   SELECT id, encrypted_data FROM documents WHERE user_id = 1;
   ```
3. Verify `encrypted_data` contains JSON with `iv`, `authTag`, and `encrypted` fields

## Troubleshooting

**"ENCRYPTION_KEY environment variable must be set"**
- Ensure ENCRYPTION_KEY is in your .env file
- Verify it's 64 hex characters

**"Decryption failed"**
- Check that the ENCRYPTION_KEY hasn't changed
- Verify data wasn't corrupted in transit

**Performance Issues**
- Encryption adds minimal overhead
- Document upload limits protect against DoS

## Support

For security issues or questions about encryption implementation, refer to:
- AES-256-GCM specification
- Node.js crypto module documentation
- OWASP encryption guidelines
